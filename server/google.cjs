// Server-side code (Node.js with Express and ws)

const fs = require("fs");
const speech = require("@google-cloud/speech").v2;
const WebSocketServer = require("ws").Server;

const GOOGLE_PROJECT_ID = "clear-backup-437314-u1";

const speechClient = new speech.SpeechClient({
  keyFilename: "./server/clear-backup-437314-u1-ae87495c64d0.json",
});

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("New WebSocket connection");

  let recognizeStream;

  function createStreamingRecognize() {
    const recognitionConfig = {
      autoDecodingConfig: {},
      languageCodes: ["en-US"],
      model: "long",
      features: {
        enableAutomaticPunctuation: true,
        enableSpokenPunctuation: true,
        enableSpokenEmojis: true,
      },
    };

    const streamingRecognitionConfig = {
      config: recognitionConfig,
      streamingFeatures: {
        interimResults: true,
      },
    };

    const streamingRecognizeRequest = {
      recognizer: `projects/${GOOGLE_PROJECT_ID}/locations/global/recognizers/_`,
      streamingConfig: streamingRecognitionConfig,
    };

    recognizeStream = speechClient
      ._streamingRecognize()
      .on("error", (error) => {
        console.error("Error from Google Speech API:", JSON.stringify(error));
        // Recreate the stream on error
        throw error;
        // createStreamingRecognize();
      })
      .on("data", (data) => {
        console.log(
          "Received data from Google Speech API:",
          JSON.stringify(data)
        );
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
      .on("end", () => {
        console.log("Google Speech API stream ended");
      });

    // Send the initial configuration
    recognizeStream.write(streamingRecognizeRequest);
    console.log("Initial configuration sent to Google Speech API");
  }

  createStreamingRecognize();

  ws.on("message", function incoming(message) {
    if (recognizeStream && !recognizeStream.destroyed) {
      recognizeStream.write({ audio: message });
      console.log("Audio data sent to Google Speech API");
    } else {
      console.log("Stream was destroyed, creating a new one");
      createStreamingRecognize();
      recognizeStream.write({ audio: message });
    }
  });

  ws.on("close", function close() {
    console.log("WebSocket connection closed");
    if (recognizeStream) {
      recognizeStream.destroy();
    }
  });
});

// Optional: Read and log the contents of the JSON key file
// fs.readFile(
//   "./server/clear-backup-437314-u1-ae87495c64d0.json",
//   "utf8",
//   function (_err, data) {
//     var json = JSON.parse(data);
//     console.log(json);
//   }
// );
