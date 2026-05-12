import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface JitsiMeetingProps {
    roomName: string;
    displayName: string;
    containerStyles?: React.CSSProperties;
    onMeetingEnd?: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export function JitsiMeeting({ roomName, displayName, containerStyles, onMeetingEnd }: JitsiMeetingProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        // Load Jitsi Script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi();
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, []);

    const initJitsi = () => {
        if (!window.JitsiMeetExternalAPI) return;

        setLoading(false);
        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: containerRef.current,
            userInfo: {
                displayName: displayName,
            },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
            lang: 'en',
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListeners({
            videoConferenceLeft: () => {
                if (onMeetingEnd) onMeetingEnd();
            },
        });
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-lg overflow-hidden shadow-xl" style={containerStyles}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    <span>Loading Secure Court Room...</span>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
