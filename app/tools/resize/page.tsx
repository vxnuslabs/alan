"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDim, setOriginalDim] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  useEffect(() => {
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setPreview(objUrl);
      
      const img = new Image();
      img.onload = () => {
        setOriginalDim({ w: img.width, h: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = objUrl;

      return () => URL.revokeObjectURL(objUrl);
    }
  }, [file]);

  const handleWidthChange = (val: string) => {
    const w = parseInt(val) || 0;
    setWidth(w);
    if (lockAspect && originalDim.w > 0) {
      setHeight(Math.round(w * (originalDim.h / originalDim.w)));
    }
  };

  const handleHeightChange = (val: string) => {
    const h = parseInt(val) || 0;
    setHeight(h);
    if (lockAspect && originalDim.h > 0) {
      setWidth(Math.round(h * (originalDim.w / originalDim.h)));
    }
  };

  const processImage = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setProcessing(true);
    setResult(null);

    try {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objUrl;
      });

      let blob: Blob | null = null;
      
      if (typeof OffscreenCanvas !== "undefined") {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          blob = await canvas.convertToBlob({ type: file.type });
        }
      } else {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, file.type);
          });
        }
      }

      if (blob) {
        setResult({
          url: URL.createObjectURL(blob),
          size: blob.size,
        });
      }
      
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error(e);
      alert("Failed to process image");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors self-start border-b border-transparent hover:border-accent/30 pb-0.5">
          <ArrowLeft size={14} />
          Back to Tools
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            [03] RESIZE
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Scale Dimensions</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to resize" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />}
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Original Dimensions</span>
                <span className="text-sm font-mono">{originalDim.w} × {originalDim.h}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Target Dimensions</span>
                <span className="text-sm font-mono text-accent">{width} × {height}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Parameters
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Width (px)</label>
                  <input 
                    type="number" 
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full bg-base border border-border px-3 py-2 text-sm text-accent focus:border-accent focus:outline-none rounded-sm transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Height (px)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full bg-base border border-border px-3 py-2 text-sm text-accent focus:border-accent focus:outline-none rounded-sm transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2 group w-fit">
                  <input 
                    type="checkbox" 
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-accent transition-colors">Lock Aspect Ratio</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Quick Scale</label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 200].map(pct => (
                    <button
                      key={pct}
                      onClick={() => {
                        setWidth(Math.round(originalDim.w * (pct / 100)));
                        setHeight(Math.round(originalDim.h * (pct / 100)));
                      }}
                      className="py-1.5 bg-transparent border border-border text-muted hover:border-muted hover:text-accent font-mono text-[10px] rounded-sm transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={processImage}
                disabled={processing || width <= 0 || height <= 0}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Resize"}
              </button>
            </div>

            {result && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Result
                </h3>
                <a
                  href={result.url}
                  download={`alan-resized-${file.name}`}
                  className="w-full text-center border border-accent text-accent py-2 rounded-sm hover:bg-surface-hover transition-colors text-sm font-medium mt-2"
                >
                  Download Output
                </a>
              </div>
            )}
            
            <button 
              onClick={() => {
                setFile(null);
                setResult(null);
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
