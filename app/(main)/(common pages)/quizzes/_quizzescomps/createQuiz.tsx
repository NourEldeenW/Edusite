import { Button } from "@/components/ui/button";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import useCreateQuizStore from "@/lib/stores/onlineQuizStores/createQuiz";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import BasicInfoComp from "./_creatQcomps/basicInfo";
import Settings from "./_creatQcomps/settings";
import CreateQuestions from "./_creatQcomps/createQuestions";
import { showToast } from "../../students/_students comps/main";
import Review from "./_creatQcomps/review";
import { api } from "@/lib/axiosinterceptor";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function CreateQuiz() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const { updateCurrentMainView } = useViewStore();

  // Don't subscribe to any quiz data - we'll access it directly via getState()
  const getQuizData = () => useCreateQuizStore.getState().createdQuiz;
  const clearQuiz = useCreateQuizStore().clearQuiz;
  const addQuiz = useQuizStore_initial((state) => state.addQuiz);

  const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Validation functions for each step
  const validateStep = (step: number): boolean => {
    const quizData = getQuizData();

    switch (step) {
      case 1: // Basic Info validation
        if (!quizData.basic_info.title.trim()) {
          showToast("Quiz title is required", "error");
          return false;
        }
        if (quizData.basic_info.grade_id <= 0) {
          showToast("Please select a grade", "error");
          return false;
        }
        if (quizData.basic_info.centers.length <= 0) {
          showToast("Please select at least one center", "error");
          return false;
        }
        return true;

      case 2: // Settings validation
        return true; // No validation needed

      case 3: // Questions validation
        if (quizData.questions.length <= 0) {
          showToast("Please add at least one question", "error");
          return false;
        }

        for (const [index, question] of quizData.questions.entries()) {
          if (!question.text.trim()) {
            showToast(`Question ${index + 1} text is required`, "error");
            return false;
          }

          if (question.choices.length < 2) {
            showToast(
              `Question ${index + 1} needs at least 2 options`,
              "error"
            );
            return false;
          }

          const hasCorrectAnswer = question.choices.some(
            (choice) => choice.is_correct
          );
          if (!hasCorrectAnswer) {
            showToast(
              `Question ${index + 1} needs at least one correct answer`,
              "error"
            );
            return false;
          }

          const isEmpty = question.choices.some(
            (choice) => !choice.text.trim() && !choice.image
          );
          if (isEmpty) {
            showToast(
              `Question ${index + 1} option text or image is required`,
              "error"
            );
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    goToStep(currentStep - 1);
  };

  const createQuiz = async () => {
    const quiz = useCreateQuizStore.getState().createdQuiz;

    // Validate quiz data before submission
    if (!quiz.basic_info.title.trim()) {
      showToast("Quiz title is required", "error");
      return;
    }

    if (quiz.basic_info.grade_id <= 0) {
      showToast("Please select a grade", "error");
      return;
    }

    if (quiz.basic_info.centers.length === 0) {
      showToast("Please select at least one center", "error");
      return;
    }

    // Validate center dates
    for (const [index, center] of quiz.basic_info.centers.entries()) {
      const openDate = new Date(center.open_date);
      const closeDate = new Date(center.close_date);

      if (closeDate <= openDate) {
        showToast(
          `Center ${index + 1}: Close date must be after open date`,
          "error"
        );
        return;
      }
    }

    if (quiz.questions.length === 0) {
      showToast("Please add at least one question", "error");
      return;
    }

    // Validate questions and choices
    for (const [qIndex, question] of quiz.questions.entries()) {
      if (!question.text.trim() && !question.image) {
        showToast(
          `Question ${qIndex + 1} requires either text or image`,
          "error"
        );
        return;
      }

      if (question.choices.length < 2) {
        showToast(`Question ${qIndex + 1} needs at least 2 options`, "error");
        return;
      }

      const correctChoices = question.choices.filter(
        (choice) => choice.is_correct
      ).length;

      if (question.selection_type === "single") {
        if (correctChoices !== 1) {
          showToast(
            `Question ${
              qIndex + 1
            } requires exactly one correct answer for single-select`,
            "error"
          );
          return;
        }
      } else if (correctChoices < 1) {
        showToast(
          `Question ${qIndex + 1} needs at least one correct answer`,
          "error"
        );
        return;
      }

      for (const [cIndex, choice] of question.choices.entries()) {
        if (!choice.text.trim() && !choice.image) {
          showToast(
            `Option ${cIndex + 1} in Question ${
              qIndex + 1
            } requires either text or image`,
            "error"
          );
          return;
        }
      }
    }

    const formData = new FormData();

    // 1. Append basic quiz info
    formData.append("title", quiz.basic_info.title);

    // Only append description if it exists
    if (quiz.basic_info.description && quiz.basic_info.description.trim()) {
      formData.append("description", quiz.basic_info.description);
    }

    formData.append("grade_id", quiz.basic_info.grade_id.toString());

    // 2. Append centers with bracket notation
    quiz.basic_info.centers.forEach((center, index) => {
      formData.append(
        `centers[${index}][center_id]`,
        center.center_id.toString()
      );
      formData.append(`centers[${index}][open_date]`, center.open_date);
      formData.append(`centers[${index}][close_date]`, center.close_date);
    });

    // 3. Append settings with bracket notation
    formData.append(
      "settings[timer_minutes]",
      quiz.settings.timer_minutes.toString()
    );
    formData.append(
      "settings[score_visibility]",
      quiz.settings.score_visibility
    );
    formData.append(
      "settings[answers_visibility]",
      quiz.settings.answers_visibility
    );
    formData.append("settings[question_order]", quiz.settings.question_order);

    // Helper function to convert base64 to File with proper extension
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
        return null;
      }
    };

    // 4. Process questions and choices
    quiz.questions.forEach((question, qIndex) => {
      // Question fields
      formData.append(
        `questions[${qIndex}][selection_type]`,
        question.selection_type
      );

      // Points are optional - only send if set
      if (question.points && question.points !== 1) {
        formData.append(
          `questions[${qIndex}][points]`,
          question.points.toString()
        );
      }

      // Handle question text
      if (question.text.trim()) {
        formData.append(`questions[${qIndex}][text]`, question.text);
      }

      // Handle question image
      if (question.image) {
        const file = base64ToFile(question.image, `question_${qIndex}`);
        if (file) {
          // Validate MIME type
          const validTypes = ["image/jpeg", "image/jpg", "image/png"];
          if (validTypes.includes(file.type)) {
            formData.append(`questions[${qIndex}][image]`, file);
          } else {
            showToast(
              `Question ${qIndex + 1}: Only JPG/JPEG/PNG images allowed`,
              "error"
            );
            return;
          }
        }
      }

      // Process choices
      question.choices.forEach((choice, cIndex) => {
        // Choice fields
        if (choice.text.trim()) {
          formData.append(
            `questions[${qIndex}][choices][${cIndex}][text]`,
            choice.text
          );
        }

        // Convert boolean to string as required by API
        formData.append(
          `questions[${qIndex}][choices][${cIndex}][is_correct]`,
          choice.is_correct.toString()
        );

        // Handle choice image
        if (choice.image) {
          const file = base64ToFile(choice.image, `choice_${qIndex}_${cIndex}`);
          if (file) {
            // Validate MIME type
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (validTypes.includes(file.type)) {
              formData.append(
                `questions[${qIndex}][choices][${cIndex}][image]`,
                file
              );
            } else {
              showToast(
                `Question ${qIndex + 1} Option ${
                  cIndex + 1
                }: Only JPG/JPEG/PNG images allowed`,
                "error"
              );
              return;
            }
          }
        }
      });
    });

    try {
      const res = await api.post(
        `${DJANGO_API_URL}onlinequiz/quizzes/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
            // Content-Type will be set automatically with boundary
          },
        }
      );

      showToast("Quiz created successfully!", "success");
      addQuiz(res.data);
      clearQuiz();
      updateCurrentMainView("dashboard");
    } catch {
      showToast("error while creating quiz", "error");
    }
  };

  return (
    <>
      <div className="header mb-8">
        <Button
          variant="ghost"
          onClick={() => updateCurrentMainView("dashboard")}
          className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover px-0">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Quizzes Dashboard
        </Button>
      </div>

      <div className="bg-bg-secondary rounded-lg p-6 sm:p-8 shadow-sm border border-border-default">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-border-default">
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
            Create New Quiz
          </h2>
        </div>

        {/* Steps Container */}
        <div className="steps-container mb-10">
          <div className="relative mb-12">
            {/* Background track */}
            <div className="absolute h-1.5 bg-bg-tertiary top-1/2 left-0 right-0 -translate-y-1/2 z-10"></div>

            {/* Active progress indicator */}
            <div
              className="absolute h-1.5 bg-success top-1/2 left-0 -translate-y-1/2 z-20 transition-all duration-500"
              style={{ width: `${progressWidth}%` }}></div>

            {/* Step Indicators */}
            <div className="flex justify-between relative z-30">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`step flex flex-col items-center ${
                    step <= currentStep ? "active" : ""
                  }`}>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-success text-white"
                        : "bg-bg-subtle text-gray-500"
                    }`}>
                    {step}
                  </div>
                  <div className="step-label text-sm font-medium text-center max-w-[80px]">
                    {step === 1 && "Basic Info"}
                    {step === 2 && "Settings"}
                    {step === 3 && "Questions"}
                    {step === 4 && "Review"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content mb-8">
          {currentStep === 1 && (
            <div className="py-2">
              <BasicInfoComp />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Settings />
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <CreateQuestions />
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <Review />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="creator-footer flex justify-between pt-6 border-t border-border-default">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              className="px-5 py-3 text-base font-medium text-text-primary bg-bg-secondary hover:bg-bg-secondary"
              onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <Button
              className="px-6 py-3 text-base font-medium"
              onClick={handleNext}>
              Next:
              {currentStep === 1
                ? "Settings"
                : currentStep === 2
                ? "Questions"
                : "Review"}
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-success hover:bg-success/90 px-6 py-3 text-base font-medium"
              onClick={createQuiz}>
              <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
