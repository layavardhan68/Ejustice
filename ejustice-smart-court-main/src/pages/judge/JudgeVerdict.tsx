
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gavel, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function JudgeVerdict() {
    const navigate = useNavigate();
    const { cases } = useAuth();

    // Mock logic: Cases that are close to resolution
    const verdictReadyCases = cases.filter(c => c.status === 'in_hearing' || c.status === 'pending');

    return (
        <DashboardLayout breadcrumbs={[{ label: 'Dashboard', path: '/judge/dashboard' }, { label: 'Deliver Verdict' }]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Deliver Verdict</h1>
                    <p className="text-muted-foreground mt-1">Finalize judgments and issue orders.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {verdictReadyCases.map((c) => (
                        <Card key={c.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline">{c.type}</Badge>
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Judgment</Badge>
                                </div>
                                <CardTitle className="text-lg line-clamp-2">{c.title}</CardTitle>
                                <CardDescription>Case ID: {c.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                    {c.description}
                                </p>
                                <Button className="w-full" onClick={() => navigate(`/judge/case/${c.id}`)}>
                                    <Gavel className="h-4 w-4 mr-2" />
                                    Draft Judgment
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
