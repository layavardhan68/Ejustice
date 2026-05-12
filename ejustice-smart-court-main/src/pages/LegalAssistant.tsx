
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Scale,
  Send,
  Bot,
  Shield,
  Scale as JusticeScale,
  ArrowLeft,
  User,
  AlertTriangle
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { legalFAQs } from '@/data/mockData';
import { chatWithLegalAssistant } from '@/services/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const protocols = [
  "How do I initiate a civil suit?",
  "Documents required for e-Filing",
  "Understanding the hearing queue",
  "Legal aid for eligible citizens"
];

export default function LegalAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to the Judicial Navigator. I am programmed to provide clarity on court protocols, filing requirements, and citizen rights within the eJustice framework.\n\nWhat procedural inquiry can I assist you with today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simple logic to find answers (reused from previous version)
  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    for (const category of legalFAQs) {
      for (const faq of category.questions) {
        const keywords = faq.q.toLowerCase().split(' ');
        const matchScore = keywords.filter(word => lowerQuestion.includes(word)).length;
        if (matchScore >= 3 || lowerQuestion.includes(faq.q.toLowerCase().slice(0, 20))) {
          return faq.a;
        }
      }
    }

    if (lowerQuestion.includes('suit') || lowerQuestion.includes('civil')) {
      return "To initiate a civil suit: (1) Draft a plaint with all material facts, (2) Pay the requisite court fees, (3) File it electronically via the eJustice Portal or physically at the filing counter. Once verified, a unique Case ID will be generated.";
    }
    if (lowerQuestion.includes('document') || lowerQuestion.includes('filing')) {
      return "For e-Filing, you typically need: (1) Identity proof, (2) Vakalatnama (if represented by a lawyer), (3) Affidavits supporting your claims, and (4) All relevant evidentiary documents in PDF format, digitally signed.";
    }

    return "I can assist you with that. Please verify the specific details with the court registry, but generally: (1) Ensure all documentation is complete, (2) Follow the procedural deadlines. Would you like me to guide you to the filing section?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);



    try {
      const response = await chatWithLegalAssistant(input);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the legal database at the moment. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleProtocolClick = (protocol: string) => {
    setInput(protocol);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar: Judicial Navigator */}
      <aside className="w-full md:w-80 lg:w-96 p-6 flex flex-col gap-6 bg-background border-r border-border/50">
        <div className="mb-2">
          <Button asChild variant="ghost" size="sm" className="pl-0 -ml-2 text-muted-foreground hover:text-foreground mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
            </Link>
          </Button>

          <Card className="bg-[#0f172a] text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Scale className="h-24 w-24" />
            </div>
            <CardHeader className="relative z-10 pb-2">
              <div className="p-2 bg-white/10 w-fit rounded-lg mb-4">
                <Scale className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="font-serif text-3xl italic leading-tight">
                Judicial <br /> Navigator
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-white/70 text-sm leading-relaxed">
                Enabling <span className="text-gold font-semibold">legal accessibility</span> through algorithmic transparency.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-3">
          {protocols.map((protocol, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto py-4 px-4 text-left whitespace-normal bg-white border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm group"
              onClick={() => handleProtocolClick(protocol)}
            >
              <div className="flex-1">
                <span className="font-medium text-sm group-hover:font-semibold transition-all">
                  {protocol}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Chat Header */}
        <header className="bg-white border-b border-border/50 py-4 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-[#0f172a]">Registry Protocol AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registry Sync Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <JusticeScale className="h-5 w-5" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 max-w-3xl",
                message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 shadow-sm",
                message.role === 'assistant' ? "bg-white border-border" : "bg-primary text-primary-foreground border-transparent"
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 text-[#0f172a]" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              <div className={cn(
                "p-6 rounded-2xl shadow-sm border text-sm leading-relaxed",
                message.role === 'assistant'
                  ? "bg-white border-border text-foreground rounded-tl-none"
                  : "bg-primary/5 border-primary/10 text-foreground rounded-tr-none"
              )}>
                <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 font-bold opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="h-4 w-4 text-[#0f172a]" />
              </div>
              <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 flex items-center gap-3 text-amber-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">Informational Guidance Only. Not a substitute for legal counsel.</span>
            </div>

            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Inquire about court protocols..."
                className="pr-12 py-6 text-base bg-muted/30 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-xl"
              />
              <Button
                onClick={handleSend}
                className="absolute right-2 top-2 rounded-lg bg-gold hover:bg-gold/90 text-[#0f172a]"
                size="icon"
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
