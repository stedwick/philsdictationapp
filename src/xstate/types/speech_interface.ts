import type { RealtimeTranscriber } from "assemblyai";

type SpeechResultInterface = {
  isFinal: boolean;
  transcript: string;
}

type SpeechRecognitionInterface = {
  start: Function;
  stop: Function;
  WebSpeechAPI?: SpeechRecognition;
  AssemblyAI?: RealtimeTranscriber;
}

export type { SpeechResultInterface, SpeechRecognitionInterface };
