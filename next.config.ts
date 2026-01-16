import type { NextConfig } from "next";
import { blogRedirects } from "./lib/blog-redirects";

const nextConfig: NextConfig = {
  /* config options here */
  
  /**
   * 301 Redirects for blog migration
   * OPTIONAL BACKUP: Only activates if DNS points old subdomain to Vercel
   * Primary redirects are handled by Netlify
   */
  async redirects() {
    const redirectRules = Object.entries(blogRedirects).map(([oldSlug, newPath]) => ({
      source: `/${oldSlug}`,
      has: [
        {
          type: 'host',
          value: 'blog.restatolahdata.id',
        },
      ],
      destination: `https://restatolahdata.id/artikel/${newPath}`,
      permanent: true, // 301 redirect - critical for SEO
    }))
    
    return redirectRules
  },
};

export default nextConfig;
