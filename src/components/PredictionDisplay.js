import React from 'react';
import './PredictionDisplay.css';

const PredictionDisplay = ({ predictions, isLoading, error, onPredict }) => {
  if (error) {
    return (
      <div className="prediction-display">
        <div className="prediction-error">
          <span className="error-icon">⚠️</span>
          <h3>Prediction Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="prediction-display">
        <div className="prediction-loading">
          <div className="loading-spinner"></div>
          <h3>Analyzing your drawing...</h3>
          <p>Please wait while Coco processes your artwork</p>
        </div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="prediction-display">
        <div className="prediction-empty">
          <div className="mascot-container">
            <img 
              src="/coco-mascot.svg" 
              alt="Coco the Learning Buddy" 
              className="coco-mascot"
            />
          </div>
          <div className="welcome-content">
            <h3>Ready to predict!</h3>
            <p>Hi, I am Coco, I am your learning buddy. Draw the word and click on Predict to see what I think it is!</p>
          </div>
          {onPredict && (
            <div className="predict-section">
              <button className="predict-btn" onClick={onPredict}>
                Predict
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-display">
      <div className="prediction-header">
        <h3>🤖 AI Predictions</h3>
        <p>Here's what our AI thinks you drew:</p>
      </div>
      
      <div className="predictions-list">
        {predictions.map((prediction, index) => (
          <div key={index} className={`prediction-item ${index === 0 ? 'top-prediction' : ''}`}>
            <div className="prediction-content">
              <div className="prediction-info">
                <span className="prediction-label">{prediction.label}</span>
                <span className="prediction-confidence">
                  {prediction.confidence.toFixed(1)}%
                </span>
              </div>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${prediction.confidence}%` }}
                ></div>
              </div>
            </div>
            {index === 0 && (
              <div className="top-badge">
                <span>🏆</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {predictions.length > 0 && (
        <div className="prediction-footer">
          <p>
            <strong>Best guess:</strong> {predictions[0].label} 
            <span className="confidence-text">
              ({predictions[0].confidence.toFixed(1)}% confident)
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay; 