"use client";

import dynamic from "next/dynamic";

const SplitBuilderDynamic = dynamic(
  () => import("./SplitBuilder").then((m) => m.SplitBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="card-glass animate-pulse rounded-[24px] h-[420px] w-full" />
    ),
  },
);

export function SplitBuilderClient() {
  return <SplitBuilderDynamic />;
}
