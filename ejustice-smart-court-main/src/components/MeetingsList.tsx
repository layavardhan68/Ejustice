import { useState } from 'react';
import { Meeting } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Video, Calendar, Clock, Users, ExternalLink, Edit, Trash2 } from 'lucide-react';

interface MeetingsListProps {
  meetings: (Meeting & { case_title?: string; judge_name?: string; lawyer_name?: string; citizen_name?: string })[];
  userRole: 'citizen' | 'lawyer' | 'judge' | 'admin';
  onMeetingUpdate?: () => void;
  onJoinMeeting?: (meeting: Meeting) => void;
}

export default function MeetingsList({ meetings, userRole, onMeetingUpdate, onJoinMeeting }: MeetingsListProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<typeof meetings[0] | null>(null);

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

  const isMeetingJoinable = (meeting: Meeting) => {
    const now = new Date();
    const meetingTime = new Date(meeting.scheduledAt);
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return meeting.status === 'scheduled' && minutesDiff <= 15 && minutesDiff >= -60;
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (onJoinMeeting) {
      onJoinMeeting(meeting);
    } else {
      window.open(meeting.meetingUrl, '_blank');
    }
  };

  const handleUpdateStatus = async (meetingId: string, status: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting status');
      }

      toast.success('Meeting status updated successfully!');
      if (onMeetingUpdate) {
        onMeetingUpdate();
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error('Failed to update meeting status');
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      toast.success('Meeting deleted successfully!');
      if (onMeetingUpdate) {
        onMeetingUpdate();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
    }
  };

  const sortedMeetings = meetings.sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const upcomingMeetings = sortedMeetings.filter(m => 
    new Date(m.scheduledAt) >= new Date() && m.status !== 'cancelled'
  );
  const pastMeetings = sortedMeetings.filter(m => 
    new Date(m.scheduledAt) < new Date() || m.status === 'completed' || m.status === 'cancelled'
  );

  const renderMeetingCard = (meeting: typeof meetings[0]) => {
    const { date, time } = formatDateTime(meeting.scheduledAt);
    const canJoin = isMeetingJoinable(meeting);

    return (
      <Card key={meeting.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{meeting.title}</CardTitle>
              <CardDescription className="mt-1">
                Case: {meeting.case_title || 'Unknown case'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(meeting.status)}>
              {meeting.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
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
              <Button onClick={() => handleJoinMeeting(meeting)} className="flex-1">
                <Video className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Meeting Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Meeting Link</DialogTitle>
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
                    Copy Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {(userRole === 'judge' || userRole === 'admin') && meeting.status === 'scheduled' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateStatus(meeting.id, 'in_progress')}
                >
                  Start
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateStatus(meeting.id, 'completed')}
                >
                  Complete
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteMeeting(meeting.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {upcomingMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Meetings ({upcomingMeetings.length})
          </h3>
          <div className="grid gap-4">
            {upcomingMeetings.map(renderMeetingCard)}
          </div>
        </div>
      )}

      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Past Meetings ({pastMeetings.length})
          </h3>
          <div className="grid gap-4">
            {pastMeetings.map(renderMeetingCard)}
          </div>
        </div>
      )}

      {meetings.length === 0 && (
        <div className="text-center py-8">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
          <p className="text-gray-500">
            {userRole === 'judge' ? 'Schedule meetings for your cases from the case details.' : 
             userRole === 'lawyer' ? 'Your scheduled meetings will appear here.' :
             'Your scheduled meetings will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}
