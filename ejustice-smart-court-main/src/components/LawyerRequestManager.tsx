import { useState } from 'react';
import { LawyerRequest, Case, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserCheck, Briefcase, Calendar, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LawyerRequestManagerProps {
  requests: (LawyerRequest & { 
    case_title?: string; 
    case_type?: string; 
    case_urgency?: string; 
    citizen_name?: string; 
    citizen_email?: string;
  })[];
  onRequestUpdate?: () => void;
}

export default function LawyerRequestManager({ requests, onRequestUpdate }: LawyerRequestManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestResponse = async (requestId: string, action: 'accept' | 'reject') => {
    if (action === 'accept' && !responseMessage.trim()) {
      toast.error('Please add a response message when accepting a request');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/lawyer-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: action,
          responseMessage: responseMessage.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      toast.success(`Request ${action}ed successfully!`);
      if (onRequestUpdate) {
        onRequestUpdate();
      }
      
      // Reset form
      setResponseMessage('');
      setSelectedRequest(null);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const renderRequestCard = (request: typeof requests[0]) => {
    const isPending = request.status === 'pending';
    
    return (
      <Card key={request.id} className={`hover:shadow-md transition-shadow ${isPending ? 'border-yellow-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{request.case_title || 'Unknown Case'}</CardTitle>
              <CardDescription className="mt-1">
                Request from {request.citizen_name || 'Unknown citizen'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status.toUpperCase()}
              </Badge>
              {request.case_urgency && (
                <Badge className={getUrgencyColor(request.case_urgency)}>
                  {request.case_urgency.toUpperCase()} PRIORITY
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>Type: {request.case_type || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <UserCheck className="w-4 h-4" />
              <span>Email: {request.citizen_email || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <strong>Citizen's Message:</strong>
            <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded text-sm">
              {request.message}
            </p>
          </div>

          {isPending && (
            <div className="flex gap-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Accept Lawyer Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Case: {request.case_title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Client: {request.citizen_name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Your Response Message</label>
                      <Textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Introduce yourself and explain how you can help with this case..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleRequestResponse(request.id, 'accept')}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Processing...' : 'Accept Request'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedRequest(null);
                          setResponseMessage('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to reject this request?')) {
                    handleRequestResponse(request.id, 'reject');
                  }
                }}
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {!isPending && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {request.status === 'accepted' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>
                  {request.status === 'accepted' ? 'Accepted on' : 'Rejected on'} {' '}
                  {new Date(request.requestedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="grid gap-4">
            {pendingRequests.map(renderRequestCard)}
          </div>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            Processed Requests ({processedRequests.length})
          </h3>
          <div className="grid gap-4">
            {processedRequests.map(renderRequestCard)}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lawyer requests</h3>
          <p className="text-gray-500">
            You haven't received any requests yet. Check back later for new case opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
