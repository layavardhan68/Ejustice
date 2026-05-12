import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useState } from 'react';
import { 
  Brain, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Clock,
  Gavel,
  MessageSquare,
  Video
} from 'lucide-react';
import HearingCard from '@/components/HearingCard';
import AvailableLawyers from '@/components/AvailableLawyers';

export default function CaseDetail() {
  const { id } = useParams();
  const { getCaseById, getUserById, documents, hearings, lawyerRequests, updateLawyerRequest, updateCase, addNotification, meetings } = useAuth();
  const { toast } = useToast();
  
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; requestId: string; action: 'accept' | 'reject' } | null>(null);

  const caseData = getCaseById(id || '');
  if (!caseData) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Case Not Found' }]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Case not found</p>
          <Button asChild className="mt-4">
            <Link to="/citizen/my-cases">Back to My Cases</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const caseDocuments = documents.filter(d => d.caseId === caseData.id);
  const caseHearings = hearings.filter(h => h.caseId === caseData.id);
  const caseMeetings = meetings.filter(m => m.caseId === caseData.id);
  const pendingRequests = lawyerRequests.filter(r => r.caseId === caseData.id && r.status === 'pending');
  const lawyer = caseData.lawyerId ? getUserById(caseData.lawyerId) : null;
  const judge = caseData.judgeId ? getUserById(caseData.judgeId) : null;

  const handleLawyerAction = (requestId: string, action: 'accept' | 'reject') => {
    setConfirmModal({ open: true, requestId, action });
  };

  const confirmAction = () => {
    if (!confirmModal) return;
    
    updateLawyerRequest(confirmModal.requestId, confirmModal.action === 'accept' ? 'accepted' : 'rejected');
    
    toast({
      title: confirmModal.action === 'accept' ? 'Lawyer Accepted' : 'Request Rejected',
      description: confirmModal.action === 'accept' 
        ? 'The lawyer has been assigned to your case.'
        : 'The representation request has been declined.',
    });
    
    setConfirmModal(null);
  };

  const urgencyVariant = caseData.urgency === 'high' ? 'urgency-high' : caseData.urgency === 'medium' ? 'urgency-medium' : 'urgency-low';
  const statusVariant = caseData.status === 'pending' ? 'status-pending' : caseData.status === 'in_hearing' ? 'status-active' : 'status-closed';

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', path: '/citizen/dashboard' },
        { label: 'My Cases', path: '/citizen/my-cases' },
        { label: caseData.id }
      ]}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant={urgencyVariant} className="capitalize">
              {caseData.urgency} Priority
            </Badge>
            <Badge variant={statusVariant} className="capitalize">
              {caseData.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{caseData.type}</Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">{caseData.title}</h1>
          <p className="text-muted-foreground mt-1">Case ID: {caseData.id} • Filed: {caseData.filedAt}</p>
        </div>
        {caseData.nextHearing && (
          <div className="card-elevated flex items-center gap-3 bg-primary/5 border border-primary/20">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Next Hearing</p>
              <p className="font-semibold text-primary">{caseData.nextHearing}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
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

          {/* Case Description */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold mb-4">Full Description</h2>
            <p className="text-sm text-muted-foreground">{caseData.description}</p>
          </div>

          {/* Documents */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Uploaded Documents</h2>
              <Badge variant="secondary">{caseDocuments.length} files</Badge>
            </div>
            {caseDocuments.length > 0 ? (
              <div className="space-y-3">
                {caseDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.size} • Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.verified ? (
                        <Badge variant="status-verified">
                          <Shield className="h-3 w-3 mr-1" />
                          Hash Verified
                        </Badge>
                      ) : (
                        <Badge variant="status-pending">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
            )}
          </div>

          {/* Available Lawyers */}
          {!caseData.lawyerId && (
            <AvailableLawyers 
              caseId={caseData.id} 
              onRequestSent={() => {
                toast({
                  title: "Request Sent",
                  description: "Your lawyer request has been sent successfully.",
                });
              }}
            />
          )}

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
                      lawyer_name: lawyer?.name,
                      citizen_name: 'You'
                    }}
                    userRole="citizen"
                    onJoinMeeting={(meeting) => window.open(meeting.meetingUrl, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hearing Timeline */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold mb-4">Hearing Timeline</h2>
            {caseHearings.length > 0 ? (
              <div className="space-y-4">
                {caseHearings.map((hearing, index) => (
                  <div key={hearing.id} className="relative pl-6 pb-4">
                    {index < caseHearings.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      hearing.status === 'completed' ? 'bg-green-500 border-green-500' :
                      hearing.status === 'scheduled' ? 'bg-primary border-primary' :
                      'bg-muted border-muted-foreground'
                    }`}>
                      {hearing.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{hearing.type}</p>
                        <Badge variant={hearing.status === 'completed' ? 'status-closed' : 'status-active'}>
                          {hearing.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hearing.date} at {hearing.time} • {hearing.courtRoom}
                      </p>
                      {hearing.notes && (
                        <p className="text-sm mt-2">{hearing.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hearings scheduled yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Team */}
          <div className="card-elevated">
            <h3 className="font-semibold mb-4">Case Team</h3>
            <div className="space-y-4">
              {lawyer ? (
                <div className="flex items-center gap-3">
                  <img src={lawyer.avatar} alt={lawyer.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{lawyer.name}</p>
                    <p className="text-xs text-muted-foreground">Representing Lawyer</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm">No lawyer assigned</p>
                    <p className="text-xs">Awaiting representation</p>
                  </div>
                </div>
              )}
              
              {judge ? (
                <div className="flex items-center gap-3">
                  <img src={judge.avatar} alt={judge.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{judge.name}</p>
                    <p className="text-xs text-muted-foreground">Presiding Judge</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm">No judge assigned</p>
                    <p className="text-xs">Pending assignment</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lawyer Requests */}
          {pendingRequests.length > 0 && (
            <div className="card-elevated border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Lawyer Requests</h3>
                <Badge variant="default">{pendingRequests.length}</Badge>
              </div>
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const requestingLawyer = getUserById(request.lawyerId);
                  if (!requestingLawyer) return null;
                  
                  return (
                    <div key={request.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={requestingLawyer.avatar} alt={requestingLawyer.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium">{requestingLawyer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {requestingLawyer.experience} years experience
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleLawyerAction(request.id, 'accept')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLawyerAction(request.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verdict (if closed) */}
          {caseData.status === 'closed' && caseData.verdict && (
            <div className="card-elevated bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="h-5 w-5 text-green-700" />
                <h3 className="font-semibold text-green-700">Verdict</h3>
              </div>
              <p className="text-sm text-green-800">{caseData.verdict}</p>
              {caseData.closedAt && (
                <p className="text-xs text-green-600 mt-2">Disposed on {caseData.closedAt}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          open={confirmModal.open}
          onOpenChange={(open) => !open && setConfirmModal(null)}
          title={confirmModal.action === 'accept' ? 'Accept Lawyer' : 'Reject Request'}
          description={
            confirmModal.action === 'accept'
              ? 'Are you sure you want to accept this lawyer to represent you? They will have access to your case details.'
              : 'Are you sure you want to reject this representation request?'
          }
          confirmLabel={confirmModal.action === 'accept' ? 'Accept' : 'Reject'}
          variant={confirmModal.action === 'reject' ? 'destructive' : 'default'}
          onConfirm={confirmAction}
        />
      )}
    </DashboardLayout>
  );
}
