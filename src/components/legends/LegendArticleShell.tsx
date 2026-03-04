import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function LegendArticleShell({ children }: Props) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-12">
        {children}
      </div>
    </div>
  );
}
