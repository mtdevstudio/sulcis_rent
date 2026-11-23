import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Con l'export statico l'ottimizzatore runtime non esiste:
  // le immagini vengono pre-generate in AVIF/WebP da scripts/images.mjs (fase build sezioni).
  images: { unoptimized: true },
};

export default nextConfig;
