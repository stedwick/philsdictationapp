import { fromPromise } from "xstate";
// import { isDesktop } from "../helpers/mobile";
import { RealtimeTranscriber } from 'assemblyai/streaming';
import * as RecordRTC from 'recordrtc';
import { SpeechRecognitionInterface } from "../types/speech_interface";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
export default fromPromise(async function () {
  const realtimeTranscriber = new RealtimeTranscriber({
    token: import.meta.env.VITE_ASSEMBLYAI_TOKEN,
    sampleRate: 16_000,
  });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const recorder = new RecordRTC(stream, {
    type: 'audio',
    mimeType: 'audio/webm;codecs=pcm',
    recorderType: RecordRTC.StereoAudioRecorder,
    timeSlice: 250,
    desiredSampRate: 16000,
    numberOfAudioChannels: 1,
    bufferSize: 4096,
    audioBitsPerSecond: 128000,
    ondataavailable: async (blob) => {
      const buffer = await blob.arrayBuffer();
      realtimeTranscriber.sendAudio(buffer);
    },
  });

  const startTranscription = async () => {
    await realtimeTranscriber.connect();
    recorder.startRecording();
  }

  const endTranscription = async () => {
    await realtimeTranscriber.close();
    recorder.pauseRecording();
  }

  const recognitionInterface: SpeechRecognitionInterface = {
    start: startTranscription,
    stop: endTranscription,
    AssemblyAI: realtimeTranscriber,
  }
  return recognitionInterface;
});
