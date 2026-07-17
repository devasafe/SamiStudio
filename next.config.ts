import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    // Qualidades usadas no site (o Next 16 exige listar as que fogem do 75
    // padrão): 85 no fundo da CTA, 92 no render do hero.
    qualities: [75, 85, 92],
  },
};

export default nextConfig;
