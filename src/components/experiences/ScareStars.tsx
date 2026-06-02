type Props = { level: number; className?: string };

export default function ScareStars({ level, className }: Props) {
  return (
    <span className={className} aria-label={`怖さ ${level} / 5`}>
      {"★".repeat(level)}
      <span className="opacity-30">{"★".repeat(5 - level)}</span>
    </span>
  );
}
