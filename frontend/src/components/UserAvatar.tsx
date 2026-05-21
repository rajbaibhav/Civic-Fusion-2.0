import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface UserAvatarProps {
  name: string;
  role?: UserRole;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

const roleColors: Record<UserRole, string> = {
  citizen: "bg-role-citizen",
  volunteer: "bg-role-volunteer",
  official: "bg-role-official",
  admin: "bg-role-admin",
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const UserAvatar = ({ name, role = "citizen", size = "md", className }: UserAvatarProps) => {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        roleColors[role],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
};
