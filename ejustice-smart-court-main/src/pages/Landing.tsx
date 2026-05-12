import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Scale,
  MessageSquare,
  FileText,
  Brain,
  AlertTriangle,
  Users,
  Video,
  Globe,
  Shield,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "No-Login Legal Assistant",
    description: "Get instant answers to common legal questions without creating an account.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FileText,
    title: "Online Case Filing",
    description: "File cases digitally with guided forms and automatic document verification.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Brain,
    title: "AI Case Summarization",
    description: "AI-powered analysis extracts key facts, legal issues, and relief sought.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: AlertTriangle,
    title: "Urgency Prioritization",
    description: "Cases are automatically prioritized based on urgency and legal complexity.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Users,
    title: "Lawyer Discovery",
    description: "Find qualified lawyers who can represent you based on case type and expertise.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: Video,
    title: "Virtual Hearings",
    description: "Attend court hearings remotely with secure video conferencing.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Access the platform in multiple languages for inclusive justice delivery.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Shield,
    title: "Digital Evidence Vault",
    description: "Securely store and verify evidence with blockchain-based hashing.",
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  {
    icon: LayoutDashboard,
    title: "Role-Based Dashboards",
    description: "Tailored interfaces for citizens, lawyers, judges, and administrators.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: CheckCircle2,
    title: "Transparency Portal",
    description: "Track case progress and access anonymized verdicts for public reference.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const stats = [
  { value: "50,000+", label: "Cases Filed" },
  { value: "15,000+", label: "Citizens Served" },
  { value: "2,500+", label: "Lawyers Registered" },
  { value: "98%", label: "User Satisfaction" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground">eJustice</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/legal-assistant" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Legal Assistant
              </Link>
              <Link to="/legal-awareness" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Legal Awareness
              </Link>
              <Link to="/transparency" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Transparency
              </Link>
              <Link to="/login" className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto stagger-children">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-6">
              <Shield className="h-4 w-4" />
              <span>Government of India Initiative</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              Delivering Fast, Fair & Accessible{' '}
              <span className="text-gradient-gold">Justice</span>{' '}
              Through AI-Powered Smart Courts
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              A modern digital platform transforming the Indian judicial system with intelligent case management,
              virtual hearings, and citizen-centric services.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/legal-assistant" className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask Legal Assistant
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/login" className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File a Case
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <p className="text-3xl md:text-4xl font-bold text-white font-serif">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Comprehensive Digital Justice Platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for efficient, transparent, and accessible justice delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-interactive group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Ready to Experience Digital Justice?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of citizens, lawyers, and judicial officers using eJustice every day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="navy" size="lg">
              <Link to="/login" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/legal-assistant">Try Legal Assistant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-gold" />
              <span className="font-serif text-lg font-semibold">eJustice</span>
            </div>
            <p className="text-sm text-primary-foreground/70 text-center">
              © 2024 eJustice - Smart Courtroom & AI-Powered Case Management System.
              A Government of India Initiative.
            </p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
              <Link to="#" className="hover:text-primary-foreground transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Terms</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
