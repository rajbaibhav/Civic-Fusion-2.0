import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi, budgetsApi, commentsApi, issuesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { RoleBadge } from "@/components/RoleBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { IssueCard } from "@/components/IssueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Edit,
  Archive,
  IndianRupee,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Send,
  Plus,
  History,
  ImagePlus,
  X,
} from "lucide-react";
import type { UserRole, ProjectStatus, BudgetHistoryEntry } from "@/types";

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "stalled", label: "Stalled" },
];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOfficial } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");

  // Progress form state
  const [progressValue, setProgressValue] = useState<number>(0);
  const [progressNotes, setProgressNotes] = useState("");
  const [progressImages, setProgressImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const progressFileInputRef = useRef<HTMLInputElement>(null);

  // Budget form state
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetAllocated, setBudgetAllocated] = useState("");
  const [budgetSpent, setBudgetSpent] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");

  // Fetch project
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch budget (handle 404 gracefully)
  const { data: budget, isError: budgetError } = useQuery({
    queryKey: ["budget", id],
    queryFn: () => budgetsApi.getByProject(id!),
    enabled: !!id,
    retry: false,
  });

  // Fetch budget history
  const { data: budgetHistory } = useQuery({
    queryKey: ["budgetHistory", id],
    queryFn: () => budgetsApi.getHistory(id!),
    enabled: !!id && !!budget,
    retry: false,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentsApi.getByProject(id!),
    enabled: !!id,
  });

  // Fetch issues
  const { data: issues = [] } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.getAll({ project: id }),
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: ProjectStatus) => projectsApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Project status updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  useEffect(() => {
    if (project) {
      setProgressValue(project.progress);
    }
  }, [project?._id, project?.progress]);

  useEffect(() => {
    const urls = progressImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [progressImages]);

  const clearProgressImages = () => {
    setProgressImages([]);
    if (progressFileInputRef.current) {
      progressFileInputRef.current.value = "";
    }
  };

  // Update progress mutation (JSON or multipart + Cloudinary)
  const updateProgressMutation = useMutation({
    mutationFn: (data: { progress: number; notes?: string; images: File[] }) => {
      const payload = { progress: data.progress, notes: data.notes };
      if (data.images.length > 0) {
        return projectsApi.updateProgressWithImages(id!, payload, data.images);
      }
      return projectsApi.updateProgress(id!, payload);
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setProgressValue(updatedProject.progress);
      setProgressNotes("");
      clearProgressImages();
      toast.success("Progress update posted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update progress");
    },
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: (data: { allocatedAmount: number }) =>
      budgetsApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
      queryClient.invalidateQueries({ queryKey: ["budgetHistory", id] });
      setBudgetDialogOpen(false);
      resetBudgetForm();
      toast.success("Budget created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create budget");
    },
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: (data: { allocatedAmount?: number; spentAmount?: number; notes?: string }) =>
      budgetsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
      queryClient.invalidateQueries({ queryKey: ["budgetHistory", id] });
      setBudgetDialogOpen(false);
      resetBudgetForm();
      toast.success("Budget updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update budget");
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(id!, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setNewComment("");
      toast.success("Comment added successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add comment");
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleStatusChange = (status: ProjectStatus) => {
    updateStatusMutation.mutate(status);
  };

  const handleProgressImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    setProgressImages((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > 10) {
        toast.error("You can attach up to 10 images per update");
        return combined.slice(0, 10);
      }
      return combined;
    });
    e.target.value = "";
  };

  const removeProgressImage = (index: number) => {
    setProgressImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProgressSubmit = () => {
    const data: { progress: number; notes?: string; images: File[] } = {
      progress: progressValue,
      images: progressImages,
    };
    if (progressNotes.trim()) {
      data.notes = progressNotes.trim();
    }
    updateProgressMutation.mutate(data);
  };

  const resetBudgetForm = () => {
    setBudgetAllocated("");
    setBudgetSpent("");
    setBudgetNotes("");
  };

  const handleBudgetSubmit = () => {
    if (!budget) {
      // Create new budget
      const allocated = parseFloat(budgetAllocated);
      if (isNaN(allocated) || allocated < 0) {
        toast.error("Please enter a valid allocated amount");
        return;
      }
      createBudgetMutation.mutate({ allocatedAmount: allocated });
    } else {
      // Update existing budget
      const data: { allocatedAmount?: number; spentAmount?: number; notes?: string } = {};
      if (budgetAllocated.trim()) {
        const allocated = parseFloat(budgetAllocated);
        if (!isNaN(allocated) && allocated >= 0) {
          data.allocatedAmount = allocated;
        }
      }
      if (budgetSpent.trim()) {
        const spent = parseFloat(budgetSpent);
        if (!isNaN(spent) && spent >= 0) {
          data.spentAmount = spent;
        }
      }
      if (budgetNotes.trim()) {
        data.notes = budgetNotes.trim();
      }
      if (Object.keys(data).length === 0) {
        toast.error("Please enter at least one field to update");
        return;
      }
      updateBudgetMutation.mutate(data);
    }
  };

  const hasBudget = budget && !budgetError;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="govt-container py-8">
        <EmptyState
          title="Project Not Found"
          message="The project you're looking for doesn't exist or has been removed."
          action={{ label: "Back to Projects", onClick: () => navigate("/projects") }}
        />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const remainingBudget = budget ? budget.allocatedAmount - budget.spentAmount : 0;
  const budgetPercentSpent = budget ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;

  return (
    <div className="govt-container py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/projects")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Status control for officials/admins */}
              {isOfficial && !project.isArchived ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={project.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
              ) : (
                <StatusBadge status={project.status} type="project" className="text-sm" />
              )}
              {project.isArchived && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Archived
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.department}
              </span>
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {isOfficial && !project.isArchived && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/projects/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" className="text-muted-foreground">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          )}
        </div>

        {/* Progress Card */}
        <Card className="govt-shadow">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Project Progress</span>
              <span className="text-2xl font-bold text-primary">{project.progress}%</span>
            </div>
            <ProgressBar progress={project.progress} showPercentage={false} size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">
            <IndianRupee className="h-4 w-4 mr-1" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-1" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-1" />
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="issues">
            <AlertCircle className="h-4 w-4 mr-1" />
            Issues ({issues.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 govt-shadow">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="govt-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Created By</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      name={project.createdBy.name} 
                      role={project.createdBy.role as UserRole}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-foreground">{project.createdBy.name}</p>
                      <RoleBadge role={project.createdBy.role as UserRole} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={project.status} type="project" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          {/* Official Budget Actions */}
          {isOfficial && !project.isArchived && (
            <div className="mb-6">
              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="saffron-gradient text-white">
                    {hasBudget ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Budget
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Budget
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {hasBudget ? "Update Budget" : "Add Budget"}
                    </DialogTitle>
                    <DialogDescription>
                      {hasBudget
                        ? "Update the budget allocation and spending for this project."
                        : "Set the initial budget allocation for this project."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="allocatedAmount">
                        Allocated Amount (₹) {!hasBudget && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id="allocatedAmount"
                        type="number"
                        min="0"
                        placeholder={hasBudget ? budget?.allocatedAmount.toString() : "Enter amount"}
                        value={budgetAllocated}
                        onChange={(e) => setBudgetAllocated(e.target.value)}
                      />
                    </div>
                    {hasBudget && (
                      <div className="space-y-2">
                        <Label htmlFor="spentAmount">Spent Amount (₹)</Label>
                        <Input
                          id="spentAmount"
                          type="number"
                          min="0"
                          placeholder={budget?.spentAmount.toString()}
                          value={budgetSpent}
                          onChange={(e) => setBudgetSpent(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="budgetNotes">Notes (optional)</Label>
                      <Textarea
                        id="budgetNotes"
                        placeholder="Add notes about this budget update..."
                        value={budgetNotes}
                        onChange={(e) => setBudgetNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBudgetDialogOpen(false);
                        resetBudgetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBudgetSubmit}
                      disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                      className="saffron-gradient text-white"
                    >
                      {(createBudgetMutation.isPending || updateBudgetMutation.isPending) && (
                        <LoadingSpinner size="sm" className="mr-2" />
                      )}
                      {hasBudget ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {hasBudget ? (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="govt-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Allocated</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(budget.allocatedAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card className="govt-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                    <span className="text-sm text-muted-foreground">Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(budget.spentAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {budgetPercentSpent.toFixed(1)}% of budget
                  </p>
                </CardContent>
              </Card>

              <Card className="govt-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-success/10">
                      <IndianRupee className="h-5 w-5 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(remainingBudget)}
                  </p>
                </CardContent>
              </Card>

              {/* Budget History */}
              {(budgetHistory?.history || budget.history)?.length > 0 && (
                <Card className="md:col-span-3 govt-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Budget History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...(budgetHistory?.history || budget.history || [])]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((entry: BudgetHistoryEntry, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-foreground">
                                  {entry.updatedBy.name}
                                </span>
                                <RoleBadge role={entry.updatedBy.role as UserRole} />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Allocated: {formatCurrency(entry.allocatedAmount)} | Spent: {formatCurrency(entry.spentAmount)}
                              </p>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground mt-1 italic">"{entry.notes}"</p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(entry.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Budget Information"
              message={
                isOfficial
                  ? "Click 'Add Budget' above to set the budget for this project."
                  : "Budget details for this project haven't been added yet."
              }
              icon={<IndianRupee className="h-12 w-12" />}
            />
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          {/* Official Progress Update Form */}
          {isOfficial && !project.isArchived && (
            <Card className="govt-shadow mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Progress Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="progress">Progress ({progressValue}%)</Label>
                      <span className="text-2xl font-bold text-primary">{progressValue}%</span>
                    </div>
                    <Slider
                      id="progress"
                      min={0}
                      max={100}
                      step={1}
                      value={[progressValue]}
                      onValueChange={(value) => setProgressValue(value[0])}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progressNotes">Notes (optional)</Label>
                    <Textarea
                      id="progressNotes"
                      placeholder="Describe the progress made..."
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photos (optional)</Label>
                    <input
                      ref={progressFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleProgressImageSelect}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => progressFileInputRef.current?.click()}
                        disabled={progressImages.length >= 10}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Add Photos ({progressImages.length}/10)
                      </Button>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {imagePreviews.map((src, index) => (
                          <div key={src} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={src}
                              alt={`Upload preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeProgressImage(index)}
                              className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow hover:bg-destructive hover:text-destructive-foreground"
                              aria-label="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleProgressSubmit}
                    disabled={updateProgressMutation.isPending}
                    className="saffron-gradient text-white"
                  >
                    {updateProgressMutation.isPending && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    <Send className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="govt-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Progress History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.progressHistory.length > 0 ? (
                <div className="space-y-4">
                  {[...project.progressHistory]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((entry, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="w-16 h-16 rounded-full govt-gradient flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {entry.progress}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-foreground">
                              {entry.updatedBy.name}
                            </span>
                            <RoleBadge role={entry.updatedBy.role as UserRole} />
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mb-1">"{entry.notes}"</p>
                          )}
                          {entry.images && entry.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                              {entry.images.map((img) => (
                                <a
                                  key={img.publicId}
                                  href={img.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block aspect-video rounded-md overflow-hidden border hover:opacity-90 transition-opacity"
                                >
                                  <img
                                    src={img.imageUrl}
                                    alt="Progress update"
                                    className="h-full w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState
                  title="No Progress Updates"
                  message={
                    isOfficial
                      ? "Use the form above to post the first progress update."
                      : "No progress updates have been recorded yet."
                  }
                  icon={<TrendingUp className="h-12 w-12" />}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card className="govt-shadow">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Comment Form */}
              {isAuthenticated ? (
                <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                  <div className="flex gap-3">
                    <UserAvatar 
                      name={user?.name || ""} 
                      role={user?.role as UserRole}
                      size="md"
                    />
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] mb-3"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        className="saffron-gradient text-white"
                      >
                        {addCommentMutation.isPending ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg border bg-muted/30 text-center">
                  <p className="text-muted-foreground mb-2">
                    Please log in to add a comment
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/login">Log In</Link>
                  </Button>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                      <UserAvatar 
                        name={comment.user.name} 
                        role={comment.user.role as UserRole}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {comment.user.name}
                          </span>
                          <RoleBadge role={comment.user.role as UserRole} />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Comments Yet"
                  message="Be the first to share your thoughts on this project."
                  icon={<MessageSquare className="h-12 w-12" />}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Issues</h3>
            {isAuthenticated && (
              <Button asChild className="saffron-gradient text-white">
                <Link to={`/projects/${id}/issues/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
            )}
          </div>

          {issues.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Issues Reported"
              message="No issues have been raised for this project yet."
              icon={<AlertCircle className="h-12 w-12" />}
              action={isAuthenticated ? {
                label: "Report an Issue",
                onClick: () => navigate(`/projects/${id}/issues/new`),
              } : undefined}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
