import { RealtimeClient } from '@speechmatics/real-time-client';

const client = new RealtimeClient();

let finalText = '';

client.addEventListener('receiveMessage', ({ data }) => {
    if (data.message === 'AddPartialTranscript') {
        const partialText = data.results
            .map((r) => r.alternatives?.[0].content)
            .join(' ');
        console.log(`\r${finalText} \x1b[3m${partialText}\x1b[0m`);
    } else if (data.message === 'AddTranscript') {
        const text = data.results.map((r) => r.alternatives?.[0].content).join(' ');
        finalText += text;
        console.log(`\r${finalText}`);
    } else if (data.message === 'EndOfTranscript') {
        console.log('\nEND\n');
    }
});

async function transcribeMicrophoneRealTime() {
    // curl -L -X POST "https://mp.speechmatics.com/v1/api_keys?type=rt"      -H "Content-Type: application/json"      -H "Authorization: Bearer $SPEECHMATICS_API_KEY"      -d '{"ttl": 86400, "client_ref": "USER123"}'
    const jwt = "todo"
    // Get microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    });

    // Create AudioContext to process the stream
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    await client.start(jwt, {
        transcription_config: {
            language: 'en',
            enable_partials: true,
        },
        audio_format: {
            type: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: audioContext.sampleRate,
        },
    });

    // Process audio data
    processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        client.sendAudio(inputData);
    };

    // Connect the audio nodes
    source.connect(processor);
    processor.connect(audioContext.destination);

    // Add cleanup function
    return () => {
        client.stopRecognition();
        stream.getTracks().forEach(track => track.stop());
        source.disconnect();
        processor.disconnect();
    };
}

// Example usage (replace 'YOUR_JWT_HERE' with actual JWT)
// transcribeMicrophoneRealTime(jwt).catch(console.error);
export default transcribeMicrophoneRealTime;