import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { MessageSquare, AlertTriangle, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
  className?: string;
}

export const IssueCard = ({ issue, className }: IssueCardProps) => {
  return (
    <Link to={`/issues/${issue._id}`}>
      <Card className={cn("card-hover cursor-pointer govt-shadow h-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 leading-tight flex-1">
              {issue.title}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={issue.status} type="issue" />
              <StatusBadge status={issue.priority} type="priority" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {issue.description}
          </p>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground">
              {issue.category}
            </span>
            <Link 
              to={`/projects/${issue.project._id}`} 
              className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {issue.project.title}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {issue.raisedBy.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {issue.responses.length}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
            </span>
          </div>

          {issue.isEscalated && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-warning/10 text-warning text-xs font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              Escalated
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
