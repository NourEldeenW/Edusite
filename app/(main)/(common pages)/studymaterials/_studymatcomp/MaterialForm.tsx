"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { X, Loader2, FileText, Link, File } from "lucide-react";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
            return;
          }
          formData.append("file", file);
          break;
        case "text":
          if (!textContent.trim()) {
            setError("Text content is required");
            return;
          }
          formData.append("text_content", textContent);
          break;
        case "link":
          if (!externalUrl.trim()) {
            setError("URL is required");
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
  };

  const renderForm = () => {
    if (!materialType) return null;

    return (
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
              className="border-2 border-dashed border-border-default rounded-xl p-8 text-center cursor-pointer bg-bg-tertiary hover:bg-bg-secondary transition-colors"
              onClick={() => fileInputRef.current?.click()}>
              {file ? (
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-red-500 text-3xl mb-2"
                  />
                  <p className="font-medium text-text-primary truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-red-500 text-3xl mb-3"
                  />
                  <p className="font-medium text-text-primary">
                    Click to upload PDF
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    or drag and drop
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
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("type")}
            disabled={isSubmitting}
            className="flex items-center gap-2 hover:text-text-inverse">
            <X className="h-4 w-4" />
            Back to Types
          </Button>
          <Button
            type="submit"
            className="bg-primary text-text-inverse hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg px-6 py-3"
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
    );
  };

  const renderTypeSelection = () => (
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
          },
          {
            type: "text",
            label: "Text Note",
            icon: faFont,
            color: "text-yellow-500",
            bg: "bg-yellow-100",
          },
          {
            type: "link",
            label: "External Link",
            icon: faLink,
            color: "text-purple-500",
            bg: "bg-purple-100",
          },
        ].map((item) => (
          <div
            key={item.type}
            className={`flex flex-col items-center p-8 rounded-2xl border border-border-default cursor-pointer transition-all duration-300 hover:shadow-lg ${
              materialType === item.type
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:-translate-y-1"
            }`}
            onClick={() => {
              setMaterialType(item.type as MaterialType);
              setStep("form");
            }}>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${item.bg} mb-4`}>
              <FontAwesomeIcon
                icon={item.icon}
                className={`text-2xl ${item.color}`}
              />
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              {item.label}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border-default hover:bg-bg-tertiary">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-default p-6 mx-auto max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {materialType === "pdf" && (
              <File className="h-6 w-6 text-red-500" />
            )}
            {materialType === "text" && (
              <FileText className="h-6 w-6 text-yellow-500" />
            )}
            {materialType === "link" && (
              <Link className="h-6 w-6 text-purple-500" />
            )}
            {!materialType && <FileText className="h-6 w-6 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            {step === "type"
              ? "Add New Material"
              : `Add ${materialType?.toUpperCase()} Material`}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-full transition-all">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {step === "type" ? renderTypeSelection() : renderForm()}
    </div>
  );
}
