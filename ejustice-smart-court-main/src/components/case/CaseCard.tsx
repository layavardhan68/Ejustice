import { Case } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface CaseCardProps {
  caseData: Case;
  showActions?: boolean;
  linkTo?: string;
  onRequestRepresent?: () => void;
}

export function CaseCard({ caseData, showActions = true, linkTo, onRequestRepresent }: CaseCardProps) {
  const { getUserById } = useAuth();
  const lawyer = caseData.lawyerId ? getUserById(caseData.lawyerId) : null;

  const urgencyVariant = caseData.urgency === 'high'
    ? 'urgency-high'
    : caseData.urgency === 'medium'
      ? 'urgency-medium'
      : 'urgency-low';

  const statusVariant = caseData.status === 'pending'
    ? 'status-pending'
    : caseData.status === 'in_hearing'
      ? 'status-active'
      : 'status-closed';

  const CardWrapper = linkTo ? Link : 'div';

  return (
    <CardWrapper
      to={linkTo || '#'}
      className={cn(
        "card-elevated block group",
        linkTo && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant={urgencyVariant} className="capitalize">
              {caseData.urgency} Priority
            </Badge>
            <Badge variant={statusVariant} className="capitalize">
              {caseData.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{caseData.type}</Badge>
          </div>

          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {caseData.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Case ID: {caseData.id}
          </p>
        </div>

        {linkTo && (
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
        {caseData.description}
      </p>

      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Filed: {caseData.filedAt}</span>
        </div>
        {lawyer && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{lawyer.name}</span>
          </div>
        )}
        {caseData.nextHearing && (
          <div className="flex items-center gap-1 text-primary font-medium">
            <Calendar className="h-4 w-4" />
            <span>Next: {caseData.nextHearing}</span>
          </div>
        )}
      </div>

      {/* AI Summary Preview */}
      {caseData.aiSummary && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
          <p className="text-sm line-clamp-2">{caseData.aiSummary.facts}</p>
        </div>
      )}

      {showActions && onRequestRepresent && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="navy-outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onRequestRepresent();
            }}
          >
            Request to Represent
          </Button>
        </div>
      )}
    </CardWrapper>
  );
}
