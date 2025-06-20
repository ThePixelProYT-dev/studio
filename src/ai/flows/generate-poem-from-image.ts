
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

export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {schema: GeneratePoemFromImageInputSchema},
  output: {schema: GeneratePoemFromImageOutputSchema},
  prompt: `You are a poet, skilled at writing poems inspired by images.

  Write a poem inspired by the following image. The poem should evoke the emotions and themes present in the image.
  The poem should be short, no more than 10 lines.
  {{#if language}}Generate the poem in {{language_name language}}.{{else}}Generate the poem in English.{{/if}}

  Image: {{media url=imageDataUri}}`,
  handlebars: {
    helpers: {
      language_name: (langCode: string) => {
        const languages: Record<string, string> = {
          en: 'English',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
          ja: 'Japanese',
          it: 'Italian',
        };
        return languages[langCode] || langCode;
      }
    }
  }
});

const generatePoemFromImageFlow = ai.defineFlow(
  {
    name: 'generatePoemFromImageFlow',
    inputSchema: GeneratePoemFromImageInputSchema,
    outputSchema: GeneratePoemFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
