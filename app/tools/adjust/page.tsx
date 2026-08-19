"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdjustPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setPreview(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [file]);

  const processImage = async () => {
    if (!file) return;
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

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, file.type, 0.95);
      });

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

  const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors self-start border-b border-transparent hover:border-accent/30 pb-0.5">
          <ArrowLeft size={14} />
          Back to Tools
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            [03] ADJUST
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Image Adjustments</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to adjust" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Preview" style={{ filter: cssFilter }} className="max-w-full max-h-full object-contain transition-all duration-100" />}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Parameters
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Brightness</label>
                  <span className="text-xs font-mono text-muted">{brightness}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" step="1" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Contrast</label>
                  <span className="text-xs font-mono text-muted">{contrast}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" step="1" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Saturation</label>
                  <span className="text-xs font-mono text-muted">{saturation}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" step="1" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Blur</label>
                  <span className="text-xs font-mono text-muted">{blur}px</span>
                </div>
                <input 
                  type="range" min="0" max="20" step="1" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <button
                onClick={processImage}
                disabled={processing}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Apply Adjustments"}
              </button>
            </div>

            {result && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Result
                </h3>
                
                <a
                  href={result.url}
                  download={`alan-adjusted-${file.name}`}
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
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setBlur(0);
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
