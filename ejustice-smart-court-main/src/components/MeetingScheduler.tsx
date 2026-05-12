import { useState } from 'react';
import { Case, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Clock, Users, Video } from 'lucide-react';

interface MeetingSchedulerProps {
  caseData: Case & { lawyer_name?: string; citizen_name?: string };
  judge: User;
  onMeetingScheduled: () => void;
}

export default function MeetingScheduler({ caseData, judge, onMeetingScheduled }: MeetingSchedulerProps) {
  const [formData, setFormData] = useState({
    title: `Meeting for ${caseData.title}`,
    description: '',
    scheduledAt: '',
    duration: '60',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);

    try {
      const meetingData = {
        caseId: caseData.id,
        title: formData.title,
        description: formData.description,
        scheduledAt: formData.scheduledAt,
        duration: parseInt(formData.duration),
        judgeId: judge.id,
        lawyerId: caseData.lawyerId,
        citizenId: caseData.citizenId,
        notes: formData.notes
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule meeting');
      }

      toast.success('Meeting scheduled successfully!');
      onMeetingScheduled();
      
      // Reset form
      setFormData({
        title: `Meeting for ${caseData.title}`,
        description: '',
        scheduledAt: '',
        duration: '60',
        notes: ''
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Schedule Video Meeting
        </CardTitle>
        <CardDescription>
          Schedule a Jitsi video conference for this case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Case Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Case Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Case:</span> {caseData.title}
              </div>
              <div>
                <span className="font-medium">Type:</span> {caseData.type}
              </div>
              <div>
                <span className="font-medium">Citizen:</span> {caseData.citizen_name || 'Loading...'}
              </div>
              <div>
                <span className="font-medium">Lawyer:</span> {caseData.lawyer_name || 'Assigned'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter meeting title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              min={getMinDateTime()}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this meeting..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information for participants..."
              rows={2}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Meeting Participants:</p>
                <ul className="space-y-1">
                  <li>• Judge: {judge.name}</li>
                  <li>• Lawyer: {caseData.lawyer_name || 'To be confirmed'}</li>
                  <li>• Citizen: {caseData.citizen_name || 'To be confirmed'}</li>
                </ul>
                <p className="mt-2 text-xs">A Jitsi meeting link will be automatically generated and sent to all participants.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormData({
              title: `Meeting for ${caseData.title}`,
              description: '',
              scheduledAt: '',
              duration: '60',
              notes: ''
            })}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
