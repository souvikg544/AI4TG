import React, { useState, useEffect, useCallback } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import PredictionDisplay from './components/PredictionDisplay';
import PdfViewer from './components/PdfViewer';
import { makePrediction, makeMockPrediction, testApiConnection } from './services/predictionService';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(null);
  const [wordListData, setWordListData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordToDraw, setCurrentWordToDraw] = useState('');
  
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 450, height: 550 });
  const pdfFileUrl = "/book.pdf";

  useEffect(() => {
    const calculateAndSetCanvasDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw <= 992;

      let newHeight;
      let newWidth;

      if (isMobile) {
        newHeight = Math.min(450, Math.max(300, vh * 0.45));
        newWidth = Math.min(vw * 0.9, 450);
      } else {
        newHeight = Math.min(750, Math.max(550, vh * 0.70));
        newWidth = 450;
      }
      setCanvasDimensions({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    calculateAndSetCanvasDimensions();
    window.addEventListener('resize', calculateAndSetCanvasDimensions);
    return () => window.removeEventListener('resize', calculateAndSetCanvasDimensions);
  }, []);

  // Test API connection and load word list on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Test API connection
      const isAvailable = await testApiConnection();
      setApiAvailable(isAvailable);
      if (!isAvailable) {
        console.warn('API not available, will use mock predictions');
      }

      // Load word list
      try {
        const response = await fetch('/wordList.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWordListData(data);
        if (data && data.pages && data.pages.length > 0 && data.pages[0].words && data.pages[0].words.length > 0) {
          setCurrentWordToDraw(data.pages[0].words[0]);
        }
      } catch (e) {
        console.error("Could not load word list:", e);
        setError("Could not load word list. Please try refreshing.");
      }
    };
    
    fetchData();
  }, []); // Keep this useEffect for initial data fetching

  const advanceWord = useCallback(() => {
    if (!wordListData || !wordListData.pages) return;

    const currentPageData = wordListData.pages[currentPageIndex];
    if (currentWordIndex < currentPageData.words.length - 1) {
      const nextWordIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextWordIndex);
      setCurrentWordToDraw(currentPageData.words[nextWordIndex]);
    } else if (currentPageIndex < wordListData.pages.length - 1) {
      const nextPageIdx = currentPageIndex + 1;
      setCurrentPageIndex(nextPageIdx);
      setCurrentWordIndex(0);
      setCurrentWordToDraw(wordListData.pages[nextPageIdx].words[0]);
    } else {
      setCurrentWordToDraw("All words completed! Great job!");
    }
  }, [wordListData, currentPageIndex, currentWordIndex]);

  const handlePrediction = async (imageData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let predictionResults;
      
      if (apiAvailable === false) {
        predictionResults = await makeMockPrediction(imageData);
      } else {
        try {
          predictionResults = await makePrediction(imageData);
          const drawnCorrectly = predictionResults.some(p => p.label.toLowerCase() === currentWordToDraw.toLowerCase() && p.confidence > 0.5);
          if (drawnCorrectly && !currentWordToDraw.startsWith("All words completed")) {
            advanceWord();
          }
        } catch (apiError) {
          console.warn('API call failed, falling back to mock predictions:', apiError);
          predictionResults = await makeMockPrediction(imageData);
          setApiAvailable(false);
        }
      }
      
      setPredictions(predictionResults);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to make prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPredictions([]);
  };

  const handleSkipWord = () => {
    if (!currentWordToDraw.startsWith("All words completed")) {
      advanceWord();
      setPredictions([]); 
      setError(null);
    }
  };

  const getCurrentPageNumberForPdf = () => {
    if (wordListData && wordListData.pages && wordListData.pages[currentPageIndex]) {
      return wordListData.pages[currentPageIndex].pageNumber;
    }
    return 1;
  };

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🎨</span>
              Shiksha
              <span className="title-icon">🤖</span>
            </h1>
            <p className="app-subtitle">
              Learn without barriers
            </p>
            {apiAvailable === false && (
              <div className="api-status">
                <span className="status-icon">⚠️</span>
                <span>Demo mode - Gradio API not connected</span>
              </div>
            )}
            {apiAvailable === true && (
              <div className="api-status" style={{ background: 'rgba(40, 167, 69, 0.2)', color: '#d4edda', borderColor: 'rgba(40, 167, 69, 0.3)' }}>
                <span className="status-icon">✅</span>
                <span>Connected to Gradio API</span>
              </div>
            )}
          </div>
        </header>

        <main className="main-content-wrapper">
          <div className="app-main-grid-layout">
            <div className="pdf-section">
              {currentWordToDraw && !currentWordToDraw.startsWith("All words completed") && (
                <div className="pdf-prompt-intro">
                  <p className="pdf-prompt-text">
                    Find the word <span className="word-emphasis">{currentWordToDraw}</span> in this Page.
                  </p>
                  <div className="arrow-down-animation"></div>
                </div>
              )}

              {wordListData && (
                <div className="pdf-viewer-component-root">
                  <PdfViewer 
                    pdfUrl={pdfFileUrl} 
                    pageNumber={getCurrentPageNumberForPdf()} 
                    height={canvasDimensions.height}
                  />
                </div>
              )}
              {!wordListData && !error && <p>Loading PDF and word list...</p>}
              {error && <p style={{color: 'red'}}>{error}</p>}
            </div>

            <div className="drawing-section">
              {currentWordToDraw && (
                <div className="current-word-prompt">
                  <h2>Draw: <span className="word-to-draw">{currentWordToDraw}</span></h2>
                </div>
              )}
              {currentWordToDraw && !currentWordToDraw.startsWith("All words completed") && (
                  <button className="skip-btn" onClick={handleSkipWord} disabled={isLoading || currentWordToDraw.startsWith("All words completed")}>
                      <span className="skip-icon">➡️</span>
                      Next Word
                  </button>
              )}
              <div className="canvas-wrapper">
                <DrawingCanvas 
                  onPredict={handlePrediction} 
                  width={canvasDimensions.width} 
                  height={canvasDimensions.height}
                />
              </div>
            </div>
          </div>

          <div className="predictions-section-global">
            <PredictionDisplay 
              predictions={predictions}
              isLoading={isLoading}
              error={error && !error.includes("word list") ? error : null}
            />
            {error && !error.includes("word list") && (
              <button className="retry-btn" onClick={handleRetry}>
                <span className="retry-icon">🔄</span>
                Try Again
              </button>
            )}
          </div>
        </main>

        <footer className="app-footer">
          <p>
            <span className="footer-icon">✨</span>
            Powered by <a href="https://www.cognitii.com/" target="_blank" rel="noopener noreferrer">Cognitii</a> • Draw, Learn, Discover
            <span className="footer-icon">✨</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
