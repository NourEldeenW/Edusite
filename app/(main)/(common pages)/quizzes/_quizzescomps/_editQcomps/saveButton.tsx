import { Button } from "@/components/ui/button";
import { useState } from "react";
import { showToast } from "../../../students/_students comps/main";
import { api } from "@/lib/axiosinterceptor";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import useQEditStore from "@/lib/stores/onlineQuizStores/editQuiz";

// Utility to convert base64 to Blob
const base64ToFile = (base64: string, filename: string): File | null => {
  try {
    const arr = base64.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    // Map mime type to file extension
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
    };

    const extension = mimeToExt[mime] || "jpg"; // Default to jpg
    const fullFilename = `${filename}.${extension}`;

    return new File([u8arr], fullFilename, { type: mime });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
  }
  return null; // Ensure null is returned on error
};

function detectImageSource(input: string): "base64" | "url" {
  if (input.startsWith("data:image/") && input.includes(";base64,")) {
    return "base64";
  }
  return "url";
}

const DJANGO_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function SaveChangesButton() {
  const [isSaving, setIsSaving] = useState(false);

  const access = useQuizStore_initial.getState().access;

  const saveChanges = async () => {
    const quizDetails = useQEditStore.getState().quizDetails;
    const deletedQuestionImages =
      useQEditStore.getState().deletedQuestionImages;
    const deletedChoiceImages = useQEditStore.getState().deletedOptionImages;

    if (!quizDetails) {
      showToast("No quiz details found.", "error");
      return;
    }
    setIsSaving(true);
    const payload = new FormData();

    // Append quiz info
    if (quizDetails?.title.length > 0)
      payload.append("title", quizDetails.title);
    payload.append("description", quizDetails.description);
    payload.append("grade_id", quizDetails.grade.id.toString());

    // Append centers
    quizDetails.center_times.map((center, index) => {
      payload.append(
        `centers[${index}][center_id]`,
        center.center.id.toString()
      );
      payload.append(`centers[${index}][open_date]`, center.open_date);
      payload.append(`centers[${index}][close_date]`, center.close_date);
    });

    // Append settings
    payload.append(
      "settings[timer_minutes]",
      quizDetails.settings.timer_minutes.toString()
    );
    payload.append(
      "settings[score_visibility]",
      quizDetails.settings.score_visibility
    );
    payload.append(
      "settings[answers_visibility]",
      quizDetails.settings.answers_visibility
    );
    payload.append(
      "settings[question_order]",
      quizDetails.settings.question_order
    );

    // Append questions and choices
    quizDetails.questions.map((question, index) => {
      if (question.id) {
        payload.append(`questions[${index}][id]`, question.id.toString());
      }
      if (question.text.length > 0)
        payload.append(`questions[${index}][text]`, question.text);
      payload.append(
        `questions[${index}][selection_type]`,
        question.selection_type
      );
      payload.append(`questions[${index}][points]`, question.points.toString());

      // Handle question image
      if (question.image && detectImageSource(question.image) === "base64") {
        const blob = base64ToFile(question.image, `question_${index}`);
        if (blob) {
          // Only append if blob is not null
          payload.append(`questions[${index}][image]`, blob);
        }
      } else if (question.id && deletedQuestionImages.length > 0) {
        const isDeleted = deletedQuestionImages.some(
          (image) => image.questionId === question.id
        );
        if (isDeleted) {
          payload.append(`questions[${index}][image]`, "");
        }
      }

      // Append choices
      question.choices.map((choice, choiceIndex) => {
        if (choice.id) {
          payload.append(
            `questions[${index}][choices][${choiceIndex}][id]`,
            choice.id.toString()
          );
        }
        if (choice.text.length > 0)
          payload.append(
            `questions[${index}][choices][${choiceIndex}][text]`,
            choice.text
          );
        payload.append(
          `questions[${index}][choices][${choiceIndex}][is_correct]`,
          choice.is_correct.toString()
        );

        // Handle choice image (for both existing and new choices)
        if (choice.image && detectImageSource(choice.image) === "base64") {
          const blob = base64ToFile(
            choice.image,
            `choice_${index}_${choiceIndex}`
          );
          if (blob) {
            // Only append if blob is not null
            payload.append(
              `questions[${index}][choices][${choiceIndex}][image]`,
              blob
            );
          }
        } else if (choice.id && deletedChoiceImages.length > 0) {
          const isDeleted = deletedChoiceImages.some(
            (image) =>
              image.questionId === question.id && image.optionId === choice.id
          );
          if (isDeleted) {
            payload.append(
              `questions[${index}][choices][${choiceIndex}][image]`,
              ""
            );
          }
        }
      });
    });

    try {
      await api.put(
        `${DJANGO_BASE_URL}onlinequiz/quizzes/${quizDetails.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );
      showToast("Changes saved successfully.", "success");
    } catch {
      showToast("Failed to save changes.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={saveChanges}
      disabled={isSaving}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
      {isSaving ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </span>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}
