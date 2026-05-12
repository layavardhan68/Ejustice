
import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { FileText, Calendar, Gavel, User, Clock, FileCheck, Video } from 'lucide-react';
import { toast } from 'sonner';
import HearingCard from '@/components/HearingCard';

export default function JudgeCaseDetail() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { cases, documents, hearings, user, users, createMeeting, refreshMeetings, meetings, updateCase } = useAuth();
    const caseData = cases.find(c => c.id === id);
    const caseDocs = documents.filter(d => d.caseId === id);
    const caseHearings = hearings.filter(h => h.caseId === id);
    const caseMeetings = meetings.filter(m => m.caseId === id);
    
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showVerdictModal, setShowVerdictModal] = useState(false);
    const [formData, setFormData] = useState({
        scheduledAt: '',
        duration: '60'
    });
    const [verdictData, setVerdictData] = useState({
        verdict: '',
        reasoning: ''
    });

    // Auto-open schedule modal if URL parameter is present
    useEffect(() => {
        if (searchParams.get('schedule') === 'true') {
            setShowScheduleModal(true);
        }
    }, [searchParams]);
    const [loading, setLoading] = useState(false);

    const citizen = users.find(u => u.id === caseData?.citizenId);
    const lawyer = users.find(u => u.id === caseData?.lawyerId);

    const handleScheduleHearing = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.scheduledAt) {
            toast.error('Please select a date and time');
            return;
        }

        if (!caseData || !user || !citizen) {
            toast.error('Missing required information');
            return;
        }

        setLoading(true);

        try {
            // First, assign the judge to the case if not already assigned
            if (!caseData.judgeId) {
                await updateCase(caseData.id, {
                    judgeId: user.id,
                    status: 'in_hearing'
                });
            }

            const meetingData = {
                caseId: caseData.id,
                title: `Hearing for ${caseData.title}`,
                scheduledAt: formData.scheduledAt,
                duration: parseInt(formData.duration),
                judgeId: user.id,
                lawyerId: lawyer?.id,
                citizenId: citizen.id
            };

            await createMeeting(meetingData);
            toast.success('Hearing scheduled successfully!');
            setShowScheduleModal(false);
            refreshMeetings();
            
            // Reset form
            setFormData({
                scheduledAt: '',
                duration: '60'
            });
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            toast.error('Failed to schedule hearing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeliverVerdict = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await updateCase(caseData.id, {
                verdict: verdictData.verdict,
                status: 'closed',
                closedAt: new Date().toISOString()
            });
            
            toast.success('Verdict delivered successfully!');
            setShowVerdictModal(false);
            
            // Reset form
            setVerdictData({
                verdict: '',
                reasoning: ''
            });
        } catch (error) {
            console.error('Error delivering verdict:', error);
            toast.error('Failed to deliver verdict. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    if (!caseData) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">Case Not Found</h2>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                { label: 'Dashboard', path: '/judge/dashboard' },
                { label: 'Case Review', path: '/judge/case-review' },
                { label: `Case ${id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{caseData.title}</h1>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="outline" className="text-sm px-3 py-1">Type: {caseData.type}</Badge>
                            <Badge variant={
                                caseData.urgency === 'high' ? 'urgency-high' :
                                    caseData.urgency === 'medium' ? 'urgency-medium' : 'urgency-low'
                            } className="text-sm px-3 py-1">
                                {caseData.urgency.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge variant="status-pending" className="text-sm px-3 py-1">
                                Status: {caseData.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Hearing
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Schedule Hearing</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleScheduleHearing} className="space-y-4">
                                    <div>
                                        <Label htmlFor="scheduledAt">Date & Time</Label>
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
                                        <Label htmlFor="duration">Duration</Label>
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

                                    <div className="bg-blue-50 p-3 rounded text-sm">
                                        <p className="font-medium">Participants:</p>
                                        <ul className="mt-1 space-y-1 text-gray-600">
                                            <li>• Judge: {user.name}</li>
                                            <li>• Lawyer: {lawyer?.name || 'Not assigned'}</li>
                                            <li>• Citizen: {citizen?.name || 'Unknown'}</li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? 'Scheduling...' : 'Schedule Hearing'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowScheduleModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={showVerdictModal} onOpenChange={setShowVerdictModal}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Gavel className="h-4 w-4 mr-2" />
                                    Deliver Verdict
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Deliver Verdict</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleDeliverVerdict} className="space-y-4">
                                    <div>
                                        <Label htmlFor="verdict">Verdict</Label>
                                        <Textarea
                                            id="verdict"
                                            value={verdictData.verdict}
                                            onChange={(e) => setVerdictData({ ...verdictData, verdict: e.target.value })}
                                            placeholder="Enter the final verdict..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="reasoning">Reasoning</Label>
                                        <Textarea
                                            id="reasoning"
                                            value={verdictData.reasoning}
                                            onChange={(e) => setVerdictData({ ...verdictData, reasoning: e.target.value })}
                                            placeholder="Provide legal reasoning for the verdict..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="bg-amber-50 p-3 rounded text-sm">
                                        <p className="font-medium text-amber-800">Note:</p>
                                        <p className="text-amber-700">This will close the case and send notifications to all parties.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? 'Delivering...' : 'Deliver Verdict'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowVerdictModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Case Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-muted-foreground">
                                    {caseData.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Scheduled Hearings */}
                        {caseMeetings.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Video className="h-5 w-5" />
                                        Scheduled Hearings ({caseMeetings.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {caseMeetings.map(meeting => (
                                        <HearingCard 
                                            key={meeting.id} 
                                            meeting={{
                                                ...meeting,
                                                case_title: caseData.title,
                                                judge_name: user?.name,
                                                lawyer_name: lawyer?.name,
                                                citizen_name: citizen?.name
                                            }}
                                            userRole="judge"
                                            onJoinMeeting={(meeting) => window.open(meeting.meetingUrl, '_blank')}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Tabs defaultValue="documents">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="documents">Documents ({caseDocs.length})</TabsTrigger>
                                <TabsTrigger value="hearings">Hearing History ({caseHearings.length})</TabsTrigger>
                                <TabsTrigger value="aisummary">AI Analysis</TabsTrigger>
                            </TabsList>

                            <TabsContent value="documents" className="mt-4">
                                <Card>
                                    <CardContent className="pt-6 space-y-4">
                                        {caseDocs.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost">View</Button>
                                            </div>
                                        ))}
                                        {caseDocs.length === 0 && <p className="text-muted-foreground text-center py-4">No documents found.</p>}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="hearings" className="mt-4">
                                <Card>
                                    <CardContent className="pt-6 space-y-4">
                                        {caseHearings.map(h => (
                                            <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary-foreground">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{h.type} Hearing</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{h.status}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Parties Involved</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Citizen</p>
                                        <p className="text-xs text-muted-foreground">{citizen?.name || 'Loading...'}</p>
                                    </div>
                                </div>
                                {lawyer && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Lawyer</p>
                                            <p className="text-xs text-muted-foreground">{lawyer.name}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {caseData.aiSummary && (
                            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileCheck className="h-4 w-4 text-primary" /> AI Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold block text-primary/80">Key Facts:</span>
                                        <p className="text-muted-foreground">{caseData.aiSummary.facts || 'Pending analysis'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-primary/80">Legal Issue:</span>
                                        <p className="text-muted-foreground">{caseData.aiSummary.legalIssue || 'Pending analysis'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
