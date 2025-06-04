import React, { useRef, useEffect, useState } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = ({ onPredict, width = 400, height = 400 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas drawing buffer size
    canvas.width = width;
    canvas.height = height;
    
    // Set drawing properties
    ctx.strokeStyle = '#000';
    // Adjust line width based on canvas size for better scaling, e.g., width / 100
    ctx.lineWidth = Math.max(2, Math.min(10, Math.round(width / 100))); 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill with white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [width, height]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // These scales are important if CSS size differs from canvas.width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (pos) => {
    setIsDrawing(true);
    setLastPos(pos);
  };

  const draw = (pos) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e) => { startDrawing(getMousePos(e)); };
  const handleMouseMove = (e) => { draw(getMousePos(e)); };
  const handleMouseUp = stopDrawing;

  const handleTouchStart = (e) => { e.preventDefault(); startDrawing(getTouchPos(e)); };
  const handleTouchMove = (e) => { e.preventDefault(); draw(getTouchPos(e)); };
  const handleTouchEnd = (e) => { e.preventDefault(); stopDrawing(); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const predictDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    if (onPredict) {
      onPredict(imageData);
    }
  };

  return (
    <div className="drawing-canvas-component-root">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ width: `${width}px`, height: `${height}px`, touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div className="canvas-controls">
        <button className="btn btn-secondary" onClick={clearCanvas}>
          <span className="btn-icon">🗑️</span>
          Clear
        </button>
        <button className="btn btn-primary" onClick={predictDrawing}>
          <span className="btn-icon">🔮</span>
          Predict
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas; 