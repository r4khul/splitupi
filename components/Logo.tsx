export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-1 select-none ${className}`}>
      <span className="text-[1.35rem] font-extrabold tracking-tight text-ink">
        split
      </span>
      <span
        className="text-[1.7rem] leading-none text-brand-bright"
        style={{ fontFamily: "var(--font-script)" }}
      >
        upi
      </span>
    </div>
  );
}
