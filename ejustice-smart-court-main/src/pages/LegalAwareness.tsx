
import { useState } from 'react';
import {
    Scale,
    Shield,
    Users,
    BookOpen,
    Gavel,
    Briefcase,
    FileText,
    ChevronRight,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

export default function LegalAwareness() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const keyRights = [
        {
            icon: Shield,
            title: "Fundamental Rights",
            description: "Understand your rights to equality, freedom, and protection under the law.",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: Users,
            title: "Consumer Protection",
            description: "Rights when purchasing goods or services. Learn how to address grievances.",
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            icon: BookOpen,
            title: "Digital Safety Laws",
            description: "Navigating the IT Act and data privacy in the digital age.",
            color: "text-slate-600",
            bg: "bg-slate-50"
        }
    ];

    const commonTopics = [
        {
            id: "property",
            title: "Property & Land Disputes",
            icon: Gavel,
            description: "Legal matters involving ownership, possession, and boundary conflicts of immovable property.",
            rights: [
                "Right to peaceful possession of property.",
                "Protection against illegal dispossession.",
                "Right to clear title and documentation.",
                "Access to RERA protections for home buyers."
            ],
            steps: [
                "Verify all property deeds and 'Chain of Documents'.",
                "Issue a legal notice to the opposing party.",
                "File for a Permanent or Temporary Injunction if threatened.",
                "Mediation is often encouraged before full trial."
            ],
            tip: "Always ensure your property tax receipts are up to date and in your name; they serve as strong evidence of possession."
        },
        {
            id: "family",
            title: "Family & Personal Law",
            icon: Users,
            description: "Matters related to marriage, divorce, custody, and inheritance.",
            rights: [
                "Right to maintenance.",
                "Right to inheritance.",
                "Protection from domestic violence."
            ],
            steps: [
                "Consult a family lawyer.",
                "File a petition in Family Court.",
                "Attend mandatory counseling/mediation."
            ],
            tip: "Keep all communication documented, especially in custody and maintenance disputes."
        },
        {
            id: "labor",
            title: "Labor & Employment Rights",
            icon: Briefcase,
            description: "Rights regarding wages, workplace safety, and protection from harassment.",
            rights: [
                "Right to minimum wage.",
                "Right to safe working conditions.",
                "Protection against sexual harassment."
            ],
            steps: [
                "File a complaint with HR/Internal Committee.",
                "Approach the Labor Commissioner.",
                "File a case in Labor Court."
            ],
            tip: "Maintain a record of your employment contract, payslips, and any correspondence related to grievances."
        },
        {
            id: "criminal",
            title: "Criminal Procedure Basics",
            icon: Scale,
            description: "Understanding FIRs, arrest rights, and bail procedures.",
            rights: [
                "Right to know the grounds of arrest.",
                "Right to legal representation.",
                "Right to not self-incriminate."
            ],
            steps: [
                "File an FIR at the nearest police station.",
                "Seek legal counsel immediately.",
                "Apply for bail if arrested."
            ],
            tip: "Do not sign any blank papers or confess under duress without a lawyer present."
        },
        {
            id: "pil",
            title: "Public Interest Litigations",
            icon: FileText,
            description: "Filing cases for the benefit of the public at large.",
            rights: [
                "Right to file PIL for public cause.",
                "Access to judicial remedy for marginalized."
            ],
            steps: [
                "Identify the public interest issue.",
                "Gather substantial evidence.",
                "File a writ petition in High Court or Supreme Court."
            ],
            tip: "Ensure the PIL is not frivolous and genuinely serves the public interest."
        }
    ];

    const getTopicData = (id: string | null) => commonTopics.find(t => t.id === id);
    const activeTopic = getTopicData(selectedTopic);

    return (
        <div className="min-h-screen bg-background pt-16">
            {/* Navigation Placeholder - reusing Landing page nav would be better but keeping simple for now */}
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
                            <Link to="/legal-awareness" className="text-sm font-medium text-primary">
                                Legal Awareness
                            </Link>
                            <Link to="/transparency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                        Legal Awareness Hub
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Empowering citizens through knowledge of the law.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Know Your Rights */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Scale className="h-8 w-8 text-primary" />
                            <h2 className="text-2xl font-serif font-bold text-foreground">Know Your Rights</h2>
                        </div>

                        <div className="space-y-4">
                            {keyRights.map((item, index) => (
                                <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className={`p-3 rounded-lg ${item.bg}`}>
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-foreground mb-1">{item.title}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Common Legal Topics */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="bg-muted/30 rounded-3xl p-8 border border-border/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Gavel className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-serif font-bold text-foreground">Common Legal Topics</h2>
                            </div>

                            <div className="space-y-4">
                                {commonTopics.map((topic) => (
                                    <Dialog key={topic.id}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between h-auto py-4 px-6 bg-background hover:bg-muted/50 border-border/50 group"
                                                onClick={() => setSelectedTopic(topic.id)}
                                            >
                                                <span className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                                    {topic.title}
                                                </span>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <topic.icon className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <DialogTitle className="text-2xl font-serif">{topic.title}</DialogTitle>
                                                </div>
                                                <DialogDescription className="text-lg">
                                                    {topic.description}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <ScrollArea className="max-h-[60vh] pr-4 mt-4">
                                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-gold font-bold text-sm uppercase tracking-wider mb-4">
                                                            <CheckCircleIcon className="h-4 w-4" /> Key Legal Rights
                                                        </h4>
                                                        <ul className="space-y-3">
                                                            {topic.rights?.map((right, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                                                                    {right}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-4">
                                                            <ListTodoIcon className="h-4 w-4" /> Procedural Steps
                                                        </h4>
                                                        <ul className="space-y-4">
                                                            {topic.steps?.map((step, idx) => (
                                                                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                                                                    <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-xs font-bold shrink-0">
                                                                        {idx + 1}
                                                                    </span>
                                                                    {step}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 border border-border/50">
                                                    <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-serif font-bold text-foreground mb-1">Pro Tip for Citizens</h5>
                                                        <p className="text-sm text-muted-foreground italic">"{topic.tip}"</p>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

function ListTodoIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="5" width="6" height="6" rx="1" />
            <path d="m3 17 2 2 4-4" />
            <path d="M13 6h8" />
            <path d="M13 12h8" />
            <path d="M13 18h8" />
        </svg>
    )
}
