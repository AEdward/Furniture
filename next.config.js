/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Next's build defaults to forking (cpu count - 1) worker
    // processes to collect page data in parallel. Shared hosting that
    // caps how many processes one account may spawn at once (cPanel
    // accounts under CloudLinux's LVE, notably) can make that fork
    // fail outright with `spawn ... EAGAIN`. Building one page's data
    // at a time avoids ever needing more than one worker — slower,
    // never different in output.
    cpus: 1,
  },
};

module.exports = nextConfig;
