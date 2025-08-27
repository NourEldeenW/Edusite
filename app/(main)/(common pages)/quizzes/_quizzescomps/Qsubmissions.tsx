import { Button } from "@/components/ui/button";
import { api } from "@/lib/axiosinterceptor";
import useQuizStore_initial from "@/lib/stores/onlineQuizStores/initialData";
import useSubmissionsStore from "@/lib/stores/onlineQuizStores/submissions";
import useViewStore from "@/lib/stores/onlineQuizStores/viewStore";
import {
  faArrowLeft,
  faCircleCheck,
  faCircleExclamation,
  faHourglassHalf,
  faRotate,
  faUsers,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useRef } from "react";
import StatCard from "../../students/_students comps/cards";
import SubmissionsTable from "./_submissionsQcomps/submissionsTable";
import { SubmissionsTableSkeleton } from "./_submissionsQcomps/skeletonTable";

export default function QSubmissions() {
  const [isFetching, setIsFetching] = useState(false);
  const [counter, setCounter] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isReleasingScore, setIsReleasingScore] = useState(false);
  const [isReleasingAnswers, setIsReleasingAnswers] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const updateCurrentMainView = useViewStore(
    (state) => state.updateCurrentMainView
  );

  const updateSubmissions = useSubmissionsStore(
    (state) => state.updateSubmissions
  );
  const updateSettings = useSubmissionsStore((state) => state.updateSettings);
  const submissions = useSubmissionsStore((state) => state.submissions);
  const settings = useSubmissionsStore((state) => state.settings);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const refetch = () => {
    if (isFetching || cooldown) return;

    setCounter((prev) => prev + 1);
    setCooldown(true);
    setCooldownSeconds(5);

    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${
            useSubmissionsStore.getState().selectedQuizId
          }/submissions/`,
          {
            headers: {
              Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
            },
          }
        );

        updateSubmissions(res.data.submissions);
        updateSettings(res.data.settings);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchSubmissions();
  }, [updateSubmissions, updateSettings, counter]);

  const handleReleaseScore = async () => {
    if (!settings?.score_visibility || isReleasingScore) return;

    setIsReleasingScore(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${
          useSubmissionsStore.getState().selectedQuizId
        }/release-all/`,
        {
          release_score: true,
        },
        {
          headers: {
            Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
          },
        }
      );
      // Trigger refresh to show updated data
      setCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error releasing score:", error);
    } finally {
      setIsReleasingScore(false);
    }
  };

  const handleReleaseAnswers = async () => {
    if (!settings?.answers_visibility || isReleasingAnswers) return;

    setIsReleasingAnswers(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${
          useSubmissionsStore.getState().selectedQuizId
        }/release-all/`,
        {
          release_answers: true,
        },
        {
          headers: {
            Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
          },
        }
      );
      // Trigger refresh to show updated data
      setCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error releasing answers:", error);
    } finally {
      setIsReleasingAnswers(false);
    }
  };

  const handleUndo = async () => {
    if (isUndoing) return;

    setIsUndoing(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}onlinequiz/quizzes/${
          useSubmissionsStore.getState().selectedQuizId
        }/release-all/`,
        {
          release_answers: false,
          release_score: false,
        },
        {
          headers: {
            Authorization: `Bearer ${useQuizStore_initial.getState().access}`,
          },
        }
      );
      // Trigger refresh to show updated data
      setCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error undoing release:", error);
    } finally {
      setIsUndoing(false);
    }
  };

  // Check if we should show the undo button
  const showUndoButton = submissions.some(
    (s) => s.is_score_released || s.are_answers_released
  );

  return (
    <>
      <div className="header mb-8 flex justify-between items-center flex-wrap">
        <Button
          variant="ghost"
          onClick={() => {
            updateCurrentMainView("dashboard");
            updateSubmissions([]);
          }}
          className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover px-0">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Quizzes Dashboard
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo Release Button */}
          {(settings?.answers_visibility === "manual" ||
            settings?.score_visibility === "manual") &&
            showUndoButton && (
              <Button
                onClick={handleUndo}
                disabled={isUndoing}
                variant="outline"
                className={`gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 ${
                  isUndoing ? "opacity-75 cursor-not-allowed" : ""
                }`}>
                {isUndoing ? (
                  <>
                    <FontAwesomeIcon
                      icon={faRotate}
                      spin
                      className="h-4 w-4 mr-2"
                    />
                    Undoing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUndo} className="h-4 w-4 mr-2" />
                    Undo Release
                  </>
                )}
              </Button>
            )}

          {settings?.score_visibility === "manual" && (
            <Button
              variant="outline"
              onClick={handleReleaseScore}
              disabled={isReleasingScore}
              className={`gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 ${
                isReleasingScore ? "opacity-75 cursor-not-allowed" : ""
              }`}>
              {isReleasingScore ? (
                <>
                  <FontAwesomeIcon
                    icon={faRotate}
                    spin
                    className="h-4 w-4 mr-2"
                  />
                  Releasing...
                </>
              ) : (
                "Release Score"
              )}
            </Button>
          )}
          {settings?.answers_visibility === "manual" && (
            <Button
              onClick={handleReleaseAnswers}
              variant="outline"
              disabled={isReleasingAnswers}
              className={`gap-2 text-sm hover:text-text-inverse h-9 flex-grow sm:flex-grow-0 ${
                isReleasingAnswers ? "opacity-75 cursor-not-allowed" : ""
              }`}>
              {isReleasingAnswers ? (
                <>
                  <FontAwesomeIcon
                    icon={faRotate}
                    spin
                    className="h-4 w-4 mr-2"
                  />
                  Releasing...
                </>
              ) : (
                "Release Answers"
              )}
            </Button>
          )}

          <Button
            onClick={refetch}
            disabled={isFetching || cooldown}
            className={`px-6 py-3 rounded-lg transition-colors shadow-md ${
              isFetching
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : cooldown
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-text-inverse hover:bg-primary-hover hover:shadow-lg"
            }`}>
            {isFetching ? (
              <>
                <FontAwesomeIcon
                  icon={faRotate}
                  spin
                  className="h-4 w-4 mr-2"
                />
                Refreshing...
              </>
            ) : cooldown ? (
              <>
                <FontAwesomeIcon
                  icon={faHourglassHalf}
                  className="h-4 w-4 mr-2"
                />
                {cooldownSeconds}s
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faRotate} className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        className="grid gap-[25px] mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        }}>
        <StatCard
          title="Total Students"
          value={submissions.length}
          icon={
            <FontAwesomeIcon icon={faUsers} className="text-xl" color="blue" />
          }
          iconContainerClass="bg-indigo-100"
        />

        <StatCard
          title="Submitted"
          value={submissions.filter((s) => s.is_submitted).length}
          icon={
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="text-xl"
              color="green"
            />
          }
          iconContainerClass="bg-green-100"
        />

        <StatCard
          title="In Progress"
          value={
            submissions.filter((s) => s.submission_status === "In Progress")
              .length
          }
          icon={
            <FontAwesomeIcon
              icon={faHourglassHalf}
              className="text-xl"
              color="orange"
            />
          }
          iconContainerClass="bg-orange-100"
        />

        <StatCard
          title="Not Started"
          value={
            submissions.filter((s) => s.submission_status === "Not Started")
              .length
          }
          icon={
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className="text-xl"
              color="red"
            />
          }
          iconContainerClass="bg-red-100"
        />
      </div>
      {isFetching ? <SubmissionsTableSkeleton /> : <SubmissionsTable />}
    </>
  );
}
