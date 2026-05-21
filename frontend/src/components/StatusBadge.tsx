import { cn } from "@/lib/utils";
import type { ProjectStatus, IssueStatus, IssuePriority } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus | IssueStatus | IssuePriority;
  type: "project" | "issue" | "priority";
  className?: string;
}

const projectStatusStyles: Record<ProjectStatus, string> = {
  planned: "bg-status-planned/15 text-status-planned border-status-planned/30",
  ongoing: "bg-status-ongoing/15 text-status-ongoing border-status-ongoing/30",
  completed: "bg-status-completed/15 text-status-completed border-status-completed/30",
  stalled: "bg-status-stalled/15 text-status-stalled border-status-stalled/30",
};

const issueStatusStyles: Record<IssueStatus, string> = {
  open: "bg-status-open/15 text-status-open border-status-open/30",
  in_progress: "bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30",
  resolved: "bg-status-resolved/15 text-status-resolved border-status-resolved/30",
};

const priorityStyles: Record<IssuePriority, string> = {
  low: "bg-priority-low/15 text-priority-low border-priority-low/30",
  medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  high: "bg-priority-high/15 text-priority-high border-priority-high/30",
};

const statusLabels: Record<string, string> = {
  planned: "Planned",
  ongoing: "Ongoing",
  completed: "Completed",
  stalled: "Stalled",
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const StatusBadge = ({ status, type, className }: StatusBadgeProps) => {
  let styles = "";
  
  if (type === "project") {
    styles = projectStatusStyles[status as ProjectStatus];
  } else if (type === "issue") {
    styles = issueStatusStyles[status as IssueStatus];
  } else if (type === "priority") {
    styles = priorityStyles[status as IssuePriority];
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles,
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
};
