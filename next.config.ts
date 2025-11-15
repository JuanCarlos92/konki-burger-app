import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Opciones de configuración aquí */
  typescript: {
    // Ignora los errores de build de TypeScript. Útil durante el desarrollo rápido, 
    // pero se recomienda activarlo para producción.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de ESLint durante el build.
    ignoreDuringBuilds: true,
  },
  images: {
    // Configura los dominios remotos desde los que se pueden cargar imágenes
    // a través del componente `next/image`.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.elle.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hips.hearstapps.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
