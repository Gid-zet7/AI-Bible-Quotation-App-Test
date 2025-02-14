# AI Bible Quote Assistant

A real-time Bible quotation assistant that listens to sermons and displays relevant Bible verses using AI-powered speech recognition.

## Features

- Real-time speech recognition using Web Speech API
- Bible reference extraction using Google Gemini AI
- MongoDB integration for quote history
- WebSocket-based real-time updates
- Modern, responsive UI built with Next.js and Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_gemini_api_key
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How it Works

1. The app uses the Web Speech API to capture audio from your microphone
2. Transcribed text is sent to the server via WebSocket
3. Google Gemini AI analyzes the text to extract Bible references
4. The app fetches the full verse from the Bible API
5. Quotes are stored in MongoDB and displayed in real-time
6. Recent quotes are preserved and displayed in chronological order

## Requirements

- Modern web browser with Web Speech API support (Chrome recommended)
- MongoDB database
- Google Gemini API key

## Note

Make sure to:
1. Allow microphone access when prompted by your browser
2. Set up your MongoDB database and update the connection string
3. Get a Google Gemini API key and add it to your environment variables
