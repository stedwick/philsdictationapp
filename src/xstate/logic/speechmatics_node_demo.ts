import { RealtimeClient } from '@speechmatics/real-time-client';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzbWlzc3VlciIsImF1ZCI6WyJldSIsImJhdGNoLWV1LTEiLCJldS0xIl0sImV4cCI6MTczNDc0MDExNCwibmJmIjoxNzM0NjUwMTE0LCJpYXQiOjE3MzQ2NTM3MTQsImNvbnRyYWN0X2lkIjoiMTAyMTgxIiwicHJvamVjdF9pZCI6IjEwMjE4MSIsInJ1bnRpbWVfaWQiOiIyMTAyNTQ4IiwicHJvZHVjdCI6ImJhdGNoIiwiYWNjb3VudF90eXBlIjoiZnJlZSIsImNsaWVudF9yZWYiOiJVU0VSMTIzIn0.o-lwTt8Exh7fRBnfonAOdPQAAtzBTaV-kc0-j8S-IHxtyLZn9D80XTspBJRH5vU0jGryv0CaPFlIPsbUibW_9wHdlam2MYWvXC3Y8Y-BS7sYIVY1zbdLtDupMrrhLCMhWHcCwF7gQTlfiyUCs9inq5XqLvELEWr-CFXCn-PovSwtGZfwI-0OUa2FrAyiaJog1bORD6jk2o4q6WdPs50QODuCtCsoiTuZzi5oVpEkLNEzCfa46OmboVZTS09I-pUw6t2QbAiYsOsL8TftiBO8jznK9XlAaEvqZSexUCzvgKpFGiXdrj_bHy_BPbwGam6c4Klmbpix6Ca-Ejork5blofkycGJS7CQVZ2f3PPwtp-eKVW_CPfmsz263XUlcXsJw3Diw5BDjPQUrCwQh6mahKbfeVf89Ux927-KLwMV-WLBKAS7K_LOdVTlPH_OuONLqbM1-92-Uk42p75zCf7WX6RJ9JhKMozLJSKLhFIZ6OW5p4BI0AjUZQHfGE1AknA29"
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
    console.log('\n');
  }
});

async function transcribeMicrophoneRealTime(jwt: string) {
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
transcribeMicrophoneRealTime(jwt).catch(console.error);
