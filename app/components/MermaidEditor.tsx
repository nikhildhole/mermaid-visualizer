"use client";

import Editor from "@monaco-editor/react";

export default function MermaidEditor({
  chartInText,
  onChange,
}: {
  chartInText: string;
  onChange: (val: string) => void;
}) {
  return (
    <Editor
      height="100vh"
      defaultLanguage="markdown"
      value={chartInText}
      onChange={(val) => onChange(val || "")}
      options={{
        minimap: { enabled: false },
        fontSize: 13,            // smaller font
        lineHeight: 18,          // tighter vertical spacing
        lineNumbersMinChars: 2,  // narrower gutter
        padding: { top: 8 },
        scrollbar: {
          verticalScrollbarSize: 6,   // thinner vertical scrollbar
          horizontalScrollbarSize: 6, // thinner horizontal scrollbar
          alwaysConsumeMouseWheel: false,
        },
      }}
    />
  );
}
