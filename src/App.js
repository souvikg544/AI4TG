import React, { useState, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import PredictionDisplay from './components/PredictionDisplay';
import { makePrediction, makeMockPrediction, testApiConnection } from './services/predictionService';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(null);

  // Test API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      const isAvailable = await testApiConnection();
      setApiAvailable(isAvailable);
      
      if (!isAvailable) {
        console.warn('API not available, will use mock predictions');
      }
    };
    
    checkApiConnection();
  }, []);

  const handlePrediction = async (imageData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let predictionResults;
      
      if (apiAvailable === false) {
        // Use mock predictions if API is not available
        predictionResults = await makeMockPrediction(imageData);
      } else {
        // Try to use real API
        try {
          predictionResults = await makePrediction(imageData);
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
          <div className="canvas-section">
            <DrawingCanvas onPredict={handlePrediction} />
          </div>
          
          <div className="predictions-section">
            <PredictionDisplay 
              predictions={predictions}
              isLoading={isLoading}
              error={error}
            />
            
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
