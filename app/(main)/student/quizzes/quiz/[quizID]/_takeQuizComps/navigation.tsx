import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import {
  CheckCircle2,
  Clock,
  Flag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";

export default function QuizNavigation() {
  const {
    quizData,
    currentQuestionIndex,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    selectedAnswers,
    submitAnswers,
    loading,
    timer,
  } = useTakeQuizStore();

  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Determine how many items per page based on question count
  const questionsPerPage = useMemo(() => {
    if (!quizData) return 20;
    const count = quizData.questions.length;
    if (count <= 20) return 20;
    if (count <= 50) return 25;
    if (count <= 100) return 30;
    return 40;
  }, [quizData]);

  const totalPages = Math.ceil(
    (quizData?.questions.length || 0) / questionsPerPage
  );

  // The questions for the currently active page
  const currentPageQuestions = quizData
    ? quizData.questions.slice(
        page * questionsPerPage,
        (page + 1) * questionsPerPage
      )
    : [];

  // Sync `page` when current question moves outside of view
  useEffect(() => {
    if (!quizData) return;
    const newPage = Math.floor(currentQuestionIndex / questionsPerPage);
    if (newPage !== page) {
      setPage(newPage);
    }
  }, [currentQuestionIndex, questionsPerPage, quizData, page]);

  // Flag/unflag a question
  const toggleFlag = useCallback((idx: number) => {
    setFlaggedQuestions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitAnswers();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitAnswers]);

  // Check if a question has an answer
  const isAnswered = useCallback(
    (questionId: number) =>
      selectedAnswers.some((ans) => ans.questionID === questionId),
    [selectedAnswers]
  );

  // Progress metrics
  const answeredCount = quizData
    ? quizData.questions.filter((q) => isAnswered(q.id)).length
    : 0;
  const totalQuestions = quizData?.questions.length || 0;
  const progress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Timer formatting
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!quizData) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white shadow-lg border-t">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Collapse toggle (mobile only) */}
      <div className="flex justify-center py-1 md:hidden">
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          className="text-gray-500 hover:text-gray-700 focus:outline-none">
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Main nav container */}
      <div
        className={`container mx-auto px-2 overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-screen py-2" : "max-h-0 md:max-h-screen md:py-2"
        }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Prev/Next + Flag */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 || loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 focus:outline-none"
              title="Previous question">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1 || loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 focus:outline-none"
              title="Next question">
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => toggleFlag(currentQuestionIndex)}
              className={`p-2 rounded-lg focus:outline-none ${
                flaggedQuestions.includes(currentQuestionIndex)
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Flag question">
              <Flag size={16} />
            </button>
          </div>

          {/* Pagination grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2 mb-1 text-xs text-gray-600">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 focus:outline-none"
                title="Previous page">
                <ChevronLeft size={16} />
              </button>
              <span>
                {page * questionsPerPage + 1}-
                {Math.min((page + 1) * questionsPerPage, totalQuestions)} /{" "}
                {totalQuestions}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 focus:outline-none"
                title="Next page">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex gap-1 flex-wrap justify-center overflow-x-auto max-h-40 py-1">
              {currentPageQuestions.map((question, idx) => {
                const globalIdx = page * questionsPerPage + idx;
                const isCurrent = globalIdx === currentQuestionIndex;
                const answered = isAnswered(question.id);
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(globalIdx)}
                    className={`w-7 h-7 text-[10px] rounded flex items-center justify-center relative focus:outline-none ${
                      isCurrent
                        ? "bg-blue-100 border border-blue-500 text-blue-700"
                        : answered
                        ? "bg-green-100 border border-green-300 text-green-700"
                        : "bg-gray-100 border border-gray-300 text-gray-700"
                    }`}
                    title={`Question ${globalIdx + 1}`}>
                    {globalIdx + 1}
                    {flaggedQuestions.includes(globalIdx) && (
                      <Flag
                        size={8}
                        className="absolute -top-0.5 -right-0.5 text-amber-600"
                        fill="currentColor"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer, count, submit */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={12} />
              <span className="font-medium">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <CheckCircle2 size={12} className="text-green-500" />
              <span className="font-medium">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || isSubmitting}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1 text-xs focus:outline-none"
              title="Submit quiz">
              {isSubmitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
