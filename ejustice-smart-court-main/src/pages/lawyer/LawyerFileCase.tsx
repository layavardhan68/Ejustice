
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CaseType } from '@/types';
import { FileText, Upload, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const caseTypes: CaseType[] = ['Property', 'Civil', 'Family', 'Consumer', 'Labor', 'Criminal', 'Other'];

export default function LawyerFileCase() {
    const navigate = useNavigate();
    const { user, addCase, addNotification } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        type: '' as CaseType,
        description: '',
        clientName: '',
        clientPhone: '',
    });

    const handleSubmit = () => {
        if (!user) return;

        const newCase = addCase({
            title: formData.title,
            type: formData.type,
            status: 'pending',
            urgency: 'medium', // Default for lawyer filed cases
            description: formData.description,
            citizenId: 'citizen-1', // Mocking citizen ID association
            lawyerId: user.id,
            judgeId: null,
            nextHearing: null,
            aiSummary: {
                facts: '',
                legalIssue: '',
                reliefSought: '',
            },
        });

        addNotification({
            userId: user.id,
            title: 'Case Filed Successfully',
            message: `Case ${newCase.id} for client ${formData.clientName} has been filed.`,
            type: 'case',
            read: false,
        });

        toast({
            title: 'Case Filed Successfully!',
            description: `Case ID: ${newCase.id}`,
        });

        navigate('/lawyer/my-cases');
    };

    const isValid = formData.title && formData.type && formData.description && formData.clientName;

    return (
        <DashboardLayout
            breadcrumbs={[
                { label: 'Dashboard', path: '/lawyer/dashboard' },
                { label: 'File New Case' }
            ]}
        >
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">File New Case</h1>
                    <p className="text-muted-foreground mt-1">Submit a new case on behalf of your client.</p>
                </div>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Client Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="clientPhone">Client Phone</Label>
                            <Input
                                id="clientPhone"
                                value={formData.clientPhone}
                                onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                placeholder="+91..."
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" /> Case Details
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Case Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Property Dispute in North District"
                            />
                        </div>

                        <div>
                            <Label>Case Type</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {caseTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                            formData.type === type
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-input hover:border-primary"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description of the case..."
                                className="min-h-[150px]"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" /> Evidence & Documents
                    </h2>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                        Click to upload case documents (Petition, Vakalatnama, Evidence)
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSubmit} disabled={!isValid}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submit Case Filings
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
