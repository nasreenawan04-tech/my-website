import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

// Configure PDF.js worker with a more compatible approach
if (typeof window !== 'undefined') {
  // Use a simple fallback that works in more environments
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
}

interface PDFViewerProps {
  file: File | null;
  onPageChange?: (pageNumber: number) => void;
  selectedPages?: number[];
  onPageSelect?: (pageNumber: number) => void;
  multiSelect?: boolean;
}

export default function PDFViewer({ 
  file, 
  onPageChange, 
  selectedPages = [], 
  onPageSelect,
  multiSelect = false 
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      loadPDF();
    }
  }, [file]);

  useEffect(() => {
    if (pdfDocument && currentPage <= totalPages) {
      renderPage();
    }
  }, [pdfDocument, currentPage, scale, rotation]);

  const loadPDF = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Validate file type first
      if (!file.type.includes('pdf')) {
        throw new Error('Invalid file type. Please select a PDF file.');
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Additional validation for PDF magic number
      const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
      const signature = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!signature.startsWith('25504446')) { // %PDF in hex
        throw new Error('Invalid PDF file format.');
      }

      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Add compatibility options
        disableAutoFetch: true,
        disableStream: true
      });
      
      const pdf = await loadingTask.promise;
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      const errorMessage = err.message || 'Failed to load PDF. Please ensure the file is valid and not password protected.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Calculate viewport with rotation
      let viewport = page.getViewport({ scale, rotation });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      if (onPageChange) {
        onPageChange(currentPage);
      }
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render page.');
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const rotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePageClick = () => {
    if (onPageSelect) {
      onPageSelect(currentPage);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Upload a PDF file to view</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 border border-red-300 rounded-lg bg-red-50">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading PDF</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const isPageSelected = selectedPages.includes(currentPage);

  return (
    <div className="w-full" data-testid="pdf-viewer">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            data-testid="button-previous-page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm" data-testid="text-page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            data-testid="button-next-page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut} data-testid="button-zoom-out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
          
          <Button variant="outline" size="sm" onClick={zoomIn} data-testid="button-zoom-in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={rotateLeft} data-testid="button-rotate-left">
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={rotateRight} data-testid="button-rotate-right">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="border border-gray-300 rounded-b-lg overflow-auto bg-white">
        <div className="p-4 flex justify-center">
          <div 
            className={`relative ${isPageSelected ? 'ring-4 ring-blue-500' : ''} ${
              onPageSelect ? 'cursor-pointer' : ''
            }`}
            onClick={handlePageClick}
          >
            <canvas
              ref={canvasRef}
              className="shadow-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
              data-testid="canvas-pdf-page"
            />
            
            {multiSelect && onPageSelect && (
              <div className="absolute top-2 right-2">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  isPageSelected 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}>
                  {isPageSelected ? '✓' : currentPage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}