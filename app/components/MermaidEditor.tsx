"use client";

import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";

export default function MermaidEditor({
  chartInText,
  onChange,
}: {
  chartInText: string;
  onChange: (val: string) => void;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isLocalChange = useRef(false);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleChange = (val: string | undefined) => {
    isLocalChange.current = true;
    onChange(val || "");
  };

  // Update editor value from external source (WebSocket) without losing cursor position
  useEffect(() => {
    if (editorRef.current && !isLocalChange.current) {
      const editor = editorRef.current;
      const currentValue = editor.getValue();

      if (currentValue !== chartInText) {
        const position = editor.getPosition();
        editor.setValue(chartInText);
        if (position) {
          editor.setPosition(position);
        }
      }
    }
    isLocalChange.current = false;
  }, [chartInText]);

  return (
    <Editor
      height="100vh"
      defaultLanguage="markdown"
      defaultValue={chartInText}
      onMount={handleEditorDidMount}
      onChange={handleChange}
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
