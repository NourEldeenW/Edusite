import { CheckIcon, XIcon as XMarkIcon } from "lucide-react";
import Image from "next/image";
import ScrollButton from "./scrollButton";

// Define interfaces for nested objects
interface QuestionType {
  id: number;
  text: string;
  image: null | string;
}

interface ChoiceType {
  id: number;
  text: string;
  image: null | string;
  is_correct: boolean;
}

interface AnswerType {
  id: number;
  question: QuestionType;
  selection_type: "single" | "multiple";
  choices: ChoiceType[];
  selected_choices: ChoiceType[];
  is_correct: boolean;
  points_earned: number;
}

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
  answers?: AnswerType[];
  submission_status: "on_time" | "late";
  is_score_released: boolean;
  are_answers_released: boolean;
}

interface AnswersAndScoresProps {
  data: ApiDataType;
}

export default function AnswersAndScores({ data }: AnswersAndScoresProps) {
  const getQuestionStatus = (answer: AnswerType) => {
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
    selectedChoices: ChoiceType[]
  ) => {
    return selectedChoices.some((selected) => selected.id === choiceId);
  };

  const getChoiceStyle = (choice: ChoiceType, isSelected: boolean) => {
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

  const getCheckboxStyle = (choice: ChoiceType, isSelected: boolean) => {
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
    return type === "single" ? "Single Answer" : "Multiple Answers";
  };

  return (
    <div className="mx-auto p-4 bg-gray-50 min-h-screen max-w-4xl">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>

      {/* Quick Nav */}
      {(data.answers?.length ?? 0) > 0 && (
        <div className="question-nav mb-6 flex flex-wrap gap-2">
          {data.answers?.map((_, idx) => (
            <ScrollButton idx={idx} key={idx} />
          ))}
        </div>
      )}

      {/* Questions List */}
      <div className="question-list space-y-8">
        {data.answers?.map((answer, index) => {
          const questionStatus = getQuestionStatus(answer);

          return (
            <div
              id={`question-${index + 1}`}
              key={answer.id}
              className="question-card bg-white rounded-md p-6 shadow-sm border border-gray-200 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Compact Question Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Q{index + 1}</span>
                  {questionStatus && (
                    <span
                      className={`px-2 py-0.5 ${questionStatus.color} text-white rounded-full text-xs`}>
                      {questionStatus.status}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatSelectionType(answer.selection_type)}
                  </span>
                </div>
                {data.is_score_released && (
                  <div
                    className={`text-sm font-bold ${
                      questionStatus?.textColor || "text-gray-600"
                    }`}>
                    {answer.points_earned}pt
                    {answer.points_earned !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div className="question-text text-sm font-medium mb-4">
                {answer.question.text}
              </div>

              {/* Responsive Question Image */}
              {answer.question.image && (
                <div className="mb-4 w-full">
                  <Image
                    src={answer.question.image}
                    alt="Question image"
                    layout="responsive"
                    width={800}
                    height={450}
                    objectFit="contain"
                    className="rounded-md"
                  />
                </div>
              )}

              {/* Options Grid */}
              <div className="options-container grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`option-item flex items-start gap-3 p-3 border rounded-sm ${choiceStyle}`}>
                      <div
                        className={`option-checkbox w-5 h-5 border-2 rounded flex items-center justify-center mt-0.5 ${checkboxStyle}`}>
                        {(isSelected ||
                          (data.are_answers_released && choice.is_correct)) && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="option-content flex-1">
                        <div className="option-text text-sm">
                          {choice.text}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {data.are_answers_released && choice.is_correct && (
                              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                                Correct
                              </span>
                            )}
                            {isSelected && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                                Student&apos;s
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Responsive Choice Image */}
                        {choice.image && (
                          <div className="mt-3 w-full">
                            <Image
                              src={choice.image}
                              alt="Choice image"
                              layout="responsive"
                              width={400}
                              height={225}
                              objectFit="contain"
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

      {/* Compact No Data Message */}
      {!data.are_answers_released && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center mt-8">
          <XMarkIcon className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="text-base font-medium mb-1">Results Not Available</h3>
          <p className="text-sm text-gray-500">
            Answers and scores not released yet
          </p>
        </div>
      )}
    </div>
  );
}
