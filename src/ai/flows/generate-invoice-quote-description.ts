'use server';
/**
 * @fileOverview An AI assistant for generating detailed descriptions for invoice and quote line items.
 *
 * - generateInvoiceQuoteDescription - A function that handles the generation of detailed descriptions.
 * - GenerateInvoiceQuoteDescriptionInput - The input type for the generateInvoiceQuoteDescription function.
 * - GenerateInvoiceQuoteDescriptionOutput - The return type for the generateInvoiceQuoteDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInvoiceQuoteDescriptionInputSchema = z.object({
  keyword: z
    .string()
    .describe('A short keyword or phrase for an invoice or quote line item.'),
});
export type GenerateInvoiceQuoteDescriptionInput = z.infer<
  typeof GenerateInvoiceQuoteDescriptionInputSchema
>;

const GenerateInvoiceQuoteDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A detailed and professional description for the invoice or quote line item.'
    ),
});
export type GenerateInvoiceQuoteDescriptionOutput = z.infer<
  typeof GenerateInvoiceQuoteDescriptionOutputSchema
>;

export async function generateInvoiceQuoteDescription(
  input: GenerateInvoiceQuoteDescriptionInput
): Promise<GenerateInvoiceQuoteDescriptionOutput> {
  return generateInvoiceQuoteDescriptionFlow(input);
}

const generateInvoiceQuoteDescriptionPrompt = ai.definePrompt({
  name: 'generateInvoiceQuoteDescriptionPrompt',
  input: {schema: GenerateInvoiceQuoteDescriptionInputSchema},
  output: {schema: GenerateInvoiceQuoteDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in generating professional and detailed descriptions for invoice and quote line items.
Based on the following keyword or short phrase, provide a comprehensive and professional description suitable for an invoice or quote.

Keyword/Phrase: {{{keyword}}}

Your response should be a JSON object conforming to the following schema:
{{json output.schema}}`,
});

const generateInvoiceQuoteDescriptionFlow = ai.defineFlow(
  {
    name: 'generateInvoiceQuoteDescriptionFlow',
    inputSchema: GenerateInvoiceQuoteDescriptionInputSchema,
    outputSchema: GenerateInvoiceQuoteDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await generateInvoiceQuoteDescriptionPrompt(input);
    return output!;
  }
);
