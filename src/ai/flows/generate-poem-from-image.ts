
'use server';
/**
 * @fileOverview AI agent that generates poems from images.
 *
 * - generatePoemFromImage - A function that generates a poem based on the image.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GeneratePoemFromImageOutput - The return type for the generatePoemFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The target language for the poem (e.g., "en", "es", "fr"). Defaults to English if not provided.'),
});
export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GeneratePoemFromImageOutputSchema = z.object({
  poem: z.string().describe('A poem inspired by the image.'),
});
export type GeneratePoemFromImageOutput = z.infer<typeof GeneratePoemFromImageOutputSchema>;

// Define a schema for the internal prompt's input, including the processed languageName
const PromptInternalInputSchema = z.object({
  imageDataUri: GeneratePoemFromImageInputSchema.shape.imageDataUri,
  languageName: z.string().describe('The full name of the target language for the poem (e.g., "English", "Spanish").')
});

export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {schema: PromptInternalInputSchema}, // Use the new internal schema
  output: {schema: GeneratePoemFromImageOutputSchema},
  prompt: `You are a poet, skilled at writing poems inspired by images.

  Write a poem inspired by the following image. The poem should evoke the emotions and themes present in the image.
  The poem should be short, no more than 10 lines.
  Generate the poem in {{languageName}}.

  Image: {{media url=imageDataUri}}`,
  // Removed custom handlebars helper as it's now handled in the flow logic
});

const generatePoemFromImageFlow = ai.defineFlow(
  {
    name: 'generatePoemFromImageFlow',
    inputSchema: GeneratePoemFromImageInputSchema, // Flow still uses the original input schema
    outputSchema: GeneratePoemFromImageOutputSchema,
  },
  async (flowInput: GeneratePoemFromImageInput) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      it: 'Italian',
    };
    // Determine the language name; default to English if not specified or not found
    const languageName = flowInput.language ? (languages[flowInput.language] || flowInput.language) : 'English';

    // Construct the input for the prompt, now including languageName
    const promptInputArgs = {
      imageDataUri: flowInput.imageDataUri,
      languageName: languageName,
    };

    const {output} = await prompt(promptInputArgs);
    return output!;
  }
);

