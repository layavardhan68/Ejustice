import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CaseCard } from '@/components/case/CaseCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/loading-state';

export default function LawyerMyCases() {
  const { user, cases } = useAuth();
  const myCases = cases.filter(c => c.lawyerId === user?.id);

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', path: '/lawyer/dashboard' },
        { label: 'My Cases' }
      ]}
      title="My Cases"
    >
      {myCases.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {myCases.map((caseData) => (
            <CaseCard
              key={caseData.id}
              caseData={caseData}
              showActions={false}
              linkTo={`/lawyer/case/${caseData.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="h-16 w-16" />}
          title="No cases yet"
          description="Discover cases that match your expertise and request to represent."
          action={
            <Button asChild variant="navy">
              <Link to="/lawyer/case-discovery">
                <Search className="h-4 w-4 mr-2" />
                Discover Cases
              </Link>
            </Button>
          }
        />
      )}
    </DashboardLayout>
  );
}
