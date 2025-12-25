import { TextTransformationResult, TextTransformationOptions } from '@/types/text-tool.types';

/**
 * Text transformation function type with proper generic typing
 */
export type TextTransformerFunction = (
  input: string,
  options: TextTransformationOptions
) => TextTransformationResult;

/**
 * Base64 encoding implementation
 * 
 * @param text - Text to encode
 * @returns Base64 encoded string
 */
export const encodeBase64 = (text: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    throw new Error('Failed to encode to Base64');
  }
};

/**
 * Base64 decoding implementation
 * 
 * @param text - Base64 text to decode
 * @returns Decoded string
 */
export const decodeBase64 = (text: string): string => {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    throw new Error('Invalid Base64 input');
  }
};

/**
 * URL encoding implementation
 * 
 * @param text - Text to encode
 * @returns URL encoded string
 */
export const encodeURL = (text: string): string => {
  return encodeURIComponent(text);
};

/**
 * URL decoding implementation
 * 
 * @param text - URL encoded text to decode
 * @returns Decoded string
 */
export const decodeURL = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error('Invalid URL encoding');
  }
};

/**
 * HTML entity encoding
 * 
 * @param text - Text to encode
 * @returns HTML encoded string
 */
export const encodeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * HTML entity decoding
 * 
 * @param text - HTML encoded text to decode
 * @returns Decoded string
 */
export const decodeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#039);/g, (entity) => map[entity] || entity);
};

/**
 * Case conversion utilities
 */
export const caseConverters = {
  toUppercase: (text: string): string => text.toUpperCase(),
  toLowercase: (text: string): string => text.toLowerCase(),
  toTitleCase: (text: string): string => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  },
  toCamelCase: (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  },
  toSnakeCase: (text: string): string => {
    return text
      .replace(/\W+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  },
  toKebabCase: (text: string): string => {
    return text
      .replace(/\W+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  },
};

/**
 * Reverse text utility
 * 
 * @param text - Text to reverse
 * @returns Reversed string
 */
export const reverseText = (text: string): string => {
  return text.split('').reverse().join('');
};

/**
 * Applies text transformation based on options
 * 
 * @param text - Input text to transform
 * @param options - Transformation options
 * @returns TextTransformationResult with transformed text and metadata
 */
export const transformText: TextTransformerFunction = (
  text: string,
  options: TextTransformationOptions
): TextTransformationResult => {
  const startTime = performance.now();
  let transformedText = text;
  let isValid = true;
  let errorMessage: string | undefined;

  try {
    switch (options.type) {
      case 'base64':
        if (options.mode === 'encode') {
          transformedText = encodeBase64(text);
        } else if (options.mode === 'decode') {
          transformedText = decodeBase64(text);
        }
        break;

      case 'url':
        if (options.mode === 'encode') {
          transformedText = encodeURL(text);
        } else if (options.mode === 'decode') {
          transformedText = decodeURL(text);
        }
        break;

      case 'html':
        if (options.mode === 'encode') {
          transformedText = encodeHTML(text);
        } else if (options.mode === 'decode') {
          transformedText = decodeHTML(text);
        }
        break;

      case 'uppercase':
        transformedText = caseConverters.toUppercase(text);
        break;

      case 'lowercase':
        transformedText = caseConverters.toLowercase(text);
        break;

      case 'reverse':
        transformedText = reverseText(text);
        break;

      default:
        isValid = false;
        errorMessage = `Unknown transformation type: ${options.type}`;
    }
  } catch (error) {
    isValid = false;
    errorMessage = error instanceof Error ? error.message : 'Transformation failed';
  }

  return {
    inputText: text,
    inputLength: text.length,
    timestamp: new Date(),
    processingTime: Math.round(performance.now() - startTime),
    originalText: text,
    transformedText,
    mode: options.mode,
    type: options.type,
    charCount: transformedText.length,
    byteCount: new Blob([transformedText]).size,
    isValid,
    errorMessage,
    copiedToClipboard: false,
  };
};

/**
 * Validates transformation options
 * 
 * @param options - Options to validate
 * @returns True if options are valid
 */
export const isValidTransformationOptions = (options: TextTransformationOptions): boolean => {
  const validTypes = ['base64', 'url', 'html', 'uppercase', 'lowercase', 'reverse', 'morse', 'rot13'];
  const validModes = ['encode', 'decode', 'convert'];

  return (
    validModes.includes(options.mode) &&
    (!options.type || validTypes.includes(options.type))
  );
};
