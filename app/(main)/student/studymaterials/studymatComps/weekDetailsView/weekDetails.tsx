import { Button } from "@/components/ui/button";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import useStudent_StudyMaterialsStore from "@/lib/stores/student/studymaterials/studyMaterials";
import {
  faArrowLeft,
  faBook,
  faDownload,
  faEye,
  faFilePdf,
  faFont,
  faImage,
  faLink,
  faVideo,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useMemo, useState } from "react";
import { formatUserDate } from "@/lib/formatDate"; // Add this import

interface MaterialCardData {
  id: number;
  title: string;
  type: "pdf" | "video" | "image" | "text" | "link";
  date: string;
  file_url?: string;
  text_content?: string;
  external_url?: string;
}

export default function WeekDetails() {
  const selectedWeek = useStudent_StudyMaterialsStore(
    (state) => state.selectedWeek
  );
  const selectedMaterial = useStudent_StudyMaterialsStore(
    (state) => state.selectedMaterial
  );

  const navigateToWeeksView = () => {
    useStudent_StudyMaterialsStore.getState().updateSelectedMaterial(null);
    useStudent_StudyMaterialsStore.getState().updateSelectedWeek(null);
    useStudent_StudyMaterialsStore.getState().setView("weeks");
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={navigateToWeeksView}
        className="flex items-center gap-2 text-primary hover:bg-bg-base hover:text-primary-hover mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        Back to Weeks
      </Button>
      <div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            {selectedWeek?.title}
          </h2>
          <p className="text-text-secondary mt-2 mb-10">
            {selectedWeek?.description}
          </p>
        </div>
        {selectedMaterial?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-border-default rounded-xl bg-bg-secondary">
            <div className="bg-blue-100 rounded-full p-4 mb-5">
              <FontAwesomeIcon
                icon={faBook}
                className="text-blue-500 text-2xl"
              />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              No Study Materials
            </h3>
            <p className="text-text-secondary mb-6 max-w-md text-center">
              This week doesn&apos;t have any materials yet.
            </p>
          </div>
        ) : (
          selectedMaterial && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {selectedMaterial
                .sort(
                  (a, b) =>
                    new Date(a.date_created).getTime() -
                    new Date(b.date_created).getTime()
                )
                .map((material) => {
                  // Transform the material data to match MaterialCardData
                  const cardData: MaterialCardData = {
                    id: material.id,
                    title: material.title,
                    type: material.material_type as MaterialCardData["type"], // Cast to the correct type
                    date: formatUserDate(material.date_created), // Format the date
                    file_url: material.file_url,
                    text_content: material.text_content,
                    external_url: material.external_url,
                  };
                  return <MaterialCard key={material.id} {...cardData} />;
                })}
            </div>
          )
        )}
      </div>
    </>
  );
}

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

const MaterialCard: React.FC<MaterialCardData> = React.memo(
  ({ title, type, date, file_url, text_content, external_url }) => {
    const typeStyles = useMemo(getTypeStyles, []);
    const { iconClass, bgClass } = typeStyles[type];
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleAction = useCallback(() => {
      if (type === "text") {
        // Open text preview dialog
        setIsPreviewOpen(true);
      } else if (type === "link" && external_url) {
        // Open link in new tab
        window.open(external_url, "_blank");
      } else if (file_url && type === "pdf") {
        window.open(file_url);
      }
    }, [type, external_url, file_url]);

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
