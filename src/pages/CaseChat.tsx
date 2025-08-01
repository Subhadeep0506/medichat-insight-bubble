import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedicalChatInterface } from '@/components/MedicalChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CaseChat = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const handleBackToCases = () => {
    navigate('/');
  };

  if (!caseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Case Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested case could not be found.</p>
          <Button onClick={handleBackToCases}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Back button header */}
      <div className="border-b bg-background/80 backdrop-blur-sm p-2">
        <Button variant="ghost" onClick={handleBackToCases} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Button>
      </div>
      
      {/* Chat Interface */}
      <div className="h-[calc(100vh-60px)]">
        <MedicalChatInterface caseId={caseId} />
      </div>
    </div>
  );
};

export default CaseChat;