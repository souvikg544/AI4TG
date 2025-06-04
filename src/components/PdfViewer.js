import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PdfViewer.css'; // We will create this CSS file next

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// OR, if you have pdf.worker.min.js in your public folder:
pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.min.mjs';

function PdfViewer({ pdfUrl, pageNumber, height = 550 }) {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const documentAreaRef = useRef(null); // Ref for the document rendering area for scrollTop

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setLoadError(null); // Clear any previous error
  }

  function onDocumentLoadError(error) {
    console.error('Failed to load PDF:', error);
    setLoadError('Failed to load PDF. Please ensure book.pdf is in the public folder and is a valid PDF.');
  }

  // Automatically scroll to the top of the PDF viewer when pageNumber changes
  useEffect(() => {
    // Scroll the document rendering area, not the outermost component root
    if (documentAreaRef.current) {
      documentAreaRef.current.scrollTop = 0;
    }
  }, [pageNumber]);

  if (loadError) {
    return <div className="pdf-error-message" style={{ height: `${height}px` }}>{loadError}</div>;
  }

  return (
    // Renamed root class for clarity, this div is now a simple flex container
    <div className="pdf-viewer-component-root"> 
      {/* This new div gets the explicit height and styling for the PDF viewing box */}
      <div 
        className="pdf-document-render-area" 
        ref={documentAreaRef} 
        style={{ height: `${height}px` }}
      >
        {loadError ? (
          <div className="pdf-error-message" style={{height: '100%'}}>{loadError}</div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="pdf-loading" style={{height: '100%'}}>Loading PDF...</div>}
            error={<div className="pdf-error-message" style={{height: '100%'}}>Error loading PDF.</div>} 
          >
            {numPages && (
              <Page 
                pageNumber={pageNumber <= numPages ? pageNumber : 1} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            )}
          </Document>
        )}
      </div>
      {numPages && !loadError && (
        <p className="pdf-page-info">
          Page {pageNumber} of {numPages}
        </p>
      )}
    </div>
  );
}

export default PdfViewer; 