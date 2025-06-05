import React from 'react';
import './ResultModal.css';

const ResultModal = ({ 
  isOpen, 
  isCorrect, 
  targetWord, 
  predictedWord, 
  confidence, 
  isLastWordOfPage,
  nextPageNumber,
  onNextWord, 
  onPlayAgain, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        {isCorrect ? (
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>Hurray! You did it!</h2>
            <p>
              You successfully drew <strong>{targetWord}</strong>!
            </p>
            <p className="confidence-text">
              AI was {confidence?.toFixed(1)}% confident it was a {predictedWord}
            </p>
            {isLastWordOfPage && nextPageNumber && (
              <div className="page-transition-message">
                <p className="page-transition-text">
                  🎊 Great job completing this page! Now we will move on to <strong>Page {nextPageNumber}</strong>.
                </p>
              </div>
            )}
            <div className="modal-actions">
              <button className="next-word-btn" onClick={onNextWord}>
                <span className="btn-icon">➡️</span>
                {isLastWordOfPage && nextPageNumber ? 'Next Page' : 'Next Word'}
              </button>
            </div>
          </div>
        ) : (
          <div className="encouragement-content">
            <div className="encouragement-icon">💪</div>
            <h2>You came so close!</h2>
            <p>You are doing awesome!</p>
            <p className="result-details">
              Target: <strong>{targetWord}</strong><br/>
              AI thought it was: <strong>{predictedWord}</strong> ({confidence?.toFixed(1)}% confident)
            </p>
            {isLastWordOfPage && nextPageNumber && (
              <div className="page-transition-message">
                <p className="page-transition-text">
                  📖 After this, we will move on to <strong>Page {nextPageNumber}</strong>.
                </p>
              </div>
            )}
            <div className="modal-actions">
              <button className="play-again-btn" onClick={onPlayAgain}>
                <span className="btn-icon">🔄</span>
                Try Again
              </button>
              <button className="next-word-btn" onClick={onNextWord}>
                <span className="btn-icon">➡️</span>
                {isLastWordOfPage && nextPageNumber ? 'Next Page' : 'Next Word'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultModal; 