import { AlertTriangle, CarFront, PawPrint, CircleDashed } from "lucide-react";
import { HazardType } from "@/lib/types";

interface HazardIconProps {
  type: HazardType;
  className?: string;
}

export function HazardIcon({ type, className }: HazardIconProps) {
  switch (type) {
    case "pothole":
      return <CircleDashed className={className} />;
    case "animal":
      return <PawPrint className={className} />;
    case "accident":
      return <CarFront className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
}
