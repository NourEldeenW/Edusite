import React from "react";
import useCreateQuizStore from "@/lib/stores/onlineQuizStores/createQuiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, ClockIcon, EyeIcon, ListOrderedIcon } from "lucide-react";
import { formatUserDate } from "@/lib/formatDate";

export default function Review() {
  const quizData = useCreateQuizStore((state) => state.createdQuiz);

  // Calculate total points
  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-8  mx-auto">
      {/* Basic Info Section */}
      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-blue-50 px-6 py-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-blue-600" />
            <span className="text-xl font-semibold text-blue-800">
              Basic Information
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-500">Title</span>
              <p className="font-semibold text-gray-800 text-lg">
                {quizData.basic_info.title || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-500">Grade</span>
              <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 text-base">
                {quizData.basic_info.grade_id
                  ? `Grade ${quizData.basic_info.grade_id}`
                  : "—"}
              </Badge>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-sm font-medium text-gray-500">
                Description
              </span>
              <p className="font-medium text-gray-700 bg-gray-50 p-4 rounded-lg">
                {quizData.basic_info.description || "No description provided"}
              </p>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-sm font-medium text-gray-500">Centers</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {quizData.basic_info.centers.length > 0 ? (
                  quizData.basic_info.centers.map((center, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-gray-800">
                        {center.center_id}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <span className="font-medium">Dates:</span>
                        {formatUserDate(center.open_date)} →
                        {formatUserDate(center.close_date)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic py-4 text-center md:col-span-2">
                    No centers selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-purple-50 px-6 py-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <ListOrderedIcon className="w-5 h-5 text-purple-600" />
            <span className="text-xl font-semibold text-purple-800">
              Quiz Settings
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Time Limit
                </span>
                <p className="font-semibold text-gray-800">
                  {quizData.settings.timer_minutes > 0
                    ? `${quizData.settings.timer_minutes} minutes`
                    : "No limit"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <EyeIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Score Visibility
                </span>
                <p className="font-semibold text-gray-800 capitalize">
                  {quizData.settings.score_visibility === "immediate"
                    ? "Immediate after submission"
                    : quizData.settings.score_visibility === "after_close"
                    ? "After quiz closes"
                    : "Manual"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <EyeIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Answers Visibility
                </span>
                <p className="font-semibold text-gray-800 capitalize">
                  {quizData.settings.score_visibility === "immediate"
                    ? "Immediate after submission"
                    : quizData.settings.score_visibility === "after_close"
                    ? "After quiz closes"
                    : "Manual"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-rose-100 p-2 rounded-full">
                <ListOrderedIcon className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Question Order
                </span>
                <p className="font-semibold text-gray-800 capitalize">
                  {quizData.settings.question_order}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Summary Section */}
      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-amber-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl font-semibold text-amber-800">
                Questions Summary
              </span>
            </CardTitle>
            <div className="flex gap-4">
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1 text-base">
                {quizData.questions.length} Questions
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1 text-base">
                {totalPoints} Total Points
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizData.questions.map((q, idx) => {
              const correctAnswers = q.choices.filter(
                (c) => c.is_correct
              ).length;

              return (
                <Card
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-lg font-bold text-gray-800">
                        Q{idx + 1}
                      </h5>
                      <Badge className="bg-purple-100 text-purple-700">
                        {q.points} {q.points === 1 ? "Point" : "Points"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant={
                          q.selection_type === "single"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize">
                        {q.selection_type === "single"
                          ? "Single Answer"
                          : "Multiple Answers"}
                      </Badge>
                      <Badge variant="outline">
                        {q.choices.length} Choices
                      </Badge>
                      <Badge
                        variant={
                          correctAnswers > 0 ? "secondary" : "destructive"
                        }>
                        {correctAnswers} Correct
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {q.text ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: q.text }}
                          className="line-clamp-2"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          No question text
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
