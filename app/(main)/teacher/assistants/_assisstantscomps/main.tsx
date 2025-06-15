"use client";

import { useEffect, useState } from "react";
import AddAssistantButton from "./addAssistantButton";
import TableData from "./table";
import { api } from "@/lib/axiosinterceptor";

interface MainProps {
  access: string;
}

interface AssistantData {
  id: number;
  full_name: string;
  phone_number: string;
  gender: string;
  user: number;
  password: string;
  username: string;
}

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export default function Main({ access }: MainProps) {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [allAssistants, setAllAssistants] = useState<AssistantData[]>([]);

  useEffect(() => {
    setIsFetching(true);
    const fetchInitialData = async () => {
      try {
        const assistantsResponse = await api.get(
          `${DJANGO_API_URL}accounts/assistants/`,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setAllAssistants(assistantsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [access, refreshCounter]);

  const triggerDataRefresh = () => setRefreshCounter((prev) => prev + 1);

  return (
    <>
      <div className="space-y-4 sm:space-y-6 bg-bg-base min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Assistant Management
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              Manage all your Assistants&apos; data
            </p>
          </div>

          <AddAssistantButton
            triggerDataRefresh={triggerDataRefresh}
            access={access}
          />
        </div>
        <TableData
          access={access}
          triggerDataRefresh={triggerDataRefresh}
          isFetching={isFetching}
          data={allAssistants}
        />
      </div>
    </>
  );
}
