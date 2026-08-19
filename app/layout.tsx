import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const space = Space_Mono({
  variable: "--font-space",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alan — Local Image Tools",
  description: "Lightweight image conversion, compression, resizing, color extraction and more. Everything runs locally in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} antialiased`}>
      <body className="min-h-screen bg-base text-accent font-sans selection:bg-accent selection:text-base flex flex-col">
        <header className="border-b border-border p-6 md:p-8 flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-medium tracking-tight text-accent leading-none">Alan</h1>
            <p className="text-sm text-muted">Image processing, locally.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-muted uppercase tracking-widest font-mono">Status</div>
            <div className="text-accent flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-accent rounded-full block animate-pulse"></span>
              Client-Side
            </div>
          </div>
        </header>
        <main className="flex-1 w-full p-6 md:p-12 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
