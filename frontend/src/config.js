// API Configuration
// Production backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://web-production-9264.up.railway.app';
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'wss://web-production-9264.up.railway.app';

// For development, you can uncomment the lines below and comment the lines above
// const API_BASE_URL = 'http://localhost:8000';
// const WS_BASE_URL = 'ws://localhost:8000';

export { API_BASE_URL, WS_BASE_URL }; 