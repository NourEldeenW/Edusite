"use client";

import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import QDashboard from "./qdashboard";
import { useEffect, useState } from "react";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import CreateQuiz from "./createQuiz";
import { api } from "@/lib/axiosinterceptor";
import QEdit from "./QEdit";
import QSubmissions from "./Qsubmissions";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function Main({ access }: { access: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchcount, setRefetchcount] = useState(0);
  const { updateAccess, updateGrades, updateCenters, updateQuizzes } =
    useQuizStore_initial();
  const { mainView } = useViewStore();
  useEffect(() => {
    updateAccess(access);
  }, [access, updateAccess]);

  const triggerRefetch = () => {
    setRefetchcount((prev) => prev + 1);
  };

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
  }, [access, updateCenters, updateGrades, updateQuizzes, refetchcount]);

  switch (mainView) {
    case "dashboard":
      return <QDashboard isLoading={isLoading} error={error} />;
    case "edit":
      return <QEdit triggerRefetch={triggerRefetch} />;
    case "create":
      return <CreateQuiz />;
    case "submissions":
      return <QSubmissions />;
    default:
      return <QDashboard isLoading={isLoading} error={error} />;
  }
}
