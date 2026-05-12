import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  Brain, 
  FileText, 
  Calendar, 
  User, 
  Video,
  Upload,
  Save,
  Shield
} from 'lucide-react';
import HearingCard from '@/components/HearingCard';

export default function LawyerCaseDetail() {
  const { id } = useParams();
  const { getCaseById, getUserById, documents, hearings, addDocument, meetings, user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');

  const caseData = getCaseById(id || '');
  if (!caseData) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Case Not Found' }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Case not found</p>
          <Button asChild className="mt-4">
            <Link to="/lawyer/my-cases">Back to My Cases</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const caseDocuments = documents.filter(d => d.caseId === caseData.id);
  const caseHearings = hearings.filter(h => h.caseId === caseData.id);
  const caseMeetings = meetings.filter(m => m.caseId === caseData.id);
  const citizen = getUserById(caseData.citizenId);
  const judge = caseData.judgeId ? getUserById(caseData.judgeId) : null;

  const handleUploadDocument = () => {
    addDocument({
      caseId: caseData.id,
      name: 'Legal_Brief_' + new Date().toISOString().split('T')[0] + '.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadedBy: 'lawyer-1',
      hash: '0x' + Math.random().toString(16).slice(2, 34),
      verified: true,
    });
    toast({ title: 'Document Uploaded', description: 'Your document has been added to the case.' });
  };

  const latestMeeting = caseMeetings.find(m => m.status === 'scheduled');

  const handleSaveNotes = () => {
    toast({ title: 'Notes Saved', description: 'Your preparation notes have been saved.' });
  };

  const urgencyVariant = caseData.urgency === 'high' ? 'urgency-high' : caseData.urgency === 'medium' ? 'urgency-medium' : 'urgency-low';
  const statusVariant = caseData.status === 'pending' ? 'status-pending' : caseData.status === 'in_hearing' ? 'status-active' : 'status-closed';

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', path: '/lawyer/dashboard' },
        { label: 'My Cases', path: '/lawyer/my-cases' },
        { label: caseData.id }
      ]}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant={urgencyVariant} className="capitalize">{caseData.urgency} Priority</Badge>
            <Badge variant={statusVariant} className="capitalize">{caseData.status.replace('_', ' ')}</Badge>
            <Badge variant="outline">{caseData.type}</Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">{caseData.title}</h1>
          <p className="text-muted-foreground mt-1">Case ID: {caseData.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUploadDocument}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="navy" onClick={() => latestMeeting && window.open(latestMeeting.meetingUrl, '_blank')}>
            <Video className="h-4 w-4 mr-2" />
            Join Hearing
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary */}
          <div className="card-elevated">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Case Summary</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Key Facts</p>
                <p className="text-sm">{caseData.aiSummary.facts}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Legal Issue</p>
                <p className="text-sm">{caseData.aiSummary.legalIssue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Relief Sought</p>
                <p className="text-sm">{caseData.aiSummary.reliefSought}</p>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold mb-4">Full Description</h2>
            <p className="text-sm text-muted-foreground">{caseData.description}</p>
          </div>

          {/* Documents */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Case Documents</h2>
              <Badge variant="secondary">{caseDocuments.length} files</Badge>
            </div>
            <div className="space-y-3">
              {caseDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size} • {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <Badge variant={doc.verified ? "status-verified" : "status-pending"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {doc.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Hearings */}
          {caseMeetings.length > 0 && (
            <div className="card-elevated">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Scheduled Video Hearings ({caseMeetings.length})</h2>
              </div>
              <div className="space-y-4">
                {caseMeetings.map(meeting => (
                  <HearingCard 
                    key={meeting.id} 
                    meeting={{
                      ...meeting,
                      case_title: caseData.title,
                      judge_name: judge?.name,
                      lawyer_name: 'You',
                      citizen_name: citizen?.name
                    }}
                    userRole="lawyer"
                    onJoinMeeting={(meeting) => window.open(meeting.meetingUrl, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preparation Notes */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold mb-4">Preparation Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your case preparation notes, arguments, and strategy here..."
              className="min-h-[150px]"
            />
            <Button className="mt-4" onClick={handleSaveNotes}>
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties */}
          <div className="card-elevated">
            <h3 className="font-semibold mb-4">Case Parties</h3>
            <div className="space-y-4">
              {citizen && (
                <div className="flex items-center gap-3">
                  <img src={citizen.avatar} alt={citizen.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{citizen.name}</p>
                    <p className="text-xs text-muted-foreground">Client</p>
                  </div>
                </div>
              )}
              {judge && (
                <div className="flex items-center gap-3">
                  <img src={judge.avatar} alt={judge.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{judge.name}</p>
                    <p className="text-xs text-muted-foreground">Presiding Judge</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="card-elevated">
            <h3 className="font-semibold mb-4">Upcoming Video Hearings</h3>
            {caseMeetings.filter(m => m.status === 'scheduled').length > 0 ? (
              <div className="space-y-3">
                {caseMeetings.filter(m => m.status === 'scheduled').map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">
                        {new Date(meeting.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">
                      {new Date(meeting.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {meeting.duration} minutes
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 w-full"
                      onClick={() => window.open(meeting.meetingUrl, '_blank')}
                    >
                      Join Meeting
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming hearings</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
