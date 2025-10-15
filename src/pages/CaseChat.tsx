import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MedicalChatInterface } from "@/components/MedicalChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CaseChat = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const handleBackToCase = () => {
    navigate("/cases");
  };

  if (!caseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Case Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The requested case could not be found.
          </p>
          <Button onClick={handleBackToCase}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <MedicalChatInterface caseId={caseId} onBackToCase={handleBackToCase} />
    </div>
  );
};

export default CaseChat;
