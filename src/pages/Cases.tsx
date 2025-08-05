import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Calendar, Eye, Search, Filter, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface Case {
  id: string;
  title: string;
  patientAge?: number;
  patientDOB?: Date;
  patientHeight?: string;
  patientWeight?: string;
  description?: string;
  imageUrl: string;
  lastUpdated: Date;
  createdAt: Date;
  category: 'radiology' | 'cardiology' | 'neurology' | 'orthopedics' | 'general' | 'pathology';
  tags: string[];
}

const editCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  patientAge: z.string().optional(),
  patientHeight: z.string().optional(),
  patientWeight: z.string().optional(),
  tags: z.string().optional(),
});

const Cases = () => {
  const navigate = useNavigate();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  
  const form = useForm<z.infer<typeof editCaseSchema>>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      title: '',
      description: '',
      patientAge: '',
      patientHeight: '',
      patientWeight: '',
      tags: '',
    },
  });
  
  // Sample cases data - in a real app this would come from a database
  const [cases, setCases] = useState<Case[]>([
    {
      id: 'case-1',
      title: 'Chest X-Ray Analysis',
      patientAge: 45,
      description: 'Patient experiencing chest pain and shortness of breath',
      imageUrl: '/placeholder.svg',
      lastUpdated: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      category: 'radiology',
      tags: ['chest', 'x-ray', 'urgent']
    },
    {
      id: 'case-2',
      title: 'Brain MRI Review',
      patientAge: 32,
      description: 'Neurological examination following headaches',
      imageUrl: '/placeholder.svg',
      lastUpdated: new Date('2024-01-14'),
      createdAt: new Date('2024-01-14'),
      category: 'neurology',
      tags: ['brain', 'mri', 'headache']
    },
    {
      id: 'case-3',
      title: 'Cardiac Echo Analysis',
      patientAge: 58,
      description: 'Echocardiogram for heart function assessment',
      imageUrl: '/placeholder.svg',
      lastUpdated: new Date('2024-01-13'),
      createdAt: new Date('2024-01-13'),
      category: 'cardiology',
      tags: ['heart', 'echo', 'cardiac']
    }
  ]);

  const handleDeleteCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const handleEditCase = (case_: Case) => {
    setEditingCase(case_);
    form.reset({
      title: case_.title,
      description: case_.description || '',
      patientAge: case_.patientAge?.toString() || '',
      patientHeight: case_.patientHeight || '',
      patientWeight: case_.patientWeight || '',
      tags: case_.tags.join(', '),
    });
  };

  const onEditSubmit = (values: z.infer<typeof editCaseSchema>) => {
    if (!editingCase) return;
    
    setCases(prev => prev.map(case_ => 
      case_.id === editingCase.id 
        ? {
            ...case_,
            title: values.title,
            description: values.description,
            patientAge: values.patientAge ? parseInt(values.patientAge) : undefined,
            patientHeight: values.patientHeight,
            patientWeight: values.patientWeight,
            tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            lastUpdated: new Date(),
          }
        : case_
    ));
    setEditingCase(null);
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleNewCase = () => {
    navigate('/new-case');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryColor = (category: Case['category']) => {
    const colors = {
      radiology: 'bg-blue-500',
      cardiology: 'bg-red-500',
      neurology: 'bg-purple-500',
      orthopedics: 'bg-green-500',
      general: 'bg-gray-500',
      pathology: 'bg-orange-500'
    };
    return colors[category];
  };

  // Filtered and sorted cases
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter(case_ => {
      const matchesSearch = 
        case_.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || case_.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort cases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'patientAge':
          return (b.patientAge || 0) - (a.patientAge || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cases, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Medical Cases</h1>
              <p className="text-muted-foreground mt-2">Manage and review your medical case analyses</p>
            </div>
            <Button onClick={handleNewCase} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Case
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by case ID, name, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="patientAge">Patient Age</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        {filteredAndSortedCases.length === 0 ? (
          cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Eye className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No cases yet</h3>
            <p className="text-muted-foreground mb-4">Create your first medical case to get started</p>
            <Button onClick={handleNewCase}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Case
            </Button>
          </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-foreground mb-2">No cases match your search</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCases.map((case_) => (
              <Card 
                key={case_.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border bg-card"
                onClick={() => handleCaseClick(case_.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                        {case_.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Case ID: {case_.id}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingCase?.id === case_.id} onOpenChange={(open) => !open && setEditingCase(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCase(case_);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                           <DialogHeader>
                             <DialogTitle>Edit Case</DialogTitle>
                           </DialogHeader>
                           <Form {...form}>
                             <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                              <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Case Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter case title" {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Enter case description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="patientAge"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Patient Age</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Age" type="number" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="patientHeight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Height</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., 175cm" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="patientWeight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Weight</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., 70kg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                      <Input placeholder="tag1, tag2, tag3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1">
                                  Save Changes
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingCase(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Case</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this case? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCase(case_.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Patient Info */}
                  {case_.patientAge && (
                    <div className="text-sm text-muted-foreground">
                      Patient Age: {case_.patientAge} years
                    </div>
                  )}

                  {/* Description */}
                  {case_.description && (
                    <p className="text-sm text-card-foreground line-clamp-2">
                      {case_.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs text-white ${getCategoryColor(case_.category)}`}
                    >
                      {case_.category}
                    </Badge>
                    {case_.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {case_.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{case_.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Updated {formatDate(case_.lastUpdated)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;