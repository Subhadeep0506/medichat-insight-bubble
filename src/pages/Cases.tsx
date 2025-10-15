import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  Calendar,
  Eye,
  Search,
  Filter,
  Edit,
  User,
  RotateCcw,
  Loader,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import FloatingNavbar from "@/components/FloatingNavbar";
import { EditPatientDialog } from "@/components/EditPatientDialog";
import EditCaseDialog from "@/components/EditCaseDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePatientsStore, useCasesStore } from "@/store";
import type { Patient, CaseRecord, ID } from "@/types/domain";
import { cn } from "@/lib/utils";

const editCaseSchema = z.object({
  caseName: z.string().min(1, "Case name is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).default([]),
});

const tagColors = [
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700",
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900 dark:text-violet-200 dark:border-violet-700",
  "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:border-rose-700",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700",
];

const Cases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState(false);
  const [openingPatientId, setOpeningPatientId] = useState<string | null>(null);
  const [showDeletePatientDialog, setShowDeletePatientDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [showDeleteCaseDialog, setShowDeleteCaseDialog] = useState(false);

  // Pagination state (patients and cases)
  const [patientPage, setPatientPage] = useState(1);
  const [patientPageSize, setPatientPageSize] = useState(8);
  const [casesPage, setCasesPage] = useState(1);
  const [casesPageSize, setCasesPageSize] = useState(8);

  const form = useForm<z.infer<typeof editCaseSchema>>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      caseName: "",
      description: "",
      priority: "medium",
      tags: [],
    },
  });

  const {
    patients,
    order: patientOrder,
    fetchPatients,
    deletePatient,
  } = usePatientsStore();
  const {
    casesByPatient,
    orderByPatient,
    listByPatient,
    updateCase,
    deleteCase,
  } = useCasesStore();
  const patientsLoading = usePatientsStore((s) => s.loading);
  const casesLoading = useCasesStore((s) => s.loading);

  useEffect(() => {
    fetchPatients().catch((error) => {
      console.error("Error fetching patients:", error);
      toast({
        title: "Failed to fetch patients.",
        description: error.data.detail,
        variant: "destructive",
      });
    });
  }, [fetchPatients, deletingPatient, toast]);

  useEffect(() => {
    if (selectedPatient?.id) listByPatient(selectedPatient.id).catch(() => {});
  }, [selectedPatient?.id, listByPatient]);

  // Reset pages when filters/search change
  useEffect(() => {
    setPatientPage(1);
  }, [patientSearchQuery]);
  useEffect(() => {
    setCasesPage(1);
  }, [caseSearchQuery, selectedCategory, selectedPatient, sortBy]);

  const patientsList: Patient[] = useMemo(
    () => patientOrder.map((id) => patients[id]).filter(Boolean) as Patient[],
    [patients, patientOrder]
  );

  const filteredPatients = useMemo(() => {
    const q = patientSearchQuery.toLowerCase();
    return patientsList.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.id || "").toLowerCase().includes(q)
    );
  }, [patientsList, patientSearchQuery]);

  // Clamp patient page when list size changes
  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredPatients.length / patientPageSize)
    );
    if (patientPage > total) setPatientPage(total);
  }, [filteredPatients.length, patientPage, patientPageSize]);

  const paginatedPatients = useMemo(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredPatients.length / patientPageSize)
    );
    const page = Math.min(patientPage, total);
    const start = (page - 1) * patientPageSize;
    return filteredPatients.slice(start, start + patientPageSize);
  }, [filteredPatients, patientPage, patientPageSize]);

  type UICase = {
    id: ID;
    patientId: ID;
    title: string;
    description?: string | null;
    lastUpdated: Date;
    category: string | null;
    tags: string[];
    priority: "low" | "medium" | "high";
  };

  const casesForSelected: UICase[] = useMemo(() => {
    if (!selectedPatient) return [];
    const ids = orderByPatient[selectedPatient.id] || [];
    const items = ids
      .map((cid) => casesByPatient[selectedPatient.id]?.[cid])
      .filter(Boolean) as CaseRecord[];
    return items.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      title: c.title,
      description: c.description,
      lastUpdated: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      category: "general",
      tags: c.tags || [],
      priority: (c.priority as "low" | "medium" | "high") || "medium",
    }));
  }, [selectedPatient, orderByPatient, casesByPatient]);

  const filteredAndSortedCases = useMemo(() => {
    let filtered = casesForSelected;
    filtered = filtered.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(caseSearchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || c.category === (selectedCategory as any);
      return matchesSearch && matchesCategory;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastUpdated":
          return a.lastUpdated < b.lastUpdated ? 1 : -1;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    return filtered;
  }, [casesForSelected, caseSearchQuery, selectedCategory, sortBy]);

  // Clamp cases page when list size changes
  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredAndSortedCases.length / casesPageSize)
    );
    if (casesPage > total) setCasesPage(total);
  }, [filteredAndSortedCases.length, casesPage, casesPageSize]);

  const paginatedCases = useMemo(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredAndSortedCases.length / casesPageSize)
    );
    const page = Math.min(casesPage, total);
    const start = (page - 1) * casesPageSize;
    return filteredAndSortedCases.slice(start, start + casesPageSize);
  }, [filteredAndSortedCases, casesPage, casesPageSize]);

  const handleDeleteCase = (caseId: string) => {
    setCaseToDelete(caseId);
    setShowDeleteCaseDialog(true);
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
  const getPriorityClasses = (p?: "low" | "medium" | "high") => {
    switch (p) {
      case "high":
        return "priority-badge priority-high";
      case "medium":
        return "priority-badge priority-medium";
      default:
        return "priority-badge priority-low";
    }
  };

  const handleEditCase = (case_: UICase) => {
    setEditingCase({
      id: case_.id,
      patientId: case_.patientId,
      title: case_.title,
      description: case_.description,
      priority: case_.priority,
      updatedAt: case_.lastUpdated.toISOString(),
      tags: case_.tags,
    });
    setEditTags(case_.tags || []);
    form.reset({
      caseName: case_.title,
      description: case_.description || "",
      priority: case_.priority,
      tags: case_.tags || [],
    });
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleNewPatient = () => {
    navigate("/new-patient");
  };

  const handleNewCase = (patientId: string) => {
    navigate("/new-case", { state: { patientId } });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatientToDelete(patientId);
    setShowDeletePatientDialog(true);
  };

  const handlePatientClick = (patient: Patient) => {
    setExpandedPatient((prev) => (prev === patient.id ? null : patient.id));
  };

  const handleOpenCases = (patient: Patient) => {
    setOpeningPatientId(patient.id);
    setSelectedPatient(patient);
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const formatDateOfBirth = (dob?: string | null) => {
    if (!dob) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dob));
  };

  const formatDateTime = (dob?: string | null) => {
    if (!dob) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dob));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  const getCategoryColor = (category: UICase["category"]) => {
    const colors: Record<UICase["category"], string> = {
      radiology: "bg-primary",
      cardiology: "bg-destructive",
      neurology: "bg-secondary",
      orthopedics: "bg-accent",
      general: "bg-muted",
      pathology: "bg-primary",
    };
    return colors[category] || "bg-muted";
  };

  const patientTotalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientPageSize)
  );
  const casesTotalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedCases.length / casesPageSize)
  );

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      <div className="container mx-auto p-6 pt-20">
        <div className="flex flex-col gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Medical Cases & Patients
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage patients and review their medical case analyses
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh-200px)] w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-full">
            {/* Patients sidebar */}
            <div className="lg:col-span-1 mb-4 bg-card rounded-xl border border-border p-2 flex flex-col relative overflow-visible">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Patients
                  </h3>
                </div>
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

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2 my-2">
                  {patientsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                      <div className="text-sm text-muted-foreground mt-3">
                        Loading patients...
                      </div>
                    </div>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={cn(
                          "m-1 px-2 py-1 rounded-md cursor-pointer border border-border",
                          selectedPatient?.id === patient.id
                            ? "bg-accent/10 ring-2 ring-primary"
                            : "hover:bg-accent"
                        )}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setExpandedPatient(patient.id);
                        }}
                      >
                        <div>
                          <div className="text-sm font-medium text-card-foreground">
                            {patient.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {patient.gender ?? "—"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {!patientsLoading && filteredPatients.length === 0 && (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No patients found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Patients pagination */}
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                    disabled={patientPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Page {Math.min(patientPage, patientTotalPages)} of{" "}
                    {patientTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPatientPage((p) => Math.min(patientTotalPages, p + 1))
                    }
                    disabled={patientPage >= patientTotalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Rows</span>
                  <Select
                    value={String(patientPageSize)}
                    onValueChange={(v) => {
                      setPatientPageSize(parseInt(v));
                      setPatientPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 min-w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cases & Patient details area */}
            <div className="lg:col-span-3 mb-4 bg-card rounded-xl border border-border p-2 flex flex-col relative overflow-visible">
              <div className="flex flex-col gap-4 h-full">
                {/* Top: Patient details */}
                <div className="bg-card-foreground/5 rounded-md border border-border p-4">
                  {selectedPatient ? (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-card-foreground">
                          {selectedPatient.name}
                        </h2>
                        <div className="mt-1 text-sm text-muted-foreground">
                          ID: {selectedPatient.id || "—"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedPatient.gender ?? "—"} • DOB:{" "}
                          {formatDateOfBirth(selectedPatient.dob)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Age: {selectedPatient.age ?? "—"} | Height:{" "}
                          {selectedPatient.height ?? "—"} | Weight:{" "}
                          {selectedPatient.weight ?? "—"}
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          Medical history:{" "}
                          {selectedPatient.medicalHistory || "—"}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditPatient(selectedPatient)}
                          aria-label="Edit patient"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleDeletePatient(selectedPatient.id)
                          }
                          aria-label="Delete patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleNewCase(selectedPatient.id)}
                          aria-label="New case"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Select a patient from the left to view details
                    </div>
                  )}
                </div>

                {/* Bottom: Cases list for selected patient */}
                <div className="flex-1 flex flex-col p-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-card-foreground">
                        Cases{" "}
                        {selectedPatient ? `- ${selectedPatient.name}` : ""}
                      </h3>
                      {selectedPatient && (
                        <Badge variant="secondary">
                          {filteredAndSortedCases.length} case
                          {filteredAndSortedCases.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:block">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lastUpdated">
                              Last Updated
                            </SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="hidden sm:block">
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                      <Button
                        onClick={() => {
                          setSelectedPatient(null);
                          setCaseSearchQuery("");
                          setPatientSearchQuery("");
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                      <Button
                        onClick={() =>
                          navigate("/new-case", {
                            state: { patientId: selectedPatient?.id },
                          })
                        }
                        variant="outline"
                        disabled={selectedPatient === null}
                      >
                        <Plus className="w-4 h-4" />
                        New Case
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-auto flex-1">
                    {casesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full py-12">
                        <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                        <div className="text-sm text-muted-foreground mt-3">
                          Loading cases...
                        </div>
                      </div>
                    ) : (
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="py-2 px-3">Title</th>
                            <th className="py-2 px-3">Case ID</th>
                            <th className="py-2 px-3">Priority</th>
                            <th className="py-2 px-3">Tags</th>
                            <th className="py-2 px-3">Updated</th>
                            <th
                              className="py-2 px-3"
                              aria-label="Actions column"
                            ></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedCases.map((case_) => (
                            <tr key={case_.id} className="border-t">
                              <td className="py-3 px-3 text-sm text-card-foreground truncate max-w-xs">
                                {case_.title}
                              </td>
                              <td className="py-3 px-3 text-sm text-card-foreground">
                                {case_.id}
                              </td>
                              <td className="py-3 px-3 text-sm">
                                <span
                                  className={getPriorityClasses(case_.priority)}
                                >
                                  {case_.priority}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm">
                                {case_.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1 w-full">
                                    {case_.tags
                                      .slice(0, 3)
                                      .map((tag, index) => (
                                        <span
                                          key={tag}
                                          className={`text-xs px-1.5 py-0.5 rounded-full border ${getTagColor(
                                            index
                                          )}`}
                                        >
                                          {truncateText(tag, 8)}
                                        </span>
                                      ))}
                                    {case_.tags.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{case_.tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm text-muted-foreground">
                                {formatDate(case_.lastUpdated)}
                              </td>
                              <td className="py-3 px-3 text-sm text-right">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label="Open actions menu"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="end"
                                    sideOffset={4}
                                    className="w-40 p-1"
                                  >
                                    <div className="flex flex-col">
                                      <Button
                                        variant="ghost"
                                        onClick={() =>
                                          handleCaseClick(case_.id)
                                        }
                                        className="justify-start"
                                      >
                                        <Eye />
                                        View
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        onClick={() =>
                                          handleEditCase(case_ as any)
                                        }
                                        className="justify-start"
                                      >
                                        <Edit />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        onClick={() =>
                                          handleDeleteCase(case_.id)
                                        }
                                        className="justify-start text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 />
                                        Delete
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </td>
                            </tr>
                          ))}

                          {filteredAndSortedCases.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-8 text-center text-muted-foreground"
                              >
                                No cases for this patient
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Cases pagination */}
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCasesPage((p) => Math.max(1, p - 1))}
                        disabled={casesPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Page {Math.min(casesPage, casesTotalPages)} of{" "}
                        {casesTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCasesPage((p) => Math.min(casesTotalPages, p + 1))
                        }
                        disabled={casesPage >= casesTotalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        Rows
                      </span>
                      <Select
                        value={String(casesPageSize)}
                        onValueChange={(v) => {
                          setCasesPageSize(parseInt(v));
                          setCasesPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 min-w-[72px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingPatient && (
        <EditPatientDialog
          patient={{
            id: editingPatient.id,
            name: editingPatient.name,
            age: String(editingPatient.age ?? ""),
            gender: String(editingPatient.gender ?? ""),
            dob: editingPatient.dob ? new Date(editingPatient.dob) : new Date(),
            height: String(editingPatient.height ?? ""),
            weight: String(editingPatient.weight ?? ""),
            medicalHistory: editingPatient.medicalHistory || "",
            dateCreated: editingPatient.createdAt || "",
            dateUpdated: editingPatient.updatedAt || "",
          }}
          open={!!editingPatient}
          onOpenChange={(open) => !open && setEditingPatient(null)}
          onPatientUpdate={() => {}}
        />
      )}

      {/* Edit case dialog */}
      {editingCase && (
        <EditCaseDialog
          caseRecord={editingCase}
          open={!!editingCase}
          onOpenChange={(open) => !open && setEditingCase(null)}
          onCaseUpdate={() => {
            setEditingCase(null);
          }}
        />
      )}

      {/* Confirm delete patient */}
      <AlertDialog
        open={showDeletePatientDialog}
        onOpenChange={setShowDeletePatientDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patient? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowDeletePatientDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!patientToDelete) return;
                setShowDeletePatientDialog(false);
                setDeletingPatient(true);
                try {
                  await deletePatient(patientToDelete);
                  toast({ title: "Patient deleted." });
                  if (selectedPatient?.id === patientToDelete)
                    setSelectedPatient(null);
                  if (expandedPatient === patientToDelete)
                    setExpandedPatient(null);
                } catch (err: any) {
                  toast({
                    title: "Patient delete failed.",
                    description: err?.data?.details ?? String(err),
                    variant: "destructive",
                  });
                } finally {
                  setDeletingPatient(false);
                  setPatientToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete case */}
      <AlertDialog
        open={showDeleteCaseDialog}
        onOpenChange={setShowDeleteCaseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete case?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteCaseDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!caseToDelete) return;
                setShowDeleteCaseDialog(false);
                try {
                  const pid = Object.keys(casesByPatient).find(
                    (p) => !!casesByPatient[p]?.[caseToDelete]
                  );
                  if (!pid) throw new Error("Patient for case not found");
                  await deleteCase(pid, caseToDelete);
                  toast({ title: "Case deleted." });
                } catch (err: any) {
                  toast({
                    title: "Case delete failed.",
                    description: err?.data?.details ?? String(err),
                    variant: "destructive",
                  });
                } finally {
                  setCaseToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cases;
