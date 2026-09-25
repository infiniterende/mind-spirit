import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Fiction lives in Markdown files read at request time (e.g. the homepage shelf),
  // so make sure they ship with the serverless functions on Vercel
  outputFileTracingIncludes: {
    "/*": ["./content/fiction/**/*"],
  },
  images: {
    // Remote images the site may show: CMS uploads (Supabase Storage) and Unsplash links
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
