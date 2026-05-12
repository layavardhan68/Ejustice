import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { CaseCard } from '@/components/case/CaseCard';
import LawyerRequestCard from '@/components/LawyerRequestCards';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Clock, Calendar, Search, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getLawyerRequests } from '@/services/api';

export default function LawyerDashboard() {
  const { user, cases, hearings } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const myCases = cases.filter(c => c.lawyerId === user?.id);
  const upcomingHearings = hearings.filter(h => myCases.some(c => c.id === h.caseId) && h.status === 'scheduled').length;
  const pendingRequests = requests.filter(r => r.status === 'pending' && r.lawyerId === user?.id).length;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await getLawyerRequests();
      // Filter requests for this lawyer
      const myRequests = allRequests.filter(r => r.lawyerId === user?.id);
      setRequests(myRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    fetchRequests();
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]} title="Lawyer Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Cases" value={myCases.length} icon={Briefcase} variant="primary" />
        <StatCard title="Pending Requests" value={pendingRequests} icon={UserCheck} />
        <StatCard title="Upcoming Hearings" value={upcomingHearings} icon={Calendar} />
        <StatCard title="Total Cases" value={cases.length} icon={Search} />
      </div>

      {/* Representation Requests Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Representation Requests</h2>
          <Badge variant="secondary">{pendingRequests} pending</Badge>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests
              .filter(r => r.status === 'pending')
              .map(request => (
                <LawyerRequestCard
                  key={request.id}
                  request={request}
                  onActionComplete={handleActionComplete}
                />
              ))}
            
            {requests.filter(r => r.status === 'pending').length === 0 && (
              <div className="card-elevated text-center py-8">
                <p className="text-muted-foreground">No pending representation requests</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Cases Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Cases</h2>
          <Button asChild variant="outline">
            <Link to="/lawyer/case-discovery">Discover More Cases</Link>
          </Button>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {myCases.map(c => <CaseCard key={c.id} caseData={c} showActions={false} linkTo={`/lawyer/case/${c.id}`} />)}
          {myCases.length === 0 && (
            <div className="card-elevated col-span-2 text-center py-8">
              <p className="text-muted-foreground">No cases yet. Accept representation requests or discover cases to represent.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
