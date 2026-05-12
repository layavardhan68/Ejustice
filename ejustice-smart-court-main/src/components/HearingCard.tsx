import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Video, ExternalLink } from 'lucide-react';

interface HearingCardProps {
  meeting: any & { case_title?: string; judge_name?: string; lawyer_name?: string; citizen_name?: string };
  userRole: 'citizen' | 'lawyer' | 'judge';
  onJoinMeeting?: (meeting: any) => void;
}

export default function HearingCard({ meeting, userRole, onJoinMeeting }: HearingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const isMeetingJoinable = () => {
    const now = new Date();
    const meetingTime = new Date(meeting.scheduledAt);
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return meeting.status === 'scheduled' && minutesDiff <= 15 && minutesDiff >= -60;
  };

  const handleJoinMeeting = () => {
    if (onJoinMeeting) {
      onJoinMeeting(meeting);
    } else {
      window.open(meeting.meetingUrl, '_blank');
    }
  };

  const { date, time } = formatDateTime(meeting.scheduledAt);
  const canJoin = isMeetingJoinable();

  return (
    <Card className={`hover:shadow-md transition-shadow ${canJoin ? 'ring-2 ring-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {meeting.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{meeting.case_title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(meeting.status)}>
              {meeting.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {canJoin && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                JOIN NOW
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{meeting.duration} minutes</span>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div><strong>Participants:</strong></div>
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
            <div>• Judge: {meeting.judge_name}</div>
            <div>• Lawyer: {meeting.lawyer_name}</div>
            <div>• Citizen: {meeting.citizen_name}</div>
          </div>
        </div>

        {meeting.description && (
          <div className="text-sm">
            <strong>Description:</strong>
            <p className="text-gray-600 mt-1">{meeting.description}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {canJoin && (
            <Button onClick={handleJoinMeeting} className="flex-1 bg-green-600 hover:bg-green-700">
              <Video className="w-4 h imm4 mr-2" />
              Join Hearing
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hearing Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Meeting URL:</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm break-all">
                    {meeting.meetingUrl}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Room Name:</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                    {meeting.roomName}
                  </div>
                </div>
                <Button 
                  onClick={() => navigator.clipboard.writeText(meeting.meetingUrl)}
                  className="w-full"
                >
                  Copy Meeting Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
