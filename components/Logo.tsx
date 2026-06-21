export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/splitupi-logo.png"
        alt="splitupi logo"
        className="h-7 w-7 rounded-[7px] object-contain"
      />
      <span className="font-instrument text-[1rem] font-bold text-ink">
        split<span className="text-brand">UPI</span>
      </span>
    </div>
  );
}
