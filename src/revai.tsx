import React, { useState, useRef, useEffect } from 'react';

const RevAiDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const mediaRecorder = useRef(null);
  const websocket = useRef(null);

  useEffect(() => {
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
        }
      });
      mediaRecorder.current = new MediaRecorder(stream, {
      });

      const websocketUrl = `wss://api.rev.ai/speechtotext/v1/stream?access_token=${accessToken}&content_type=audio/webm;codecs=opus;layout=interleaved;rate=48000;format=F32LE;channels=1`;
      websocket.current = new WebSocket(websocketUrl);

      websocket.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsRecording(true);
      };

      websocket.current.onmessage = (event) => {
        const result = JSON.parse(event.data);
        if (result.type === 'partial' || result.type === 'final') {
          setTranscript(prevTranscript => prevTranscript + ' ' + result.elements[0].value);
        }
      };

      websocket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsRecording(false);
      };

      websocket.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsRecording(false);
      };

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && websocket.current.readyState === WebSocket.OPEN) {
          console.log('Sending data to WebSocket', event.data);
          const data = await event.data.arrayBuffer();
          websocket.current.send(data);
        }
      };

      mediaRecorder.current.start(1000); // Send data every 250ms
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (websocket.current) {
        websocket.current.close();
      }
      setIsRecording(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Rev.ai Speech-to-Text Demo</h2>
      <input
        type="text"
        placeholder="Enter Rev.ai Access Token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {isRecording ? (
          <button onClick={stopRecording} style={{ padding: '10px 20px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', cursor: 'pointer' }}>
            Stop Recording
          </button>
        ) : (
          <button onClick={startRecording} disabled={!accessToken} style={{ padding: '10px 20px', backgroundColor: accessToken ? '#1890ff' : '#d9d9d9', color: 'white', border: 'none', cursor: accessToken ? 'pointer' : 'not-allowed' }}>
            Start Recording
          </button>
        )}
      </div>
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', minHeight: '100px' }}>
        <p>{transcript || 'Transcript will appear here...'}</p>
      </div>
    </div>
  );
};

export default RevAiDemo;
