// Server-side code (Node.js with Express and ws)

const fs = require("fs");
const {
  SpeechClient,
  StreamingRecognizeRequest,
} = require("@google-cloud/speech"); //.v2;
const { setTimeout } = require("timers/promises");

fs.readFile(
  "./server/clear-backup-437314-u1-ae87495c64d0.json",
  "utf8",
  function (_err, data) {
    var json = JSON.parse(data);
    console.log(json);
  }
);

const speechClient = new SpeechClient({
  keyFilename: "./server/clear-backup-437314-u1-ae87495c64d0.json",
});

const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ port: 8080 });

let recognizeStream;

const streamingConfig = {
  config: {
    encoding: "WEBM_OPUS",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  },
  interimResults: true,
};

wss.on("connection", function connection(ws) {
  console.log("New WebSocket connection");

  // Create a new recognizeStream for each connection
  recognizeStream = speechClient
    .streamingRecognize(streamingConfig)
    .on("data", (data) => {
      console.log("Received data from Google Speech API:", data);
      const result = data.results[0];
      if (result && result.alternatives[0]) {
        ws.send(
          JSON.stringify({
            transcription: result.alternatives[0].transcript,
            isFinal: result.isFinal,
          })
        );
      }
    })
    .on("error", (error) => {
      console.error("Error from Google Speech API:", error);
    })
    .on("end", () => {
      console.log("Google Speech API stream ended");
    });

  ws.on("message", function incoming(message) {
    if (recognizeStream.writable) {
      recognizeStream.write(message);
      console.log("Audio data sent to Google Speech API");
    } else {
      console.error("Stream not writable");
    }
  });

  ws.on("close", function close() {
    console.log("WebSocket connection closed");
    if (recognizeStream) {
      recognizeStream.end();
    }
  });
});
