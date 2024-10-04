// Client-side code (browser)

import RecordRTC from "recordrtc";

let socket: WebSocket;
let mediaRecorder: MediaRecorder;
let recorder: RecordRTC;
let stream: MediaStream;

function startStreaming() {
  // Create WebSocket connection
  socket = new WebSocket("ws://localhost:8080");

  socket.onopen = function (event) {
    console.log("WebSocket connection opened");
    console.log(event);
    startRecording();
  };

  socket.onmessage = function (event) {
    const result = JSON.parse(event.data);
    console.log(
      "Transcription:",
      result.transcription,
      "Is Final:",
      result.isFinal
    );
    // Here you can update your UI with the transcription
  };

  socket.onerror = function (error) {
    console.error("WebSocket Error:", error);
  };

  socket.onclose = function (_event) {
    console.log("WebSocket connection closed");
  };
}

function startRecording() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((newStream) => {
      stream = newStream;
      mediaRecorder = new MediaRecorder(newStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(await event.data.arrayBuffer());
        }
      };

      mediaRecorder.start(1000); // Send audio data every 1000ms (1 second)
    })
    .catch((error) => console.error("Error accessing microphone:", error));
}

function stopStreaming() {
  if (recorder) {
    stream.getTracks().forEach((track) => track.stop());
    recorder.stopRecording();
    recorder.destroy();
  }
  if (typeof mediaRecorder != "undefined") {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }
  if (socket) {
    socket.close();
  }
}

export { startStreaming, stopStreaming };
