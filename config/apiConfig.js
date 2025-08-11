const apiConfig = {
  development: {
    // Use external APIs instead of internal backend
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", // External API
    googleApiUrl: "https://speech.googleapis.com/v1",
    elevenlabsApiUrl: "https://api.elevenlabs.io/v1",
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    googleApiUrl: "https://speech.googleapis.com/v1",
    elevenlabsApiUrl: "https://api.elevenlabs.io/v1",
  },
};

const environment = process.env.NODE_ENV || "development";
const config = apiConfig[environment];

export default config;
