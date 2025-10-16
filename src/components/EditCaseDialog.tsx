import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCasesStore } from "@/store";
import type { CaseRecord } from "@/types/domain";

const formSchema = z.object({
  caseName: z.string().min(1, "Case name is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).optional(),
});

interface EditCaseDialogProps {
  caseRecord: CaseRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseUpdate: (updatedCase: CaseRecord) => void;
}

export default function EditCaseDialog({
  caseRecord,
  open,
  onOpenChange,
  onCaseUpdate,
}: EditCaseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateCase = useCasesStore((s) => s.updateCase);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseName: caseRecord?.title ?? "",
      description: caseRecord?.description ?? "",
      priority: (caseRecord?.priority as any) ?? "medium",
      tags: caseRecord?.tags ?? [],
    },
  });

  const [editTags, setEditTags] = useState<string[]>(caseRecord?.tags || []);

  useEffect(() => {
    form.reset({
      caseName: caseRecord?.title ?? "",
      description: caseRecord?.description ?? "",
      priority: (caseRecord?.priority as any) ?? "medium",
      tags: caseRecord?.tags ?? [],
    });
    setEditTags(caseRecord?.tags ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseRecord?.id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!caseRecord) return;
    setIsSubmitting(true);
    try {
      const updated = await updateCase(caseRecord.id, {
        title: values.caseName,
        description: values.description ?? null,
        tags: editTags,
        priority: values.priority as any,
      });

      onCaseUpdate({
        ...updated,
      } as CaseRecord);

      toast({
        title: "Case updated",
        description: "Case information has been updated.",
        type: "info",
      });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update case.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (!val) return;
      if (!editTags.includes(val)) setEditTags((t) => [...t, val]);
      (e.target as HTMLInputElement).value = "";
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

  const removeEditTag = (tag: string) =>
    setEditTags((t) => t.filter((x) => x !== tag));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter case name" {...field} />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-48">
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

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter case description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <Input
                    placeholder="Type a tag and press Enter"
                    onKeyDown={onEditTagKeyDown}
                    className="tag-input-field mt-2 w-full"
                  />
                  {editTags.length > 0 && (
                    <div className="tag-input-container mt-2">
                      {editTags.map((tag) => (
                        <span
                          key={tag}
                          className={`tag-badge tag-color-${getRandomColorIndexFor(
                            tag
                          )} mr-2`}
                        >
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            className="tag-remove ml-2"
                            onClick={() => removeEditTag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
