import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Users, Settings, Phone, Maximize2 } from 'lucide-react';
import { Meeting } from '@/types';

interface JitsiMeetingProps {
  meeting: Meeting & { case_title?: string };
  userRole: 'citizen' | 'lawyer' | 'judge';
  onMeetingEnd?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiMeeting({ meeting, userRole, onMeetingEnd }: JitsiMeetingProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    document.body.appendChild(script);

    return () => {
      if (api) {
        api.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: meeting.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableInitialGUM: false,
        enableWelcomePage: false,
        enableFeatures: {
          'lobby-mode': false,
          'breakout-rooms': false,
          'calendar': false,
          'live-streaming': false,
          'recording': false,
          'transcription': false,
        },
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'info', 'chat',
          'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'tileview', 'videobackgroundblur', 'download', 'help'
        ],
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 4,
        VIDEO_LAYOUT_FIT: 'contain',
        VERTICAL_FILMSTRIP: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      },
      userInfo: {
        displayName: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      },
    };

    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
    setApi(jitsiApi);

    // Event listeners
    jitsiApi.addEventListener('videoMuteStatusChanged', ({ muted }: { muted: boolean }) => {
      setIsVideoMuted(muted);
    });

    jitsiApi.addEventListener('audioMuteStatusChanged', ({ muted }: { muted: boolean }) => {
      setIsAudioMuted(muted);
    });

    jitsiApi.addEventListener('participantJoined', () => {
      updateParticipantCount();
    });

    jitsiApi.addEventListener('participantLeft', () => {
      updateParticipantCount();
    });

    jitsiApi.addEventListener('readyToClose', () => {
      handleMeetingEnd();
    });

    jitsiApi.addEventListener('videoConferenceJoined', () => {
      setIsLoading(false);
      updateParticipantCount();
    });

    const updateParticipantCount = () => {
      jitsiApi.getNumberOfParticipants().then((count: number) => {
        setParticipantCount(count);
      });
    };

    return () => {
      jitsiApi.dispose();
    };
  };

  const toggleVideo = () => {
    if (api) {
      if (isVideoMuted) {
        api.executeCommand('toggleVideo');
      } else {
        api.executeCommand('toggleVideo');
      }
    }
  };

  const toggleAudio = () => {
    if (api) {
      if (isAudioMuted) {
        api.executeCommand('toggleAudio');
      } else {
        api.executeCommand('toggleAudio');
      }
    }
  };

  const toggleTileView = () => {
    if (api) {
      api.executeCommand('toggleTileView');
    }
  };

  const handleMeetingEnd = async () => {
    try {
      // Update meeting status to completed
      await fetch(`/api/meetings/${meeting.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch (error) {
      console.error('Error updating meeting status:', error);
    }

    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Meeting Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{meeting.title}</CardTitle>
              <p className="text-sm text-gray-600">{meeting.case_title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(meeting.status)}>
                {meeting.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{participantCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Jitsi Container */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Joining meeting...</p>
            </div>
          </div>
        )}
        <div ref={jitsiContainerRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Custom Controls */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={isAudioMuted ? "destructive" : "default"}
                size="sm"
                onClick={toggleAudio}
                className="rounded-full"
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant={isVideoMuted ? "destructive" : "default"}
                size="sm"
                onClick={toggleVideo}
                className="rounded-full"
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleTileView}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Scheduled: {formatTime(meeting.scheduledAt)}</span>
              <span>•</span>
              <span>Duration: {meeting.duration} min</span>
            </div>

            <Button variant="destructive" onClick={handleMeetingEnd}>
              <Phone className="w-4 h-4 mr-2" />
              End Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
