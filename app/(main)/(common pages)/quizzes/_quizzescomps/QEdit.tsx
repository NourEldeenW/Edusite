import { Button } from "@/components/ui/button";
import { api } from "@/lib/axiosinterceptor";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import QuizEditInfoCard from "./_editQcomps/editSettings";
import EditQuestions from "./_editQcomps/editQuestions";
import SaveChangesButton from "./_editQcomps/saveButton";

export default function QEdit({
  triggerRefetch,
}: {
  triggerRefetch: () => void;
}) {
  const updateCurrentMainView = useViewStore(
    (state) => state.updateCurrentMainView
  );

  const selectedQuizId = useQEditStore((state) => state.selectedQuizId);
  const updateQuizDetails = useQEditStore((state) => state.updateQuizDetails);

  useEffect(() => {
    if (!selectedQuizId) return;

    const fetchQuizDetails = async () => {
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${selectedQuizId}/`,
          {
            headers: {
              Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
            },
          }
        );

        updateQuizDetails(res.data);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    };

    fetchQuizDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="header mb-8 flex justify-between items-center flex-wrap">
        <Button
          variant="ghost"
          onClick={() => {
            triggerRefetch();
            updateCurrentMainView("dashboard");
            updateQuizDetails(null);
          }}
          className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover px-0">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Quizzes Dashboard
        </Button>

        <SaveChangesButton />
      </div>

      <QuizEditInfoCard />

      <EditQuestions />
    </>
  );
}
