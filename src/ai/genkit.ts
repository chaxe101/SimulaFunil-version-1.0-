/**
 * @fileoverview This file initializes the Genkit AI library with the Google AI provider.
 * It configures the model to be used and exports the configured genkit instance.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The plugin will automatically use the GEMINI_API_KEY from your .env file.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
