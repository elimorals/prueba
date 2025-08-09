// frontend/components/clinical-rag-search.tsx
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface SearchResult {
  reporte_id: string;
  paciente_id: string;
  contenido: string;
  similarity: number;
}

export function ClinicalRAGSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`/api/v1/rag/buscar?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('La respuesta del servidor no fue exitosa.');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('No se pudo realizar la búsqueda. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscador de Historial Clínico (RAG)</CardTitle>
        <CardDescription>Busca en el historial de todos los pacientes usando lenguaje natural.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Ej: paciente con hallazgos de neumonía en tórax..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-4 space-y-3">
          {results.length > 0 ? (
            results.map((result) => (
              <div key={result.reporte_id} className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Paciente: {result.paciente_id} | Similitud: {(result.similarity * 100).toFixed(2)}%
                </p>
                <p className="font-medium truncate">{result.contenido}</p>
              </div>
            ))
          ) : (
            !isLoading && <p className="text-sm text-muted-foreground">No se encontraron resultados.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}