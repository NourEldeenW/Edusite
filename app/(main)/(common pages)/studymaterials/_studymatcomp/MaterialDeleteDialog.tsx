"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { StudyMaterial } from "./main";
import { api } from "@/lib/axiosinterceptor";
import { showToast } from "../../students/_students comps/main";
import { useCallback, useState } from "react";
import { formatUserDate } from "@/lib/formatDate";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

interface MaterialDeleteDialogProps {
  material: StudyMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  access: string;
}

export default function MaterialDeleteDialog({
  material,
  isOpen,
  onClose,
  onSuccess,
  access,
}: MaterialDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!material) return;

    setIsDeleting(true);
    try {
      await api.delete(
        `${DJANGO_API_URL}studymaterials/materials/${material.id}/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      showToast("Material deleted successfully!", "success");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete material:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [material, access, onSuccess, onClose]);

  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Material?
          </DialogTitle>
          <DialogDescription className="pt-3">
            Are you sure you want to delete this material? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 border-y border-border-default">
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              {material.material_type === "pdf" && (
                <div className="bg-red-100 p-2 rounded-md">
                  <svg
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              {material.material_type === "text" && (
                <div className="bg-yellow-100 p-2 rounded-md">
                  <svg
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              {material.material_type === "link" && (
                <div className="bg-purple-100 p-2 rounded-md">
                  <svg
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-text-primary">
                {material.title}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {material.material_type_display} •{" "}
                {formatUserDate(material.date_created)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="hover:bg-bg-secondary">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2">
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Material
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
