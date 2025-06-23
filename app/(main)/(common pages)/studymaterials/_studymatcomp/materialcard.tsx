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
import React from "react";

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
if (!DJANGO_API_URL) {
  throw new Error("NEXT_PUBLIC_DJANGO_BASE_URL is not defined");
}

interface MaterialCardsGridProps {
  materials: MaterialCardData[];
  onClick_AddMaterial: (view: string) => void;
}

const MaterialCardsGrid: React.FC<MaterialCardsGridProps> = ({
  materials,
  onClick_AddMaterial,
}) => {
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
      {materials.map((material, index) => (
        <MaterialCard key={index} {...material} />
      ))}
    </div>
  );
};

export interface MaterialCardData {
  title: string;
  type: "pdf" | "video" | "image" | "text" | "link";
  date: string;
  file_url?: string;
  text_content?: string;
}

type IconMap = {
  [key in MaterialCardData["type"]]: {
    iconClass: IconDefinition;
    bgClass: string;
  };
};

const MaterialCard: React.FC<MaterialCardData> = ({
  title,
  type,
  date,
  file_url,
  text_content,
}) => {
  const typeStyles: IconMap = {
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

  const { iconClass, bgClass } = typeStyles[type];

  return (
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
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg">
          <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
        </button>
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
          // Inside MaterialCard component
          onClick={() => {
            if (type === "text") {
              console.log("Preview text content:", text_content);
            } else if (file_url) {
              const base = DJANGO_API_URL.endsWith("api/")
                ? DJANGO_API_URL.slice(0, -4)
                : DJANGO_API_URL;

              const resource = file_url.startsWith("/")
                ? file_url
                : `/${file_url}`;

              // Create hidden download link
              window.open(`${base}${resource}`, "_blank");
            }
          }}>
          <FontAwesomeIcon
            icon={type === "text" ? faEye : faDownload}
            className="text-sm"
          />
          <span>{type === "text" ? "Preview" : "Download"}</span>
        </button>
      </div>

      {/* Hover effect bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default MaterialCardsGrid;
