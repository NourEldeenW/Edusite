// app/(main)/tasks/[taskID]/submissions/[sID]/SubmissionViewer.tsx
"use client";

import { useState, useEffect } from "react";

interface SubmissionViewerProps {
  text?: string;
  pdf?: string;
  role: string;
}

export default function SubmissionViewer({ text, pdf }: SubmissionViewerProps) {
  const [wordCount, setWordCount] = useState(0);
  const [pdfError, setPdfError] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  // Calculate word count client-side
  useEffect(() => {
    if (text) {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
    }
  }, [text]);

  // Try to display PDF in iframe, fallback to download button
  const handlePdfError = () => {
    setPdfError(true);
    setIsPdfLoading(false);
  };

  const handlePdfLoad = () => {
    setIsPdfLoading(false);
  };

  return (
    <div className="space-y-6">
      {text && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Text Submission
            </h3>
          </div>
          <div className="p-5">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed text-gray-700">
              {text}
            </div>

            <div className="mt-3 text-sm text-gray-500 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {wordCount} words
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              PDF Submission
            </h3>
          </div>
          <div className="p-5">
            {!pdfError ? (
              <div className="pdf-viewer relative rounded-lg border border-gray-200 overflow-hidden">
                {isPdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-500">Loading PDF...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={pdf}
                  className="w-full h-96"
                  title="Submission PDF"
                  onError={handlePdfError}
                  onLoad={handlePdfLoad}
                  style={{ display: isPdfLoading ? "none" : "block" }}
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="p-3 mr-4 bg-red-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Submission Document.pdf
                    </h4>
                    <p className="text-sm text-gray-500">
                      PDF file - unable to preview in browser
                    </p>
                  </div>
                </div>
                <a
                  href={pdf}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  target="_blank"
                  rel="noopener noreferrer">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {!text && !pdf && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Submission Content
            </h3>
          </div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No submission content
            </h3>
            <p className="text-gray-500">
              This submission doesn&apos;t contain any text or PDF content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
