import React, { useState, useEffect, useCallback } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import PredictionDisplay from './components/PredictionDisplay';
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
  }, []);

  const advanceWord = useCallback(() => {
    if (!wordListData || !wordListData.pages) return;

    const currentPage = wordListData.pages[currentPageIndex];
    if (currentWordIndex < currentPage.words.length - 1) {
      // Advance to the next word on the current page
      const nextWordIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextWordIndex);
      setCurrentWordToDraw(currentPage.words[nextWordIndex]);
    } else if (currentPageIndex < wordListData.pages.length - 1) {
      // Advance to the first word of the next page
      const nextPageInx = currentPageIndex + 1;
      setCurrentPageIndex(nextPageInx);
      setCurrentWordIndex(0);
      setCurrentWordToDraw(wordListData.pages[nextPageInx].words[0]);
    } else {
      // All words and pages completed
      setCurrentWordToDraw("All words completed! Great job!");
      // Optionally, reset or disable further predictions
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
          // Check if the current word was drawn correctly
          // This is a simple check, can be made more sophisticated
          const drawnCorrectly = predictionResults.some(p => p.label.toLowerCase() === currentWordToDraw.toLowerCase() && p.confidence > 0.5);
          if (drawnCorrectly) {
            // alert(`Correct! You drew ${currentWordToDraw}.`);
            advanceWord(); // Advance to the next word if drawn correctly
          } else {
             // alert(`Try drawing ${currentWordToDraw} again, or click next if you want to skip.`);
          }

        } catch (apiError) {
          console.warn('API call failed, falling back to mock predictions:', apiError);
          predictionResults = await makeMockPrediction(imageData);
          setApiAvailable(false); // Assume API is down if call fails
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
    // Potentially also reset the current word or page if needed
  };

  const handleSkipWord = () => {
    advanceWord();
    setPredictions([]); // Clear previous predictions when skipping
    setError(null);
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

        <main className="app-main">
          {currentWordToDraw && (
            <div className="current-word-prompt">
              <h2>Draw: <span className="word-to-draw">{currentWordToDraw}</span></h2>
            </div>
          )}
          <div className="canvas-section">
            <DrawingCanvas onPredict={handlePrediction} />
          </div>
          
          <div className="predictions-section">
            <PredictionDisplay 
              predictions={predictions}
              isLoading={isLoading}
              error={error}
            />
             {currentWordToDraw && !currentWordToDraw.startsWith("All words completed") && (
                <button className="skip-btn" onClick={handleSkipWord} disabled={isLoading}>
                    <span className="skip-icon">➡️</span>
                    Skip Word
                </button>
            )}
            {error && (
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
