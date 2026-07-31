/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // NOTE: unoptimized was previously true to avoid Vercel's image
    // transformation quota. But that also skipped Next's cache-control
    // headers on <Image>, so browsers/CDN re-fetched the full photo on every
    // page view — this is what blew past the Supabase egress limit (21GB of
    // 5.5GB). Photos are already resized+compressed at upload time (see
    // compressImage in admin/actions.ts), so re-enabling optimization here
    // costs very few/no extra Vercel transformations (no further resizing
    // needed) while restoring proper caching, which is the actual fix.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Allow camera access for the Gate Check-In QR scanner
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https://*.supabase.co; " +
              "font-src 'self'; " +
              "connect-src 'self' https://*.supabase.co https://api.paystack.co https://api.flutterwave.com; " +
              "frame-src https://www.google.com/recaptcha/;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
