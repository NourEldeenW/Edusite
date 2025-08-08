import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function Question() {
  const {
    quizData,
    currentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    selectedAnswers,
    toggleAnswer,
  } = useTakeQuizStore();

  // Handle keyboard navigation for a better user experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextQuestion();
      if (e.key === "ArrowLeft") goToPreviousQuestion();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextQuestion, goToPreviousQuestion]);

  if (!quizData) return <NoQuizSelected />;

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    // Use a slightly larger max-width and more padding for better spacing
    <div className="mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 max-w-5xl">
      {/* Main question card with enhanced shadow and rounding for a modern look */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200/80">
        {/* NEW: Question Number Counter */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        {/* Question Text: Increased size and weight for emphasis */}
        <div className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {currentQuestion.text}
        </div>

        {/* Question Image: Constrained height to prevent it from being too large */}
        {currentQuestion.image && (
          <div className="mb-8 w-full max-h-[550px] flex justify-center">
            <Image
              src={currentQuestion.image}
              alt="Question image"
              width={1000}
              height={562}
              className="rounded-lg object-contain"
            />
          </div>
        )}

        {/* Options List: Increased vertical spacing */}
        <div className="space-y-4 mb-10">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswers.some(
              (ans) =>
                ans.questionID === currentQuestion.id &&
                ans.answerID === choice.id
            );
            return (
              <div
                key={choice.id}
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onClick={() =>
                  toggleAnswer(
                    currentQuestion.id,
                    choice.id,
                    currentQuestion.selection_type
                  )
                }>
                {/* Larger checkbox/radio icon for better visibility and interaction */}
                <div
                  className={`w-6 h-6 border-2 mt-1 flex-shrink-0 flex items-center justify-center transition-colors ${
                    currentQuestion.selection_type === "single"
                      ? "rounded-full"
                      : "rounded-md"
                  } ${
                    isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-400 bg-white"
                  }`}>
                  {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  {/* Larger text for options */}
                  <div className="text-base font-medium text-gray-700">
                    {choice.text}
                  </div>
                  {/* ENHANCED: Larger, consistently sized image container for choices */}
                  {choice.image && (
                    <div className="mt-4 w-full h-48 relative">
                      <Image
                        src={choice.image}
                        alt="Choice image"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons: Redesigned for clarity and better UX */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <button
            onClick={isLastQuestion ? () => {} : goToNextQuestion}
            className={`w-full sm:w-auto px-8 py-2.5 font-semibold rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLastQuestion
                ? ""
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}>
            {!isLastQuestion && "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component (unchanged)
const NoQuizSelected = () => (
  <div className="text-center py-12">
    <h3 className="text-gray-700 text-lg">No quiz selected</h3>
    <p className="text-gray-500">Please choose a quiz to begin</p>
  </div>
);
