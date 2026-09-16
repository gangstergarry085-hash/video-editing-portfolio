export default function TiltCard({
  children,
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative h-full transition-all duration-300 ease-out hover:-translate-y-1.5 ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* High performance subtle border illuminate on hover */}
      <div className="relative z-0 h-full w-full">{children}</div>
    </div>
  );
}
