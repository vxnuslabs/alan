"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FaviconPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ size: number, url: string, bytes: number }[] | null>(null);

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
    setResults(null);

    try {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objUrl;
      });

      const sizes = [16, 32, 180];
      const generatedResults: { size: number, url: string, bytes: number }[] = [];

      for (const size of sizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) throw new Error("Could not get canvas context");
        
        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, size, size);

        const blob = await new Promise<Blob | null>((resolve) => {
          // Favicons are typically PNG
          canvas.toBlob(resolve, "image/png");
        });

        if (blob) {
          generatedResults.push({
            size,
            url: URL.createObjectURL(blob),
            bytes: blob.size
          });
        }
      }

      setResults(generatedResults);
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
            [04] FAVICON
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Favicon Generator</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image for favicon" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main workspace */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />}
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
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Output Formats</label>
                <div className="text-sm text-muted">
                  Generates standard sizes: 16x16, 32x32, and 180x180 (Apple Touch Icon). Outputs will be in PNG format for best compatibility.
                </div>
              </div>

              <button
                onClick={processImage}
                disabled={processing}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Generate Favicons"}
              </button>
            </div>

            {results && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Results
                </h3>
                
                <div className="flex flex-col gap-4">
                  {results.map((res) => (
                    <div key={res.size} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">{res.size}x{res.size}</span>
                          <span className="text-sm font-medium text-accent">{formatSize(res.bytes)}</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={res.url} alt={`Favicon ${res.size}x${res.size}`} width={res.size > 32 ? 32 : res.size} height={res.size > 32 ? 32 : res.size} className="border border-border" />
                      </div>
                      <a
                        href={res.url}
                        download={`favicon-${res.size}x${res.size}.png`}
                        className="w-full text-center border border-accent text-accent py-2 rounded-sm hover:bg-surface-hover transition-colors text-sm font-medium"
                      >
                        Download {res.size}x{res.size}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => {
                setFile(null);
                setResults(null);
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
