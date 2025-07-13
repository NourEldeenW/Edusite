"use client";

import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import QDashboard from "./qdashboard";
import { useEffect, useState } from "react";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import CreateQuiz from "./createQuiz";
import { api } from "@/lib/axiosinterceptor";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function Main({ access }: { access: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateAccess, updateGrades, updateCenters, updateQuizzes } =
    useQuizStore_initial();
  const { mainView } = useViewStore();
  useEffect(() => {
    updateAccess(access);
  }, [access, updateAccess]);

  useEffect(() => {
    if (!access) return;

    const fetch_initials = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [centersRes, gradesRes, quizzesRes] = await Promise.all([
          api.get(`${djangoApi}accounts/centers/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoApi}accounts/grades/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoApi}onlinequiz/quizzes/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
        ]);
        updateCenters(centersRes.data);
        updateGrades(gradesRes.data);
        updateQuizzes(quizzesRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetch_initials();
  }, [access, updateCenters, updateGrades, updateQuizzes]);

  switch (mainView) {
    case "dashboard":
      return <QDashboard isLoading={isLoading} error={error} />;
    case "create":
      return <CreateQuiz />;
    default:
      return <QDashboard isLoading={isLoading} error={error} />;
  }
}
