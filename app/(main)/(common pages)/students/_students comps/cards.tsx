// components/StatCard.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconContainerClass: string;
  valueClass?: string;
  descriptionClass?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconContainerClass,
  valueClass = "text-text-primary",
  descriptionClass = "text-text-secondary",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow min-w-[200px] flex-1">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs sm:text-sm ${descriptionClass}`}>{title}</p>
            <p className={`text-lg sm:text-2xl font-bold ${valueClass}`}>
              {value}
            </p>
          </div>
          <div
            className={`h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center ${iconContainerClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
