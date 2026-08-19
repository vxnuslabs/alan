"use client";

import { useState, useEffect } from "react";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import Link from "next/link";
import { ArrowLeft, HardDrive, Calendar, Image as ImageIcon, Ruler } from "lucide-react";

interface Metadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width: number;
  height: number;
}

export default function MetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setPreview(objUrl);
      
      const img = new Image();
      img.onload = () => {
        setMetadata({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          width: img.width,
          height: img.height,
        });
      };
      img.src = objUrl;

      return () => URL.revokeObjectURL(objUrl);
    } else {
      setMetadata(null);
      setPreview(null);
    }
  }, [file]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
            [04] METADATA
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-accent">File Metadata</h2>
      </div>

      {!file ? (
        <ImageDropzone onFileSelect={setFile} label="Select image to view metadata" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main workspace */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface border border-border p-4 rounded-sm flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="Original" className="max-w-full max-h-[600px] object-contain" />}
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Filename</span>
                <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Type</span>
                <span className="text-sm font-medium uppercase">{file.type.split('/')[1] || "Unknown"}</span>
              </div>
            </div>
          </div>

          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6 bg-surface border border-border p-6 rounded-sm">
              <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest border-b border-border/50 pb-3">
                File Information
              </h3>
              
              {metadata ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <Ruler size={18} className="text-muted mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Dimensions</span>
                      <span className="text-sm font-medium">{metadata.width} × {metadata.height} px</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <HardDrive size={18} className="text-muted mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">File Size</span>
                      <span className="text-sm font-medium">{formatSize(metadata.size)} ({metadata.size.toLocaleString()} bytes)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <ImageIcon size={18} className="text-muted mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">MIME Type</span>
                      <span className="text-sm font-medium">{metadata.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Calendar size={18} className="text-muted mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Last Modified</span>
                      <span className="text-sm font-medium">{formatDate(metadata.lastModified)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted text-sm font-mono flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-border border-t-accent animate-spin mb-2" />
                  Reading metadata...
                </div>
              )}
            </div>
            
            <button 
              onClick={() => {
                setFile(null);
                setMetadata(null);
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
