// This example transcribes a file in NodeJS.
// For examples in other environments, see the link above
import fs from 'node:fs';
import { RealtimeClient } from '@speechmatics/real-time-client';

const client = new RealtimeClient();

async function fetchJWT(): Promise<string> {
  const apiKey = YOUR_API_KEY;

  const resp = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      ttl: 3600,
    }),
  });
  if (!resp.ok) {
    throw new Error('Bad response from API', { cause: resp });
  }
  return (await resp.json()).key_value;
}

let finalText = '';

client.addEventListener('receiveMessage', ({ data }) => {
  if (data.message === 'AddPartialTranscript') {
    const partialText = data.results
      .map((r) => r.alternatives?.[0].content)
      .join(' ');
    process.stdout.write(`\r${finalText} \x1b[3m${partialText}\x1b[0m`);
  } else if (data.message === 'AddTranscript') {
    const text = data.results.map((r) => r.alternatives?.[0].content).join(' ');
    finalText += text;
    process.stdout.write(`\r${finalText}`);
  } else if (data.message === 'EndOfTranscript') {
    process.stdout.write('\n');
    process.exit(0);
  }
});

async function transcribeFileRealTime() {
  const jwt = await fetchJWT();
  const PATH_TO_FILE = path.join(__dirname, './example.wav'),

  const fileStream = fs.createReadStream(
    PATH_TO_FILE,
    {
      highWaterMark: 4096, //avoid sending faster than realtime
    },
  );

  await client.start(jwt, {
    transcription_config: {
      language: 'en',
      enable_partials: true,
    },
  });

  //send audio data from file stream
  fileStream.on('data', (sample) => {
    client.sendAudio(sample);
  });

  //end the session
  fileStream.on('end', () => {
    client.stopRecognition();
  });
}

transcribeFileRealTime();