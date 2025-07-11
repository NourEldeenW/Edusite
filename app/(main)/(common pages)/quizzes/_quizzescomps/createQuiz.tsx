import { Button } from "@/components/ui/button";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import { ArrowLeft } from "lucide-react";

export default function CreateQuiz() {
  const { updateCurrentMainView } = useViewStore();

  return (
    <>
      <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => {
              updateCurrentMainView("dashboard");
            }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes Dashboard
          </Button>
        </div>
      </div>
    </>
  );
}
