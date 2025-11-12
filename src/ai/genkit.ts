/**
 * @fileoverview Configuración e inicialización de la instancia principal de Genkit.
 * Este archivo centraliza la configuración de Genkit, incluyendo los plugins (como Google AI)
 * y el modelo de lenguaje por defecto que se usará en toda la aplicación.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Instancia principal de `ai`.
 * Se exporta para ser utilizada en toda la aplicación para definir flujos, prompts y otras funcionalidades de IA.
 * 
 * @property {plugin[]} plugins - Un array de plugins que extienden la funcionalidad de Genkit.
 *   - `googleAI()`: Habilita el uso de los modelos de Google (como Gemini).
 * @property {string} model - El ID del modelo de lenguaje por defecto que se usará en las operaciones de `ai.generate()`.
 *   - `'googleai/gemini-2.5-flash'`: Especifica el uso del modelo Gemini 2.5 Flash.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
