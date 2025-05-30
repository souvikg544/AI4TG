import React from 'react';
import './PredictionDisplay.css';

const PredictionDisplay = ({ predictions, isLoading, error }) => {
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
          <p>Please wait while our AI processes your artwork</p>
        </div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="prediction-display">
        <div className="prediction-empty">
          <span className="empty-icon">🎨</span>
          <h3>Ready to predict!</h3>
          <p>Draw something on the canvas above and click "Predict" to see what our AI thinks it is!</p>
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
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${prediction.confidence * 100}%` }}
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
              ({(predictions[0].confidence * 100).toFixed(1)}% confident)
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay; 