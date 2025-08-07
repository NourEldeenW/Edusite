import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { Flag, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";

export default function QuizNavigation() {
  const {
    quizData,
    currentQuestionIndex,
    goToQuestion,
    selectedAnswers,
    submitAnswers,
    loading,
  } = useTakeQuizStore();

  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flag/unflag question
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

  // Check if question has answer
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
    <div className="w-full bg-white shadow-lg border-t rounded-t-lg">
      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main nav container */}
      <div className="container mx-auto px-2 overflow-hidden transition-all duration-300 max-h-screen py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Navigation controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFlag(currentQuestionIndex)}
              className={`p-3 rounded-lg focus:outline-none flex items-center ${
                flaggedQuestions.includes(currentQuestionIndex)
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Flag question">
              <Flag size={20} />
            </button>
          </div>

          {/* Question grid - All questions displayed */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-center gap-2 py-1 px-2">
              {quizData.questions.map((question, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const answered = isAnswered(question.id);

                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(idx)}
                    className={`min-w-[42px] h-[42px] text-sm font-medium rounded-lg flex items-center justify-center relative transition-all ${
                      isCurrent
                        ? "bg-blue-100 border-2 border-blue-500 scale-105"
                        : answered
                        ? "bg-green-100 border-2 border-green-300"
                        : "bg-gray-100 border-2 border-gray-300"
                    } hover:scale-105 focus:outline-none ${
                      answered
                        ? "text-green-700"
                        : isCurrent
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                    title={`Question ${idx + 1}`}>
                    {idx + 1}
                    {flaggedQuestions.includes(idx) && (
                      <Flag
                        size={12}
                        className="absolute -top-1 -right-1 text-amber-600 bg-amber-100 rounded-full p-0.5"
                        fill="currentColor"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer & Submit */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={loading || isSubmitting}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 font-bold focus:outline-none transition-colors"
              title="Submit quiz">
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
