# 🎨 Drawing Classifier

An interactive web application that uses AI to classify hand-drawn sketches in real-time. Draw anything on the canvas and let our machine learning model predict what you've drawn!

Built with React and integrated with **Gradio Spaces** using direct HTTP API calls for maximum compatibility.

## ✨ Features

- **Interactive Drawing Canvas**: Smooth drawing experience with mouse and touch support
- **Real-time AI Predictions**: Get instant predictions with confidence scores
- **Gradio Integration**: Direct HTTP calls to Gradio-hosted ML models (no dependencies conflicts)
- **Beautiful UI**: Modern gradient design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Fallback Mode**: Demo mode with mock predictions when API is unavailable
- **Error Handling**: Graceful error handling with retry functionality

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Internet connection (for Gradio API access)

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd drawing-classifier
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and visit `http://localhost:3000`

The app comes pre-configured to use the **souvikg544/quickdraw-classifier** Gradio Space via HTTP API!

## 🔧 Gradio API Configuration

### Default Configuration

The app is pre-configured to work with the QuickDraw classifier Gradio Space:
- **Space**: `souvikg544/quickdraw-classifier`
- **API Method**: Direct HTTP calls to `/api/predict`
- **Top K**: 5 predictions
- **Timeout**: 30 seconds

### Custom Configuration (Optional)

Create a `.env` file to customize settings:

```env
# Use a different Gradio Space
REACT_APP_GRADIO_SPACE=your-username/your-space-name

# Customize number of predictions
REACT_APP_TOP_K=3

# Adjust timeout
REACT_APP_API_TIMEOUT=20000
```

### Gradio HTTP API Format

The app makes HTTP POST requests to:
```
https://huggingface.co/spaces/{SPACE_NAME}/api/predict
```

**Request Format:**
```json
{
  "data": ["base64_image_data", 5],
  "fn_index": 0
}
```

**Expected Response:**
```json
{
  "data": [
    [
      ["cat", 0.85],
      ["dog", 0.72], 
      ["bird", 0.58]
    ]
  ]
}
```

## 🎯 How to Use

1. **Draw**: Use your mouse or finger to draw on the white canvas
2. **Predict**: Click the "Predict" button to get AI predictions
3. **Clear**: Click "Clear" to start over with a new drawing
4. **View Results**: See prediction results with confidence scores

## 🏗️ Project Structure

```
src/
├── components/
│   ├── DrawingCanvas.js      # Main drawing canvas component
│   ├── DrawingCanvas.css     # Canvas styling
│   ├── PredictionDisplay.js  # Prediction results component
│   └── PredictionDisplay.css # Prediction styling
├── services/
│   └── predictionService.js  # HTTP-based Gradio API integration
├── App.js                    # Main application component
├── App.css                   # Global application styles
└── index.js                  # Application entry point
```

## 🤖 Creating Your Own Gradio Space

To use your own model:

1. **Create a Gradio Space** on Hugging Face
2. **Implement the function**:
   ```python
   import gradio as gr
   import base64
   from PIL import Image
   import io
   
   def classify_image_api(image_data, top_k=5):
       # Decode base64 image
       image_bytes = base64.b64decode(image_data)
       image = Image.open(io.BytesIO(image_bytes))
       
       # Process with your model
       predictions = your_model.predict(image)
       
       # Return predictions as list of [label, confidence] pairs
       return predictions[:top_k]
   
   # Create Gradio interface
   demo = gr.Interface(
       fn=classify_image_api,
       inputs=[
           gr.Textbox(label="image_data"),
           gr.Number(label="top_k", value=5)
       ],
       outputs=gr.JSON()
   )
   
   demo.launch()
   ```

3. **Update your .env** with your space name

## 🎨 Customization

### Styling

The app uses CSS custom properties and gradients. You can customize:

- **Colors**: Update gradient colors in `App.css`
- **Canvas size**: Modify canvas dimensions in `DrawingCanvas.js`
- **Animations**: Adjust animation timings in CSS files

### Drawing Settings

In `DrawingCanvas.js`, you can modify:

```javascript
// Drawing properties
ctx.strokeStyle = '#000';    // Line color
ctx.lineWidth = 3;           // Line thickness
ctx.lineCap = 'round';       // Line cap style
```

### Mock Predictions

When API is unavailable, the app uses mock predictions. Customize them in `predictionService.js`:

```javascript
const mockPredictions = [
  { label: 'cat', confidence: 0.85 },
  { label: 'dog', confidence: 0.72 },
  // Add your own mock predictions
];
```

## 📱 Mobile Support

The app is fully responsive and supports:

- **Touch drawing** on mobile devices
- **Responsive layouts** for different screen sizes
- **Touch-optimized buttons** with appropriate sizing
- **Viewport optimization** for mobile browsers

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (irreversible)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🚀 Deployment

### Environment Variables

For production deployment, set:

```env
REACT_APP_GRADIO_SPACE=your-username/your-space-name
```

### Hosting Options

The app can be deployed to:

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Use `npm run deploy` (after setup)
- **AWS S3**: Upload build files to S3 bucket
- **Any static hosting service**

## 🔍 Troubleshooting

### Common Issues

**Gradio Connection Failed**
- Check internet connection
- Verify the Gradio Space is running and accessible
- Check browser console for detailed error messages
- Ensure the Gradio Space is public (not private)

**Canvas Not Drawing**
- Ensure you're clicking/touching within the canvas area
- Check if touch events are being blocked by other elements

**Predictions Not Showing**
- Verify your Gradio Space returns data in the expected format
- Check browser console for JavaScript errors
- Test your Gradio Space independently in the browser

**CORS Issues**
- Gradio Spaces should handle CORS automatically
- If using a custom domain, ensure CORS is properly configured

### Debug Mode

The app includes console logging for debugging API calls. Check browser console for detailed information about:
- API connection attempts
- Request/response data
- Error messages

## 📋 Gradio Requirements

Your Gradio Space should:

1. **Accept image data** as base64 string and top_k parameter
2. **Process the image** with your ML model
3. **Return predictions** as array of [label, confidence] pairs
4. **Be publicly accessible** (not private)
5. **Handle the HTTP API format** correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 🙏 Acknowledgments

- Built with React and Create React App
- Integrated with Gradio Spaces via HTTP API
- Styled with modern CSS features
- Icons from Unicode emoji set
- Gradient inspirations from various design resources

---

**Happy Drawing! 🎨🤖**

*Powered by Gradio Spaces*
