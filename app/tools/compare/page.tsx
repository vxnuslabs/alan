"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ComparePage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);

  const [opacity, setOpacity] = useState(50);
  const [blendMode, setBlendMode] = useState<string>("normal");

  useEffect(() => {
    if (file1) {
      const objUrl = URL.createObjectURL(file1);
      setPreview1(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [file1]);

  useEffect(() => {
    if (file2) {
      const objUrl = URL.createObjectURL(file2);
      setPreview2(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [file2]);

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors self-start border-b border-transparent hover:border-accent/30 pb-0.5">
          <ArrowLeft size={14} />
          Back to Tools
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            [04] COMPARE
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Image Comparator</h2>
      </div>

      {(!file1 || !file2) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest">Image 1 (Bottom Layer)</h3>
            {!file1 ? (
              <ImageDropzone onFileSelect={setFile1} label="Select base image" />
            ) : (
              <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center h-[300px] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview1 && <img src={preview1} alt="Preview 1" className="max-w-full max-h-full object-contain" />}
                <button onClick={() => setFile1(null)} className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-sm">Change</button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest">Image 2 (Top Layer)</h3>
            {!file2 ? (
              <ImageDropzone onFileSelect={setFile2} label="Select image to compare" />
            ) : (
              <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center h-[300px] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview2 && <img src={preview2} alt="Preview 2" className="max-w-full max-h-full object-contain" />}
                <button onClick={() => setFile2(null)} className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-sm">Change</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[500px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview1 && <img src={preview1} alt="Image 1" className="absolute inset-0 w-full h-full object-contain p-4" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview2 && (
                <img 
                  src={preview2} 
                  alt="Image 2" 
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity" 
                  style={{ opacity: opacity / 100, mixBlendMode: blendMode as any }} 
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Parameters
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Top Layer Opacity</label>
                  <span className="text-xs font-mono text-muted">{opacity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Blend Mode</label>
                <select 
                  value={blendMode} 
                  onChange={(e) => setBlendMode(e.target.value)}
                  className="bg-base border border-border text-sm p-2 rounded-sm text-muted focus:border-accent focus:text-accent outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                  <option value="difference">Difference</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                setFile1(null);
                setFile2(null);
                setOpacity(50);
                setBlendMode("normal");
              }}
              className="text-xs text-muted hover:text-accent font-mono uppercase tracking-widest w-full text-center transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
