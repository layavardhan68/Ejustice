import { useState } from 'react';
import { User, Case, LawyerRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCheck, Mail, Phone, Briefcase, Star } from 'lucide-react';

interface LawyerSelectionProps {
  caseData: Case;
  lawyers: User[];
  onRequestSent: () => void;
}

export default function LawyerSelection({ caseData, lawyers, onRequestSent }: LawyerSelectionProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const verifiedLawyers = lawyers.filter(lawyer => lawyer.role === 'lawyer' && lawyer.verified);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLawyer) {
      toast.error('Please select a lawyer');
      return;
    }

    if (!message.trim()) {
      toast.error('Please add a message for the lawyer');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        caseId: caseData.id,
        lawyerId: selectedLawyer.id,
        message: message.trim()
      };

      const response = await fetch('/api/lawyer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      toast.success('Request sent to lawyer successfully!');
      onRequestSent();
    } catch (error) {
      console.error('Error sending lawyer request:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationColor = (spec: string) => {
    const colors: Record<string, string> = {
      'Civil Law': 'bg-blue-100 text-blue-800',
      'Criminal Law': 'bg-red-100 text-red-800',
      'Family Law': 'bg-purple-100 text-purple-800',
      'Property Disputes': 'bg-green-100 text-green-800',
      'Consumer Law': 'bg-yellow-100 text-yellow-800',
      'Labor Law': 'bg-orange-100 text-orange-800',
    };
    return colors[spec] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Lawyer for Your Case</h2>
        <p className="text-gray-600">
          Choose from our verified lawyers to represent you in: <span className="font-semibold">{caseData.title}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {verifiedLawyers.map((lawyer) => (
          <Card 
            key={lawyer.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLawyer?.id === lawyer.id ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => setSelectedLawyer(lawyer)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/20 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                    <p className="text-sm text-gray-500">{lawyer.barNumber}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {lawyer.specialization?.map((spec) => (
                  <Badge key={spec} variant="secondary" className={getSpecializationColor(spec)}>
                    {spec}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{lawyer.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{lawyer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{lawyer.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">(4.0)</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLawyer && (
        <Card>
          <CardHeader>
            <CardTitle>Send Request to {selectedLawyer.name}</CardTitle>
            <CardDescription>
              Write a message explaining why you need their representation for this case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message">Message to Lawyer</Label>
                <Textarea
                  id="message"
                  placeholder="Explain your case briefly and why you need their representation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedLawyer(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
