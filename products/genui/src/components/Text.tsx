export type TextProps = {
  content: string;
};

export function Text({ content }: TextProps) {
  return (
    <p
      style={{
        margin: 0,
        color: "var(--color-fg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {content}
    </p>
  );
}
