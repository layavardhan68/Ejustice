import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { updateLawyerRequest } from '@/services/api';

interface LawyerRequestCardProps {
  request: {
    id: string;
    caseId: string;
    lawyerId: string;
    status: string;
    message: string;
    requestedAt: string;
    case: {
      id: string;
      title: string;
      type: string;
      description: string;
      urgency: string;
      filedAt: string;
      aiSummary: {
        facts: string;
        legalIssue: string;
        reliefSought: string;
      };
    };
    citizen: {
      id: string;
      name: string;
      email: string;
      phone: string;
      avatar: string;
    };
  };
  onActionComplete?: () => void;
}

export default function LawyerRequestCard({ request, onActionComplete }: LawyerRequestCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      setLoading(action);
      await updateLawyerRequest(request.id, action === 'accept' ? 'accepted' : 'rejected');
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setLoading(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Safety check for case data
  if (!request.case) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Case information not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{request.case.type}</Badge>
              <Badge className={getUrgencyColor(request.case.urgency)}>
                {request.case.urgency} priority
              </Badge>
            </div>
            <CardTitle className="text-lg">{request.case.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Case ID: {request.case.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Requested</p>
            <p className="text-sm font-medium">{new Date(request.requestedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Citizen Info */}
        {request.citizen ? (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar>
              <AvatarImage src={request.citizen.avatar} />
              <AvatarFallback>{request.citizen.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{request.citizen.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{request.citizen.email}</span>
                {request.citizen.phone && <span>{request.citizen.phone}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Citizen information not available</p>
          </div>
        )}

        {/* Case Summary */}
        {request.case.aiSummary ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Case Summary
            </h4>
            
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Key Facts:</p>
                <p className="text-muted-foreground">{request.case.aiSummary.facts}</p>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground">Legal Issue:</p>
                <p className="text-muted-foreground">{request.case.aiSummary.legalIssue}</p>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground">Relief Sought:</p>
                <p className="text-muted-foreground">{request.case.aiSummary.reliefSought}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Case Summary
            </h4>
            <p className="text-sm text-muted-foreground">Case summary not available</p>
          </div>
        )}

        {/* Request Message */}
        {request.message && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Request Message
            </h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {request.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => handleAction('accept')}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'accept' ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Representation
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAction('reject')}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'reject' ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Decline Request
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
