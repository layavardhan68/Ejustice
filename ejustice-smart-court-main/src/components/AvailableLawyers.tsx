import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, Briefcase, Award, CheckCircle } from 'lucide-react';
import { getAvailableLawyers, createLawyerRequest } from '@/services/api';

interface Lawyer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  verified: boolean;
  barNumber: string;
  specialization: string[];
  experience: number;
  createdAt: string;
}

interface AvailableLawyersProps {
  caseId: string;
  onRequestSent?: () => void;
}

export default function AvailableLawyers({ caseId, onRequestSent }: AvailableLawyersProps) {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [caseType, setCaseType] = useState<string>('');
  const [isSpecializedMatch, setIsSpecializedMatch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestingLawyer, setRequestingLawyer] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableLawyers();
  }, [caseId]);

  const fetchAvailableLawyers = async () => {
    try {
      setLoading(true);
      const response = await getAvailableLawyers(caseId);
      setLawyers(response.lawyers);
      setCaseType(response.caseType);
      setIsSpecializedMatch(response.isSpecializedMatch);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLawyer = async (lawyerId: string) => {
    try {
      setRequestingLawyer(lawyerId);
      await createLawyerRequest({
        caseId,
        lawyerId,
        status: 'pending',
        message: `Request for legal representation in ${caseType} case`
      });
      
      if (onRequestSent) {
        onRequestSent();
      }
      
      // Remove the lawyer from the list after request
      setLawyers(lawyers.filter(lawyer => lawyer.id !== lawyerId));
    } catch (error) {
      console.error('Error requesting lawyer:', error);
    } finally {
      setRequestingLawyer(null);
    }
  };

  const getExperienceColor = (experience: number) => {
    if (experience >= 10) return 'bg-green-100 text-green-800';
    if (experience >= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading available lawyers...</div>
        </CardContent>
      </Card>
    );
  }

  if (lawyers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No verified lawyers available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Available Lawyers
          <Badge variant={isSpecializedMatch ? "default" : "secondary"}>
            {isSpecializedMatch ? 'Specialized' : 'All Verified'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isSpecializedMatch 
            ? `Lawyers specializing in ${caseType} cases`
            : `All verified lawyers (no ${caseType} specialists available)`
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lawyers.map((lawyer) => (
            <div key={lawyer.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={lawyer.avatar} />
                    <AvatarFallback>{lawyer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{lawyer.name}</h4>
                      {lawyer.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{lawyer.barNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getExperienceColor(lawyer.experience)}>
                    {lawyer.experience} years
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {lawyer.specialization.map((spec, index) => (
                  <Badge 
                    key={index} 
                    variant={spec === caseType ? "default" : "outline"}
                    className="text-xs"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {lawyer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lawyer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {lawyer.email}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleRequestLawyer(lawyer.id)}
                  disabled={requestingLawyer === lawyer.id}
                >
                  {requestingLawyer === lawyer.id ? 'Requesting...' : 'Request Representation'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
