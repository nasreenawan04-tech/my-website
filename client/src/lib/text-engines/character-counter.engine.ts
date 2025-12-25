import { CharacterCountResult, analyzeText } from '@/types/text-tool.types';

/**
 * Character counter calculator function type with proper generic typing
 */
export type CharacterCounterFunction = (input: string) => CharacterCountResult;

/**
 * Calculates character count with detailed character breakdown analysis
 * Returns strongly-typed CharacterCountResult with comprehensive metrics
 * 
 * @param inputText - The text to analyze
 * @returns CharacterCountResult with detailed character type breakdown
 */
export const calculateCharacterCount: CharacterCounterFunction = (inputText: string): CharacterCountResult => {
  const startTime = performance.now();
  
  // Use the shared analyzeText function from types
  const analysis = analyzeText(inputText);
  
  // Cast to CharacterCountResult (already contains all needed fields)
  const result: CharacterCountResult = analysis as CharacterCountResult;
  
  // Add processing time
  result.processingTime = Math.round(performance.now() - startTime);
  
  return result;
};

/**
 * Validates input for character counting
 * 
 * @param text - Text to validate
 * @returns True if text is valid for character counting
 */
export const isValidCharacterCountInput = (text: string): boolean => {
  return typeof text === 'string';
};

/**
 * Analyzes character composition percentages
 * 
 * @param result - CharacterCountResult to analyze
 * @returns Object with character type percentages
 */
export const analyzeCharacterComposition = (result: CharacterCountResult) => {
  const total = result.totalCharacters || 1;
  
  return {
    alphabeticPercentage: ((result.alphabeticCharacters || 0) / total * 100).toFixed(1),
    numericPercentage: ((result.numericCharacters || 0) / total * 100).toFixed(1),
    specialPercentage: ((result.specialCharacters || 0) / total * 100).toFixed(1),
    spacePercentage: ((result.spaces || 0) / total * 100).toFixed(1),
  };
};

/**
 * Helper function to format character count result for display
 * 
 * @param result - CharacterCountResult to format
 * @returns Formatted statistics object
 */
export const formatCharacterCountResult = (result: CharacterCountResult) => {
  const avgWordLength = result.words > 0 
    ? (result.charactersWithoutSpaces / result.words).toFixed(1) 
    : '0';
  const avgWordsPerSentence = result.sentences > 0 
    ? (result.words / result.sentences).toFixed(1) 
    : '0';
  const readingTime = result.words > 0 ? Math.ceil(result.words / 200) : 0;
  const speakingTime = result.words > 0 ? Math.ceil(result.words / 130) : 0;
  
  return {
    totalCharacters: result.totalCharacters.toLocaleString(),
    charactersNoSpaces: result.charactersWithoutSpaces.toLocaleString(),
    alphabeticCharacters: (result.alphabeticCharacters || 0).toLocaleString(),
    numericCharacters: (result.numericCharacters || 0).toLocaleString(),
    specialCharacters: (result.specialCharacters || 0).toLocaleString(),
    upperCaseLetters: (result.upperCaseLetters || 0).toLocaleString(),
    lowerCaseLetters: (result.lowerCaseLetters || 0).toLocaleString(),
    words: result.words.toLocaleString(),
    sentences: result.sentences.toLocaleString(),
    paragraphs: result.paragraphs.toLocaleString(),
    lines: result.lines.toLocaleString(),
    spaces: (result.spaces || 0).toLocaleString(),
    punctuation: (result.punctuation || 0).toLocaleString(),
    uniqueWords: (result.uniqueWords || 0).toLocaleString(),
    averageWordLength: avgWordLength,
    averageWordsPerSentence: avgWordsPerSentence,
    readingTime: `${readingTime} min`,
    speakingTime: `${speakingTime} min`,
  };
};
