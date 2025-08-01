import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  age: z.string().optional(),
  dob: z.date().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NewCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: '',
      age: '',
      height: '',
      weight: '',
      description: '',
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate case creation - in a real app this would save to database
      const newCaseId = `case-${Date.now()}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Case Created Successfully',
        description: `New case ${newCaseId} has been created and is ready for analysis.`,
      });
      
      // Navigate to the chat interface for this case
      navigate(`/case/${newCaseId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Case</h1>
            <p className="text-muted-foreground mt-2">Upload medical image and patient details</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Case Information</CardTitle>
              <CardDescription>
                Please provide the medical image and any relevant patient details. Only the image is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Image Upload */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">Medical Image *</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div
                              className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                                "border-border hover:border-primary/50 bg-background",
                                imagePreview && "border-primary/50"
                              )}
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              {imagePreview ? (
                                <div className="space-y-4">
                                  <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    className="max-h-48 mx-auto rounded-md object-contain"
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Click to change image
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                                  <div>
                                    <p className="text-foreground font-medium">Upload medical image</p>
                                    <p className="text-sm text-muted-foreground">
                                      Drag and drop or click to browse
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Patient Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground">Patient Age</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 45" 
                              {...field} 
                              className="bg-background border-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-card-foreground">Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-background border-input",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground">Height</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 5'8&quot; or 173cm" 
                              {...field} 
                              className="bg-background border-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground">Weight</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 150lbs or 68kg" 
                              {...field} 
                              className="bg-background border-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-card-foreground">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe symptoms, concerns, or any relevant medical history..."
                            className="min-h-[100px] bg-background border-input"
                            {...field}
                          />
                        </FormControl>
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
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
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