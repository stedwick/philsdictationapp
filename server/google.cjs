// Server-side code (Node.js with Express and ws)

const fs = require("fs");
const speech = require("@google-cloud/speech").v2;
const WebSocketServer = require("ws").Server;

const GOOGLE_PROJECT_ID = "clear-backup-437314-u1";

const speechClient = new speech.SpeechClient({
  keyFilename: "./server/clear-backup-437314-u1-ae87495c64d0.json",
});

const wss = new WebSocketServer({ port: 8080 });

// Function to create or update a phrase set
async function createOrUpdatePhraseSet() {
  const phraseSetId = "custom-vocabulary";
  const phraseSetName = `projects/${GOOGLE_PROJECT_ID}/locations/global/phraseSets/${phraseSetId}`;

  const phrases = [
    { value: "Fanita", boost: 20 },
    { value: "Syncta", boost: 20 },
    { value: "SentryPlus", boost: 20 },
    // Add or modify phrases here as needed
  ];

  try {
    // Try to update the existing phrase set
    const [updatedPhraseSet] = await speechClient.updatePhraseSet({
      phraseSet: {
        name: phraseSetName,
        phrases: phrases,
      },
      updateMask: {
        paths: ["phrases"],
      },
    });
    console.log(`Updated phrase set: ${updatedPhraseSet.name}`);
    return updatedPhraseSet.name;
  } catch (error) {
    throw error;
  }
}

// New function to create or update a custom class
async function createOrUpdateCustomClass() {
  const customClassId = "custom-vocabulary-class";
  const customClassName = `projects/${GOOGLE_PROJECT_ID}/locations/global/customClasses/${customClassId}`;

  const items = [
    { value: "Fanita" },
    { value: "Syncta" },
    { value: "SentryPlus" },
  ];

  try {
    // Try to update the existing custom class
    const [updatedCustomClass] = await speechClient.updateCustomClass({
      customClass: {
        name: customClassName,
        items: items,
      },
      updateMask: {
        paths: ["items"],
      },
    });
    console.log(`Updated custom class: ${updatedCustomClass.name}`);
    return updatedCustomClass.name;
  } catch (error) {
    if (error.code === 5) {
      // 5 is the error code for NOT_FOUND
      // If the custom class doesn't exist, create a new one
      const [newCustomClass] = await speechClient.createCustomClass({
        parent: `projects/${GOOGLE_PROJECT_ID}/locations/global`,
        customClassId: customClassId,
        customClass: {
          items: items,
        },
      });
      console.log(`Created new custom class: ${newCustomClass.name}`);
      return newCustomClass.name;
    } else {
      // If it's a different error, throw it
      throw error;
    }
  }
}

// New function to get the custom class
async function getCustomClass() {
  const customClassId = "custom-vocabulary-class";
  const customClassName = `projects/${GOOGLE_PROJECT_ID}/locations/global/customClasses/${customClassId}`;

  try {
    const [customClass] = await speechClient.getCustomClass({
      name: customClassName,
    });
    console.log(`Retrieved custom class: ${customClass.name}`);
    return customClass;
  } catch (error) {
    if (error.code === 5) {
      // 5 is the error code for NOT_FOUND
      console.log(`Custom class ${customClassId} not found.`);
      return null;
    } else {
      console.error("Error retrieving custom class:", error);
      throw error;
    }
  }
}

wss.on("connection", async function connection(ws) {
  console.log("New WebSocket connection");

  let recognizeStream;
  let phraseSetName;
  let customClassName;

  phraseSetName = `projects/${GOOGLE_PROJECT_ID}/locations/global/phraseSets/custom-vocabulary`;

  try {
    // await createOrUpdatePhraseSet();
    customClassName = await getCustomClass();
    if (!customClassName) {
      console.log("Custom class not found. Creating a new one...");
      // customClassName = await createOrUpdateCustomClass();
    }
  } catch (error) {
    console.error(
      "Error creating/updating phrase set or custom class:",
      JSON.stringify(error)
    );
  }

  function createStreamingRecognize() {
    const recognitionConfig = {
      autoDecodingConfig: {},
      languageCodes: ["en-US"],
      model: "latest_long",
      features: {
        enableAutomaticPunctuation: true,
        enableSpokenPunctuation: true,
        enableSpokenEmojis: true,
      },
      adaptation: {
        phraseSets: [{ phraseSet: phraseSetName }],
        customClasses: [customClassName],
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
        createStreamingRecognize();
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
