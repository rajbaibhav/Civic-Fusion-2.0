import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { issuesApi, projectsApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import type { IssuePriority } from "@/types";

const createIssueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  priority: z.enum(["low", "medium", "high"]),
});

type CreateIssueData = z.infer<typeof createIssueSchema>;

const CreateIssue = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  const form = useForm<CreateIssueData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateIssueData) => 
      issuesApi.create(projectId!, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority as IssuePriority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      toast.success("Issue reported successfully");
      navigate(`/projects/${projectId}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create issue");
    },
  });

  const onSubmit = (data: CreateIssueData) => {
    createMutation.mutate(data);
  };

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
          message="The project you're trying to report an issue for doesn't exist."
          action={{ label: "Back to Projects", onClick: () => navigate("/projects") }}
        />
      </div>
    );
  }

  const commonCategories = [
    "Quality Issues",
    "Delay",
    "Budget Concerns",
    "Safety",
    "Environmental",
    "Corruption",
    "Labor Issues",
    "Infrastructure",
    "Other",
  ];

  return (
    <div className="govt-container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/projects/${projectId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Project
      </Button>

      <div className="max-w-2xl mx-auto">
        {/* Project Context */}
        <Card className="mb-6 bg-muted/50 border-l-4 border-l-primary">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Reporting issue for:</p>
            <p className="font-semibold text-foreground">{project.title}</p>
          </CardContent>
        </Card>

        <Card className="govt-shadow border-t-4 border-t-warning">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-warning flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Report an Issue</CardTitle>
            <CardDescription>
              Raise a concern or grievance about this project
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Brief description of the issue"
                          className="input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide detailed information about the issue, including any evidence or observations..."
                          className="min-h-[150px] input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                  >
                    {createMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Issue
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateIssue;
