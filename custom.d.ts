// custom.d.ts
/// <reference types="next-auth" />

import { DefaultSession } from "next-auth";

declare module "*.css";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// ==================== Speech Recognition API Types ====================
// Define all Speech Recognition interfaces globally

declare global {
  // Speech Recognition Alternative (transcript + confidence)
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  // Speech Recognition Result (contains alternatives)
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    readonly [index: number]: SpeechRecognitionAlternative;
  }

  // Speech Recognition Result List (contains results)
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    readonly [index: number]: SpeechRecognitionResult;
  }

  // Speech Recognition Event (triggered when speech is recognized)
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
  }

  // Speech Recognition Error Event
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: 
      | 'no-speech'
      | 'aborted'
      | 'audio-capture'
      | 'network'
      | 'not-allowed'
      | 'service-not-allowed'
      | 'bad-grammar'
      | 'language-not-supported';
    readonly message: string;
  }

  // Main Speech Recognition Interface
  interface SpeechRecognition extends EventTarget {
    // Properties
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;

    // Event Handlers
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;

    // Methods
    start(): void;
    stop(): void;
    abort(): void;
  }

  // Speech Recognition Constructor
  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  // Webkit prefixed version (for Safari)
  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  // Extend Window interface
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export {};
