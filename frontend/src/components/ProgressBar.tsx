import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const getProgressColor = (progress: number): string => {
  if (progress <= 50) return "bg-status-ongoing";
  if (progress <= 80) return "bg-warning";
  return "bg-status-planned";
};

export const ProgressBar = ({ progress, showPercentage = true, size = "md", className }: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getProgressColor(clampedProgress)
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground mt-1">{clampedProgress}% Complete</p>
      )}
    </div>
  );
};
