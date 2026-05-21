import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Building2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard = ({ project, className }: ProjectCardProps) => {
  return (
    <Link to={`/projects/${project._id}`}>
      <Card className={cn("card-hover cursor-pointer govt-shadow border-l-4 border-l-primary h-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 leading-tight">
              {project.title}
            </h3>
            <StatusBadge status={project.status} type="project" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          <ProgressBar progress={project.progress} size="sm" />

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {project.department}
            </span>
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {project.location}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {project.createdBy.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
