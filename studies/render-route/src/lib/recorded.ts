import { readRecording, type DeepseekRecording } from "./recording";
import { recordingData } from "./recording-data";

export const deepseekRecording: DeepseekRecording = readRecording(recordingData);
