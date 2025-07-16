import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useCreateQuizStore, {
  Question,
} from "@/lib/stores/onlineQuizStores/createQuiz";
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
import { ChangeEvent, useCallback, useRef, useState } from "react";

const QUESTION_TYPES = [
  { label: "Single Answer", value: "single" },
  { label: "Multiple Answers", value: "multiple" },
];

export default function CreateQuestions() {
  const questions = useCreateQuizStore((state) => state.createdQuiz.questions);
  const addQuestion = useCreateQuizStore((state) => state.addQuestion);
  const deleteQuestion = useCreateQuizStore((state) => state.deleteQuestion);
  const moveQuestion = useCreateQuizStore((state) => state.moveQuestion);
  const editQuestion = useCreateQuizStore((state) => state.editQuestion);
  const insertQuestion = useCreateQuizStore((state) => state.insertQuestion);
  const deleteQuestionChoice = useCreateQuizStore(
    (state) => state.deleteQuestionChoice
  );
  const editQuestionChoice = useCreateQuizStore(
    (state) => state.editQuestionChoice
  );
  const addQuestionChoice = useCreateQuizStore(
    (state) => state.addQuestionChoice
  );
  const setQuestionImage = useCreateQuizStore(
    (state) => state.setQuestionImage
  );
  const deleteQuestionImage = useCreateQuizStore(
    (state) => state.deleteQuestionImage
  );
  const setChoiceImage = useCreateQuizStore((state) => state.setChoiceImage);
  const deleteChoiceImage = useCreateQuizStore(
    (state) => state.deleteChoiceImage
  );

  // Collapse state management
  const [isCollapseMode, setIsCollapseMode] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Properly typed ref object
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddQuestion = () => {
    const newQuestionIndex = questions.length;
    addQuestion({
      question_type: "mcq",
      selection_type: "single",
      text: "",
      points: 1,
      choices: [],
    });

    // Auto-expand new question in collapse mode
    if (isCollapseMode) {
      setExpandedQuestions((prev) => new Set([...prev, newQuestionIndex]));
    }
  };

  const toggleQuestionExpansion = (questionIndex: number) => {
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
  };

  const toggleCollapseMode = () => {
    setIsCollapseMode(!isCollapseMode);
    if (!isCollapseMode) {
      // When entering collapse mode, collapse all questions
      setExpandedQuestions(new Set());
    } else {
      // When exiting collapse mode, expand all questions
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
      // Reset to first correct answer only when switching to single
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

  // Handle points input with 2 decimal places
  const handlePointsChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value === "") {
      editQuestion(index, { points: 1 });
      return;
    }

    // Allow numbers with up to 2 decimal places
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
          // Store as base64 string
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

  return (
    <>
      {/* Collapse Mode Toggle */}
      {questions.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={isCollapseMode ? faEye : faEyeSlash}
                className="text-gray-600"
              />
              <span className="font-medium text-gray-700">
                {isCollapseMode ? "Collapse Mode: ON" : "Collapse Mode: OFF"}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({questions.length} question{questions.length !== 1 ? "s" : ""})
            </span>
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
      )}

      {questions.length > 0 &&
        questions.map((question, index) => (
          <div
            key={index}
            className={cn(
              "bg-white rounded-xl shadow-md border border-gray-200 relative transition-all hover:shadow-lg",
              isQuestionExpanded(index) ? "p-4 sm:p-6 mb-6" : "p-4 mb-3"
            )}>
            {/* Collapsed View */}
            {!isQuestionExpanded(index) && (
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => toggleQuestionExpansion(index)}>
                <div className="flex items-start sm:items-center gap-3 flex-1 w-full">
                  <div className="question-number text-lg font-semibold text-blue-600 flex-shrink-0">
                    Q{index + 1}
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
                    onClick={() =>
                      insertQuestion(
                        {
                          question_type: "mcq",
                          selection_type: "single",
                          text: "",
                          points: 1,
                          choices: [],
                        },
                        index,
                        "above"
                      )
                    }>
                    <FontAwesomeIcon icon={faPlusCircle} size="xs" />
                    Insert Above
                  </Button>
                </div>

                <div className="question-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="question-number text-xl font-semibold text-blue-600">
                    Question {index + 1}
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
                  <label className="block mb-2 font-medium text-gray-700">
                    Question Text
                  </label>
                  <Textarea
                    className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-full resize-y overflow-y-auto"
                    placeholder="Enter your question"
                    style={{
                      minHeight: 81,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
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
                          onClick={() => deleteQuestionImage(index)}>
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="block mb-2 font-medium text-gray-700">
                    Choices Type
                  </label>
                  <div className="question-type-select grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUESTION_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={cn(
                          "p-4 border rounded-lg text-center cursor-pointer transition-all flex items-center justify-center",
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
                        {type.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="block mb-2 font-medium text-gray-700">
                    Points
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={question.points}
                    onChange={(e) => handlePointsChange(e, index)}
                  />
                </div>

                {question.question_type && (
                  <div className="form-group">
                    <label className="block mb-2 font-medium text-gray-700">
                      Options
                    </label>
                    <div className="options-container mb-4">
                      {question.choices.map(
                        (
                          option: {
                            text: string;
                            is_correct: boolean;
                            image?: string | null;
                          },
                          optIdx: number
                        ) => (
                          <div
                            key={optIdx}
                            className="option-item flex flex-col gap-3 p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                              <div className="flex items-start gap-3 w-full">
                                <div
                                  className={cn(
                                    "option-checkbox w-6 h-6 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer",
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
                                    style={{
                                      wordBreak: "break-word",
                                      overflowWrap: "break-word",
                                    }}
                                    value={option.text}
                                    onChange={(e) =>
                                      editQuestionChoice(index, optIdx, {
                                        text: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                className="delete-option-btn w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex-shrink-0 self-end sm:self-auto"
                                onClick={() => {
                                  deleteQuestionChoice(index, optIdx);
                                }}>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="text-sm"
                                />
                              </button>
                            </div>

                            {/* Choice Image Section */}
                            <div className="sm:ml-9">
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
                                        deleteChoiceImage(index, optIdx)
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
                        )
                      )}
                    </div>
                    <button
                      type="button"
                      className="add-option-btn flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium cursor-pointer px-4 py-2.5 rounded-lg transition-colors"
                      onClick={() =>
                        addQuestionChoice(index, {
                          text: "",
                          is_correct: false,
                        })
                      }>
                      <FontAwesomeIcon icon={faPlus} /> Add Option
                    </button>
                  </div>
                )}

                {/* Insert Question Below Button */}
                <div className="flex justify-center mt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                    onClick={() =>
                      insertQuestion(
                        {
                          question_type: "mcq",
                          selection_type: "single",
                          text: "",
                          points: 1,
                          choices: [],
                        },
                        index,
                        "under"
                      )
                    }>
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
          className="px-5 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Question
        </Button>
      </div>
    </>
  );
}
