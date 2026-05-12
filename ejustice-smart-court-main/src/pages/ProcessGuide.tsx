
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ProcessGuide() {
    return (
        <div className="min-h-screen bg-background pt-16 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-primary/5 p-6 rounded-full mb-6">
                <Scale className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Process Guide</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-8">
                A step-by-step guide to filing cases and understanding the judicial process is coming soon.
            </p>
            <Button asChild>
                <Link to="/">Return to Home</Link>
            </Button>
        </div>
    );
}
