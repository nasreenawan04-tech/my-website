/**
 * Shared TypeScript interfaces for text processing and analysis tools
 * Covers text analysis, transformation, and generation utilities
 */

/**
 * Base text tool configuration
 */
export interface TextToolConfig {
  id: string;
  name: string;
  category: 'analysis' | 'transformation' | 'generation' | 'encryption' | 'utilities';
  description: string;
  icon: string;
  supportsRealTime: boolean;
  maxInputLength?: number;
}

/**
 * Text input state for text tools
 * Stores the raw text input
 */
export interface TextInput {
  text: string;
  lastModified: Date;
  length: number;
}

/**
 * Base text tool result
 */
export interface TextToolResult {
  inputText: string;
  inputLength: number;
  timestamp: Date;
  processingTime?: number; // milliseconds
}

/**
 * Text analysis result for word/character counting
 */
export interface TextAnalysisResult extends TextToolResult {
  // Basic counts
  totalCharacters: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  spaces: number;

  // Character breakdown
  alphabeticCharacters?: number;
  numericCharacters?: number;
  specialCharacters?: number;
  punctuation?: number;

  // Case analysis
  upperCaseLetters?: number;
  lowerCaseLetters?: number;

  // Word analysis
  uniqueWords?: number;
  averageWordLength?: number;
  longestWord?: number;
  shortestWord?: number;
  averageWordsPerSentence?: number;

  // Time estimates
  readingTime?: number; // minutes (200 wpm)
  speakingTime?: number; // minutes (130 wpm)
  listeningTime?: number; // minutes (150 wpm)

  // Readability
  fleSchKincaidGrade?: number;
  fleSchScore?: number;
  gunningFogIndex?: number;
}

/**
 * Word counter specific result
 */
export interface WordCountResult extends TextAnalysisResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  averageWordLength: number;
  averageWordsPerSentence: number;
  longestWord: number;
  shortestWord: number;
  uniqueWords: number;
  readingTime: number;
  speakingTime: number;
}

/**
 * Character counter specific result
 */
export interface CharacterCountResult extends TextAnalysisResult {
  totalCharacters: number;
  charactersWithoutSpaces: number;
  alphabeticCharacters: number;
  numericCharacters: number;
  specialCharacters: number;
  upperCaseLetters: number;
  lowerCaseLetters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  spaces: number;
  punctuation: number;
  uniqueWords: number;
}

/**
 * Text transformation options
 * For encoding, decoding, case conversion, etc.
 */
export interface TextTransformationOptions {
  mode: 'encode' | 'decode' | 'convert';
  type?: 'base64' | 'url' | 'html' | 'uppercase' | 'lowercase' | 'reverse' | 'morse' | 'rot13';
  lineBreakEvery?: number; // For base64 formatting
  addLineBreaks?: boolean;
  urlSafe?: boolean;
  validateInput?: boolean;
  addPadding?: boolean;
  stripWhitespace?: boolean;
  removeSpaces?: boolean;
  preserveFormatting?: boolean;
  customPrefix?: string;
  customSuffix?: string;
}

/**
 * Text transformation result
 */
export interface TextTransformationResult extends TextToolResult {
  originalText: string;
  transformedText: string;
  mode: 'encode' | 'decode' | 'convert';
  type?: string;
  charCount: number;
  byteCount?: number;
  isValid: boolean;
  errorMessage?: string;
  copiedToClipboard?: boolean;
}

/**
 * Password generation options
 */
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean; // Excludes 0, O, 1, l, I
  excludeAmbiguous: boolean; // Excludes confusing characters
  customCharacters?: string;
  excludeCharacters?: string;
  minimumUppercase?: number;
  minimumLowercase?: number;
  minimumNumbers?: number;
  minimumSymbols?: number;
  allowSpaces?: boolean;
}

/**
 * Password strength assessment
 */
export interface PasswordStrength {
  score: number; // 0-100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string; // Color code for visualization
  description: string;
  suggestions?: string[];
}

/**
 * Password entropy calculation
 */
export interface PasswordEntropy {
  entropy: number; // bits
  charsetSize: number;
  crackTimeSeconds: number;
  crackTimeReadable: string;
  estimatedCrackTime: string;
}

/**
 * Password generation result
 */
export interface PasswordGenerationResult extends TextToolResult {
  password: string;
  strength: PasswordStrength;
  entropy: PasswordEntropy;
  options: PasswordOptions;
  length: number;
}

/**
 * Text generation options
 * For text generation, completion, lorem ipsum, etc.
 */
export interface TextGenerationOptions {
  type: 'lorem-ipsum' | 'random-text' | 'placeholder' | 'json' | 'csv';
  paragraphCount?: number;
  sentenceCount?: number;
  wordCount?: number;
  format?: 'paragraph' | 'sentence' | 'word' | 'list';
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  startWithLoremIpsum?: boolean;
}

/**
 * Text generation result
 */
export interface TextGenerationResult extends TextToolResult {
  generatedText: string;
  type: string;
  itemCount: number;
  options: TextGenerationOptions;
}

/**
 * Text comparison result
 * For comparing two texts
 */
export interface TextComparisonResult {
  text1: string;
  text2: string;
  text1Length: number;
  text2Length: number;
  similarity: number; // 0-100 percentage
  differenceCount: number;
  isSame: boolean;
  differences: Array<{
    position: number;
    char1: string;
    char2: string;
  }>;
}

/**
 * Regular expression result
 * For regex matching and replacement
 */
export interface RegexResult extends TextToolResult {
  pattern: string;
  matches: Array<{
    text: string;
    position: number;
    groups?: string[];
  }>;
  matchCount: number;
  replacedText?: string;
  replacementCount?: number;
}

/**
 * Search and replace options
 */
export interface SearchReplaceOptions {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWordsOnly: boolean;
  useRegex: boolean;
  replaceAll: boolean;
}

/**
 * Search and replace result
 */
export interface SearchReplaceResult extends TextToolResult {
  original: string;
  result: string;
  searchTerm: string;
  replaceTerm: string;
  occurrencesFound: number;
  occurrencesReplaced: number;
  caseSensitive: boolean;
  wholeWordsOnly: boolean;
  useRegex: boolean;
}

/**
 * Text sorting and filtering options
 */
export interface TextProcessingOptions {
  operation: 'sort' | 'filter' | 'deduplicate' | 'shuffle' | 'reverse' | 'trim';
  caseSensitive?: boolean;
  removeEmpty?: boolean;
  removeDuplicates?: boolean;
  sortOrder?: 'asc' | 'desc';
  reverseLines?: boolean;
  reverseCells?: boolean;
  lineDelimiter?: 'newline' | 'comma' | 'semicolon' | 'tab' | 'pipe' | 'custom';
  customDelimiter?: string;
}

/**
 * Text processing result
 */
export interface TextProcessingResult extends TextToolResult {
  original: string;
  processed: string;
  operation: string;
  lineCount: number;
  linesAffected: number;
  linesRemoved?: number;
  linesDuplicated?: number;
}

/**
 * Text statistics for advanced analysis
 */
export interface TextStatistics {
  totalWords: number;
  totalCharacters: number;
  totalCharactersNoSpaces: number;
  totalSentences: number;
  totalParagraphs: number;
  totalLines: number;
  averageWordLength: number;
  averageWordsPerSentence: number;
  averageWordsPerParagraph?: number;
  averageCharsPerLine?: number;
  mostFrequentWords?: Array<{ word: string; count: number }>;
  longestWord: string;
  shortestWord: string;
  uniqueWordCount: number;
  wordVariety?: number; // unique / total
  estimatedReadingTime: number; // seconds
  estimatedSpeakingTime: number; // seconds
}

/**
 * Text history entry
 * For tracking text operations history
 */
export interface TextHistoryEntry {
  id: string;
  originalText: string;
  processedText: string;
  operation: string;
  timestamp: Date;
  tags?: string[];
  isFavorite?: boolean;
}

/**
 * Text tool options state
 * Generic UI options for text tools
 */
export interface TextToolUIState {
  showAdvanced: boolean;
  showStatistics: boolean;
  showHistory: boolean;
  showCompare: boolean;
  autoUpdate: boolean;
  selectedHistoryId?: string;
  compareText?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Character frequency analysis
 */
export interface CharacterFrequency {
  character: string;
  count: number;
  percentage: number;
  type: 'letter' | 'number' | 'special' | 'whitespace';
}

/**
 * Word frequency analysis
 */
export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
  length: number;
}

/**
 * Phrase frequency analysis
 */
export interface PhraseFrequency {
  phrase: string;
  count: number;
  percentage: number;
  wordCount: number;
}

/**
 * Clipboard operation result
 */
export interface ClipboardOperation {
  success: boolean;
  text: string;
  textLength: number;
  timestamp: Date;
  action: 'copy' | 'paste' | 'cut';
  errorMessage?: string;
}

/**
 * Text encoding detection
 */
export interface EncodingDetection {
  detectedEncoding: string;
  confidence: number; // 0-100
  alternativeEncodings?: string[];
  bytesNeeded?: number;
  isUtf8Safe: boolean;
}

/**
 * Text validation result
 */
export interface TextValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  validationRules: string[];
}

/**
 * Generic text tool function type
 */
export type TextToolFunction<T extends TextToolResult = TextToolResult> = (
  input: string,
  options?: Record<string, unknown>
) => T;

/**
 * Text export format options
 */
export type TextExportFormat = 'text' | 'json' | 'csv' | 'pdf' | 'docx' | 'markdown';

/**
 * Text import format options
 */
export type TextImportFormat = 'text' | 'json' | 'csv' | 'tsv' | 'markdown' | 'html';

/**
 * Helper function to calculate reading time
 */
export const calculateReadingTime = (wordCount: number, wordsPerMinute = 200): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Helper function to calculate speaking time
 */
export const calculateSpeakingTime = (wordCount: number, wordsPerMinute = 130): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Helper function to analyze text
 */
export const analyzeText = (text: string): TextAnalysisResult => {
  const trimmedText = text.trim();

  // Basic counts
  const totalCharacters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  const words = trimmedText === '' ? 0 : trimmedText.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = trimmedText === '' ? 0 : trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = trimmedText === '' ? 0 : trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const lines = text === '' ? 0 : text.split('\n').length;
  const spaces = (text.match(/\s/g) || []).length;

  // Character breakdown
  const alphabeticCharacters = (text.match(/[a-zA-Z]/g) || []).length;
  const numericCharacters = (text.match(/[0-9]/g) || []).length;
  const specialCharacters = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const punctuation = (text.match(/[.,;:!?'"()[\]{}\-]/g) || []).length;

  // Case analysis
  const upperCaseLetters = (text.match(/[A-Z]/g) || []).length;
  const lowerCaseLetters = (text.match(/[a-z]/g) || []).length;

  // Word analysis
  const wordsArray = trimmedText.split(/\s+/).filter(w => w.length > 0);
  const wordLengths = wordsArray.map(w => w.length);
  const longestWord = wordLengths.length > 0 ? Math.max(...wordLengths) : 0;
  const shortestWord = wordLengths.length > 0 ? Math.min(...wordLengths) : 0;
  const uniqueWordsSet = new Set(wordsArray.map(w => w.toLowerCase()));
  const uniqueWords = uniqueWordsSet.size;

  // Averages
  const totalWordLength = wordsArray.reduce((sum, w) => sum + w.length, 0);
  const averageWordLength = words > 0 ? Math.round((totalWordLength / words) * 10) / 10 : 0;
  const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

  // Time estimates
  const readingTime = calculateReadingTime(words);
  const speakingTime = calculateSpeakingTime(words);

  return {
    inputText: text,
    inputLength: text.length,
    timestamp: new Date(),
    totalCharacters,
    charactersWithoutSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    spaces,
    alphabeticCharacters,
    numericCharacters,
    specialCharacters,
    punctuation,
    upperCaseLetters,
    lowerCaseLetters,
    uniqueWords,
    averageWordLength,
    longestWord,
    shortestWord,
    averageWordsPerSentence,
    readingTime,
    speakingTime
  };
};
