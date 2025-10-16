import React, { useMemo, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, X, Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCasesStore } from "@/store";

const formSchema = z.object({
  caseName: z.string().min(1, "Case name is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

const NewCase = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const patientId = location?.state?.patientId as string | undefined;
  const { createCase } = useCasesStore();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseName: "",
      description: "",
      priority: "medium",
      tags: [],
    },
  });

  const addTag = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (!tags.includes(v)) {
      const next = [...tags, v];
      setTags(next);
      form.setValue("tags", next);
    }
  };
  const removeTag = (value: string) => {
    const next = tags.filter((t) => t !== value);
    setTags(next);
    form.setValue("tags", next);
  };
  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      addTag(input.value);
      input.value = "";
    }
  };
  const tagColorMapRef = useRef<Map<string, number>>(new Map());
  const getRandomColorIndexFor = (s: string) => {
    const existing = tagColorMapRef.current.get(s);
    if (existing) return existing;
    const idx = Math.floor(Math.random() * 12) + 1;
    tagColorMapRef.current.set(s, idx);
    return idx;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (!patientId) {
        toast({
          title: "Missing patient",
          description: "No patient selected for this case.",
          // variant: "destructive",
          type: "error",
        });
        return;
      }
      const created = await createCase(patientId, {
        title: data.caseName,
        description: data.description,
        tags: tags,
        priority: data.priority,
      });

      toast({
        title: "Case Created.",
        description: `New case ${created.id} has been created and is ready for analysis.`,
        type: "info",
      });

      navigate(`/case/${created.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        // variant: "destructive",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/cases");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Button>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="my-4 mx-2">
            <h1 className="text-3xl font-bold text-foreground">
              Create New Case
            </h1>
            <p className="text-muted-foreground mt-2">
              Add case details, tags, and priority
            </p>
          </div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">
                Case Information
              </CardTitle>
              <CardDescription>
                Provide the case name, description, tags, and priority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Case Name */}
                  <FormField
                    control={form.control}
                    name="caseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">
                          Case Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter case name"
                            {...field}
                            className="bg-background border-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter case description"
                            className="min-h-[100px] bg-background border-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags */}
                  <div>
                    <Label className="text-card-foreground">Tags</Label>
                    <Input
                      placeholder="Type a tag and press Enter"
                      onKeyDown={onTagKeyDown}
                      className="tag-input-field mt-2 w-full"
                    />
                    {tags.length > 0 && (
                      <div className="tag-input-container mt-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`tag-badge tag-color-${getRandomColorIndexFor(
                              tag
                            )}`}
                          >
                            {tag}
                            <button
                              type="button"
                              aria-label={`Remove ${tag}`}
                              className="tag-remove"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">
                          Priority
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-input w-48">
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

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Creating Case...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Create Case
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
    </div>
  );
};

export default NewCase;
