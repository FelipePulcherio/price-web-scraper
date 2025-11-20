import utils from '../utils/index.js';
import { ILondonDrugsSearchAPIData } from './types.js';

function sanitizeRscTokens(segment: string): string {
  // Replace $L1d, $undefined, $something123_ with null
  return segment.replace(/\$[a-zA-Z0-9_]+/g, 'null');
}

function extractProductsBlock(raw: string, pageSize: number): string {
  const startPattern = '{"products"';
  const endPattern = `"pageSize":${pageSize}}`;

  const startIndex = raw.indexOf(startPattern);
  const endIndex = raw.indexOf(endPattern);

  if (startIndex === -1 || endIndex === -1) {
    throw new utils.ParsingError(
      'Extract Products Block: Start or end pattern not found in the string.'
    );
  }

  // endIndex + length of endPattern to include the closing part
  const rawProducts: string = raw.slice(
    startIndex,
    endIndex + endPattern.length
  );

  return sanitizeRscTokens(rawProducts);
}

function identifyRedirect(raw: string, pageSize: number): string {
  const startPattern = '"digest":"NEXT_REDIRECT;replace;';
  const endPattern = `?pageSize=${pageSize};`;

  const startIndex = raw.indexOf(startPattern);
  const endIndex = raw.indexOf(endPattern);

  if (startIndex === -1 || endIndex === -1) {
    throw new utils.ParsingError(
      'Identify Redirect: Start or end pattern not found in the string.'
    );
  }

  const redirectLink: string = raw.slice(
    startIndex + startPattern.length,
    endIndex
  );

  return redirectLink;
}

export default function ({
  apiResponse,
  pageSize,
}: {
  apiResponse: string;
  pageSize: number;
}): ILondonDrugsSearchAPIData | string {
  // Try regular parsing. If it fails check if it's a redirect.
  try {
    const sanitizedBlock = extractProductsBlock(apiResponse, pageSize);
    return JSON.parse(sanitizedBlock);
  } catch (err) {
    if (
      err instanceof utils.ParsingError &&
      err.message.includes(
        'Extract Products Block: Start or end pattern not found in the string.'
      )
    ) {
      const redirectLink = identifyRedirect(apiResponse, pageSize);
      return redirectLink;
    }
    throw err;
  }
}
