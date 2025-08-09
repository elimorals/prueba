/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['your-supabase-project.supabase.co'],
  },
  // API rewrites para conectar con el backend (solo si la URL está definida)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl !== 'undefined') {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ]
    }
    return []
  },
  // Configuración para producción y desarrollo
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? [
    '192.168.0.28',
    '192.168.1.*',
    '192.168.0.*', 
    '10.0.0.*',
    '172.16.*.*',
  ] : [],
  // Optimizaciones para Vercel (configuración actualizada)
  serverExternalPackages: ['sharp'],
}

export default nextConfig