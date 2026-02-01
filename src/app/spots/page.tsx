import { Suspense } from "react";
import SpotsClient from "./SpotsClient";

export default function SpotsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 text-zinc-900" />}>
      <SpotsClient />
    </Suspense>
  );
}
