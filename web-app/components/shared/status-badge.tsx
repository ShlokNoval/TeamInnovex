import { Badge } from "@/components/ui/badge";
import { IncidentStatus } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: IncidentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`capitalize ${getStatusColor(status)}`}>
      {status}
    </Badge>
  );
}
