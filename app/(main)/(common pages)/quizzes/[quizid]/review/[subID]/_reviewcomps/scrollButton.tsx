"use client";

import { Button } from "@/components/ui/button";

export default function ScrollButton({ idx }: { idx: number }) {
  return (
    <>
      <Button
        key={idx}
        onClick={() => {
          document
            .getElementById(`question-${idx + 1}`)
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition">
        Q{idx + 1}
      </Button>
    </>
  );
}
