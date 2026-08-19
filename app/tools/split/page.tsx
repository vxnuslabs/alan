"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Format = "image/png" | "image/jpeg" | "image/webp";
type Direction = "horizontal" | "vertical";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("horizontal");
  const [outFormat, setOutFormat] = useState<Format>("image/png");
  const [quality, setQuality] = useState(0.8);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url1: string; size1: number; url2: string; size2: number } | null>(null);

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

      const canvas1 = document.createElement("canvas");
      const ctx1 = canvas1.getContext("2d");
      const canvas2 = document.createElement("canvas");
      const ctx2 = canvas2.getContext("2d");
      
      if (!ctx1 || !ctx2) throw new Error("Could not get canvas context");

      if (direction === "horizontal") {
        // Split left and right
        const halfWidth = Math.floor(img.width / 2);
        canvas1.width = halfWidth;
        canvas1.height = img.height;
        ctx1.drawImage(img, 0, 0, halfWidth, img.height, 0, 0, halfWidth, img.height);
        
        canvas2.width = img.width - halfWidth;
        canvas2.height = img.height;
        ctx2.drawImage(img, halfWidth, 0, img.width - halfWidth, img.height, 0, 0, img.width - halfWidth, img.height);
      } else {
        // Split top and bottom
        const halfHeight = Math.floor(img.height / 2);
        canvas1.width = img.width;
        canvas1.height = halfHeight;
        ctx1.drawImage(img, 0, 0, img.width, halfHeight, 0, 0, img.width, halfHeight);
        
        canvas2.width = img.width;
        canvas2.height = img.height - halfHeight;
        ctx2.drawImage(img, 0, halfHeight, img.width, img.height - halfHeight, 0, 0, img.width, img.height - halfHeight);
      }

      const [blob1, blob2] = await Promise.all([
        new Promise<Blob | null>((resolve) => canvas1.toBlob(resolve, outFormat, quality)),
        new Promise<Blob | null>((resolve) => canvas2.toBlob(resolve, outFormat, quality))
      ]);

      if (blob1 && blob2) {
        setResult({
          url1: URL.createObjectURL(blob1),
          size1: blob1.size,
          url2: URL.createObjectURL(blob2),
          size2: blob2.size,
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            [03] SPLIT
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Image Splitter</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to split" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main workspace */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />}
              
              {/* Overlay line to show split */}
              {preview && (
                <div 
                  className={`absolute bg-accent/50 pointer-events-none
                    ${direction === 'horizontal' 
                      ? 'w-[2px] h-full left-1/2 top-0 -translate-x-1/2' 
                      : 'h-[2px] w-full top-1/2 left-0 -translate-y-1/2'
                    }
                  `} 
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Original Size</span>
                <span className="text-sm font-medium">{formatSize(file.size)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Original Format</span>
                <span className="text-sm font-medium uppercase">{file.type.split('/')[1]}</span>
              </div>
            </div>
          </div>

          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Parameters
              </h3>

              <div className="flex flex-col gap-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['horizontal', 'vertical'] as const).map(dir => (
                    <button
                      key={dir}
                      onClick={() => setDirection(dir)}
                      className={`py-2 text-xs uppercase rounded-sm border transition-colors ${
                        direction === dir 
                          ? 'bg-accent text-base border-accent' 
                          : 'bg-transparent text-muted border-border hover:border-muted'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['image/png', 'image/jpeg', 'image/webp'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutFormat(fmt)}
                      className={`py-2 text-xs uppercase rounded-sm border transition-colors ${
                        outFormat === fmt 
                          ? 'bg-accent text-base border-accent' 
                          : 'bg-transparent text-muted border-border hover:border-muted'
                      }`}
                    >
                      {fmt.split('/')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {outFormat !== 'image/png' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Quality</label>
                    <span className="text-xs font-mono text-muted">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>
              )}

              <button
                onClick={processImage}
                disabled={processing}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Split Image"}
              </button>
            </div>

            {result && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Result
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Part 1 Size</span>
                    <span className="text-sm font-medium text-accent">
                      {formatSize(result.size1)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Part 2 Size</span>
                    <span className="text-sm font-medium text-accent">
                      {formatSize(result.size2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <a
                    href={result.url1}
                    download={`alan-${file.name.split('.')[0]}-part1.${outFormat.split('/')[1]}`}
                    className="w-full text-center border border-accent text-accent py-2 rounded-sm hover:bg-surface-hover transition-colors text-sm font-medium"
                  >
                    Download {direction === 'horizontal' ? 'Left' : 'Top'} Half
                  </a>
                  <a
                    href={result.url2}
                    download={`alan-${file.name.split('.')[0]}-part2.${outFormat.split('/')[1]}`}
                    className="w-full text-center border border-accent text-accent py-2 rounded-sm hover:bg-surface-hover transition-colors text-sm font-medium"
                  >
                    Download {direction === 'horizontal' ? 'Right' : 'Bottom'} Half
                  </a>
                </div>
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
