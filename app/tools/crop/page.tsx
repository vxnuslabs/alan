"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AspectRatio = "1:1" | "4:3" | "16:9" | "free";

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; width: number; height: number } | null>(null);

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
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;

      if (ratio !== "free") {
        const [w, h] = ratio.split(":").map(Number);
        const targetAspect = w / h;
        const imgAspect = img.width / img.height;

        if (imgAspect > targetAspect) {
          sHeight = img.height;
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sWidth = img.width;
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }
      } else {
        // Just crop 80% from center as a default for "free" in this simple implementation
        sWidth = img.width * 0.8;
        sHeight = img.height * 0.8;
        sx = (img.width - sWidth) / 2;
        sy = (img.height - sHeight) / 2;
      }

      canvas.width = sWidth;
      canvas.height = sHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, file.type, 1.0);
      });

      if (blob) {
        setResult({
          url: URL.createObjectURL(blob),
          width: Math.round(sWidth),
          height: Math.round(sHeight),
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
            [02] CROP
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Image Cropper</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to crop" />
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
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Original Aspect</span>
                <span className="text-sm font-medium">Auto</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Target Aspect</span>
                <span className="text-sm font-medium">{ratio === "free" ? "80% Center" : ratio}</span>
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
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['1:1', '4:3', '16:9', 'free'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`py-2 text-xs uppercase rounded-sm border transition-colors ${
                        ratio === r 
                          ? 'bg-accent text-base border-accent' 
                          : 'bg-transparent text-muted border-border hover:border-muted'
                      }`}
                    >
                      {r === 'free' ? 'Center 80%' : r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={processImage}
                disabled={processing}
                className="w-full bg-accent text-base font-medium py-3 rounded-sm hover:bg-accent/90 disabled:opacity-50 transition-colors mt-2 text-sm"
              >
                {processing ? "Processing..." : "Crop Center"}
              </button>
            </div>

            {result && (
              <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm animate-fade-in">
                <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                  Result
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Output Width</span>
                    <span className="text-sm font-medium">
                      {result.width}px
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Output Height</span>
                    <span className="text-sm font-medium">
                      {result.height}px
                    </span>
                  </div>
                </div>
                
                <a
                  href={result.url}
                  download={`alan-${file.name.split('.')[0]}-crop.${file.type.split('/')[1]}`}
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
