// frontend/app/estudios/[id]/page.tsx
"use client";

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Componente DicomViewer que se carga dinámicamente ---
const DicomViewer = ({ imageUrl }: { imageUrl: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initCornerstone = async () => {
      // Importar librerías solo en el lado del cliente
      const cornerstone = (await import('cornerstone-core')).default;
      const cornerstoneWADOImageLoader = (await import('cornerstone-wado-image-loader')).default;
      const dicomParser = (await import('dicom-parser'));

      // Configurar el loader
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
      cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
          // Puedes añadir headers aquí si es necesario para la autenticación
        },
      });

      const element = elementRef.current;
      if (!element) return;

      // Habilitar el elemento para Cornerstone
      cornerstone.enable(element);

      const imageId = 'wadouri:' + imageUrl;

      try {
        const image = await cornerstone.loadImage(imageId);
        cornerstone.displayImage(element, image);

        // Habilitar herramientas básicas
        cornerstone.setViewport(element, cornerstone.getDefaultViewportForImage(element, image));
        cornerstone.tool.setToolActive('Wwwc', { mouseButtonMask: 1 }); // Window/Level
        cornerstone.tool.setToolActive('Zoom', { mouseButtonMask: 2 }); // Zoom
        cornerstone.tool.setToolActive('Pan', { mouseButtonMask: 4 }); // Pan
        cornerstone.tool.setToolActive('ZoomMouseWheel', {}); // Zoom con la rueda del ratón
      } catch (error) {
        console.error('Error al cargar la imagen DICOM:', error);
        alert('No se pudo cargar la imagen DICOM.');
      }
    };

    if (imageUrl) {
      initCornerstone();
    }

    // Cleanup
    return () => {
      const element = elementRef.current;
      if (element) {
        try {
          // Deshabilitar el elemento para liberar memoria
          cornerstone.disable(element);
        } catch(e) {
            // Puede fallar si el componente se desmonta muy rápido
        }
      }
    };
  }, [imageUrl]);

  return (
    <div ref={elementRef} className="w-full h-[512px] bg-black text-white flex items-center justify-center">
      Cargando imagen DICOM...
    </div>
  );
};


// --- Componente Principal de la Página ---
export default function EstudioDetallePage({ params }: { params: { id: string } }) {
  // En una aplicación real, obtendrías esta URL de tu API o Supabase Storage
  // Usaremos una URL de ejemplo pública para la demostración
  const dicomImageUrl = 'https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Visor DICOM - Estudio ID: {params.id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Visualización del Estudio</CardTitle>
        </CardHeader>
        <CardContent>
          {/* El componente DicomViewer se renderiza solo en el cliente */}
          <DicomViewer imageUrl={dicomImageUrl} />
        </CardContent>
      </Card>
    </div>
  );
}