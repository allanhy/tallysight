/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'img.clerk.com',
            'a.espncdn.com',  // ✅ Allow ESPN images
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: `
                            default-src 'self';
                            script-src 'self' 'unsafe-inline' 'unsafe-eval' grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev cdn.jsdelivr.net scdn.clerk.com js.sentry-cdn.com browser.sentry-cdn.com *.ingest.sentry.io challenges.cloudflare.com segapi.clerk.com www.google.com www.gstatic.com clerk.accounts.dev;
                            script-src-elem 'self' 'unsafe-inline' grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev clerk.accounts.dev www.google.com www.gstatic.com;
                            worker-src 'self' blob:;
                            connect-src 'self' grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev scdn.clerk.com segapi.clerk.com https://www.google.com www.gstatic.com;
                            img-src 'self' data: blob: grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev scdn.clerk.com www.gstatic.com a.espncdn.com;
                            style-src 'self' 'unsafe-inline' grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev cdn.jsdelivr.net scdn.clerk.com;
                            frame-src 'self' grand-wolf-37.accounts.dev grand-wolf-37.clerk.accounts.dev challenges.cloudflare.com https://www.google.com https://www.gstatic.com;
                        `.replace(/\s{2,}/g, " "), // Minify policy
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
