import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CaseType, CaseUrgency } from '@/types';
import {
  FileText,
  Upload,
  Mic,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateCaseSummary } from '@/services/api';

const caseTypes: CaseType[] = ['Property', 'Civil', 'Family', 'Consumer', 'Labor', 'Criminal', 'Other'];

const steps = [
  { id: 1, title: 'Case Details', icon: FileText },
  { id: 2, title: 'Description', icon: FileCheck },
  { id: 3, title: 'Evidence', icon: Upload },
  { id: 4, title: 'AI Analysis', icon: Brain },
];

export default function FileCase() {
  const navigate = useNavigate();
  const { user, addCase, addNotification, addSystemLog } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: '' as CaseType,
    description: '',
    files: [] as File[],
  });

  const [aiAnalysis, setAiAnalysis] = useState({
    facts: '',
    legalIssue: '',
    reliefSought: '',
    urgency: 'medium' as CaseUrgency,
    urgencyReason: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        files: [...formData.files, ...Array.from(e.target.files)],
      });
      toast({ title: 'Files uploaded', description: `${e.target.files.length} files added successfully` });
    }
  };



  const runAIAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const summary = await generateCaseSummary({
        title: formData.title,
        type: formData.type,
        description: formData.description
      });

      setAiAnalysis(summary);
      setAnalysisComplete(true);
      toast({ title: 'Analysis Complete', description: 'AI has successfully analyzed your case.' });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: 'Analysis Failed', description: 'Could not generate AI summary. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('type', formData.type);
        submissionData.append('description', formData.description);
        submissionData.append('citizenId', user?.id || '');

        // Append AI Summary if available
        if (aiAnalysis) {
          submissionData.append('aiSummary', JSON.stringify(aiAnalysis));
        }

        // Append files
        // NOTE: The current formData.files stores metadata ({name, size}), not actual File objects.
        // For this to work, formData.files would need to be updated to store File objects.
        // For now, assuming 'files' refers to formData.files and it contains File objects.
        formData.files.forEach((file) => {
          // This line assumes 'file' is an actual File object.
          // If formData.files still contains {name, size} objects, this will not work as intended.
          submissionData.append('files', file as any);
        });

        const newCase = await addCase(submissionData);

        addNotification({
          userId: user!.id, // Assuming user is not null here based on previous checks
          title: 'Case Filed Successfully',
          message: `Your case ${newCase.id} has been filed and is pending review.`,
          type: 'case',
          read: false,
        });

        addSystemLog({
          userId: user!.id, // Assuming user is not null here
          userName: user!.name, // Assuming user is not null here
          action: 'Case Filed',
          details: `Filed new case ${newCase.id}`,
          type: 'case',
        });

        toast({
          title: 'Case Filed Successfully!',
          description: `Your case ID is ${newCase.id}`,
        });

        navigate('/citizen/my-cases');
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: 'Submission Failed',
          description: 'Could not file the case. Please try again.',
        });
      }
    }
  };
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title && formData.type;
      case 2: return formData.description.length >= 50;
      case 3: return true;
      case 4: return analysisComplete;
      default: return false;
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', path: '/citizen/dashboard' },
        { label: 'File New Case' }
      ]}
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                currentStep >= step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium hidden sm:block",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 sm:w-20 h-0.5 mx-2 sm:mx-4",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Case Details */}
        {currentStep === 1 && (
          <div className="card-elevated animate-fade-in">
            <h2 className="text-xl font-serif font-semibold mb-6">Case Details</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your case"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Case Type *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {caseTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={cn(
                        "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                        formData.type === type
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {currentStep === 2 && (
          <div className="card-elevated animate-fade-in">
            <h2 className="text-xl font-serif font-semibold mb-6">Case Description</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Describe your case in detail *</Label>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your case including dates, parties involved, and what happened..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.description.length}/50 minimum characters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Evidence Upload */}
        {currentStep === 3 && (
          <div className="card-elevated animate-fade-in">
            <h2 className="text-xl font-serif font-semibold mb-6">Upload Evidence</h2>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload relevant documents</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Support your case with evidence. Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
                <div className="flex gap-4">
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <Label htmlFor="file-upload">
                    <div className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer")}>
                      Select Files
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            {/* File List */}
            {formData.files.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Attached Files</h4>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Badge variant="status-verified">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              * Evidence upload is optional but recommended for faster case processing
            </p>
          </div>
        )}

        {/* Step 4: AI Analysis */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            {!analysisComplete && !isAnalyzing && (
              <div className="card-elevated text-center py-8">
                <Brain className="h-16 w-16 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">AI Case Analysis</h2>
                <p className="text-muted-foreground mb-6">
                  Our AI will analyze your case to extract key facts, identify legal issues, and determine urgency.
                </p>
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline" className="cursor-pointer">
                    <span>
                      Browse Files
                    </span>
                  </Button>
                </label>
                <Button onClick={runAIAnalysis} variant="navy" size="lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Run AI Analysis
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="card-elevated text-center py-12">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-serif font-semibold mb-2">Analyzing Your Case...</h2>
                <p className="text-muted-foreground">
                  Extracting facts, identifying legal issues, and assessing urgency
                </p>
              </div>
            )}

            {analysisComplete && (
              <>
                <div className="card-elevated">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Case Summary</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Key Facts</Label>
                      <p className="mt-1 text-sm">{aiAnalysis.facts}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Legal Issue</Label>
                      <p className="mt-1 text-sm">{aiAnalysis.legalIssue}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Relief Sought</Label>
                      <p className="mt-1 text-sm">{aiAnalysis.reliefSought}</p>
                    </div>
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold">Urgency Assessment</h3>
                    </div>
                    <Badge variant={
                      aiAnalysis.urgency === 'high' ? 'urgency-high' :
                        aiAnalysis.urgency === 'medium' ? 'urgency-medium' : 'urgency-low'
                    } className="text-sm px-3 py-1">
                      {aiAnalysis.urgency.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{aiAnalysis.urgencyReason}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={!analysisComplete}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Case
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
