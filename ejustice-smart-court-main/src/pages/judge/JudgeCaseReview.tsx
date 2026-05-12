
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Search, FileText, Filter, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function JudgeCaseReview() {
    const navigate = useNavigate();
    const { cases } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter cases that need review (mock logic: status 'pending' or 'in-progress')
    const pendingCases = cases.filter(c =>
        (c.status === 'pending' || c.status === 'in_hearing') &&
        (c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout breadcrumbs={[{ label: 'Dashboard', path: '/judge/dashboard' }, { label: 'Case Review' }]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Case Review</h1>
                    <p className="text-muted-foreground mt-1">Review pending cases and assign hearing dates.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Case ID or Title"
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                        <CardDescription>Cases awaiting judicial review.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Case ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Filed Date</TableHead>
                                    <TableHead>Urgency</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingCases.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.id}</TableCell>
                                        <TableCell>{c.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{c.type}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(c.filedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                c.urgency === 'high' ? 'urgency-high' :
                                                    c.urgency === 'medium' ? 'urgency-medium' : 'urgency-low'
                                            }>
                                                {c.urgency.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => navigate(`/judge/case/${c.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
