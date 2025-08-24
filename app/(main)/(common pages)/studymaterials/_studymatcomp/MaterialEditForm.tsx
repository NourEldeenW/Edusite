"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/axiosinterceptor";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFont, faLink } from "@fortawesome/free-solid-svg-icons";
import { StudyMaterial } from "./main";
import { showToast } from "../../students/_students comps/main";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface MaterialEditFormProps {
  material: StudyMaterial;
  onSuccess: () => void;
  onCancel: () => void;
  access: string;
}

export default function MaterialEditForm({
  material,
  onSuccess,
  onCancel,
  access,
}: MaterialEditFormProps) {
  const [title, setTitle] = useState(material.title);
  const [textContent, setTextContent] = useState(material.text_content || "");
  const [externalUrl, setExternalUrl] = useState(material.external_url || "");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

  // Set initial preview URL for existing files
  useEffect(() => {
    if (material.file_url && material.material_type === "pdf") {
      setPreviewUrl(material.file_url);
    }
  }, [material]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];

        if (
          material.material_type === "pdf" &&
          selectedFile.type !== "application/pdf"
        ) {
          setError("Please select a PDF file");
          return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("File size must be less than 10MB");
          return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview URL
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      }
    },
    [material.material_type]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("title", title);

        switch (material.material_type) {
          case "pdf":
            if (file) {
              formData.append("material_type", material.material_type);
              formData.append("file", file);
            }
            break;
          case "text":
            if (!textContent.trim()) {
              setError("Text content is required");
              setIsSubmitting(false);
              return;
            }
            formData.append("material_type", material.material_type);
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

        await api.put(
          `${DJANGO_API_URL}studymaterials/materials/${material.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        showToast("Material updated successfully!", "success");
        onSuccess();
      } catch (error) {
        console.error("Failed to update material:", error);
        setError("Failed to update material. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      access,
      externalUrl,
      file,
      material.id,
      material.material_type,
      onSuccess,
      textContent,
      title,
    ]
  );

  const getIcon = () => {
    switch (material.material_type) {
      case "pdf":
        return (
          <FontAwesomeIcon icon={faFilePdf} className="h-6 w-6 text-red-500" />
        );
      case "text":
        return (
          <FontAwesomeIcon icon={faFont} className="h-6 w-6 text-yellow-500" />
        );
      case "link":
        return (
          <FontAwesomeIcon icon={faLink} className="h-6 w-6 text-purple-500" />
        );
      default:
        return (
          <FontAwesomeIcon icon={faFilePdf} className="h-6 w-6 text-gray-500" />
        );
    }
  };

  // Use ref to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-default p-6 mx-auto max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gray-100">{getIcon()}</div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Edit {material.material_type.toUpperCase()} Material
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Update your study material
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

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
            placeholder="Enter material title"
            required
          />
        </div>

        {material.material_type === "pdf" && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              PDF File
            </label>
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-border-default rounded-xl p-4 cursor-pointer bg-bg-tertiary relative overflow-hidden">
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="bg-red-100 p-3 rounded-lg mb-3">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-red-500 text-4xl"
                    />
                  </div>
                  <p className="font-medium text-text-primary truncate max-w-xs">
                    {file ? file.name : "Current PDF"}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "Uploaded file"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-red-500 text-4xl mb-4"
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
            <div className="mt-2 text-center">
              <Button
                variant="outline"
                type="button"
                onClick={triggerFileInput}
                className="border-border-default hover:bg-bg-tertiary">
                {previewUrl ? "Change File" : "Select File"}
              </Button>
            </div>
          </div>
        )}

        {material.material_type === "text" && (
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

        {material.material_type === "link" && (
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

        <div className="flex justify-between pt-5 border-t border-border-default">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-text-inverse hover:bg-primary-hover transition-colors shadow-md px-6 py-3 min-w-[180px]"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </div>
            ) : (
              "Update Material"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
