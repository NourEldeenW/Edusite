"use client";

import { api } from "@/lib/axiosinterceptor";
import useAllQuizzes from "@/lib/stores/student/quizzes/allQuizzes";
import { useEffect, useState } from "react";
import QDashboard from "./qDashboard";

const djangoAPI = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function Main({ access }: { access: string }) {
  const [isFetchingQuizzes, setIsFetchingQuizzes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateAllQuizzes = useAllQuizzes.getState().updateAllQuizzes;

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      setIsFetchingQuizzes(true);
      try {
        const res = await api.get(`${djangoAPI}onlinequiz/quizzes/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        updateAllQuizzes(res.data);
      } catch {
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setIsFetchingQuizzes(false);
      }
    };
    fetchAllQuizzes();
  }, [access, updateAllQuizzes]);

  return (
    <>
      <QDashboard isLoading={isFetchingQuizzes} error={error} />
    </>
  );
}
