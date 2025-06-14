// Configuration for the Gradio API
const API_CONFIG = {
  // Primary Gradio Space URL (Zero GPU powered)
  primarySpaceUrl: process.env.REACT_APP_GRADIO_SPACE || "souvikg544-draw-zero-shot.hf.space",
  // Fallback Gradio Space URL (when primary is exhausted)
  fallbackSpaceUrl: process.env.REACT_APP_FALLBACK_GRADIO_SPACE || "souvikg544-quickdraw-classifier.hf.space",
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 300000, // 30 seconds timeout
  topK: parseInt(process.env.REACT_APP_TOP_K) || 5 // Number of top predictions to return
};

// Track current space being used
let currentSpaceUrl = API_CONFIG.primarySpaceUrl;
let isUsingFallback = false;

/**
 * Reset to primary space (can be called manually or after some time)
 */
const resetToPrimary = () => {
  console.log('Resetting to primary space...');
  currentSpaceUrl = API_CONFIG.primarySpaceUrl;
  isUsingFallback = false;
};

/**
 * Get current space status
 * @returns {Object} - Current space information
 */
export const getSpaceStatus = () => {
  return {
    currentSpace: currentSpaceUrl,
    isUsingFallback,
    primarySpace: API_CONFIG.primarySpaceUrl,
    fallbackSpace: API_CONFIG.fallbackSpaceUrl
  };
};

/**
 * Convert base64 image data to a format suitable for the Gradio API
 * @param {string} imageData - Base64 image data from canvas
 * @returns {string} - Processed image data
 */
const processImageData = (imageData) => {
  // Remove the data:image/png;base64, prefix if present
  if (imageData.startsWith('data:image/')) {
    return imageData.split(',')[1];
  }
  return imageData;
};

/**
 * Make a prediction request to the Gradio API using the correct event-based format
 * @param {string} imageData - Base64 image data from canvas
 * @param {string} word - The current word to draw (in lowercase)
 * @returns {Promise<Array>} - Array of prediction objects with label and confidence
 */
export const makePrediction = async (imageData, word = '') => {
  let lastError = null;

  // Try primary space first
  try {
    console.log('Trying primary space:', API_CONFIG.primarySpaceUrl);
    currentSpaceUrl = API_CONFIG.primarySpaceUrl;
    isUsingFallback = false;
    
    const result = await makePredictionAttempt(imageData, word);
    console.log('Success with primary space');
    return result;
  } catch (error) {
    console.warn('Primary space failed:', error.message);
    lastError = error;
  }

  // Try fallback space
  try {
    console.log('Trying fallback space:', API_CONFIG.fallbackSpaceUrl);
    currentSpaceUrl = API_CONFIG.fallbackSpaceUrl;
    isUsingFallback = true;
    
    const result = await makePredictionAttempt(imageData, word);
    console.log('Success with fallback space');
    return result;
  } catch (error) {
    console.error('Fallback space also failed:', error.message);
    lastError = error;
  }

  // Both failed, throw error
  const spaceInfo = 'both spaces';
  if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
    throw new Error(`Request timeout on ${spaceInfo} - please try again`);
  } else if (lastError.message.includes('Failed to fetch') || lastError.message.includes('network')) {
    throw new Error(`Unable to connect to prediction service (${spaceInfo}). Please check your internet connection.`);
  } else {
    throw new Error(`Prediction failed on ${spaceInfo}: ${lastError.message || 'Unknown error'}`);
  }
};

/**
 * Make a single prediction attempt to the current space
 * @param {string} imageData - Base64 image data from canvas
 * @param {string} word - The current word to draw (in lowercase)
 * @returns {Promise<Array>} - Array of prediction objects with label and confidence
 */
const makePredictionAttempt = async (imageData, word = '') => {
  const processedImageData = processImageData(imageData);
  
  // Correct Gradio API endpoints based on your curl command
  const baseUrl = `https://${currentSpaceUrl}`;
  const callUrl = `${baseUrl}/gradio_api/call/classify_image_api`;
  
  console.log('Calling Gradio API at:', callUrl);
  
  // Step 1: Make the initial call to get the event ID
  const callResponse = await fetch(callUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [processedImageData, API_CONFIG.topK, word]
    }),
    signal: AbortSignal.timeout(API_CONFIG.timeout)
  });

  if (!callResponse.ok) {
    const errorText = await callResponse.text();
    throw new Error(`API Call Error (${callResponse.status}): ${callResponse.statusText} - ${errorText}`);
  }

  const callResult = await callResponse.json();
  console.log('Initial call response:', callResult);

  // Check for errors in the response
  if (callResult.error) {
    throw new Error(`API returned error: ${callResult.error}`);
  }

  // Extract event ID from the JSON response
  if (!callResult.event_id) {
    throw new Error('Failed to get event_id from Gradio API');
  }
  
  const eventId = callResult.event_id;
  console.log('Got event ID:', eventId);

  // Step 2: Poll the result using the event ID
  const resultUrl = `${baseUrl}/gradio_api/call/classify_image_api/${eventId}`;
  console.log('Polling result at:', resultUrl);

  const resultResponse = await fetch(resultUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
    },
    signal: AbortSignal.timeout(API_CONFIG.timeout)
  });

  if (!resultResponse.ok) {
    const errorText = await resultResponse.text();
    throw new Error(`API Result Error (${resultResponse.status}): ${resultResponse.statusText} - ${errorText}`);
  }

  // Read the streaming response
  const reader = resultResponse.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let predictions = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    result += chunk;
    
    // Look for the completion event with data
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.startsWith('event: complete')) {
        // The next line should contain the data
        const nextLineIndex = lines.indexOf(line) + 1;
        if (nextLineIndex < lines.length && lines[nextLineIndex].startsWith('data: ')) {
          try {
            const dataStr = lines[nextLineIndex].substring(6); // Remove 'data: ' prefix
            const data = JSON.parse(dataStr);
            console.log('Complete event data:', data);
            
            // Check for errors in the completion data
            if (Array.isArray(data) && data.length > 0 && data[0].error) {
              throw new Error(`Prediction error: ${data[0].error}`);
            }
            
            // Expected format: [{"success": true, "predictions": [...]}]
            if (Array.isArray(data) && data.length > 0 && data[0].success && data[0].predictions) {
              predictions = data[0].predictions;
              console.log('Raw predictions from API:', predictions);
              break;
            }
          } catch (e) {
            console.warn('Error parsing complete event data:', lines[nextLineIndex], e);
          }
        }
      }
    }
    
    if (predictions) break;
  }

  if (!predictions || !Array.isArray(predictions)) {
    console.error('Invalid predictions format:', predictions);
    throw new Error('Invalid response format from Gradio API');
  }

  // Process and format predictions
  const formattedPredictions = predictions.map(pred => {
    return {
      label: pred.category || pred.label || 'Unknown',
      confidence: typeof pred.confidence === 'number' ? pred.confidence : 0
    };
  });

  // Sort by confidence (highest first) and return top results
  const sortedPredictions = formattedPredictions
    .filter(pred => pred.label && pred.label !== 'Unknown')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, API_CONFIG.topK);

  console.log('Formatted predictions:', sortedPredictions);
  console.log(`Success using ${isUsingFallback ? 'fallback' : 'primary'} space:`, currentSpaceUrl);
  
  if (sortedPredictions.length === 0) {
    throw new Error('No valid predictions received from API');
  }
  
  return sortedPredictions;
};

/**
 * Test the Gradio API connection
 * @returns {Promise<boolean>} - True if API is reachable
 */
export const testApiConnection = async () => {
  try {
    console.log('Testing Gradio API connection...');
    const apiUrl = `https://${currentSpaceUrl}`;
    
    const response = await fetch(apiUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout for health check
    });
    
    const isAvailable = response.ok;
    console.log('Gradio API connection test result:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.warn('Gradio API connection test failed:', error);
    return false;
  }
};

/**
 * Mock prediction function for testing when API is not available
 * @param {string} imageData - Base64 image data (not used in mock)
 * @returns {Promise<Array>} - Mock prediction results
 */
export const makeMockPrediction = async (imageData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockPredictions = [
    { label: 'cat', confidence: 0.85 },
    { label: 'dog', confidence: 0.72 },
    { label: 'bird', confidence: 0.58 },
    { label: 'fish', confidence: 0.34 },
    { label: 'house', confidence: 0.12 }
  ];
  
  // Randomize the results a bit to make it more realistic
  return mockPredictions.map(pred => ({
    ...pred,
    confidence: Math.max(0.01, Math.min(0.99, pred.confidence + (Math.random() - 0.5) * 0.2))
  })).sort((a, b) => b.confidence - a.confidence);
};

// Named exports
const predictionService = {
  makePrediction,
  testApiConnection,
  makeMockPrediction,
  getSpaceStatus,
  resetToPrimary
};

export default predictionService;
export { resetToPrimary }; 