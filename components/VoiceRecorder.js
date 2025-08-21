import { useState, useRef } from 'react';

export default function VoiceRecorder({ onRecordingComplete }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    onRecordingComplete(base64data);
                };
                reader.readAsDataURL(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                    setIsRecording(false);
                }
            }, 20000); // 20 seconds limit
        } catch (err) {
            console.error('Error accessing microphone', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleRecordClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const clearRecording = () => {
        setAudioUrl('');
        onRecordingComplete('');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {audioUrl && (
                <div style={{ marginBottom: '10px' }}>
                    <audio controls src={audioUrl}></audio>
                    <button onClick={clearRecording} style={{ marginLeft: '10px' }}>
                        Clear
                    </button>
                </div>
            )}
            <button onClick={handleRecordClick} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                {isRecording ? 'Stop Recording' : 'Record Voice Note'}
            </button>
        </div>
    );
}
