import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { User, Users, Briefcase, Shield } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  className?: string;
}

const roleStyles: Record<UserRole, string> = {
  citizen: "bg-role-citizen/15 text-role-citizen border-role-citizen/30",
  volunteer: "bg-role-volunteer/15 text-role-volunteer border-role-volunteer/30",
  official: "bg-role-official/15 text-role-official border-role-official/30",
  admin: "bg-role-admin/15 text-role-admin border-role-admin/30",
};

const roleLabels: Record<UserRole, string> = {
  citizen: "Citizen",
  volunteer: "Volunteer",
  official: "Official",
  admin: "Admin",
};

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  citizen: User,
  volunteer: Users,
  official: Briefcase,
  admin: Shield,
};

export const RoleBadge = ({ role, showIcon = false, className }: RoleBadgeProps) => {
  const Icon = roleIcons[role];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        roleStyles[role],
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {roleLabels[role]}
    </span>
  );
};
