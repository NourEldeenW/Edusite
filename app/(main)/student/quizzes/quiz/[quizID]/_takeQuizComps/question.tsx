import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { CheckIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Interfaces for ConfDialog - simplified, but compatible with store data
interface Question {
  id: number;
  text: string;
}

interface QuizData {
  questions: Question[];
}

interface SelectedAnswer {
  questionID: number;
  answerID: number;
}

export default function Question() {
  const {
    quizData,
    currentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    selectedAnswers,
    toggleAnswer,
    submitAnswers,
  } = useTakeQuizStore();
  const router = useRouter();
  const submissionCompleted = useTakeQuizStore((s) => s.submissionCompleted);
  const clearSubmissionCompleted = useTakeQuizStore(
    (s) => s.clearSubmissionCompleted
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitAnswers();
      setDialogOpen(false);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitAnswers]);

  useEffect(() => {
    if (submissionCompleted) {
      router.push(
        `/quizzes/${submissionCompleted.quizId}/review/${submissionCompleted.submissionId}`
      );
      clearSubmissionCompleted();
    }
  }, [submissionCompleted, router, clearSubmissionCompleted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextQuestion();
      if (e.key === "ArrowLeft") goToPreviousQuestion();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextQuestion, goToPreviousQuestion]);

  if (!quizData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 max-w-5xl">
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200/80">
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <div className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {currentQuestion.text}
        </div>

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
                  <div className="text-base font-medium text-gray-700">
                    {choice.text}
                  </div>
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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>

          {isLastQuestion ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto px-8 py-2.5 font-semibold rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                  Submit Quiz
                </button>
              </DialogTrigger>
              <ConfDialog
                quizData={quizData}
                selectedAnswers={selectedAnswers}
                submitAnswers={handleSubmit}
                isSubmitting={isSubmitting}
                onClose={() => setDialogOpen(false)}
              />
            </Dialog>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="w-full sm:w-auto px-8 py-2.5 font-semibold rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ConfDialog component copied from navigation.tsx
interface ConfDialogProps {
  quizData: QuizData;
  selectedAnswers: SelectedAnswer[];
  submitAnswers: () => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
}

function ConfDialog({
  quizData,
  selectedAnswers,
  submitAnswers,
  isSubmitting,
  onClose,
}: ConfDialogProps) {
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);

  const isAnswered = useCallback(
    (questionId: number) =>
      selectedAnswers.some((ans) => ans.questionID === questionId),
    [selectedAnswers]
  );

  useEffect(() => {
    if (quizData) {
      const unanswered = quizData.questions
        .map((question, index) => ({ index, id: question.id }))
        .filter((q) => !isAnswered(q.id))
        .map((q) => q.index + 1);

      setUnansweredQuestions(unanswered);
    }
  }, [quizData, isAnswered]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogDescription>
          {unansweredQuestions.length > 0 ? (
            <div className="py-4">
              <p className="font-medium text-red-500 mb-2">
                You haven&apos;t answered {unansweredQuestions.length}{" "}
                question(s):
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {unansweredQuestions.map((num) => (
                  <span
                    key={num}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-md">
                    Question {num}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-gray-600">
                Are you sure you want to submit anyway?
              </p>
            </div>
          ) : (
            <p className="py-4 text-gray-600">
              You&apos;ve answered all questions. Ready to submit your quiz?
            </p>
          )}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isSubmitting}>
          Cancel
        </button>

        <button
          onClick={submitAnswers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Anyway"
          )}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}
