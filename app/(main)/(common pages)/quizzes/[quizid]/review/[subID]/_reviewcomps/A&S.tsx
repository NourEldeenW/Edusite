import { CheckIcon, XIcon as XMarkIcon } from "lucide-react";
import Image from "next/image";

interface ApiDataType {
  id: number;
  quiz_title: string;
  quiz_description: string;
  student_id: string;
  student_name: string;
  center: {
    id: number;
    name: string;
    teacher: number;
  };
  grade: {
    id: number;
    name: string;
  };
  start_time: string;
  end_time: string;
  score: string;
  is_submitted: boolean;
  time_taken: string;
  answers: Array<{
    id: number;
    question: {
      id: number;
      text: string;
      image: null | string;
    };
    selection_type: "single" | "multiple";
    choices: Array<{
      id: number;
      text: string;
      image: null | string;
      is_correct: boolean;
    }>;
    selected_choices: Array<{
      id: number;
      text: string;
      image: null | string;
      is_correct: boolean;
    }>;
    is_correct: boolean;
    points_earned: number;
  }>;
  submission_status: "on_time" | "late";
  is_score_released: boolean;
  are_answers_released: boolean;
}

interface AnswersAndScoresProps {
  data: ApiDataType;
}

export default function AnswersAndScores({ data }: AnswersAndScoresProps) {
  const getQuestionStatus = (answer: ApiDataType["answers"][0]) => {
    if (!data.are_answers_released) return null;

    if (answer.is_correct) {
      return {
        status: "Correct",
        color: "bg-green-500",
        textColor: "text-green-600",
      };
    } else if (answer.points_earned > 0) {
      return {
        status: "Partial",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
      };
    } else {
      return {
        status: "Incorrect",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    }
  };

  const isChoiceSelected = (
    choiceId: number,
    selectedChoices: ApiDataType["answers"][0]["selected_choices"]
  ) => {
    return selectedChoices.some((selected) => selected.id === choiceId);
  };

  const getChoiceStyle = (
    choice: ApiDataType["answers"][0]["choices"][0],
    isSelected: boolean
  ) => {
    if (!data.are_answers_released) {
      return isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300";
    }

    if (choice.is_correct && isSelected) {
      return "border-green-500 bg-green-50";
    } else if (choice.is_correct) {
      return "border-green-500 bg-green-50";
    } else if (isSelected) {
      return "border-blue-500 bg-blue-50";
    } else {
      return "border-gray-300";
    }
  };

  const getCheckboxStyle = (
    choice: ApiDataType["answers"][0]["choices"][0],
    isSelected: boolean
  ) => {
    if (!data.are_answers_released) {
      return isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300";
    }

    if (choice.is_correct) {
      return "border-green-500 bg-green-500";
    } else if (isSelected) {
      return "border-blue-500 bg-blue-500";
    } else {
      return "border-gray-300";
    }
  };

  const formatSelectionType = (type: "single" | "multiple") => {
    return type === "single"
      ? "Multiple Choice (Single Answer)"
      : "Multiple Choice (Multiple Answers)";
  };

  return (
    <div className=" mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>

      {/* Questions List */}
      <div className="question-list space-y-6">
        {data.answers.map((answer, index) => {
          const questionStatus = getQuestionStatus(answer);

          return (
            <div
              key={answer.id}
              className="question-card bg-white rounded-md p-6 shadow-sm border border-gray-200 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Question Header */}
              <div className="question-header flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold">
                      Question {index + 1}
                    </span>
                    {questionStatus && (
                      <span
                        className={`px-2 py-1 ${questionStatus.color} text-white rounded-full text-xs`}>
                        {questionStatus.status}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">
                    {formatSelectionType(answer.selection_type)}
                  </p>
                </div>
                {data.is_score_released && (
                  <div
                    className={`text-xl font-bold ${
                      questionStatus?.textColor || "text-gray-600"
                    }`}>
                    {answer.points_earned} point
                    {answer.points_earned !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div className="question-text text-lg font-medium mb-4">
                {answer.question.text}
              </div>

              {/* Question Image */}
              {answer.question.image && (
                <div className="image-container mb-4">
                  <Image
                    src={answer.question.image}
                    alt="Question image"
                    width={600}
                    height={400}
                    className="rounded-md"
                  />
                </div>
              )}

              {/* Options Container */}
              <div className="options-container grid gap-3 mb-4">
                {answer.choices.map((choice) => {
                  const isSelected = isChoiceSelected(
                    choice.id,
                    answer.selected_choices
                  );
                  const choiceStyle = getChoiceStyle(choice, isSelected);
                  const checkboxStyle = getCheckboxStyle(choice, isSelected);

                  return (
                    <div
                      key={choice.id}
                      className={`option-item flex items-start gap-4 p-4 border rounded-sm ${choiceStyle}`}>
                      <div
                        className={`option-checkbox w-5 h-5 border-2 rounded flex items-center justify-center mt-0.5 ${checkboxStyle}`}>
                        {(isSelected ||
                          (data.are_answers_released && choice.is_correct)) && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="option-content flex-1">
                        <div
                          className={`option-text ${
                            isSelected ||
                            (data.are_answers_released && choice.is_correct)
                              ? "font-medium"
                              : ""
                          }`}>
                          {choice.text}
                          {data.are_answers_released && choice.is_correct && (
                            <span className="correct-answer-indicator ml-2 text-green-600 text-sm">
                              (Correct Answer)
                            </span>
                          )}
                          {isSelected && (
                            <span className="student-answer-indicator ml-2 text-blue-600 text-sm">
                              (Student&rsquo;s Answer)
                            </span>
                          )}
                        </div>
                        {choice.image && (
                          <div className="choice-image mt-2">
                            <Image
                              src={choice.image}
                              alt="Choice image"
                              width={300}
                              height={200}
                              className="rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Data Messages */}
      {!data.are_answers_released && !data.is_score_released && (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
          <div className="text-gray-500">
            <XMarkIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Results Not Available</h3>
            <p>The teacher has not released the answers or scores yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
