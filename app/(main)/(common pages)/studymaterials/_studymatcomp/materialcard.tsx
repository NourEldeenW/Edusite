import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  faFilePdf,
  faVideo,
  faImage,
  faFont,
  faLink,
  faEllipsisVertical,
  faEye,
  faDownload,
  IconDefinition,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Edit, Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Use memoized environment variable check for performance and SSR
const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL!;
if (!DJANGO_API_URL) {
  throw new Error("NEXT_PUBLIC_DJANGO_BASE_URL is not defined");
}

export interface MaterialCardData {
  id: number;
  title: string;
  type: "pdf" | "video" | "image" | "text" | "link";
  date: string;
  file_url?: string;
  text_content?: string;
  external_url?: string;
  material_type: string;
  date_created: string;
}

interface MaterialCardsGridProps {
  materials: MaterialCardData[];
  onClick_AddMaterial: (view: string) => void;
  onEdit?: (material: MaterialCardData) => void;
  onDelete?: (material: MaterialCardData) => void;
}

const MaterialCardsGrid: React.FC<MaterialCardsGridProps> = React.memo(
  ({ materials, onClick_AddMaterial, onEdit, onDelete }) => {
    if (materials.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="max-w-md w-full p-8 text-center">
            <div className="mx-auto bg-gradient-to-br from-indigo-50 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faPlus}
                className="text-indigo-500 text-4xl"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Materials Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first learning material
            </p>
            <button
              onClick={() => onClick_AddMaterial("ADD_MATERIAL_VIEW")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-full transition duration-300 transform hover:-translate-y-0.5">
              Add Material
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            {...material}
            onEdit={onEdit ? () => onEdit(material) : undefined}
            onDelete={onDelete ? () => onDelete(material) : undefined}
          />
        ))}
      </div>
    );
  }
);
MaterialCardsGrid.displayName = "MaterialCardsGrid";

type IconMap = {
  [key in MaterialCardData["type"]]: {
    iconClass: IconDefinition;
    bgClass: string;
  };
};

const getTypeStyles = (() => {
  let cache: IconMap | null = null;
  return () => {
    if (cache) return cache;
    cache = {
      pdf: {
        iconClass: faFilePdf,
        bgClass: "bg-red-100 text-red-800",
      },
      video: {
        iconClass: faVideo,
        bgClass: "bg-blue-100 text-blue-800",
      },
      image: {
        iconClass: faImage,
        bgClass: "bg-green-100 text-green-800",
      },
      text: {
        iconClass: faFont,
        bgClass: "bg-purple-100 text-purple-800",
      },
      link: {
        iconClass: faLink,
        bgClass: "bg-amber-100 text-amber-800",
      },
    };
    return cache;
  };
})();

interface MaterialCardProps extends MaterialCardData {
  onEdit?: () => void;
  onDelete?: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = React.memo(
  ({ title, type, date, file_url, text_content, onEdit, onDelete }) => {
    const typeStyles = useMemo(getTypeStyles, []);
    const { iconClass, bgClass } = typeStyles[type];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleAction = useCallback(() => {
      if (type === "text") {
        // Open text preview dialog
        setIsPreviewOpen(true);
      } else if (type === "link" && file_url) {
        // Open link in new tab
        window.open(file_url, "_blank");
      } else if (file_url && type === "pdf") {
        const base = DJANGO_API_URL.endsWith("api/")
          ? DJANGO_API_URL.slice(0, -4)
          : DJANGO_API_URL;

        const resource = file_url.startsWith("/") ? file_url : `/${file_url}`;
        window.open(`${base}${resource}`, "_blank");
      }
    }, [type, file_url]);

    return (
      <>
        <div
          className={`group flex flex-col h-full bg-gradient-to-br bg-bg-secondary border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:shadow-lg overflow-hidden relative`}>
          {/* Floating icon effect */}
          <div
            className={`absolute -top-3 -right-3 w-24 h-24 rounded-full opacity-10 ${bgClass.replace(
              "bg-",
              "bg-"
            )} transition-opacity duration-300 group-hover:opacity-20`}></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-start gap-3">
              <div
                className={`${bgClass} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                <FontAwesomeIcon icon={iconClass} className="text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {title}
                </h3>
              </div>
            </div>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg">
                  <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    className="text-sm"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-fit p-3">
                <DropdownMenuLabel className="text-sm font-medium text-text-secondary">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onEdit && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-bg-subtle hover:cursor-pointer focus:bg-bg-subtle"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      onEdit();
                    }}>
                    <Edit className="h-4 w-4 text-text-secondary" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2 py-2 text-sm text-error hover:cursor-pointer focus:bg-error/20"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      onDelete();
                    }}>
                    <Trash2 className="h-4 w-4 text-error" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-5 flex justify-between items-center relative z-10">
            <span
              className={`${bgClass} text-xs font-medium px-3 py-1 rounded-full shadow-sm`}>
              {type}
            </span>
            <div className="text-xs text-gray-500 font-medium">{date}</div>
          </div>

          <div className="mt-4 flex justify-end relative z-10 border-t border-gray-100 pt-3">
            <button
              className="text-gray-700 hover:text-primary flex items-center gap-1.5 transition-colors text-sm font-medium"
              onClick={handleAction}>
              <FontAwesomeIcon
                icon={type === "pdf" ? faDownload : faEye}
                className="text-sm"
              />
              <span>{type === "pdf" ? "Download" : "Preview"}</span>
            </button>
          </div>

          {/* Hover effect bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Text Preview Dialog */}
        {type === "text" && (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                {text_content ? (
                  <pre className="whitespace-pre-wrap break-words font-sans">
                    {text_content}
                  </pre>
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setIsPreviewOpen(false)}>
                  Close Preview
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
);
MaterialCard.displayName = "MaterialCard";

export default MaterialCardsGrid;
