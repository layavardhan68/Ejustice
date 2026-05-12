import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Brain, 
  AlertTriangle, 
  Calendar, 
  User,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CaseType, CaseUrgency } from '@/types';

export default function CaseDiscovery() {
  const { user, cases, addLawyerRequest, addNotification, addSystemLog } = useAuth();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<CaseUrgency | 'all'>('all');
  const [requestModal, setRequestModal] = useState<{ open: boolean; caseId: string } | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  // Cases without lawyers (available for representation)
  const availableCases = cases.filter(c => !c.lawyerId && c.status === 'pending');
  
  const filteredCases = availableCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.id.toLowerCase().includes(search.toLowerCase()) ||
                          c.aiSummary.facts.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesUrgency = urgencyFilter === 'all' || c.urgency === urgencyFilter;
    return matchesSearch && matchesType && matchesUrgency;
  });

  const caseTypes: (CaseType | 'all')[] = ['all', 'Property', 'Civil', 'Family', 'Consumer', 'Labor', 'Criminal'];
  const urgencies: (CaseUrgency | 'all')[] = ['all', 'high', 'medium', 'low'];

  const handleRequestRepresent = (caseId: string) => {
    setRequestModal({ open: true, caseId });
    setRequestMessage(`I am interested in representing you in this case. With my experience and expertise, I am confident I can provide effective legal representation.`);
  };

  const submitRequest = () => {
    if (!requestModal || !user) return;

    addLawyerRequest({
      caseId: requestModal.caseId,
      lawyerId: user.id,
      status: 'pending',
      message: requestMessage,
    });

    const caseData = cases.find(c => c.id === requestModal.caseId);
    if (caseData) {
      addNotification({
        userId: caseData.citizenId,
        title: 'New Lawyer Request',
        message: `${user.name} has requested to represent you in case ${requestModal.caseId}`,
        type: 'lawyer_request',
        read: false,
      });
    }

    addSystemLog({
      userId: user.id,
      userName: user.name,
      action: 'Representation Requested',
      details: `Requested to represent case ${requestModal.caseId}`,
      type: 'case',
    });

    toast({
      title: 'Request Sent',
      description: 'Your representation request has been sent to the citizen.',
    });

    setRequestModal(null);
    setRequestMessage('');
  };

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', path: '/lawyer/dashboard' },
        { label: 'Case Discovery' }
      ]}
      title="Discover Cases"
    >
      {/* Filters */}
      <div className="card-elevated mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by title, ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CaseType | 'all')}
                className="text-sm border rounded-md px-2 py-1"
              >
                {caseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Urgency:</span>
              {urgencies.map((urgency) => (
                <Button
                  key={urgency}
                  variant={urgencyFilter === urgency ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUrgencyFilter(urgency)}
                  className={cn(
                    "capitalize",
                    urgencyFilter === urgency && urgency === 'high' && "bg-red-600",
                    urgencyFilter === urgency && urgency === 'medium' && "bg-amber-600",
                    urgencyFilter === urgency && urgency === 'low' && "bg-green-600"
                  )}
                >
                  {urgency === 'all' ? 'All' : urgency}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCases.length} of {availableCases.length} available cases
        </p>
      </div>

      {/* Cases Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredCases.map((caseData) => {
          const urgencyVariant = caseData.urgency === 'high' ? 'urgency-high' : 
                                 caseData.urgency === 'medium' ? 'urgency-medium' : 'urgency-low';
          
          return (
            <div key={caseData.id} className="card-elevated">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={urgencyVariant} className="capitalize">
                      {caseData.urgency} Priority
                    </Badge>
                    <Badge variant="outline">{caseData.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Case ID: {caseData.id}</p>
                </div>
                <AlertTriangle className={cn(
                  "h-5 w-5 flex-shrink-0",
                  caseData.urgency === 'high' ? "text-red-500" :
                  caseData.urgency === 'medium' ? "text-amber-500" : "text-green-500"
                )} />
              </div>

              {/* Anonymized Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Summary (Anonymized)</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {caseData.aiSummary.facts}
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Legal Issue:</p>
                  <p className="text-sm line-clamp-2">{caseData.aiSummary.legalIssue}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Filed: {caseData.filedAt}</span>
                  </div>
                </div>
                <Button 
                  variant="navy" 
                  size="sm"
                  onClick={() => handleRequestRepresent(caseData.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request to Represent
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No cases found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

    </DashboardLayout>
  );
}
