"use client";

import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { useEffect } from "react";
import Header from "./header";
import HeaderSkeleton from "./headerSkeleton";
import QuizNavigation from "./navigation";

interface propsType {
  access: string;
  quizId: string;
}

export default function TakeQuiz({ access, quizId }: propsType) {
  const loading = useTakeQuizStore((state) => state.loading);
  // const error = useTakeQuizStore((state) => state.error);
  const setSelectedQuizID = useTakeQuizStore.getState().setSelectedQuiz;
  const setAuthToken = useTakeQuizStore.getState().setAuthToken;

  useEffect(() => {
    if (!quizId || !access) return;
    setAuthToken(access);
    setSelectedQuizID(Number(quizId)); // Set the selected quiz ID
    return () => {
      setSelectedQuizID(null); // Clean up by setting the selected quiz ID to null when the component unmounts
    };
  }, [access, setSelectedQuizID, quizId, setAuthToken]);

  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      {!loading && <Header />}
      {!loading && <QuizNavigation />}
      <div className="max-w-4xl mx-auto px-4 py-8"></div>
    </>
  );
}
