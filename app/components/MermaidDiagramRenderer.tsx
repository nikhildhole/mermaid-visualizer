"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function MermaidDiagramRenderer({
  chartInText,
}: {
  chartInText: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartInText) return;

    mermaid.initialize({ startOnLoad: false, theme: "neutral" });

    const renderMermaid = async () => {
      try {
        const { svg } = await mermaid.render("live-diagram", chartInText);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        if (ref.current)
          ref.current.innerHTML = `<pre class="text-red-500">Invalid Mermaid syntax</pre>`;
      }
    };

    renderMermaid();
  }, [chartInText]); // ✅ re-run on every edit

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div ref={ref} />
    </main>
  );
}
