import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { JitsiMeeting } from '@/components/hearing/JitsiMeeting';
import { Hearing } from '@/types';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info } from 'lucide-react';

export default function LiveHearing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hearing, setHearing] = useState<Hearing | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initHearing = async () => {
            try {
                if (!id) return;

                // 1. Get Hearing Details to display info
                // This assumes we have a getHearingById method exposed or we can fetch direct
                // For now, we will hit the start endpoint which returns roomName and ensures it exists
                const response = await axios.post(`https://ejustice-smart-court.onrender.com/api/hearings/${id}/start`);
                setRoomName(response.data.roomName);

                // Also fetch full hearing details for context
                const detailsResponse = await axios.get(`https://ejustice-smart-court.onrender.com/api/hearings/${id}`);
                setHearing(detailsResponse.data);

            } catch (error) {
                console.error("Failed to initialize hearing:", error);
            } finally {
                setLoading(false);
            }
        };

        initHearing();
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Starting Secure Session...</div>;
    }

    if (!hearing || !roomName || !user) {
        return <div className="flex items-center justify-center h-screen">Failed to load hearing.</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {hearing.type} Hearing
                        </h1>
                        <p className="text-sm text-slate-500">
                            Case #{hearing.caseId} • {hearing.courtRoom}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        Case Details
                    </Button>
                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
                        🔴 LIVE
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
                <JitsiMeeting
                    roomName={roomName}
                    displayName={`${user.name} (${user.role})`}
                    containerStyles={{ flex: 1 }}
                    onMeetingEnd={() => navigate(-1)}
                />
            </main>
        </div>
    );
}
