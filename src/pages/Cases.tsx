import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calendar, Eye } from 'lucide-react';
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

const Cases = () => {
  const navigate = useNavigate();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Cases</h1>
            <p className="text-muted-foreground mt-2">Manage and review your medical case analyses</p>
          </div>
          <Button onClick={handleNewCase} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Case
          </Button>
        </div>

        {/* Cases Grid */}
        {cases.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((case_) => (
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