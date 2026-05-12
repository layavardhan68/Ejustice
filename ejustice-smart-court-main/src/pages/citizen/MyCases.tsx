import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CaseCard } from '@/components/case/CaseCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';

export default function MyCases() {
  const { user, cases } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const myCases = cases.filter(c => c.citizenId === user?.id);
  
  const filteredCases = myCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Cases' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_hearing', label: 'In Hearing' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', path: '/citizen/dashboard' },
        { label: 'My Cases' }
      ]}
      title="My Cases"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                statusFilter === option.value && "shadow-soft"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredCases.map((caseData) => (
            <CaseCard
              key={caseData.id}
              caseData={caseData}
              showActions={false}
              linkTo={`/citizen/case/${caseData.id}`}
            />
          ))}
        </div>
      ) : myCases.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="No cases filed yet"
          description="File your first case to get started with the eJustice platform."
          action={
            <Button asChild variant="navy">
              <Link to="/citizen/file-case">
                <FileText className="h-4 w-4 mr-2" />
                File New Case
              </Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<Search className="h-16 w-16" />}
          title="No cases found"
          description="Try adjusting your search or filter criteria."
        />
      )}
    </DashboardLayout>
  );
}
