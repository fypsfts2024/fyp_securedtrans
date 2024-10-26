"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";

//props
interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard = ({ text }: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium">{text}</p>
      <button onClick={handleCopy} aria-label="Copy to clipboard">
        <Copy className="w-3 h-3 cursor-pointer" />
      </button>
      {copied && <span className="text-xs text-green-500">Copied!</span>}
    </div>
  );
};

export default CopyToClipboard;