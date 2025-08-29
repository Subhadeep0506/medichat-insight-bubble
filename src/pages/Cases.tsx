import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Calendar, Eye, Search, Filter, Edit, User, ChevronDown, ChevronUp } from 'lucide-react';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dob: Date;
  medicalHistory: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  patientId: string;
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
  
  // Separate search and filter states for patients and cases
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  
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
  
  // Sample patients data
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'patient-1',
      name: 'John Smith',
      age: 45,
      gender: 'male',
      dob: new Date('1979-03-15'),
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'patient-2',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'female',
      dob: new Date('1992-08-22'),
      medicalHistory: ['Migraine', 'Anxiety'],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-14'),
    },
    {
      id: 'patient-3',
      name: 'Michael Brown',
      age: 58,
      gender: 'male',
      dob: new Date('1966-11-10'),
      medicalHistory: ['Coronary Artery Disease', 'High Cholesterol'],
      createdAt: new Date('2023-11-20'),
      updatedAt: new Date('2024-01-13'),
    },
  ]);

  // Sample cases data - linked to patients
  const [cases, setCases] = useState<Case[]>([
    {
      id: 'case-1',
      patientId: 'patient-1',
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
      patientId: 'patient-2',
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
      patientId: 'patient-3',
      title: 'Cardiac Echo Analysis',
      patientAge: 58,
      description: 'Echocardiogram for heart function assessment',
      imageUrl: '/placeholder.svg',
      lastUpdated: new Date('2024-01-13'),
      createdAt: new Date('2024-01-13'),
      category: 'cardiology',
      tags: ['heart', 'echo', 'cardiac']
    },
    {
      id: 'case-4',
      patientId: 'patient-1',
      title: 'Blood Test Analysis',
      patientAge: 45,
      description: 'Routine blood work for diabetes monitoring',
      imageUrl: '/placeholder.svg',
      lastUpdated: new Date('2024-01-12'),
      createdAt: new Date('2024-01-12'),
      category: 'pathology',
      tags: ['blood', 'diabetes', 'routine']
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

  const handlePatientClick = (patient: Patient) => {
    if (expandedPatient === patient.id) {
      setExpandedPatient(null);
    } else {
      setExpandedPatient(patient.id);
    }
  };

  const handleOpenCases = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateOfBirth = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (category: Case['category']) => {
    const colors = {
      radiology: 'bg-primary',
      cardiology: 'bg-destructive',
      neurology: 'bg-secondary',
      orthopedics: 'bg-accent',
      general: 'bg-muted',
      pathology: 'bg-primary'
    };
    return colors[category];
  };

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  }, [patients, patientSearchQuery]);

  // Filtered and sorted cases for selected patient
  const filteredAndSortedCases = useMemo(() => {
    let filtered = selectedPatient 
      ? cases.filter(case_ => case_.patientId === selectedPatient.id)
      : [];

    // Apply search filter
    filtered = filtered.filter(case_ => {
      const matchesSearch = 
        case_.id.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        case_.title.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        case_.tags.some(tag => tag.toLowerCase().includes(caseSearchQuery.toLowerCase()));
      
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
  }, [cases, selectedPatient, caseSearchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Medical Cases & Patients</h1>
              <p className="text-muted-foreground mt-2">Manage patients and review their medical case analyses</p>
            </div>
            <Button onClick={handleNewCase} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Case
            </Button>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="h-[calc(100vh-200px)] w-full">
          <ResizablePanelGroup direction="horizontal" className="min-h-full border rounded-lg">
            
            {/* Patients Panel - Left 40% */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="flex flex-col h-full">
                {/* Patients Header & Search */}
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-card-foreground">Patients</h2>
                  </div>
                  
                  {/* Patient Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search patients..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Patients List */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {filteredPatients.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedPatient?.id === patient.id ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div 
                            className="flex items-center justify-between"
                            onClick={() => handlePatientClick(patient)}
                          >
                            <div>
                              <CardTitle className="text-base text-card-foreground">{patient.name}</CardTitle>
                              <CardDescription className="text-sm">
                                ID: {patient.id} • Age: {patient.age} • {patient.gender}
                              </CardDescription>
                            </div>
                            {expandedPatient === patient.id ? 
                              <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>

                          {/* Patient Details - Accordion Content */}
                          {expandedPatient === patient.id && (
                            <CardContent className="px-0 pt-4 space-y-3">
                              <Separator />
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-card-foreground">Date of Birth:</span>
                                  <span className="text-muted-foreground ml-2">
                                    {formatDateOfBirth(patient.dob)}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-card-foreground">Medical History:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {patient.medicalHistory.map((condition, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {condition}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Created: {formatDate(patient.createdAt)}</span>
                                  <span>Updated: {formatDate(patient.updatedAt)}</span>
                                </div>
                              </div>

                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCases(patient);
                                }}
                                className="w-full mt-3"
                                size="sm"
                              >
                                Open Cases ({cases.filter(c => c.patientId === patient.id).length})
                              </Button>
                            </CardContent>
                          )}
                        </CardHeader>
                      </Card>
                    ))}

                    {filteredPatients.length === 0 && (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
                        <p className="text-muted-foreground">Try adjusting your search</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Cases Panel - Right 60% */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="flex flex-col h-full">
                {/* Cases Header & Search */}
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold text-card-foreground">
                        Cases {selectedPatient && `- ${selectedPatient.name}`}
                      </h2>
                    </div>
                    {selectedPatient && (
                      <Badge variant="secondary">
                        {filteredAndSortedCases.length} case{filteredAndSortedCases.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Case Search & Filters */}
                  {selectedPatient && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search cases..."
                          value={caseSearchQuery}
                          onChange={(e) => setCaseSearchQuery(e.target.value)}
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
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lastUpdated">Last Updated</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cases Content */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {!selectedPatient ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <Eye className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Select a patient</h3>
                        <p className="text-muted-foreground">Choose a patient from the left panel to view their cases</p>
                      </div>
                    ) : filteredAndSortedCases.length === 0 ? (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                        <p className="text-muted-foreground">
                          {cases.filter(c => c.patientId === selectedPatient.id).length === 0 
                            ? 'This patient has no cases yet' 
                            : 'No cases match your search criteria'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Cases;
