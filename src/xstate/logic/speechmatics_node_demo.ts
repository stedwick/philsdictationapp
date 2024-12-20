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
  const jwt = "";
  // Get microphone stream
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });

  // Create AudioContext to process the stream
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  
  // Add AudioWorklet
  await audioContext.audioWorklet.addModule('/audio-processor.js');
  const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
  
  workletNode.port.onmessage = (event) => {
    client.sendAudio(event.data);
  };

  await client.start(jwt, {
    transcription_config: {
      language: 'en',
      diarization: 'none',
      additional_vocab: [
        {
          content: 'Syncta'
        },
        {
          content: 'SentryPlus'
        },
        {
          content: 'Nadeem'
        },
        {
          content: 'Fanita'
        },
        {
          content: 'Watts'
        },
        {
          content: 'Facundo'
        },
        {
          content: 'Ilein'
        },
        {
          content: 'Zach'
        }
      ],
      operating_point: 'enhanced',
      max_delay_mode: 'flexible',
      max_delay: 2,
      enable_partials: true,
      enable_entities: true,
      output_locale: 'en-US',
      transcript_filtering_config: {
        remove_disfluencies: true
      }
    },
    audio_format: {
      type: 'raw',
      encoding: 'pcm_f32le',
      sample_rate: audioContext.sampleRate,
    },
  });

  // Connect the audio nodes
  source.connect(workletNode);
  workletNode.connect(audioContext.destination);

  // Add cleanup function
  return () => {
    client.stopRecognition();
    stream.getTracks().forEach(track => track.stop());
    source.disconnect();
    workletNode.disconnect();
  };
}

// Example usage (replace 'YOUR_JWT_HERE' with actual JWT)
// transcribeMicrophoneRealTime(jwt).catch(console.error);
export default transcribeMicrophoneRealTime;