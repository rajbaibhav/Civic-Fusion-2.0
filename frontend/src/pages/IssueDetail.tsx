import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { issuesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { RoleBadge } from "@/components/RoleBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, User, Calendar, FolderKanban, Send, AlertTriangle, MessageSquare } from "lucide-react";
import type { UserRole, IssueStatus } from "@/types";

const IssueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOfficial } = useAuth();
  const queryClient = useQueryClient();
  const [newResponse, setNewResponse] = useState("");

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ["issue", id],
    queryFn: () => issuesApi.getById(id!),
    enabled: !!id,
  });

  const respondMutation = useMutation({
    mutationFn: (response: string) => issuesApi.respond(id!, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      setNewResponse("");
      toast.success("Response added successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: IssueStatus) => issuesApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      toast.success("Status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="govt-container py-8">
        <EmptyState
          title="Issue Not Found"
          message="The issue you're looking for doesn't exist."
          action={{ label: "Back to Issues", onClick: () => navigate("/issues") }}
        />
      </div>
    );
  }

  return (
    <div className="govt-container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/issues")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Issues
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header */}
          <Card className="govt-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={issue.status} type="issue" />
                <StatusBadge status={issue.priority} type="priority" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {issue.category}
                </span>
                {issue.isEscalated && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/15 text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Escalated
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-4">{issue.title}</h1>
              
              <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <UserAvatar 
                    name={issue.raisedBy.name} 
                    role={issue.raisedBy.role as UserRole}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{issue.raisedBy.name}</p>
                    <RoleBadge role={issue.raisedBy.role as UserRole} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <Card className="govt-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Responses ({issue.responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Response Form (Officials only) */}
              {isOfficial && (
                <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                  <Textarea
                    placeholder="Add an official response..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="min-h-[80px] mb-3"
                  />
                  <Button
                    onClick={() => respondMutation.mutate(newResponse)}
                    disabled={!newResponse.trim() || respondMutation.isPending}
                    className="saffron-gradient text-white"
                  >
                    {respondMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post Response
                  </Button>
                </div>
              )}

              {/* Responses List */}
              {issue.responses.length > 0 ? (
                <div className="space-y-4">
                  {issue.responses.map((response, index) => (
                    <div key={index} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                      <UserAvatar
                        name={response.respondedBy.name}
                        role={response.respondedBy.role as UserRole}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {response.respondedBy.name}
                          </span>
                          <RoleBadge role={response.respondedBy.role as UserRole} />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(response.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{response.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Responses Yet"
                  message="An official will respond to this issue soon."
                  icon={<MessageSquare className="h-12 w-12" />}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Link */}
          <Card className="govt-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Related Project
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                to={`/projects/${issue.project._id}`}
                className="block p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <p className="font-medium text-primary">{issue.project.title}</p>
              </Link>
            </CardContent>
          </Card>

          {/* Status Update (Officials only) */}
          {isOfficial && (
            <Card className="govt-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={issue.status}
                  onValueChange={(v) => updateStatusMutation.mutate(v as IssueStatus)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card className="govt-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={issue.status} type="issue" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <StatusBadge status={issue.priority} type="priority" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{issue.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responses</span>
                <span className="font-medium">{issue.responses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {format(new Date(issue.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
