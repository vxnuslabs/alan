"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StripMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

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
      ctx.drawImage(img, 0, 0);

      // Exporting from canvas strips EXIF metadata automatically
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
            [02] STRIP METADATA
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">EXIF Stripper</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to strip metadata" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
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
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Format</span>
                <span className="text-sm font-medium uppercase">{file.type.split('/')[1]}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Parameters
              </h3>
              
              <div className="text-sm text-muted mb-2 leading-relaxed">
                This tool rewrites the image file entirely by drawing it to a local canvas and re-exporting. This removes all hidden EXIF data, GPS coordinates, and camera info.
              </div>

              <button
                onClick={processImage}
                disabled={processing}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Strip Metadata"}
              </button>
            </div>

            {result && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Result
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Output Size</span>
                    <span className={`text-sm font-medium ${result.size < file.size ? 'text-green-500' : 'text-red-500'}`}>
                      {formatSize(result.size)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Delta</span>
                    <span className="text-sm font-mono text-muted">
                      {result.size < file.size ? '-' : '+'}{Math.abs(100 - (result.size / file.size) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <a
                  href={result.url}
                  download={`alan-stripped-${file.name}`}
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
