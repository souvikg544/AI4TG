import React, { useState } from 'react';
import './InitialScreen.css';

const InitialScreen = ({ onClassSelect }) => {
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ageGroups = [
    { value: '5-7', label: '5-7 years', emoji: '👶' },
    { value: '8-10', label: '8-10 years', emoji: '🧒' },
    { value: '11-13', label: '11-13 years', emoji: '👦' },
    { value: '14-16', label: '14-16 years', emoji: '👨' },
  ];

  const classLevels = [
    { value: 1, label: 'Class 1', description: 'Beginner Level', emoji: '🌱' },
    { value: 2, label: 'Class 2', description: 'Elementary Level', emoji: '🌿' },
    { value: 3, label: 'Class 3', description: 'Intermediate Level', emoji: '🌳' },
    { value: 4, label: 'Class 4', description: 'Advanced Level', emoji: '🌲' },
    { value: 5, label: 'Class 5', description: 'Expert Level', emoji: '🏆' }
  ];

  const handleSubmit = async () => {
    if (!selectedAge || !selectedClass) {
      alert('Please select both age and class level');
      return;
    }

    setIsSubmitting(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      onClassSelect({
        age: selectedAge,
        class: selectedClass
      });
    }, 500);
  };

  return (
    <div className="initial-screen">
      <div className="initial-screen-container">
        <header className="initial-header">
          <div className="welcome-icon">🎨</div>
          <h1 className="welcome-title">Welcome to Varnam!</h1>
          <p className="welcome-subtitle">
            Learn without barriers through drawing and AI
          </p>
        </header>

        <div className="selection-content">
          <div className="selection-section">
            <h2 className="section-title">
              <span className="section-icon">🎂</span>
              What's your age group?
            </h2>
            <div className="age-grid">
              {ageGroups.map((age) => (
                <button
                  key={age.value}
                  className={`age-card ${selectedAge === age.value ? 'selected' : ''}`}
                  onClick={() => setSelectedAge(age.value)}
                >
                  <div className="card-emoji">{age.emoji}</div>
                  <div className="card-label">{age.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-section">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              Choose your learning level
            </h2>
            <div className="class-grid">
              {classLevels.map((classLevel) => (
                <button
                  key={classLevel.value}
                  className={`class-card ${selectedClass === classLevel.value ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(classLevel.value)}
                >
                  <div className="card-emoji">{classLevel.emoji}</div>
                  <div className="card-content">
                    <div className="card-label">{classLevel.label}</div>
                    <div className="card-description">{classLevel.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="submit-section">
            <button 
              className={`start-learning-btn ${(!selectedAge || !selectedClass) ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!selectedAge || !selectedClass || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Loading...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Start Learning!
                </>
              )}
            </button>
            
            {selectedAge && selectedClass && (
              <div className="selection-summary">
                <p>
                  Age: <strong>{selectedAge}</strong> • Level: <strong>Class {selectedClass}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="initial-footer">
          <p>
            <span className="footer-icon">✨</span>
            Powered by <a href="https://www.cognitii.com/" target="_blank" rel="noopener noreferrer">
              <img src="/cognitii_logo.png" alt="Cognitii Logo" className="cognitii-logo" />
              Cognitii
            </a>
            <span className="footer-icon">✨</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default InitialScreen; 