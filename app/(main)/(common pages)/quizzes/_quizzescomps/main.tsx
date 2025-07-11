"use client";

import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import QDashboard from "./qdashboard";
import { useEffect } from "react";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import CreateQuiz from "./createQuiz";

export default function Main({ access }: { access: string }) {
  const { updateAccess } = useQuizStore_initial();
  const { mainView } = useViewStore();
  useEffect(() => {
    updateAccess(access);
  }, [access, updateAccess]);

  switch (mainView) {
    case "dashboard":
      return <QDashboard />;
    case "create":
      return <CreateQuiz />;
    default:
      return <QDashboard />;
  }
}
