"use client";
import { api } from "@/lib/axiosinterceptor";
import useStudent_StudyMaterialsStore from "@/lib/stores/student/studymaterials/studyMaterials";
import { useEffect, useState } from "react";
import AllWeeks from "./weeksView/allWeeks";
import AllWeeksSkeleton from "./weeksView/allWeeksLoader";
import WeekDetails from "./weekDetailsView/weekDetails";

const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function Main({ access }: { access: string }) {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);

  const updateWeeks = useStudent_StudyMaterialsStore(
    (state) => state.updateWeeks
  );
  const updateMaterials = useStudent_StudyMaterialsStore(
    (state) => state.updateMaterials
  );

  const view = useStudent_StudyMaterialsStore((state) => state.view);

  useEffect(() => {
    if (!access || !djangoApi) return;

    const fetchData = async () => {
      try {
        setIsInitialLoading(true);

        // Fetch both endpoints in parallel
        const [weeksRes, materialsRes] = await Promise.all([
          api.get(`${djangoApi}studymaterials/weeks/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          api.get(`${djangoApi}studymaterials/materials/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
        ]);

        updateWeeks(weeksRes.data);
        updateMaterials(materialsRes.data);
        setHasData(true);
      } catch (error) {
        console.error("Failed to load study materials:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [access, updateWeeks, updateMaterials]);

  switch (view) {
    case "weeks":
      // Show skeleton during initial load or if no data exists
      if (isInitialLoading || !hasData) return <AllWeeksSkeleton />;
      return <AllWeeks />;

    case "week_details":
      return <WeekDetails />;

    default:
      return <AllWeeks />;
  }
}
