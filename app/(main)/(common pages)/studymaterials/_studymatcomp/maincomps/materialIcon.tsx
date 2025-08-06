import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFont, faLink } from "@fortawesome/free-solid-svg-icons";

interface MaterialIconProps {
  type: string;
}

export default function MaterialIcon({ type }: MaterialIconProps) {
  const iconConfig = {
    pdf: { icon: faFilePdf, color: "text-red-600", bg: "bg-red-100" },
    text: { icon: faFont, color: "text-yellow-600", bg: "bg-yellow-100" },
    link: { icon: faLink, color: "text-purple-600", bg: "bg-purple-100" },
  };

  const { icon, color, bg } = iconConfig[type as keyof typeof iconConfig] || {
    icon: faFilePdf,
    color: "text-gray-600",
    bg: "bg-gray-100",
  };

  return (
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center ${bg}`}>
      <FontAwesomeIcon icon={icon} className={`text-sm ${color}`} />
    </div>
  );
}
