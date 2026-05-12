import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { CaseCard } from '@/components/case/CaseCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, Clock, CheckCircle2, Scale } from 'lucide-react';

export default function CitizenDashboard() {
  const { user, cases } = useAuth();
  const myCases = cases.filter(c => c.citizenId === user?.id);
  const pendingCases = myCases.filter(c => c.status === 'pending').length;
  const inHearingCases = myCases.filter(c => c.status === 'in_hearing').length;
  const closedCases = myCases.filter(c => c.status === 'closed').length;

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* Welcome */}
      <div className="card-elevated bg-hero-gradient text-primary-foreground mb-8">
        <div className="flex items-center gap-4">
          <Scale className="h-12 w-12 text-gold" />
          <div>
            <h1 className="text-2xl font-serif font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-primary-foreground/80 mt-1">Track your cases and access justice services</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button asChild variant="hero" size="lg">
            <Link to="/citizen/file-case"><FileText className="h-4 w-4 mr-2" />File New Case</Link>
          </Button>
          <Button asChild variant="hero-outline" size="lg">
            <Link to="/citizen/my-cases"><FolderOpen className="h-4 w-4 mr-2" />View My Cases</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Cases" value={myCases.length} icon={FolderOpen} />
        <StatCard title="Pending" value={pendingCases} icon={Clock} />
        <StatCard title="In Hearing" value={inHearingCases} icon={Scale} variant="primary" />
        <StatCard title="Closed" value={closedCases} icon={CheckCircle2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent Cases</h2>
          {myCases.slice(0, 3).map(c => (
            <CaseCard key={c.id} caseData={c} showActions={false} linkTo={`/citizen/case/${c.id}`} />
          ))}
          {myCases.length === 0 && (
            <div className="card-elevated text-center py-8">
              <p className="text-muted-foreground">No cases filed yet</p>
              <Button asChild className="mt-4"><Link to="/citizen/file-case">File Your First Case</Link></Button>
            </div>
          )}
        </div>
        <NotificationsPanel />
      </div>
    </DashboardLayout>
  );
}
