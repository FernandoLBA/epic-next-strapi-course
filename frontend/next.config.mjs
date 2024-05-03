/** @type {import('next').NextConfig} */
const nextConfig = {
    // * Esto se agrega para que acepte imágenes provenientes de ciertos endpoints
    images: {
        remotePatterns: [
            // * Esto se agrega para que acepte imágenes provenientes de http://localhost:1337/uploads/...
            {
                protocol: "http",
                hostname: "localhost",
                port: "1337",
                pathname: "/uploads/**/*",
            },
            // * Esto se agrega para que acepte imágenes provenientes de https://placehold.co
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
    },
};

export default nextConfig;
