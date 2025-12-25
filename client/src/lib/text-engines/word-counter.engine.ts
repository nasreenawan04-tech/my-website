import { WordCountResult, TextToolResult, analyzeText } from '@/types/text-tool.types';

/**
 * Word counter calculator function type with proper generic typing
 */
export type WordCounterFunction = (input: string) => WordCountResult;

/**
 * Calculates word count and comprehensive text statistics
 * Returns strongly-typed WordCountResult with all metrics
 * 
 * @param inputText - The text to analyze
 * @returns WordCountResult with word, character, and sentence counts plus time estimates
 */
export const calculateWordCount: WordCounterFunction = (inputText: string): WordCountResult => {
  const startTime = performance.now();
  
  // Use the shared analyzeText function from types
  const analysis = analyzeText(inputText);
  
  // Transform analysis result into WordCountResult with required fields
  const result: WordCountResult = {
    ...analysis,
    characters: analysis.totalCharacters,
    charactersNoSpaces: analysis.charactersWithoutSpaces,
    averageWordLength: analysis.averageWordLength ?? 0,
    averageWordsPerSentence: analysis.averageWordsPerSentence ?? 0,
    longestWord: analysis.longestWord ?? 0,
    shortestWord: analysis.shortestWord ?? 0,
    uniqueWords: analysis.uniqueWords ?? 0,
    readingTime: analysis.readingTime ?? 0,
    speakingTime: analysis.speakingTime ?? 0,
  };
  
  // Add processing time
  result.processingTime = Math.round(performance.now() - startTime);
  
  return result;
};

/**
 * Validates input for word counting
 * 
 * @param text - Text to validate
 * @returns True if text is valid for word counting
 */
export const isValidWordCountInput = (text: string): boolean => {
  return typeof text === 'string';
};

/**
 * Helper function to format word count result for display
 * 
 * @param result - WordCountResult to format
 * @returns Formatted statistics object
 */
export const formatWordCountResult = (result: WordCountResult) => {
  return {
    totalWords: result.words.toLocaleString(),
    totalCharacters: result.characters.toLocaleString(),
    charactersNoSpaces: result.charactersNoSpaces.toLocaleString(),
    sentences: result.sentences.toLocaleString(),
    paragraphs: result.paragraphs.toLocaleString(),
    lines: result.lines.toLocaleString(),
    averageWordLength: result.averageWordLength.toFixed(1),
    averageWordsPerSentence: result.averageWordsPerSentence.toFixed(1),
    longestWord: result.longestWord.toLocaleString(),
    shortestWord: result.shortestWord.toLocaleString(),
    uniqueWords: result.uniqueWords?.toLocaleString() || '0',
    readingTime: `${result.readingTime || 0} min`,
    speakingTime: `${result.speakingTime || 0} min`,
  };
};
