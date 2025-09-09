"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={
        className ||
        "inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 ease-in-out w-fit"
      }>
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {children}
    </button>
  );
}
