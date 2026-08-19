# Alan — Local-First Image Utility

**Alan** is a lightweight, browser-based image processing toolbox built for the modern web. The central promise is simple: **«Your images never need to leave the browser.»**

Designed with the aesthetic language of "quiet technical futurism," Alan serves as a highly functional, slightly experimental technical instrument rather than a typical SaaS dashboard.

## Features

Alan provides 12 core local-first tools:

1. **Convert** - Change image formats between PNG, JPEG, and WEBP.
2. **Compress** - Reduce file size with quality control.
3. **Resize** - Scale dimensions precisely with aspect ratio locking.
4. **Crop** - Standardized center cropping (1:1, 4:3, 16:9).
5. **Color** - Extract precise HEX and RGB pixel data via click.
6. **Metadata** - Inspect file and image dimensions natively.
7. **Strip Metadata** - Clean hidden EXIF and sensitive data from files.
8. **Adjust** - Core corrections (Brightness, Contrast, Saturation, Blur).
9. **Compare** - Diff two images with overlay opacity blending.
10. **Join** - Combine multiple images horizontally or vertically.
11. **Split** - Divide a single image precisely in half.
12. **Favicon** - Automatically generate 16x16, 32x32, and 180x180 sizes.

## Technology Stack

Alan relies purely on native browser APIs to handle heavy operations without a backend:

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Custom elegant dark theme)
- **Icons**: Lucide React
- **Processing**: HTML5 `<canvas>`, `File` API, `ImageBitmap`, `OffscreenCanvas`

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

## Privacy & Deployment

Alan does not require a database, authentication, or external API. It is completely static and deployable anywhere (like Vercel) without server environment variables or external storage buckets. Your images are processed in your browser memory and never leave your device.
