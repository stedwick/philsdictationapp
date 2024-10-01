// Server-side code (Node.js with Express and ws)

const fs = require('fs');
const { SpeechClient, StreamingRecognizeRequest } = require('@google-cloud/speech'); //.v2;
const { setTimeout } = require('timers/promises');

fs.readFile('./server/clear-backup-437314-u1-ae87495c64d0.json', 'utf8', function (_err, data) {
  var json = JSON.parse(data);
  console.log(json);
});

const speechClient = new SpeechClient({ keyFilename: './server/clear-backup-437314-u1-ae87495c64d0.json' });

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 8080 });

const streamingConfig = {
  config: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  },
  interimResults: true,
};
const recognizeStream = speechClient.streamingRecognize(streamingConfig)
  .on('data', (data) => {
    console.log(data);
  })
  .on('error', console.error);

console.log('before settimeout');
try {
  global.setTimeout(function () {
    console.log('inside settimeout');
    // recognizeStream.write("aaaastreamingConfig"); // .message);
  }, 3000);
} catch (error) {
  console.log(error);
}
console.log('after settimeout');

wss.on('connection', function connection(ws) {
  // recognizeStream.on('data', (data) => {
  //   console.log(data);
  //   const result = data.results[0];
  //   if (result.alternatives[0]) {
  //     ws.send(JSON.stringify({
  //       transcription: result.alternatives[0].transcript,
  //       isFinal: result.isFinal,
  //     }));
  //   }
  // });

  // ws.on('message', function message(data) {
  // console.log('received: %s', data);
  // console.log('received: %s', data);
  // });

  // ws.send('something');

  ws.on('message', function incoming(message) {
    // ws.send(JSON.stringify({
    //   transcription: "woowy!",
    //   isFinal: true,
    // }));

    if (recognizeStream.writable) {
      recognizeStream.write(message); // .message);
      console.log('written');
    }
    else { throw new Error('Stream not writable'); }
  });

  ws.on('close', function close() {
    console.log('WebSocket connection closed');
    if (recognizeStream) {
      // recognizeStream.end();
    }
  });
});
