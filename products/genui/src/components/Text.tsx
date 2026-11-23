export type TextProps = {
  content: string;
};

export function Text({ content }: TextProps) {
  return (
    <p
      style={{
        margin: 0,
        minWidth: 0,
        color: "var(--color-fg, inherit)",
        fontFamily: "var(--font-sans, inherit)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      }}
    >
      {content}
    </p>
  );
}
