"use client";

import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { useEffect } from "react";
import Header from "./header";
import HeaderSkeleton from "./headerSkeleton";
import QuizNavigation from "./navigation";
import Question from "./question";
import { useRouter } from "next/navigation";

interface propsType {
  access: string;
  quizId: string;
}

export default function TakeQuiz({ access, quizId }: propsType) {
  const loading = useTakeQuizStore((state) => state.loading);
  const error = useTakeQuizStore((state) => state.error);
  const setSelectedQuizID = useTakeQuizStore.getState().setSelectedQuiz;
  const setAuthToken = useTakeQuizStore.getState().setAuthToken;

  const router = useRouter();
  useEffect(() => {
    if (!quizId || !access) return;
    setAuthToken(access);
    setSelectedQuizID(Number(quizId)); // Set the selected quiz ID
    return () => {
      setSelectedQuizID(null); // Clean up by setting the selected quiz ID to null when the component unmounts
    };
  }, [access, setSelectedQuizID, quizId, setAuthToken]);

  if (error) {
    router.push("/student/quizzes");
  }

  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      <div
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          WebkitTouchCallout: "none", // Blocks iOS long-press screenshot
          WebkitUserSelect: "none", // Disables text selection
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}>
        {!loading && <Header />}
        {!loading && <Question />}
        {!loading && <QuizNavigation />}
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8"></div>
    </>
  );
}
