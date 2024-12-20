class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0][0];
    if (input) {
      this.port.postMessage(input);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 