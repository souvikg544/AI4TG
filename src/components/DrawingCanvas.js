import React, { useRef, useEffect, useState, forwardRef } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = forwardRef(({ onPredict, width = 400, height = 400 }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentTool, setCurrentTool] = useState('brush'); // 'brush' or 'eraser'
  const [brushSize, setBrushSize] = useState(5);
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedImageData, setSavedImageData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Save existing drawing if canvas already has content and is being resized
    let imageDataToRestore = null;
    if (isInitialized && (canvas.width !== width || canvas.height !== height)) {
      try {
        imageDataToRestore = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.warn('Could not save canvas data:', e);
        imageDataToRestore = savedImageData; // Fall back to previously saved data
      }
    }
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentTool === 'brush' ? '#000' : '#fff';
    ctx.lineWidth = brushSize;
    
    // Fill with white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Restore drawing if we had one
    if (imageDataToRestore && isInitialized) {
      try {
        ctx.putImageData(imageDataToRestore, 0, 0);
        setSavedImageData(imageDataToRestore);
      } catch (e) {
        console.warn('Could not restore canvas data:', e);
      }
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [width, height]);

  // Separate effect for updating drawing properties without clearing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = currentTool === 'brush' ? '#000' : '#fff';
    ctx.lineWidth = brushSize;
  }, [currentTool, brushSize, isInitialized]);

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
    
    // Set drawing mode based on current tool
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000';
    }
    
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Save current canvas state after drawing is complete
    const canvas = canvasRef.current;
    if (canvas && isInitialized) {
      try {
        const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        setSavedImageData(imageData);
      } catch (e) {
        console.warn('Could not save canvas state:', e);
      }
    }
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
    // Reset initialization state to ensure clean state
    setIsInitialized(true);
    // Clear saved image data
    setSavedImageData(null);
  };

  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(parseInt(e.target.value));
  };

  const predictDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    if (onPredict) {
      onPredict(imageData);
    }
  };

  return (
    <div ref={ref} className="drawing-canvas-component-root">
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
      
      <div className="canvas-tools">
        <div className="tool-section">
          <label className="tool-label">Tools:</label>
          <div className="tool-buttons">
            <button 
              className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
              onClick={() => handleToolChange('brush')}
            >
              <span className="tool-icon">🖌️</span>
              Brush
            </button>
            <button 
              className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => handleToolChange('eraser')}
            >
              <span className="tool-icon">🧹</span>
              Eraser
            </button>
          </div>
        </div>
        
        <div className="size-section">
          <label className="size-label">Size: {brushSize}px</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="size-slider"
          />
        </div>
      </div>

      <div className="canvas-controls">
        <button className="btn btn-secondary" onClick={clearCanvas}>
          <span className="btn-icon">🗑️</span>
          Clear
        </button>
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas; 