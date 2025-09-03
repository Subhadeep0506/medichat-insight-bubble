import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Calendar, Eye, Search, Filter, Edit, User, ChevronDown, ChevronUp, X } from 'lucide-react';
import FloatingNavbar from '@/components/FloatingNavbar';
import { EditPatientDialog } from '@/components/EditPatientDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
import { usePatientsStore, useCasesStore } from '@/store';
import type { Patient, CaseRecord, ID } from '@/types/domain';
import { cn } from '@/lib/utils';

const editCaseSchema = z.object({
  caseName: z.string().min(1, 'Case name is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).default([]),
});

const Cases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState(false)

  const form = useForm<z.infer<typeof editCaseSchema>>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: { caseName: '', description: '', priority: 'medium', tags: [] },
  });

  const { patients, order: patientOrder, fetchPatients, deletePatient } = usePatientsStore();
  const { casesByPatient, orderByPatient, listByPatient, updateCase, deleteCase } = useCasesStore();

  useEffect(() => {
    fetchPatients().catch((error) => {
      console.error('Error fetching patients:', error);
      toast({ "title": "Failed to fetch patients.", "description": error.data.detail, "variant": 'destructive' })
    });
  }, [fetchPatients, deletingPatient, toast]);

  useEffect(() => {
    if (selectedPatient?.id) listByPatient(selectedPatient.id).catch(() => { });
  }, [selectedPatient?.id, listByPatient]);

  const patientsList: Patient[] = useMemo(() => patientOrder.map((id) => patients[id]).filter(Boolean) as Patient[], [patients, patientOrder]);

  const filteredPatients = useMemo(() => {
    const q = patientSearchQuery.toLowerCase();
    return patientsList.filter((p) =>
      (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q)
    );
  }, [patientsList, patientSearchQuery]);

  type UICase = {
    id: ID;
    patientId: ID;
    title: string;
    description?: string | null;
    lastUpdated: Date;
    category: string | null;
    tags: string[];
    priority: 'low' | 'medium' | 'high';
  };

  const casesForSelected: UICase[] = useMemo(() => {
    if (!selectedPatient) return [];
    const ids = orderByPatient[selectedPatient.id] || [];
    const items = ids.map((cid) => casesByPatient[selectedPatient.id]?.[cid]).filter(Boolean) as CaseRecord[];
    return items.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      title: c.title,
      description: c.description,
      lastUpdated: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      category: 'general',
      tags: c.tags || [],
      priority: (c.priority as 'low' | 'medium' | 'high') || 'medium',
    }));
  }, [selectedPatient, orderByPatient, casesByPatient]);

  const filteredAndSortedCases = useMemo(() => {
    let filtered = casesForSelected;
    filtered = filtered.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(caseSearchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory as any;
      return matchesSearch && matchesCategory;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastUpdated':
          return a.lastUpdated < b.lastUpdated ? 1 : -1;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    return filtered;
  }, [casesForSelected, caseSearchQuery, selectedCategory, sortBy]);

  const handleDeleteCase = (caseId: string) => {
    if (!selectedPatient) return;
    deleteCase(selectedPatient.id, caseId).catch(() => { });
  };

  const [editTags, setEditTags] = useState<string[]>([]);
  const tagColorMapRef = useRef<Map<string, number>>(new Map());
  const getRandomColorIndexFor = (s: string) => {
    const existing = tagColorMapRef.current.get(s);
    if (existing) return existing;
    const idx = Math.floor(Math.random() * 12) + 1;
    tagColorMapRef.current.set(s, idx);
    return idx;
  };
  const getPriorityClasses = (p?: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high': return 'priority-badge priority-high';
      case 'medium': return 'priority-badge priority-medium';
      default: return 'priority-badge priority-low';
    }
  };
  const addEditTag = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (!editTags.includes(v)) setEditTags([...editTags, v]);
  };
  const removeEditTag = (value: string) => setEditTags(editTags.filter((t) => t !== value));
  const onEditTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      addEditTag(input.value);
      input.value = '';
    }
  };

  const handleEditCase = (case_: UICase) => {
    setEditingCase({
      id: case_.id,
      patientId: case_.patientId,
      title: case_.title,
      description: case_.description,
      status: 'open',
      updatedAt: case_.lastUpdated.toISOString(),
      tags: case_.tags,
    });
    setEditTags(case_.tags || []);
    form.reset({ caseName: case_.title, description: case_.description || '', priority: case_.priority, tags: case_.tags || [] });
  };

  const onEditSubmit = async (values: z.infer<typeof editCaseSchema>) => {
    if (!editingCase) return;
    try {
      await updateCase(editingCase.id, { title: values.caseName, description: values.description, tags: editTags, priority: values.priority });
      toast({ title: 'Case updated' });
    } catch {
      toast({ title: 'Failed to update case', variant: 'destructive' });
    } finally {
      setEditingCase(null);
    }
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleNewPatient = () => {
    navigate('/new-patient');
  };

  const handleNewCase = (patientId: string) => {
    navigate('/new-case', { state: { patientId } });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleDeletePatient = (patientId: string) => {
    setDeletingPatient(true)
    deletePatient(patientId).then(() => { toast({ title: "Patient deleted." }); }).catch((err: any) => {
      toast({ title: "Patient delete failed.", description: err.data.details, variant: "destructive" });
    });
    if (selectedPatient?.id === patientId) setSelectedPatient(null);
    if (expandedPatient === patientId) setExpandedPatient(null);
    setDeletingPatient(false)
  };

  const handlePatientClick = (patient: Patient) => {
    setExpandedPatient((prev) => (prev === patient.id ? null : patient.id));
  };

  const handleOpenCases = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);

  const formatDateOfBirth = (dob?: string | null) => {
    if (!dob) return '—';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dob));
  };

  const formatDateTime = (dob?: string | null) => {
    if (!dob) return '—';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: "2-digit", minute: "2-digit" }).format(new Date(dob));
  };

  const getCategoryColor = (category: UICase['category']) => {
    const colors: Record<UICase['category'], string> = {
      radiology: 'bg-primary',
      cardiology: 'bg-destructive',
      neurology: 'bg-secondary',
      orthopedics: 'bg-accent',
      general: 'bg-muted',
      pathology: 'bg-primary',
    };
    return colors[category] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      <div className="container mx-auto p-6 pt-20">
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Cases & Patients</h1>
            <p className="text-muted-foreground mt-2">Manage patients and review their medical case analyses</p>
          </div>
        </div>

        <div className="h-[calc(100vh-200px)] w-full">
          <ResizablePanelGroup direction="horizontal" className="min-h-full border  border-green-300 dark:border-green-700 rounded-xl shadow-xl">
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-card-foreground">Patients</h2>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Search patients..." value={patientSearchQuery} onChange={(e) => setPatientSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {filteredPatients.map((patient) => (
                      <Card key={patient.id} className={`cursor-pointer transition-colors hover:bg-accent ${selectedPatient?.id === patient.id ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between" onClick={() => handlePatientClick(patient)}>
                            <div>
                              <CardTitle className="text-base text-card-foreground">{patient.name}</CardTitle>
                              <CardDescription className="text-sm">ID: {patient.id} • Age: {patient.age ?? '—'} • {patient.gender ?? '—'}</CardDescription>
                            </div>
                            {expandedPatient === patient.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>

                          {expandedPatient === patient.id && (
                            <CardContent className="px-0 pt-2 pb-0 space-y-3">
                              <Separator />
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-card-foreground">Date of Birth:</span>
                                  <span className="text-muted-foreground ml-2">{formatDateOfBirth(patient.dob)}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-card-foreground">Medical History:</span>
                                  <div className="mt-1 text-sm text-muted-foreground">{patient.medicalHistory || 'No medical history recorded'}</div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Created: {formatDateTime(patient.createdAt) || '—'}</span>
                                  <span>Updated: {formatDateTime(patient.updatedAt) || '—'}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 mt-3">
                                <Button onClick={(e) => { e.stopPropagation(); handleOpenCases(patient); }} className="W-full" size="sm">
                                  Open Cases {(orderByPatient[patient.id]?.length || 0) > 0 ? `(${orderByPatient[patient.id]?.length || 0})` : ''}
                                </Button>
                                <div className="flex gap-2">
                                  <Button onClick={(e) => { e.stopPropagation(); handleNewCase(patient.id); }} variant="outline" className="flex-1" size="sm">
                                    <Plus className="w-3 h-3 mr-1" />
                                    New Case
                                  </Button>
                                  <Button onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }} variant="outline" size="sm">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button onClick={(e) => e.stopPropagation()} variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {patient.name}? This will also delete all associated cases. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeletePatient(patient.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
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

            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold text-card-foreground">Cases {selectedPatient && `- ${selectedPatient.name}`}</h2>
                    </div>
                    {selectedPatient && (
                      <Badge variant="secondary">{filteredAndSortedCases.length} case{filteredAndSortedCases.length !== 1 ? 's' : ''}</Badge>
                    )}
                  </div>

                  {selectedPatient && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input placeholder="Search cases..." value={caseSearchQuery} onChange={(e) => setCaseSearchQuery(e.target.value)} className="pl-10" />
                      </div>

                      <div className="flex gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="general">General</SelectItem>
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
                        <p className="text-muted-foreground">{(orderByPatient[selectedPatient.id]?.length || 0) === 0 ? 'This patient has no cases yet' : 'No cases match your search criteria'}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredAndSortedCases.map((case_) => (
                          <Card key={case_.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border bg-card" onClick={() => handleCaseClick(case_.id)}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold text-card-foreground truncate">{case_.title}</CardTitle>
                                  <CardDescription className="text-sm text-muted-foreground">Case ID: {case_.id}</CardDescription>
                                </div>
                                <div className="flex gap-1">
                                  <Dialog open={editingCase?.id === case_.id} onOpenChange={(open) => !open && setEditingCase(null)}>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); handleEditCase(case_ as any); }}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                                      <DialogHeader>
                                        <DialogTitle>Edit Case</DialogTitle>
                                      </DialogHeader>
                                      <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                                          <FormField control={form.control} name="caseName" render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Case Name</FormLabel>
                                              <FormControl>
                                                <Input placeholder="Enter case name" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )} />
                                          <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Description</FormLabel>
                                              <FormControl>
                                                <Textarea placeholder="Enter case description" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )} />

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
                                                  <span key={tag} className={`tag-badge tag-color-${getRandomColorIndexFor(tag)}`}>
                                                    {tag}
                                                    <button type="button" aria-label={`Remove ${tag}`} className="tag-remove" onClick={() => removeEditTag(tag)}>
                                                      <X className="w-3 h-3" />
                                                    </button>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          <FormField control={form.control} name="priority" render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Priority</FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                          )} />

                                          <div className="flex gap-2 pt-4">
                                            <Button type="submit" className="flex-1">Save Changes</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditingCase(null)}>Cancel</Button>
                                          </div>
                                        </form>
                                      </Form>
                                    </DialogContent>
                                  </Dialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Case</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to delete this case? This action cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCase(case_.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {case_.description && <p className="text-sm text-card-foreground line-clamp-2"><strong>Description:</strong> {case_.description}</p>}
                              <div className="flex flex-wrap gap-1">
                                {case_.tags.map((tag) => (
                                  <span key={tag} className={`tag-badge tag-color-${getRandomColorIndexFor(tag)}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  Updated {formatDate(case_.lastUpdated)}
                                </div>
                                <span className={getPriorityClasses(case_.priority)}>
                                  Priority: {case_.priority.charAt(0).toUpperCase() + case_.priority.slice(1)}
                                </span>
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

      {editingPatient && (
        <EditPatientDialog
          patient={{
            id: editingPatient.id,
            name: editingPatient.name,
            age: String(editingPatient.age ?? ''),
            gender: String(editingPatient.gender ?? ''),
            dob: editingPatient.dob ? new Date(editingPatient.dob) : new Date(),
            height: String(editingPatient.height ?? ''),
            weight: String(editingPatient.weight ?? ''),
            medicalHistory: editingPatient.medicalHistory || '',
            dateCreated: editingPatient.createdAt || '',
            dateUpdated: editingPatient.updatedAt || '',
          }}
          open={!!editingPatient}
          onOpenChange={(open) => !open && setEditingPatient(null)}
          onPatientUpdate={() => { }}
        />
      )}
    </div>
  );
};

export default Cases;
