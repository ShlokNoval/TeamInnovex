import { Badge } from "@/components/ui/badge";
import { SeverityLabel } from "@/lib/types";
import { getSeverityColor } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: SeverityLabel;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge variant="outline" className={`capitalize ${getSeverityColor(severity)}`}>
      {severity}
    </Badge>
  );
}
