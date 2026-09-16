export default function AudioVisualizer({ className = '', bars = 14, label = '48kHz · 24-BIT' }) {
  const animClasses = ['eq-anim-1', 'eq-anim-2', 'eq-anim-3', 'eq-anim-4'];

  return (
    <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-full glass border border-border/80 ${className}`}>
      {/* Hardware-accelerated equalizer bars */}
      <div className="flex items-end gap-1 h-3.5 w-auto">
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={`w-0.5 h-full rounded-full bg-accent eq-bar-gpu ${animClasses[i % animClasses.length]}`}
            style={{
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
            }}
          />
        ))}
      </div>

      {label && (
        <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
