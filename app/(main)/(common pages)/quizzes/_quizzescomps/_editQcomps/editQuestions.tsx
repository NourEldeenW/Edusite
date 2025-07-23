import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/lib/stores/onlineQuizStores/createQuiz";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import { cn } from "@/lib/utils";
import {
  faArrowDown,
  faArrowUp,
  faPlus,
  faTrash,
  faPlusCircle,
  faImage,
  faTimes,
  faChevronDown,
  faChevronUp,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

const QUESTION_TYPES = [
  { label: "Single Answer", value: "single" },
  { label: "Multiple Answers", value: "multiple" },
];

export default function EditQuestions() {
  const quizDetails = useQEditStore((state) => state.quizDetails);
  const questions = quizDetails?.questions || [];

  // Get store actions
  const addQuestion = useQEditStore((state) => state.addQuestion);
  const deleteQuestion = useQEditStore((state) => state.deleteQuestion);
  const moveQuestion = useQEditStore((state) => state.moveQuestion);
  const editQuestion = useQEditStore((state) => state.editQuestion);
  const insertQuestion = useQEditStore((state) => state.insertQuestion);
  const deleteQuestionChoice = useQEditStore(
    (state) => state.deleteQuestionChoice
  );
  const editQuestionChoice = useQEditStore((state) => state.editQuestionChoice);
  const addQuestionChoice = useQEditStore((state) => state.addQuestionChoice);
  const setQuestionImage = useQEditStore((state) => state.setQuestionImage);
  const deleteQuestionImage = useQEditStore(
    (state) => state.deleteQuestionImage
  );
  const setChoiceImage = useQEditStore((state) => state.setChoiceImage);
  const deleteChoiceImage = useQEditStore((state) => state.deleteOptionImage);

  // Collapse state management
  const [isCollapseMode, setIsCollapseMode] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Active question tracking
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddQuestion = () => {
    const newIndex = questions.length;
    addQuestion();
    setActiveQuestion(newIndex);

    if (isCollapseMode) {
      setExpandedQuestions(new Set([newIndex]));
    }
  };

  const toggleQuestionExpansion = (questionIndex: number) => {
    setActiveQuestion(questionIndex);
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const collapseQuestion = (questionIndex: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionIndex);
      return newSet;
    });
    setActiveQuestion(null);
  };

  const toggleCollapseMode = () => {
    setIsCollapseMode(!isCollapseMode);
    if (!isCollapseMode) {
      setExpandedQuestions(new Set());
      setActiveQuestion(null);
    } else {
      setExpandedQuestions(new Set(questions.map((_, index) => index)));
    }
  };

  const isQuestionExpanded = (index: number) => {
    return !isCollapseMode || expandedQuestions.has(index);
  };

  const getQuestionPreview = (question: Question) => {
    if (question.text.length > 50) {
      return question.text.substring(0, 50) + "...";
    }
    return question.text || "Empty question";
  };

  const handleChoiceClick = (
    questionIndex: number,
    choiceIndex: number,
    currentValue: boolean
  ) => {
    const question = questions[questionIndex];

    if (question.selection_type === "single") {
      const newChoices = question.choices.map((choice, idx) => ({
        ...choice,
        is_correct: idx === choiceIndex ? !currentValue : false,
      }));
      editQuestion(questionIndex, { choices: newChoices });
    } else {
      editQuestionChoice(questionIndex, choiceIndex, {
        is_correct: !currentValue,
      });
    }
  };

  const handleSelectionTypeChange = (
    index: number,
    newType: "single" | "multiple"
  ) => {
    const question = questions[index];

    if (newType === "single" && question.selection_type === "multiple") {
      // Reset to first correct answer
      const firstCorrectIndex = question.choices.findIndex((c) => c.is_correct);
      const newChoices = question.choices.map((choice, idx) => ({
        ...choice,
        is_correct: idx === firstCorrectIndex,
      }));

      editQuestion(index, {
        selection_type: newType,
        choices: newChoices,
      });
    } else {
      editQuestion(index, { selection_type: newType });
    }
  };

  const handlePointsChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value === "") {
      editQuestion(index, { points: 1 });
      return;
    }

    const regex = /^\d+(\.\d{0,2})?$/;
    if (!regex.test(value)) return;

    const points = parseFloat(value);
    if (isNaN(points)) return;

    editQuestion(index, { points });
  };

  // Handle image upload for questions
  const handleQuestionImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>, questionIndex: number) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Store as base64 string for new images
          setQuestionImage(questionIndex, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Reset input
    },
    [setQuestionImage]
  );

  // Handle image upload for choices
  const handleChoiceImageUpload = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      questionIndex: number,
      choiceIndex: number
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setChoiceImage(
            questionIndex,
            choiceIndex,
            event.target.result as string
          );
        }
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Reset input
    },
    [setChoiceImage]
  );

  // Scroll to active question
  useEffect(() => {
    if (activeQuestion !== null && containerRef.current) {
      const questionElement = document.getElementById(
        `question-${activeQuestion}`
      );
      if (questionElement) {
        questionElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [activeQuestion]);

  return (
    <div ref={containerRef}>
      {/* Progress Navigation Bar - Always visible */}
      {questions.length > 0 && (
        <div className="sticky top-0 z-10 mb-6 bg-white shadow-md rounded-lg border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={isCollapseMode ? faEye : faEyeSlash}
                  className="text-gray-600"
                />
                <span className="font-medium text-gray-700">
                  {isCollapseMode ? "Collapse Mode" : "Expand Mode"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Question Navigation */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Jump to Question:
              </span>
              <div className="flex flex-wrap gap-1">
                {questions.map((_, index) => (
                  <button
                    key={`nav-${index}`}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      activeQuestion === index ||
                        (isCollapseMode && expandedQuestions.has(index))
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      activeQuestion === index &&
                        "ring-2 ring-offset-2 ring-blue-400"
                    )}
                    onClick={() => {
                      setActiveQuestion(index);
                      if (isCollapseMode && !expandedQuestions.has(index)) {
                        toggleQuestionExpansion(index);
                      }
                    }}
                    title={`Question ${index + 1}`}>
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleCollapseMode}
              className="flex items-center gap-2 w-full sm:w-auto">
              <FontAwesomeIcon
                icon={isCollapseMode ? faChevronDown : faChevronUp}
                size="sm"
              />
              {isCollapseMode ? "Expand All" : "Collapse All"}
            </Button>
          </div>
        </div>
      )}

      {questions.length > 0 &&
        questions.map((question, index) => (
          <div
            id={`question-${index}`}
            key={question.id || `new-${index}`}
            className={cn(
              "bg-white rounded-xl shadow-md border border-gray-200 relative transition-all hover:shadow-lg",
              isQuestionExpanded(index)
                ? "p-4 sm:p-6 mb-6 border-l-4 border-blue-500"
                : "p-4 mb-3",
              activeQuestion === index && "ring-2 ring-blue-400"
            )}>
            {/* Collapsed View */}
            {!isQuestionExpanded(index) && (
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => toggleQuestionExpansion(index)}>
                <div className="flex items-start sm:items-center gap-3 flex-1 w-full">
                  <div className="question-number flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
                    <span className="text-gray-700 line-clamp-2 sm:truncate flex-1">
                      {getQuestionPreview(question)}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                        {question.selection_type === "single"
                          ? "Single"
                          : "Multiple"}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {question.points} pts
                      </span>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        {question.choices.length} options
                      </span>
                      {question.image && (
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                          Has Image
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Expanded View */}
            {isQuestionExpanded(index) && (
              <>
                {/* Insert Question Above Button */}
                <div className="flex justify-center mb-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg"
                    onClick={() => insertQuestion(index, "above")}>
                    <FontAwesomeIcon icon={faPlusCircle} size="xs" />
                    Insert Above
                  </Button>
                </div>

                <div className="question-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 sticky top-16 bg-white z-10 py-2">
                  <div className="flex items-center gap-3">
                    <div className="question-number w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-gray-800">
                        Editing Question
                      </div>
                      <div className="text-sm text-gray-500">
                        {index + 1} of {questions.length}
                      </div>
                    </div>
                  </div>
                  <div className="question-actions flex flex-wrap gap-2">
                    {/* Collapse button (only visible in collapse mode) */}
                    {isCollapseMode && (
                      <button
                        type="button"
                        className="question-action-btn w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        onClick={() => collapseQuestion(index)}
                        title="Collapse question">
                        <FontAwesomeIcon
                          icon={faChevronUp}
                          className="text-sm"
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      className={cn(
                        "question-action-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        index === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      )}
                      onClick={() => moveQuestion(index, "up")}
                      disabled={index === 0}>
                      <FontAwesomeIcon icon={faArrowUp} className="text-sm" />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "question-action-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        index === questions.length - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      )}
                      onClick={() => moveQuestion(index, "down")}
                      disabled={index === questions.length - 1}>
                      <FontAwesomeIcon icon={faArrowDown} className="text-sm" />
                    </button>
                    <button
                      type="button"
                      className="question-action-btn w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                      onClick={() => deleteQuestion(index)}>
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="block mb-2 font-medium text-gray-700 items-center gap-2">
                    <span>Question Text</span>
                    <span className="text-xs text-gray-500 font-normal">
                      (Required)
                    </span>
                  </label>
                  <Textarea
                    className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-full resize-y overflow-y-auto min-h-[100px]"
                    placeholder="Enter your question"
                    value={question.text}
                    onChange={(e) =>
                      editQuestion(index, { text: e.target.value })
                    }
                  />
                </div>

                {/* Question Image Section */}
                <div className="form-group mb-6">
                  <label className="block mb-2 font-medium text-gray-700">
                    Question Image (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {question.image ? (
                      <div className="relative">
                        <Image
                          src={question.image}
                          alt="Question"
                          width={200}
                          height={150}
                          className="max-w-[200px] max-h-[150px] rounded-lg object-contain border border-gray-200"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                          onClick={() =>
                            deleteQuestionImage(question.id || null, index)
                          }>
                          <FontAwesomeIcon icon={faTimes} size="xs" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`question-image-${index}`}
                          onChange={(e) => handleQuestionImageUpload(e, index)}
                          ref={(el) => {
                            fileInputRefs.current[`question-${index}`] = el;
                          }}
                        />
                        <label
                          htmlFor={`question-image-${index}`}
                          className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg flex items-center gap-2">
                          <FontAwesomeIcon icon={faImage} />
                          Upload Image
                        </label>
                        <span className="text-sm text-gray-500">
                          JPG, PNG (max 2MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="form-group">
                    <label className="block mb-2 font-medium text-gray-700">
                      Choices Type
                    </label>
                    <div className="question-type-select grid grid-cols-1 gap-3">
                      {QUESTION_TYPES.map((type) => (
                        <div
                          key={type.value}
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between",
                            question.selection_type === type.value
                              ? "bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-inner"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          )}
                          data-type={type.value}
                          onClick={() =>
                            handleSelectionTypeChange(
                              index,
                              type.value as "single" | "multiple"
                            )
                          }>
                          <span>{type.label}</span>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              question.selection_type === type.value
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-400"
                            )}>
                            {question.selection_type === type.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block mb-2 font-medium text-gray-700">
                      Points
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={question.points}
                        onChange={(e) => handlePointsChange(e, index)}
                      />
                      <span className="text-gray-500 whitespace-nowrap">
                        points
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Points awarded for correct answer
                    </div>
                  </div>
                </div>

                {question.question_type && (
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block font-medium text-gray-700">
                        Options
                      </label>
                      <span className="text-sm text-gray-500">
                        Click the circle to mark correct answers
                      </span>
                    </div>
                    <div className="options-container mb-4 space-y-4">
                      {question.choices.map((option, optIdx: number) => (
                        <div
                          key={option.id || `new-${optIdx}`}
                          className="option-item p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                            <div
                              className={cn(
                                "option-checkbox w-8 h-8 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer mt-1",
                                option.is_correct
                                  ? question.selection_type === "single"
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-green-500 border-green-500"
                                  : "bg-white border-gray-400"
                              )}
                              onClick={() =>
                                handleChoiceClick(
                                  index,
                                  optIdx,
                                  option.is_correct
                                )
                              }>
                              <span
                                className={cn(
                                  "text-white text-xs font-bold",
                                  option.is_correct ? "" : "hidden"
                                )}>
                                {question.selection_type === "single"
                                  ? "●"
                                  : "✓"}
                              </span>
                            </div>

                            <div className="flex-1 w-full">
                              <Textarea
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                                placeholder="Option text"
                                value={option.text}
                                onChange={(e) =>
                                  editQuestionChoice(index, optIdx, {
                                    text: e.target.value,
                                  })
                                }
                                rows={2}
                              />

                              {/* Choice Image Section */}
                              <div className="mt-3">
                                <label className="block mb-2 font-medium text-gray-700 text-sm">
                                  Option Image (Optional)
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  {option.image ? (
                                    <div className="relative">
                                      <Image
                                        src={option.image}
                                        alt="Option"
                                        width={150}
                                        height={100}
                                        className="max-w-[150px] max-h-[100px] rounded-lg object-contain border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                                        onClick={() =>
                                          deleteChoiceImage(
                                            question.id || null,
                                            option.id || null,
                                            index,
                                            optIdx
                                          )
                                        }>
                                        <FontAwesomeIcon
                                          icon={faTimes}
                                          size="xs"
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id={`choice-image-${index}-${optIdx}`}
                                        onChange={(e) =>
                                          handleChoiceImageUpload(
                                            e,
                                            index,
                                            optIdx
                                          )
                                        }
                                        ref={(el) => {
                                          fileInputRefs.current[
                                            `choice-${index}-${optIdx}`
                                          ] = el;
                                        }}
                                      />
                                      <label
                                        htmlFor={`choice-image-${index}-${optIdx}`}
                                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-2">
                                        <FontAwesomeIcon
                                          icon={faImage}
                                          size="xs"
                                        />
                                        Upload Image
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="delete-option-btn w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex-shrink-0 self-start sm:self-center"
                              onClick={() => {
                                deleteQuestionChoice(index, optIdx);
                              }}>
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="text-sm"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="add-option-btn flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium cursor-pointer px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
                      onClick={() => addQuestionChoice(index)}>
                      <FontAwesomeIcon icon={faPlus} /> Add Option
                    </button>
                  </div>
                )}

                {/* Insert Question Below Button */}
                <div className="flex justify-center mt-5 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                    onClick={() => insertQuestion(index, "under")}>
                    <FontAwesomeIcon icon={faPlusCircle} size="xs" />
                    Insert Below
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

      {/* Centered Add Question Button */}
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          onClick={handleAddQuestion}
          className="px-5 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} />
          Add Question
        </Button>
      </div>
    </div>
  );
}
