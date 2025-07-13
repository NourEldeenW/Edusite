"use client";

import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { X, Loader2, FileText } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFont, faLink } from "@fortawesome/free-solid-svg-icons";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface MaterialFormProps {
  weekId: number;
  onSuccess: () => void;
  onCancel: () => void;
  access: string;
}

type MaterialType = "pdf" | "text" | "link";

export default function MaterialForm({
  weekId,
  onSuccess,
  onCancel,
  access,
}: MaterialFormProps) {
  const [step, setStep] = useState<"type" | "form">("type");
  const [materialType, setMaterialType] = useState<MaterialType | null>(null);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize file change handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== "application/pdf") {
          setError("Please select a PDF file");
          return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("File size must be less than 10MB");
          return;
        }
        setFile(selectedFile);
        setError(null);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("week", weekId.toString());
        formData.append("title", title);
        formData.append("material_type", materialType || "");

        switch (materialType) {
          case "pdf":
            if (!file) {
              setError("Please select a PDF file");
              setIsSubmitting(false);
              return;
            }
            formData.append("file", file);
            break;
          case "text":
            if (!textContent.trim()) {
              setError("Text content is required");
              setIsSubmitting(false);
              return;
            }
            formData.append("text_content", textContent);
            break;
          case "link":
            if (!externalUrl.trim()) {
              setError("URL is required");
              setIsSubmitting(false);
              return;
            }
            formData.append("external_url", externalUrl);
            break;
        }

        await api.post(
          `${DJANGO_API_URL}studymaterials/materials/create/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        onSuccess();
      } catch (error) {
        console.error("Failed to create material:", error);
        setError("Failed to create material. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      access,
      externalUrl,
      file,
      materialType,
      onSuccess,
      textContent,
      title,
      weekId,
    ]
  );

  // Memoize material type selection for performance
  const selectType = useCallback((type: MaterialType) => {
    setMaterialType(type);
    setStep("form");
  }, []);

  return (
    <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-default p-6 mx-auto max-w-3xl transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl transition-all duration-300 ${
              materialType === "pdf"
                ? "bg-red-100"
                : materialType === "text"
                ? "bg-yellow-100"
                : materialType === "link"
                ? "bg-purple-100"
                : "bg-primary/10"
            }`}>
            {materialType === "pdf" && (
              <FontAwesomeIcon
                icon={faFilePdf}
                className="h-6 w-6 text-red-500 transition-colors"
              />
            )}
            {materialType === "text" && (
              <FontAwesomeIcon
                icon={faFont}
                className="h-6 w-6 text-yellow-500 transition-colors"
              />
            )}
            {materialType === "link" && (
              <FontAwesomeIcon
                icon={faLink}
                className="h-6 w-6 text-purple-500 transition-colors"
              />
            )}
            {!materialType && (
              <FileText className="h-6 w-6 text-primary transition-colors" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {step === "type"
                ? "Add New Material"
                : `Add ${materialType?.toUpperCase()} Material`}
            </h2>
            {step === "form" && materialType && (
              <p className="text-sm text-text-secondary mt-1">
                {materialType === "pdf"
                  ? "Upload study materials in PDF format"
                  : materialType === "text"
                  ? "Create text-based study notes"
                  : "Add links to external resources"}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-full transition-all duration-300 transform hover:scale-110">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {step === "type" ? (
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary text-center">
            Select Material Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                type: "pdf",
                label: "PDF Document",
                icon: faFilePdf,
                color: "text-red-500",
                bg: "bg-red-100",
                description: "Upload study materials in PDF format",
              },
              {
                type: "text",
                label: "Text Note",
                icon: faFont,
                color: "text-yellow-500",
                bg: "bg-yellow-100",
                description: "Create text-based study notes",
              },
              {
                type: "link",
                label: "External Link",
                icon: faLink,
                color: "text-purple-500",
                bg: "bg-purple-100",
                description: "Add links to external resources",
              },
            ].map((item) => (
              <div
                key={item.type}
                className={`flex flex-col items-center p-6 rounded-2xl border border-border-default cursor-pointer transition-all duration-300 hover:shadow-lg group ${
                  materialType === item.type
                    ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
                    : "hover:-translate-y-1"
                }`}
                onClick={() => selectType(item.type as MaterialType)}>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${item.bg} mb-4 transition-all duration-300 group-hover:scale-110`}>
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-2xl ${item.color} transition-transform`}
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-text-secondary text-center opacity-80">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-border-default hover:bg-bg-tertiary transition-colors duration-300 px-6 py-3">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50"
              placeholder={`Enter ${materialType} title`}
              required
            />
          </div>

          {materialType === "pdf" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                PDF File
              </label>
              <div
                className="border-2 border-dashed border-border-default rounded-xl p-8 text-center cursor-pointer bg-bg-tertiary hover:bg-bg-secondary transition-colors duration-300 relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}>
                {file ? (
                  <div className="flex flex-col items-center">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-red-500 text-4xl mb-3 transition-transform group-hover:scale-110"
                    />
                    <p className="font-medium text-text-primary truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        type="button"
                        className="border-border-default hover:bg-bg-tertiary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}>
                        Change File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-red-500 text-4xl mb-4 transition-transform group-hover:scale-110"
                    />
                    <p className="font-medium text-text-primary mb-1">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-text-secondary mt-3 opacity-70">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="application/pdf"
                />
              </div>
            </div>
          )}

          {materialType === "text" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50 min-h-[200px]"
                placeholder="Enter your text content here..."
                required
              />
              <div className="text-xs text-text-secondary mt-2 flex justify-end">
                {textContent.length} characters
              </div>
            </div>
          )}

          {materialType === "link" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLink}
                    className="text-text-secondary"
                  />
                </div>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full pl-10 px-4 py-3 bg-bg-tertiary border border-border-default rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-secondary/50"
                  placeholder="https://example.com"
                  required
                />
              </div>
              {externalUrl && (
                <div className="mt-2 text-xs text-text-secondary">
                  <span className="font-medium">Preview:</span>
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-2 truncate block">
                    {externalUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="flex justify-center pt-5 border-t border-border-default flex-wrap gap-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("type")}
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:text-text-inverse px-6 py-3 transition-colors">
              <X className="h-4 w-4" />
              Back to Types
            </Button>
            <Button
              type="submit"
              className="bg-primary text-text-inverse hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg px-6 py-3 min-w-[180px]"
              disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Material...
                </div>
              ) : (
                "Create Material"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
