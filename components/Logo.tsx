export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark className="h-7 w-7" />
      <span className="font-instrument text-[1rem] font-bold text-ink">
        split<span className="text-brand">upi</span>
      </span>
    </div>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-[7px] bg-brand text-white ${className}`}
      style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.25)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[60%] w-[60%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {/* a single node splitting into two — the "split" */}
        <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="19" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="19" cy="18.5" r="1.6" fill="currentColor" stroke="none" />
        <path d="M6.4 11.2 17.6 6" />
        <path d="M6.4 12.8 17.6 18" />
      </svg>
    </span>
  );
}
