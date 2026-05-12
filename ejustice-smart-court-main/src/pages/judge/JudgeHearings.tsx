
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function JudgeHearings() {
    const { meetings, user, cases, users } = useAuth();
    
    // Filter meetings for this judge and get distinct cases
    const judgeMeetings = meetings
        .filter(m => m.judgeId === user?.id)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    
    // Get distinct cases (latest meeting per case)
    const distinctCaseMeetings = judgeMeetings.reduce((acc, meeting) => {
        const existingIndex = acc.findIndex(m => m.caseId === meeting.caseId);
        if (existingIndex === -1) {
            acc.push(meeting);
        } else {
            // Keep the latest meeting for this case
            if (new Date(meeting.scheduledAt) > new Date(acc[existingIndex].scheduledAt)) {
                acc[existingIndex] = meeting;
            }
        }
        return acc;
    }, [] as any[]);

    return (
        <DashboardLayout breadcrumbs={[{ label: 'Dashboard', path: '/judge/dashboard' }, { label: 'Hearings Schedule' }]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Hearings Schedule</h1>
                    <p className="text-muted-foreground mt-1">Manage your daily court docket.</p>
                </div>

                <div className="grid gap-6">
                    {distinctCaseMeetings.map((meeting) => {
                        const caseData = cases.find(c => c.id === meeting.caseId);
                        const lawyer = users.find(u => u.id === meeting.lawyerId);
                        const citizen = users.find(u => u.id === meeting.citizenId);
                        
                        return (
                            <Card key={meeting.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row border-l-4 border-primary">
                                    <div className="bg-muted/30 p-6 flex flex-col justify-center items-center min-w-[150px] text-center border-r">
                                        <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                                            {new Date(meeting.scheduledAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-4xl font-bold text-foreground mb-1">
                                            {new Date(meeting.scheduledAt).getDate()}
                                        </div>
                                        <div className="text-sm text-muted-foreground uppercase">
                                            {new Date(meeting.scheduledAt).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">Video Hearing</Badge>
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <Video className="h-3 w-3" />
                                                        Virtual Court
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-semibold mb-1">{caseData?.title || `Case #${meeting.caseId}`}</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    <span className="flex items-center gap-2 mb-1">
                                                        <User className="h-3 w-3" /> Presiding: {user?.name}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-3 w-3" /> Lawyer: {lawyer?.name || 'Not assigned'}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-3 w-3" /> Citizen: {citizen?.name || 'Unknown'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                                                    <Clock className="h-5 w-5" />
                                                    {new Date(meeting.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Duration: {meeting.duration} minutes
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button onClick={() => window.open(meeting.meetingUrl, '_blank')}>
                                                Join Video Session
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <a href={`/judge/case/${meeting.caseId}`}>View Case Details</a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    
                    {distinctCaseMeetings.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No hearings scheduled yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
