"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const TOOLS = [
  { id: "01", name: "Convert", desc: "Change image format", href: "/tools/convert" },
  { id: "02", name: "Compress", desc: "Reduce file size", href: "/tools/compress" },
  { id: "03", name: "Resize", desc: "Change dimensions", href: "/tools/resize" },
  { id: "04", name: "Crop", desc: "Adjust aspect ratio", href: "/tools/crop" },
  { id: "05", name: "Color", desc: "Extract palette", href: "/tools/color" },
  { id: "06", name: "Metadata", desc: "Inspect EXIF", href: "/tools/metadata" },
  { id: "07", name: "Strip", desc: "Remove metadata", href: "/tools/strip-metadata" },
  { id: "08", name: "Adjust", desc: "Basic corrections", href: "/tools/adjust" },
  { id: "09", name: "Compare", desc: "Diff two images", href: "/tools/compare" },
  { id: "10", name: "Join", desc: "Combine images", href: "/tools/join" },
  { id: "11", name: "Split", desc: "Divide images", href: "/tools/split" },
  { id: "12", name: "Favicon", desc: "Generate icons", href: "/tools/favicon" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-12 animate-fade-in">
      
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            TOOL_REGISTRY / IMAGE
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-4">
          {TOOLS.map((tool) => (
            <Link
              href={tool.href}
              key={tool.id}
              className="group py-5 border-b border-border hover:border-accent/30 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                    [{tool.id}]
                  </span>
                  <h3 className="text-xl text-accent group-hover:text-accent transition-all font-medium">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-sm text-muted">
                  {tool.desc}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted/70 group-hover:text-accent transition-colors pt-2">
                <span className="hidden md:inline">Open tool</span>
                <ArrowUpRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            SYS_LOG / PRIVACY
          </span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        
        <div className="flex flex-col gap-4 max-w-2xl mt-4">
          <h3 className="text-xl text-accent font-medium">Local Processing</h3>
          <p className="text-sm text-muted leading-relaxed">
            Images are processed entirely in your browser. Alan does not require an upload server, API, or database. Your data never leaves your device.
          </p>
        </div>
      </section>

    </div>
  );
}
