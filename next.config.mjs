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
  },
  // Configuración para desarrollo - permite acceso desde otras IPs en la red local
  async rewrites() {
    return []
  },
  // Permite solicitudes de origen cruzado en desarrollo
  allowedDevOrigins: [
    '192.168.0.28',
    '192.168.1.*', // Permite cualquier IP en el rango 192.168.1.x
    '192.168.0.*', // Permite cualquier IP en el rango 192.168.0.x
    '10.0.0.*',    // Permite cualquier IP en el rango 10.0.0.x
    '172.16.*.*',  // Permite cualquier IP en el rango 172.16.x.x
  ],
}

export default nextConfig