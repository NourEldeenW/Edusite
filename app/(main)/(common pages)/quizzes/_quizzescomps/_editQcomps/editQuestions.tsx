import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import { Question } from "@/lib/stores/onlineQuizStores/createQuiz";
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
  faCheck,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { ChangeEvent, useCallback, useRef, useState } from "react";

const QUESTION_TYPES = [
  { label: "Single Answer", value: "single" },
  { label: "Multiple Answers", value: "multiple" },
];

export default function EditQuestions() {
  // store selectors
  const questions = useQEditStore((s) => s.quizDetails?.questions ?? []);
  const addQuestion = useQEditStore((s) => s.addQuestion);
  const deleteQuestion = useQEditStore((s) => s.deleteQuestion);
  const moveQuestion = useQEditStore((s) => s.moveQuestion);
  const editQuestion = useQEditStore((s) => s.editQuestion);
  const insertQuestion = useQEditStore((s) => s.insertQuestion);
  const deleteQuestionChoice = useQEditStore((s) => s.deleteQuestionChoice);
  const editQuestionChoice = useQEditStore((s) => s.editQuestionChoice);
  const addQuestionChoice = useQEditStore((s) => s.addQuestionChoice);
  const setQuestionImage = useQEditStore((s) => s.setQuestionImage);
  const deleteQuestionImage = useQEditStore((s) => s.deleteQuestionImage);
  const setChoiceImage = useQEditStore((s) => s.setChoiceImage);
  const deleteChoiceImage = useQEditStore((s) => s.deleteOptionImage);

  const [isCollapseMode, setIsCollapseMode] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // toggle collapse/expand all
  const toggleCollapseMode = () => {
    setIsCollapseMode((prev) => !prev);
    setExpandedQuestions(
      () =>
        isCollapseMode
          ? new Set() // if already collapsed, clear expansions
          : new Set(questions.map((_, i) => i)) // else expand all
    );
  };

  // per‐question expand/collapse
  const isQuestionExpanded = (i: number) =>
    !isCollapseMode || expandedQuestions.has(i);

  const toggleQuestionExpansion = (i: number) =>
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });

  const collapseQuestion = (i: number) =>
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      next.delete(i);
      return next;
    });

  const getQuestionPreview = (q: Question) =>
    q.text.length > 50 ? q.text.slice(0, 50) + "…" : q.text || "Empty question";

  const handleAddQuestion = () => {
    const idx = questions.length;
    addQuestion();
    if (isCollapseMode) {
      setExpandedQuestions((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    }
  };

  const handleSelectionTypeChange = (
    qi: number,
    newType: "single" | "multiple"
  ) => {
    const q = questions[qi];
    if (newType === "single" && q.selection_type === "multiple") {
      const firstCorrect = q.choices.findIndex((c) => c.is_correct);
      const updated = q.choices.map((c, i) => ({
        ...c,
        is_correct: i === firstCorrect,
      }));
      editQuestion(qi, { selection_type: newType, choices: updated });
    } else {
      editQuestion(qi, { selection_type: newType });
    }
  };

  const handleChoiceClick = (qi: number, ci: number, current: boolean) => {
    const q = questions[qi];
    if (q.selection_type === "single") {
      const updated = q.choices.map((c, i) => ({
        ...c,
        is_correct: i === ci ? !current : false,
      }));
      editQuestion(qi, { choices: updated });
    } else {
      editQuestionChoice(qi, ci, { is_correct: !current });
    }
  };

  const handlePointsChange = (e: ChangeEvent<HTMLInputElement>, qi: number) => {
    const v = e.target.value;
    if (v === "") {
      editQuestion(qi, { points: 1 });
      return;
    }
    const rx = /^\d+(\.\d{0,2})?$/;
    if (!rx.test(v)) return;
    const pts = parseFloat(v);
    if (!isNaN(pts)) {
      editQuestion(qi, { points: pts });
    }
  };

  // image uploads
  const handleQuestionImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>, qi: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setQuestionImage(qi, ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [setQuestionImage]
  );

  const handleChoiceImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>, qi: number, ci: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setChoiceImage(qi, ci, ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [setChoiceImage]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {questions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200 gap-3">
          <div className="flex items-center gap-2 text-indigo-800">
            <FontAwesomeIcon
              icon={isCollapseMode ? faEye : faEyeSlash}
              className="text-indigo-600"
            />
            <span className="font-medium">
              {isCollapseMode ? "Collapse Mode: ON" : "Collapse Mode: OFF"}
            </span>
            <span className="text-sm text-indigo-600">
              ({questions.length} question
              {questions.length !== 1 ? "s" : ""})
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCollapseMode}
            className="flex items-center gap-2 text-indigo-700 border-indigo-300 hover:bg-indigo-100">
            <FontAwesomeIcon
              icon={isCollapseMode ? faChevronDown : faChevronUp}
            />
            {isCollapseMode ? "Expand All" : "Collapse All"}
          </Button>
        </div>
      )}

      {questions.map((question, qi) => (
        <div
          key={qi}
          className={cn(
            "bg-white rounded-xl shadow-sm border border-indigo-100 mx-auto overflow-hidden transition-all hover:shadow-md",
            isQuestionExpanded(qi) ? "p-5" : "p-3"
          )}>
          {!isQuestionExpanded(qi) && (
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleQuestionExpansion(qi)}>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-indigo-600 bg-indigo-50 rounded-full w-8 h-8 flex items-center justify-center">
                  {qi + 1}
                </div>
                <div className="text-gray-700 line-clamp-1 group-hover:text-indigo-800">
                  {getQuestionPreview(question)}
                </div>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-gray-400 group-hover:text-indigo-600"
              />
            </div>
          )}

          {isQuestionExpanded(qi) && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-white bg-indigo-600 rounded-full w-8 h-8 flex items-center justify-center">
                    {qi + 1}
                  </div>
                  <div className="text-xl font-bold text-indigo-800">
                    Question {qi + 1}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCollapseMode && (
                    <button
                      onClick={() => collapseQuestion(qi)}
                      className="p-2 bg-indigo-50 rounded-full hover:bg-indigo-100 text-indigo-600"
                      title="Collapse">
                      <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                  )}
                  <button
                    onClick={() => moveQuestion(qi, "up")}
                    disabled={qi === 0}
                    className={cn(
                      "p-2 rounded-full",
                      qi === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                    )}>
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                  <button
                    onClick={() => moveQuestion(qi, "down")}
                    disabled={qi === questions.length - 1}
                    className={cn(
                      "p-2 rounded-full",
                      qi === questions.length - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                    )}>
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(qi)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {/* Question Text & Image Side by Side */}
              <div className="mb-5 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Question Text
                  </label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => editQuestion(qi, { text: e.target.value })}
                    placeholder="Type your question..."
                    className="w-full min-h-[100px] border-gray-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Image
                  </label>
                  <div className="flex items-center justify-center">
                    {question.image ? (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-indigo-100">
                        <Image
                          src={question.image}
                          alt="Question"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() =>
                            deleteQuestionImage(question.id || null, qi)
                          }
                          className="absolute top-1 right-1 bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                          <FontAwesomeIcon icon={faTimes} size="xs" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          id={`q-img-${qi}`}
                          className="hidden"
                          onChange={(e) => handleQuestionImageUpload(e, qi)}
                          ref={(el) => {
                            fileInputRefs.current[`q-${qi}`] = el;
                          }}
                        />
                        <label
                          htmlFor={`q-img-${qi}`}
                          className="flex flex-col items-center justify-center gap-1 text-indigo-600 hover:text-indigo-800 cursor-pointer text-sm w-full h-32 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                          <FontAwesomeIcon icon={faImage} size="lg" />
                          <span>Upload Image</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Type & Points */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-5">
                <div className="md:col-span-5">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Type
                  </label>
                  <div className="flex gap-2">
                    {QUESTION_TYPES.map((t) => (
                      <div
                        key={t.value}
                        onClick={() =>
                          handleSelectionTypeChange(
                            qi,
                            t.value as "single" | "multiple"
                          )
                        }
                        className={cn(
                          "px-4 py-2 border rounded-lg cursor-pointer transition-colors font-medium w-full",
                          question.selection_type === t.value
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}>
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Points
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    value={question.points}
                    onChange={(e) => handlePointsChange(e, qi)}
                    className="w-full border-gray-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-gray-700 font-medium">Options</label>
                  <button
                    onClick={() => addQuestionChoice(qi)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    <FontAwesomeIcon icon={faPlus} size="sm" />
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {question.choices.map((opt, ci) => (
                    <div
                      key={ci}
                      className="flex items-center border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 transition-colors bg-white">
                      <div
                        onClick={() =>
                          handleChoiceClick(qi, ci, opt.is_correct)
                        }
                        className={cn(
                          "flex-shrink-0 w-6 h-6 border-2 rounded-full flex items-center justify-center cursor-pointer transition-colors",
                          opt.is_correct
                            ? question.selection_type === "single"
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-emerald-500 border-emerald-500"
                            : "bg-white border-gray-400 hover:border-indigo-400"
                        )}>
                        {opt.is_correct && (
                          <FontAwesomeIcon
                            icon={
                              question.selection_type === "single"
                                ? faCheck
                                : faCheckCircle
                            }
                            className="text-white text-xs"
                          />
                        )}
                      </div>

                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          editQuestionChoice(qi, ci, { text: e.target.value })
                        }
                        placeholder="Option text"
                        className="ml-3 flex-1 border-0 focus:ring-0 text-sm py-0"
                      />

                      {opt.image ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden ml-2 border border-indigo-100">
                          <Image
                            src={opt.image}
                            alt="Option"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() =>
                              deleteChoiceImage(
                                question.id || null,
                                opt.id || null,
                                qi,
                                ci
                              )
                            }
                            className="absolute top-0 right-0 bg-white text-red-600 w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                            <FontAwesomeIcon icon={faTimes} size="xs" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            id={`opt-img-${qi}-${ci}`}
                            className="hidden"
                            onChange={(e) => handleChoiceImageUpload(e, qi, ci)}
                            ref={(el) => {
                              fileInputRefs.current[`opt-${qi}-${ci}`] = el;
                            }}
                          />
                          <label
                            htmlFor={`opt-img-${qi}-${ci}`}
                            className="ml-2 text-indigo-600 hover:text-indigo-800 cursor-pointer text-sm p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100">
                            <FontAwesomeIcon icon={faImage} size="sm" />
                          </label>
                        </>
                      )}

                      <button
                        onClick={() => deleteQuestionChoice(qi, ci)}
                        className="ml-2 text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insert Below */}
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => insertQuestion(qi, "under")}
                  className="gap-2 text-indigo-700 hover:bg-indigo-50 border border-indigo-200">
                  <FontAwesomeIcon icon={faPlusCircle} />
                  Insert Below
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add Question */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-5 px-6 rounded-xl shadow-sm transition-all">
          <FontAwesomeIcon icon={faPlus} />
          Add Question
        </Button>
      </div>
    </div>
  );
}
