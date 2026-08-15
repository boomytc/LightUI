declare module "*.json" {
  const value: {
    voices: Record<string, string>;
    prompts: Record<string, { text: string; audio: string }>;
    films: Record<string, Record<string, { id: string; text: string }[]>>;
  };
  export default value;
}
