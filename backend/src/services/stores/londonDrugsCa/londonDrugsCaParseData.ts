import { ILondonDrugsSearchAPIData } from './types';

function extractProductsBlock(raw: string, pageSize: number): string {
  const startPattern = '{"products"';
  const endPattern = `"pageSize":${pageSize}}`;

  const startIndex = raw.indexOf(startPattern);
  const endIndex = raw.indexOf(endPattern);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Start or end pattern not found in the string.');
  }

  // endIndex + length of endPattern to include the closing part
  return raw.slice(startIndex, endIndex + endPattern.length);
}

function sanitizeRscTokens(segment: string): string {
  // Replace $L1d, $undefined, $something123_ with null
  return segment.replace(/\$[a-zA-Z0-9_]+/g, 'null');
}

export default function ({
  apiResponse,
  pageSize,
}: {
  apiResponse: string;
  pageSize: number;
}): ILondonDrugsSearchAPIData {
  // TO DO: Identify a redirect. "digest": "NEXT_REDIRECT;replace;
  // If a redirect is found we should return with a message asking to refine search.
  const productsBlock = extractProductsBlock(apiResponse, pageSize);
  const sanitizedBlock = sanitizeRscTokens(productsBlock);

  return JSON.parse(sanitizedBlock);
}
