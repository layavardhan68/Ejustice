
import { useState } from 'react';
import {
    Scale,
    Search,
    CheckCircle2,
    Activity,
    Globe,
    FileText,
    ChevronRight,
    ArrowRight,
    Download,
    Share2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

export default function Transparency() {
    const [selectedJudgment, setSelectedJudgment] = useState<string | null>(null);
    const [showCertifiedCopy, setShowCertifiedCopy] = useState(false);

    const stats = [
        {
            label: "TOTAL CASES SOLVED",
            value: "12,482",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "AVG. REVIEW TIME",
            value: "14 Days",
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "ACTIVE REGISTRIES",
            value: "48",
            icon: Globe,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];

    const judgments = [
        {
            id: "JUD-2024-001",
            title: "Land Dispute - North Block",
            type: "CIVIL",
            status: "CLOSED",
            date: "May 12, 2024",
            summary: "A complex property ownership dispute involving historical deeds from the 1970s. The court ruled in favor of the petitioner based on consistent tax records and uninterrupted possession for 30 years.",
            timeline: [
                { date: "JAN 10, 2024", stage: "Case Intake", desc: "Electronic filing received via Portal." },
                { date: "JAN 25, 2024", stage: "Lawyer Assigned", desc: "Adv. Sarah Miller took the representation." },
                { date: "MAR 15, 2024", stage: "Hearing Session", desc: "Testimony of local land registry officials taken." },
                { date: "MAY 12, 2024", stage: "Final Verdict", desc: "Ownership declared for petitioner. Case closed." },
            ],
            parties: {
                petitioner: "North Block Residents Association",
                respondent: "Municipal Land Authority"
            },
            judge: "Hon. Justice Chen"
        },
        {
            id: "JUD-2024-002",
            title: "Commercial Fraud - Tech Hub",
            type: "CRIMINAL/FRAUD",
            status: "CLOSED",
            date: "May 10, 2024",
            summary: "Allegations of financial irregularities in a tech startup. Forensic audit revealed discrepancies of $2M. Accused pleaded guilty during pre-trial.",
            timeline: [
                { date: "FEB 01, 2024", stage: "Investigation Started", desc: "Cyber Cell initiated probe." },
                { date: "MAY 10, 2024", stage: "Judgment", desc: "Fines imposed and probation ordered." }
            ],
            parties: {
                petitioner: "State Prosecutor",
                respondent: "Tech Hub Innovations Ltd."
            },
            judge: "Hon. Justice Rao"
        },
        {
            id: "JUD-2024-003",
            title: "Environmental Breach - River City",
            type: "PUBLIC INTEREST",
            status: "CLOSED",
            date: "May 08, 2024",
            summary: "PIL filed against industrial waste dumping. Court ordered immediate cessation of activities and imposed restoration fines.",
            timeline: [],
            parties: {
                petitioner: "Green Earth Foundation",
                respondent: "River City Manufacturers Assn."
            },
            judge: "Hon. Justice D'Souza"
        }
    ];

    const getJudgment = (id: string | null) => judgments.find(j => j.id === id);
    const activeJudgment = getJudgment(selectedJudgment);

    return (
        <div className="min-h-screen bg-background pt-16">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <Scale className="h-8 w-8 text-primary" />
                            <span className="font-serif text-xl font-bold text-foreground">eJustice</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/legal-assistant" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Legal Assistant
                            </Link>
                            <Link to="/legal-awareness" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Legal Awareness
                            </Link>
                            <Link to="/transparency" className="text-sm font-medium text-primary">
                                Transparency
                            </Link>
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                        Transparency Portal
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Real-time statistics and public judicial insights.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, idx) => (
                        <Card key={idx} className="border-border/50 shadow-sm">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-serif font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Main Content: Recent Judgments */}
                    <div className="lg:col-span-8">
                        <Card className="border-border/50 shadow-sm h-full">
                            <CardContent className="p-0">
                                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <h2 className="font-serif font-bold text-lg text-foreground uppercase tracking-wide">Recent Public Judgments</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-primary font-semibold">
                                            View All
                                        </Button>
                                    </div>
                                </div>

                                <div className="divide-y divide-border/50">
                                    {judgments.map((judgment) => (
                                        <Dialog key={judgment.id}>
                                            <DialogTrigger asChild>
                                                <div
                                                    className="p-6 hover:bg-muted/30 cursor-pointer transition-colors group"
                                                    onClick={() => setSelectedJudgment(judgment.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                                                {judgment.title}
                                                            </h3>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-xs font-bold font-mono text-muted-foreground/80 uppercase tracking-wider">{judgment.id}</span>
                                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase text-gold bg-gold/10 hover:bg-gold/20 border-0">
                                                                    {judgment.type}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">
                                                                Judgment Published On {judgment.date}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-bold">
                                                                {judgment.status}
                                                            </Badge>
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>

                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <div className="flex items-center justify-between mr-8">
                                                        <div>
                                                            <DialogTitle className="text-2xl font-serif mb-1">{judgment.title}</DialogTitle>
                                                            <p className="text-xs font-mono text-muted-foreground">{judgment.id}</p>
                                                        </div>
                                                    </div>
                                                </DialogHeader>

                                                <ScrollArea className="max-h-[70vh] pr-4">
                                                    {!showCertifiedCopy ? (
                                                        <>
                                                            <div className="bg-primary/5 rounded-xl p-6 mb-8 border border-primary/10">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Case Summary</span>
                                                                </div>
                                                                <p className="text-lg text-foreground/80 italic leading-relaxed">
                                                                    "{judgment.summary}"
                                                                </p>
                                                            </div>

                                                            <div className="mb-8 pl-2">
                                                                <div className="flex items-center gap-2 mb-6">
                                                                    <Activity className="h-5 w-5 text-primary" />
                                                                    <h4 className="font-serif font-bold text-foreground">Track & Progress</h4>
                                                                </div>

                                                                <div className="relative border-l-2 border-border ml-2.5 pl-8 space-y-8 pb-2">
                                                                    {judgment.timeline.map((event, idx) => (
                                                                        <div key={idx} className="relative">
                                                                            <div className="absolute -left-[39px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                                                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                                                                                <h5 className="font-bold text-foreground">{event.stage}</h5>
                                                                                <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">{event.date}</span>
                                                                            </div>
                                                                            <p className="text-sm text-muted-foreground">{event.desc}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end pt-4 border-t border-border">
                                                                <Button className="gap-2" onClick={() => setShowCertifiedCopy(true)}>
                                                                    View Certified Record <ArrowRight className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowCertifiedCopy(false)}
                                                                className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <ArrowRight className="h-4 w-4 rotate-180" /> Back to Summary
                                                            </Button>

                                                            <div className="border-4 double border-primary/20 p-8 rounded-sm bg-background relative overflow-hidden">
                                                                {/* Watermark */}
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                                                    <Scale className="h-96 w-96" />
                                                                </div>

                                                                <div className="text-center mb-8 relative z-10">
                                                                    <div className="flex justify-center mb-4">
                                                                        <Scale className="h-12 w-12 text-gold opacity-80" />
                                                                    </div>
                                                                    <h3 className="font-serif font-bold text-xl uppercase tracking-widest text-foreground pb-2 border-b border-border/60 inline-block px-8">
                                                                        Electronic Judicial Record
                                                                    </h3>
                                                                    <p className="text-xs font-serif italic text-muted-foreground mt-2">Authenticated via eJustice Digital Seal</p>
                                                                </div>

                                                                <div className="space-y-6 relative z-10 font-serif text-foreground/90 leading-relaxed">
                                                                    <div className="text-center">
                                                                        <p className="uppercase font-bold">In The High Court Of Justice</p>
                                                                        <p className="uppercase">CASE NO: {judgment.id}</p>
                                                                    </div>

                                                                    <div className="text-center py-4">
                                                                        <p className="uppercase font-bold">BETWEEN: {judgment.parties.petitioner}</p>
                                                                        <p>(Petitioner)</p>
                                                                        <p className="my-2 text-xs font-bold text-muted-foreground">AND</p>
                                                                        <p className="uppercase font-bold">{judgment.parties.respondent}</p>
                                                                        <p>(Respondent)</p>
                                                                    </div>

                                                                    <div className="text-center pb-4">
                                                                        <p className="uppercase font-bold">JUDGMENT RENDERED BY {judgment.judge}</p>
                                                                    </div>

                                                                    <p className="text-justify px-4">
                                                                        Upon hearing the submissions of Advocate Sarah Miller for the Petitioner, the Court finds that the Petitioner has established a clear chain of title. The Respondent's claim of encroachment is dismissed as the provided surveys are found to be superseded by the 1995 Master Plan. The Court hereby orders the immediate rectification of land records...
                                                                    </p>

                                                                    <div className="pt-12 flex justify-between items-end px-4">
                                                                        <div className="border-t border-foreground/30 px-8 pt-2">
                                                                            <p className="text-xs uppercase font-bold text-center">Registrar</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <Badge variant="outline" className="border-gold text-gold font-mono text-[10px]">DIGITALLY SIGNED</Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-center gap-4 mt-6">
                                                                <Button variant="outline" className="gap-2">
                                                                    <Download className="h-4 w-4" /> Download PDF
                                                                </Button>
                                                                <Button variant="outline" className="gap-2">
                                                                    <Share2 className="h-4 w-4" /> Share
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#0f172a] text-white rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Activity className="h-32 w-32" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <Activity className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-serif font-bold uppercase tracking-widest text-sm">Backlog Trends</h3>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Pre-AI Backlog</p>
                                        <p className="text-3xl font-mono font-bold">480,000</p>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div>
                                        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Current Pending</p>
                                        <p className="text-3xl font-mono font-bold">312,000</p>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div>
                                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Efficiency Gain</p>
                                        <p className="text-4xl font-serif font-bold text-emerald-400">35.4%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
