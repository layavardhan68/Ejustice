import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { CaseCard } from '@/components/case/CaseCard';
import { useAuth } from '@/context/AuthContext';
import { Gavel, Calendar, FileCheck, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function JudgeDashboard() {
  const { cases, meetings, user } = useAuth();
  const [schedulingCase, setSchedulingCase] = useState<string | null>(null);
  
  // Filter cases that need judge attention
  const pendingCases = cases.filter(c => 
    (c.status === 'pending_lawyer' || c.status === 'pending') && !c.judgeId
  );
  const assignedCases = cases.filter(c => c.judgeId === user?.id);
  const highPriority = [...pendingCases, ...assignedCases].filter(c => c.urgency === 'high').length;
  const scheduledHearings = meetings.filter(m => m.status === 'scheduled').length;

  const handleScheduleHearing = (caseId: string) => {
    setSchedulingCase(caseId);
    // Navigate to case detail with scheduling modal open
    window.location.href = `/judge/case/${caseId}?schedule=true`;
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]} title="Judicial Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Pending Assignment" value={pendingCases.length} icon={Clock} variant="accent" />
        <StatCard title="Assigned Cases" value={assignedCases.length} icon={FileCheck} variant="primary" />
        <StatCard title="High Priority" value={highPriority} icon={AlertTriangle} />
        <StatCard title="Scheduled Hearings" value={scheduledHearings} icon={Calendar} />
      </div>

      {/* Pending Cases Section */}
      {pendingCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Cases Pending Assignment</h2>
            <Badge variant="secondary">{pendingCases.length} cases</Badge>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {pendingCases
              .sort((a, b) => {
                // Sort by urgency first, then by filing date
                if (a.urgency === 'high' && b.urgency !== 'high') return -1;
                if (a.urgency !== 'high' && b.urgency === 'high') return 1;
                return new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime();
              })
              .map(c => (
                <div key={c.id} className="card-elevated">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{c.title}</h3>
                        <p className="text-sm text-muted-foreground">Case ID: {c.id}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={c.urgency === 'high' ? 'destructive' : 'secondary'}>
                          {c.urgency} priority
                        </Badge>
                        <Badge variant="outline">{c.type}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {c.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        <p>Filed: {new Date(c.filedAt).toLocaleDateString()}</p>
                        <p>Status: {c.status.replace('_', ' ')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/judge/case/${c.id}`}>Review</Link>
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleScheduleHearing(c.id)}
                        >
                          Assign & Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Assigned Cases Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Assigned Cases</h2>
          <Badge variant="secondary">{assignedCases.length} cases</Badge>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {assignedCases
            .sort((a, b) => {
              // Sort by urgency and next hearing date
              if (a.urgency === 'high' && b.urgency !== 'high') return -1;
              if (a.urgency !== 'high' && b.urgency === 'high') return 1;
              if (a.nextHearing && !b.nextHearing) return -1;
              if (!a.nextHearing && b.nextHearing) return 1;
              return 0;
            })
            .map(c => {
              // Find scheduled meeting for this case
              const caseMeeting = meetings.find(m => m.caseId === c.id && m.status === 'scheduled');
              return (
                <div key={c.id} className="card-elevated">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{c.title}</h3>
                        <p className="text-sm text-muted-foreground">Case ID: {c.id}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={c.urgency === 'high' ? 'destructive' : 'secondary'}>
                          {c.urgency} priority
                        </Badge>
                        <Badge variant="outline">{c.type}</Badge>
                        <Badge variant={c.status === 'in_hearing' ? 'default' : 'secondary'}>
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {c.description}
                    </p>
                    
                    {/* Show scheduled hearing if exists */}
                    {caseMeeting && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Scheduled Hearing</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p>{new Date(caseMeeting.scheduledAt).toLocaleDateString()} at {new Date(caseMeeting.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          <p>Duration: {caseMeeting.duration} minutes</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => window.open(caseMeeting.meetingUrl, '_blank')}
                        >
                          Join Meeting
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        <p>Filed: {new Date(c.filedAt).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/judge/case/${c.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        
        {assignedCases.length === 0 && pendingCases.length === 0 && (
          <div className="card-elevated text-center py-8">
            <p className="text-muted-foreground">No cases assigned yet. Cases will appear here once lawyers accept representation requests.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
