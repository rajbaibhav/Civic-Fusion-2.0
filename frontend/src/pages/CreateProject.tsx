import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectsApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, FolderPlus } from "lucide-react";

const createProjectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(10, "Location must be at least  10characters"),
});

type CreateProjectData = z.infer<typeof createProjectSchema>;

const CreateProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      location: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
      navigate(`/projects/`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create project");
    },
  });

  const onSubmit = (data: CreateProjectData) => {
    createMutation.mutate({
      title: data.title,
      description: data.description,
      department: data.department,
      location: data.location || undefined,
    });
  };

  return (
    <div className="govt-container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/projects")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="govt-shadow border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg govt-gradient flex items-center justify-center mb-4">
              <FolderPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Add a new government project for public tracking
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
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., National Highway Development - Phase IV"
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
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide a detailed description of the project, its objectives, and expected outcomes..."
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
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Ministry of Road Transport"
                            className="input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., New Delhi, Maharashtra"
                            className="input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/projects")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 govt-gradient"
                  >
                    {createMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Project
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

export default CreateProject;
