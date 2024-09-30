import { fromPromise } from "xstate";
// import { isDesktop } from "../helpers/mobile";
import { RealtimeTranscriber } from 'assemblyai/streaming';
import * as RecordRTC from 'recordrtc';
import { SpeechRecognitionInterface } from "../types/speech_interface";

// https://recordrtc.org/
const rtcOpts: RecordRTC.Options = {
  type: 'audio',
  mimeType: 'audio/webm;codecs=pcm',
  recorderType: RecordRTC.StereoAudioRecorder,
  timeSlice: 250,
  desiredSampRate: 16000,
  numberOfAudioChannels: 1,
  bufferSize: 4096,
  audioBitsPerSecond: 128000,
}

export default fromPromise(async function () {
  // https://github.com/AssemblyAI-Community/realtime-react-example/blob/main/src/App.js
  const realtimeTranscriber = new RealtimeTranscriber({
    token: import.meta.env.VITE_ASSEMBLYAI_TOKEN,
    sampleRate: 16_000,
    wordBoost: ["fanita", "sentryplus"]
  });
  let stream: MediaStream;
  let recorder: RecordRTC;

  const startTranscription = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await realtimeTranscriber.connect();
    recorder = new RecordRTC(stream, {
      ...rtcOpts,
      ondataavailable: async (blob) => {
        const buffer = await blob.arrayBuffer();
        realtimeTranscriber?.sendAudio(buffer);
      },
    });
    recorder.startRecording();
  }

  const endTranscription = async () => {
    recorder.stopRecording();
    stream.getTracks().forEach(track => track.stop());
    await realtimeTranscriber.close();
  }

  const recognitionInterface: SpeechRecognitionInterface = {
    start: startTranscription,
    stop: endTranscription,
    AssemblyAI: realtimeTranscriber!,
  }
  return recognitionInterface;
});
