import { Button } from "@/components/ui/button";
import { api, djangoApi } from "@/lib/axiosinterceptor";
import useSubmissionsStore from "@/lib/stores/tasksStores/submissions";
import {
  faArrowLeft,
  faCircleCheck,
  faCircleExclamation,
  faHourglassHalf,
  faRotate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StatCard from "../../students/_students comps/cards";
import TSubmissionsTable from "./_tSubmissionscomps/tSubmissionsTable";

export default function TSubmissions({ access }: { access: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const setSubmissions = useSubmissionsStore((state) => state.setSubmissions);
  const submissions = useSubmissionsStore((state) => state.submissions);
  const [isFetching, setIsFetching] = useState(false);
  const [counter, setCounter] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isReleasingScore, setIsReleasingScore] = useState(false);

  const id = searchParams.get("id");

  useEffect(() => {
    if (!access || !id) return;

    const fetchSubmissions = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(`${djangoApi}task/tasks/${id}/submissions/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        setSubmissions(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSubmissions();
  }, [access, id, setSubmissions, counter]);

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

  const handleReleaseScore = async (t: "release" | "undo") => {
    if (isReleasingScore) return;

    setIsReleasingScore(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}task/tasks/${id}/release-grades/`,
        {
          release: t === "release" ? true : false,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
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

  return (
    <>
      <div className="header mb-8 flex justify-between items-center flex-wrap">
        <Button
          variant="ghost"
          onClick={() => {
            router.back();
            setSubmissions([]);
          }}
          className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover px-0">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to Online Tasks Dashboard
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {submissions.some((s) => s.is_released === true) && (
            <Button
              variant="outline"
              onClick={() => handleReleaseScore("undo")}
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
                  Retracting...
                </>
              ) : (
                "Retract Score"
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleReleaseScore("release")}
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
          value={submissions.filter((s) => s.status === "submitted").length}
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
          value={submissions.filter((s) => s.status === "in_progress").length}
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
          value={submissions.filter((s) => s.status === "not_started").length}
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
      <TSubmissionsTable access={access} taskId={Number(id)} />
    </>
  );
}
