"use client";

import { useState, useEffect, useRef } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ColorPickerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (file) {
      const objUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
      img.src = objUrl;

      return () => {
        URL.revokeObjectURL(objUrl);
        imageRef.current = null;
      };
    } else {
      setColor(null);
    }
  }, [file]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    setColor({ hex, rgb });
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
            [03] COLOR
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">Color Picker</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to pick color" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main workspace */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full max-h-[600px] object-contain"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-border">
              <p className="text-sm text-muted font-mono">
                Click anywhere on the image above to extract the color of a pixel.
              </p>
            </div>
          </div>

          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                Current Color
              </h3>
              
              {color ? (
                <div className="flex flex-col gap-6">
                  <div 
                    className="w-full h-24 rounded-sm border border-border shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">HEX Code</span>
                      <div className="flex items-center justify-between bg-base border border-border p-3 rounded-sm">
                        <span className="font-mono text-sm">{color.hex}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(color.hex)}
                          className="text-xs text-muted hover:text-accent font-medium transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">RGB Value</span>
                      <div className="flex items-center justify-between bg-base border border-border p-3 rounded-sm">
                        <span className="font-mono text-sm">{color.rgb}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(color.rgb)}
                          className="text-xs text-muted hover:text-accent font-medium transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted text-sm font-mono flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-border animate-pulse mb-2" />
                  No color selected
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                setFile(null);
                setColor(null);
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
