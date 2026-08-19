"use client";

import React, { useState, useRef, useCallback } from "react";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}

export function ImageDropzone({ onFileSelect, accept = "image/*", label = "Drop image here" }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border border-border p-16 text-center transition-all cursor-pointer rounded-sm flex flex-col items-center justify-center gap-4
        ${isDragging ? "bg-surface-hover border-accent/50" : "bg-surface hover:bg-surface-hover"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <div className="text-accent font-medium text-lg">
        {label}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted border border-border px-3 py-1.5 rounded-sm">
        Select File
      </div>
    </div>
  );
}
