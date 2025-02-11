/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'img.clerk.com',
            'a.espncdn.com', 
            'site.api.espn.com'
        ],
        unoptimized: true,
    },
};
  
export default nextConfig;