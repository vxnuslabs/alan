"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

type Format = "image/png" | "image/jpeg" | "image/webp";
type Direction = "horizontal" | "vertical";

export default function JoinPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>("horizontal");
  const [outFormat, setOutFormat] = useState<Format>("image/webp");
  const [quality, setQuality] = useState(0.8);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const processImage = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setResult(null);

    try {
      const imgs = await Promise.all(
        files.map((file, i) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = previews[i];
          });
        })
      );

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      if (direction === "horizontal") {
        const totalWidth = imgs.reduce((sum, img) => sum + img.width, 0);
        const maxHeight = Math.max(...imgs.map((img) => img.height));
        canvas.width = totalWidth;
        canvas.height = maxHeight;

        let currentX = 0;
        imgs.forEach((img) => {
          ctx.drawImage(img, currentX, 0);
          currentX += img.width;
        });
      } else {
        const maxWidth = Math.max(...imgs.map((img) => img.width));
        const totalHeight = imgs.reduce((sum, img) => sum + img.height, 0);
        canvas.width = maxWidth;
        canvas.height = totalHeight;

        let currentY = 0;
        imgs.forEach((img) => {
          ctx.drawImage(img, 0, currentY);
          currentY += img.height;
        });
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outFormat, quality);
      });

      if (blob) {
        setResult({
          url: URL.createObjectURL(blob),
          size: blob.size,
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process images");
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
            [02] JOIN
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Image Joiner</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface border border-border p-4 rounded-sm flex flex-col gap-4 min-h-[400px] relative overflow-hidden">
            {previews.length > 0 ? (
              <div className={`flex flex-1 gap-2 ${direction === 'horizontal' ? 'flex-row overflow-x-auto' : 'flex-col overflow-y-auto'} items-center justify-center p-4`}>
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={`Preview ${idx + 1}`} className="max-w-[200px] max-h-[200px] object-contain border border-border" />
                    <button 
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 bg-surface border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:border-accent text-muted hover:text-accent"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
                Add at least two images to join them
              </div>
            )}
            
            <div className="mt-auto">
              <ImageDropzone onFileSelect={(file) => setFiles(prev => [...prev, file])} label="Drop an image to add" />
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Total Images</span>
                <span className="text-sm font-medium">{files.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Est. Output Format</span>
                <span className="text-sm font-medium uppercase">{outFormat.split('/')[1]}</span>
              </div>
            </div>
          )}
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
              disabled={processing || files.length < 2}
              className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
            >
              {processing ? "Processing..." : "Join Images"}
            </button>
          </div>

          {result && (
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Result
              </h3>
              
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Output Size</span>
                <span className="text-sm font-medium text-accent">
                  {formatSize(result.size)}
                </span>
              </div>
              
              <a
                href={result.url}
                download={`alan-joined.${outFormat.split('/')[1]}`}
                className="w-full text-center border border-accent text-accent py-2 rounded-sm hover:bg-surface-hover transition-colors text-sm font-medium mt-2"
              >
                Download Output
              </a>
            </div>
          )}
          
          <button 
            onClick={() => {
              setFiles([]);
              setResult(null);
            }}
            className="text-xs text-muted hover:text-accent font-mono uppercase tracking-widest w-full text-center transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
