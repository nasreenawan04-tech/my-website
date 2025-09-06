import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

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
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf')) {
        setError('Invalid file type. Please select a PDF file.');
        return;
      }

      // Create a URL for the PDF file to display in iframe
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError(null);

      // Cleanup function
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    } else {
      setFileUrl(null);
      setError(null);
    }
  }, [file]);

  const handlePageClick = () => {
    if (onPageSelect) {
      onPageSelect(1); // Simple implementation - always page 1
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Upload a PDF file to view</p>
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

  return (
    <div className="w-full" data-testid="pdf-viewer">
      {/* PDF Display */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="p-4 bg-gray-100 border-b">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {file.name}
            </span>
            <span className="text-xs text-gray-500">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
        
        {fileUrl ? (
          <iframe
            src={fileUrl}
            className="w-full h-96"
            title="PDF Viewer"
            style={{ border: 'none' }}
            onClick={handlePageClick}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>
      
      {file && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>PDF file ready:</strong> {file.name} has been uploaded successfully and is ready for processing.
            {onPageSelect && " Click on the PDF to select it for operations."}
          </p>
        </div>
      )}
    </div>
  );
}