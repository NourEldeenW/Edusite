import { Button } from "@/components/ui/button";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import BasicInfoComp from "./_creatQcomps/basicInfo";
import Settings from "./_creatQcomps/settings";

export default function CreateQuiz() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const { updateCurrentMainView } = useViewStore();

  const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
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
          {currentStep === 3 && <div>{/* Step 3 content */}</div>}
          {currentStep === 4 && <div>{/* Step 4 content */}</div>}
        </div>

        {/* Navigation Buttons */}
        <div className="creator-footer flex justify-between pt-6 border-t border-border-default">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              className="px-5 py-3 text-base font-medium text-text-primary bg-bg-secondary hover:bg-bg-secondary"
              onClick={() => goToStep(currentStep - 1)}>
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <Button
              className="px-6 py-3 text-base font-medium"
              onClick={() => goToStep(currentStep + 1)}>
              Next:{" "}
              {currentStep === 1
                ? "Settings"
                : currentStep === 2
                ? "Questions"
                : "Review"}
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button className="bg-success hover:bg-success/90 px-6 py-3 text-base font-medium">
              <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
