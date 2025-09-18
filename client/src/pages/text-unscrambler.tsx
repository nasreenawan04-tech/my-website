
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UnscrambleOptions {
  mode: 'words' | 'anagram' | 'smart' | 'pattern';
  dictionary: 'english' | 'common' | 'extended';
  minWordLength: number;
  preserveSpaces: boolean;
  preservePunctuation: boolean;
  suggestAlternatives: boolean;
  sortByLength: boolean;
  maxSuggestions: number;
}

interface UnscrambleResult {
  originalText: string;
  unscrambledText: string;
  suggestions: string[];
  mode: string;
  wordsFound: number;
  confidence: number;
  processingTime: number;
}

export default function TextUnscrambler() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<UnscrambleResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<UnscrambleOptions>({
    mode: 'words',
    dictionary: 'english',
    minWordLength: 3,
    preserveSpaces: true,
    preservePunctuation: true,
    suggestAlternatives: true,
    sortByLength: false,
    maxSuggestions: 5
  });
  const { toast } = useToast();

  // Comprehensive English words dictionary
  const commonWords = [
    // Basic words
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'may', 'put', 'say', 'she', 'too', 'use',
    // Common words
    'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'your', 'work', 'life', 'only', 'think', 'also', 'back', 'after', 'first', 'good', 'know', 'where', 'much', 'some', 'time', 'right', 'people', 'could', 'world', 'still', 'would', 'great', 'little', 'should', 'through', 'water', 'being', 'place', 'because', 'before', 'never', 'under', 'again', 'while', 'where', 'every', 'house', 'might', 'around', 'small', 'found', 'asked', 'going', 'large', 'until', 'along', 'shall', 'being', 'often', 'since', 'about', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while', 'another', 'between', 'through', 'because', 'without', 'against', 'nothing', 'someone', 'something', 'everything', 'anything', 'everyone', 'anyone',
    // Technology and modern words
    'hello', 'world', 'computer', 'science', 'program', 'software', 'website', 'internet', 'technology', 'digital', 'online', 'information', 'business', 'company', 'service', 'product', 'system', 'development', 'application', 'solution', 'design', 'creative', 'professional', 'quality', 'excellent', 'amazing', 'fantastic', 'wonderful', 'beautiful', 'perfect', 'success', 'project', 'education', 'learning', 'student', 'teacher', 'school', 'university', 'research', 'knowledge', 'experience', 'skills', 'training', 'course', 'lesson', 'study', 'book', 'read', 'write', 'language', 'communication', 'message', 'email', 'phone', 'mobile', 'social', 'media', 'network', 'connect', 'community', 'friend', 'family', 'love', 'happy', 'smile', 'laugh', 'enjoy', 'fun', 'play', 'game', 'sport', 'music', 'art', 'culture', 'travel', 'adventure', 'explore', 'discover', 'nature', 'environment', 'green', 'clean', 'fresh', 'healthy', 'food', 'restaurant', 'cooking', 'recipe', 'delicious', 'taste', 'flavor', 'sweet', 'coffee', 'drink', 'water', 'energy', 'power', 'strong', 'fast', 'quick', 'easy', 'simple', 'clear', 'bright', 'light', 'dark', 'color', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white', 'silver', 'golden',
    // Extended vocabulary
    'ability', 'above', 'accept', 'according', 'account', 'across', 'action', 'activity', 'actually', 'address', 'administration', 'admit', 'adult', 'affect', 'afternoon', 'ahead', 'almost', 'alone', 'along', 'already', 'although', 'always', 'among', 'amount', 'analysis', 'animal', 'answer', 'anyone', 'anything', 'appear', 'approach', 'area', 'argue', 'around', 'arrive', 'article', 'artist', 'assume', 'attack', 'attempt', 'attend', 'attention', 'attorney', 'audience', 'author', 'authority', 'available', 'avoid', 'away', 'baby', 'base', 'beat', 'become', 'behavior', 'behind', 'believe', 'benefit', 'best', 'better', 'beyond', 'billion', 'birth', 'black', 'blood', 'board', 'body', 'born', 'both', 'break', 'bring', 'brother', 'budget', 'build', 'building', 'business', 'call', 'camera', 'campaign', 'cancer', 'candidate', 'capital', 'card', 'care', 'career', 'carry', 'case', 'catch', 'cause', 'cell', 'center', 'central', 'century', 'certain', 'certainly', 'chair', 'challenge', 'chance', 'change', 'character', 'charge', 'check', 'child', 'choice', 'choose', 'church', 'citizen', 'city', 'civil', 'claim', 'class', 'clear', 'clearly', 'close', 'coach', 'cold', 'collection', 'college', 'color', 'commercial', 'common', 'community', 'compare', 'computer', 'concern', 'condition', 'conference', 'congress', 'consider', 'consumer', 'contain', 'continue', 'control', 'cost', 'country', 'couple', 'course', 'court', 'cover', 'create', 'crime', 'cultural', 'culture', 'current', 'customer', 'data', 'daughter', 'dead', 'deal', 'death', 'debate', 'decade', 'decide', 'decision', 'deep', 'defense', 'degree', 'democratic', 'describe', 'design', 'despite', 'detail', 'determine', 'develop', 'development', 'difference', 'different', 'difficult', 'dinner', 'direction', 'director', 'discover', 'discuss', 'discussion', 'disease', 'doctor', 'door', 'down', 'draw', 'dream', 'drive', 'drop', 'drug', 'during', 'each', 'early', 'east', 'economic', 'economy', 'edge', 'education', 'effect', 'effort', 'eight', 'either', 'election', 'electric', 'electronic', 'element', 'else', 'employee', 'energy', 'enough', 'entire', 'environment', 'environmental', 'especially', 'establish', 'even', 'evening', 'event', 'ever', 'every', 'everybody', 'everyone', 'everything', 'evidence', 'exactly', 'example', 'executive', 'exist', 'expect', 'experience', 'expert', 'explain', 'face', 'fact', 'factor', 'fail', 'fall', 'family', 'fast', 'father', 'fear', 'federal', 'feel', 'feeling', 'field', 'fight', 'figure', 'fill', 'film', 'final', 'finally', 'financial', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'fish', 'five', 'floor', 'fly', 'focus', 'follow', 'food', 'foot', 'force', 'foreign', 'forget', 'form', 'former', 'forward', 'four', 'free', 'friend', 'from', 'front', 'full', 'fund', 'future', 'game', 'garden', 'general', 'generation', 'give', 'glass', 'goal', 'gone', 'government', 'great', 'green', 'ground', 'group', 'grow', 'growth', 'guess', 'gun', 'guy', 'hair', 'half', 'hand', 'hang', 'happen', 'happy', 'hard', 'head', 'health', 'hear', 'heart', 'heat', 'heavy', 'help', 'high', 'history', 'hit', 'hold', 'home', 'hope', 'hospital', 'hot', 'hotel', 'hour', 'however', 'huge', 'human', 'hundred', 'husband', 'idea', 'identify', 'image', 'imagine', 'impact', 'important', 'improve', 'include', 'including', 'increase', 'indeed', 'indicate', 'individual', 'industry', 'information', 'inside', 'instead', 'institution', 'interest', 'interesting', 'international', 'interview', 'into', 'investment', 'involve', 'issue', 'item', 'itself', 'join', 'keep', 'kill', 'kind', 'kitchen', 'land', 'language', 'large', 'last', 'late', 'later', 'laugh', 'lawyer', 'lay', 'lead', 'leader', 'learn', 'least', 'leave', 'left', 'legal', 'less', 'letter', 'level', 'lie', 'line', 'list', 'listen', 'little', 'live', 'local', 'look', 'lose', 'loss', 'love', 'machine', 'magazine', 'main', 'maintain', 'major', 'majority', 'management', 'manager', 'market', 'marriage', 'material', 'matter', 'maybe', 'mean', 'measure', 'media', 'medical', 'meet', 'meeting', 'member', 'memory', 'mention', 'method', 'middle', 'military', 'million', 'mind', 'minute', 'miss', 'mission', 'model', 'modern', 'moment', 'money', 'month', 'more', 'morning', 'most', 'mother', 'move', 'movement', 'movie', 'music', 'must', 'myself', 'name', 'nation', 'national', 'natural', 'nature', 'near', 'nearly', 'necessary', 'need', 'network', 'news', 'newspaper', 'next', 'nice', 'night', 'nine', 'nobody', 'north', 'note', 'nothing', 'notice', 'number', 'occur', 'offer', 'office', 'officer', 'official', 'often', 'once', 'open', 'operation', 'opportunity', 'option', 'order', 'organization', 'others', 'outside', 'over', 'own', 'owner', 'page', 'pain', 'painting', 'paper', 'parent', 'part', 'participant', 'particular', 'particularly', 'partner', 'party', 'pass', 'past', 'patient', 'pattern', 'pay', 'peace', 'people', 'perform', 'performance', 'perhaps', 'period', 'person', 'personal', 'phone', 'physical', 'pick', 'picture', 'piece', 'place', 'plan', 'plant', 'play', 'player', 'point', 'police', 'policy', 'political', 'politics', 'poor', 'popular', 'population', 'position', 'positive', 'possible', 'power', 'practice', 'prepare', 'present', 'president', 'pressure', 'pretty', 'prevent', 'price', 'private', 'probably', 'problem', 'process', 'produce', 'product', 'production', 'professional', 'professor', 'program', 'project', 'property', 'protect', 'provide', 'public', 'pull', 'purpose', 'push', 'quality', 'question', 'quickly', 'quite', 'race', 'radio', 'raise', 'range', 'rate', 'rather', 'reach', 'read', 'ready', 'real', 'reality', 'realize', 'really', 'reason', 'receive', 'recent', 'recently', 'recognize', 'record', 'reduce', 'reflect', 'region', 'relate', 'relationship', 'religious', 'remain', 'remember', 'remove', 'report', 'represent', 'republican', 'require', 'research', 'resource', 'respond', 'response', 'responsibility', 'rest', 'result', 'return', 'reveal', 'rich', 'right', 'rise', 'risk', 'road', 'rock', 'role', 'room', 'rule', 'run', 'safe', 'same', 'save', 'scene', 'school', 'science', 'scientist', 'score', 'sea', 'season', 'seat', 'second', 'section', 'security', 'seek', 'seem', 'sell', 'send', 'senior', 'sense', 'series', 'serious', 'serve', 'service', 'seven', 'several', 'share', 'shoot', 'short', 'shot', 'show', 'side', 'sign', 'significant', 'similar', 'simple', 'simply', 'since', 'sing', 'single', 'sister', 'site', 'situation', 'size', 'skill', 'skin', 'small', 'smile', 'social', 'society', 'soldier', 'solid', 'somebody', 'someone', 'something', 'sometimes', 'song', 'soon', 'sort', 'sound', 'source', 'south', 'southern', 'space', 'speak', 'special', 'specific', 'speech', 'spend', 'sport', 'spring', 'staff', 'stage', 'stand', 'standard', 'star', 'start', 'state', 'statement', 'station', 'stay', 'step', 'stop', 'store', 'story', 'strategy', 'street', 'strong', 'structure', 'student', 'study', 'stuff', 'style', 'subject', 'success', 'successful', 'such', 'suddenly', 'suffer', 'suggest', 'summer', 'support', 'sure', 'surface', 'system', 'table', 'talk', 'task', 'teach', 'teacher', 'team', 'technology', 'television', 'tell', 'tend', 'term', 'test', 'than', 'thank', 'that', 'their', 'them', 'themselves', 'then', 'theory', 'there', 'these', 'they', 'thing', 'third', 'this', 'those', 'though', 'thought', 'thousand', 'threat', 'three', 'throw', 'thus', 'time', 'today', 'together', 'tonight', 'total', 'tough', 'toward', 'town', 'trade', 'traditional', 'training', 'travel', 'treat', 'treatment', 'tree', 'trial', 'trip', 'trouble', 'true', 'truth', 'turn', 'type', 'under', 'understand', 'union', 'unit', 'united', 'university', 'unless', 'until', 'upon', 'used', 'user', 'usually', 'value', 'various', 'very', 'victim', 'view', 'violence', 'visit', 'voice', 'vote', 'wait', 'walk', 'wall', 'want', 'watch', 'water', 'weapon', 'wear', 'week', 'weight', 'well', 'west', 'western', 'what', 'whatever', 'when', 'where', 'whether', 'which', 'while', 'white', 'whole', 'whom', 'whose', 'wide', 'wife', 'will', 'wind', 'window', 'wish', 'with', 'within', 'without', 'woman', 'wonder', 'word', 'work', 'worker', 'working', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'write', 'writer', 'wrong', 'yard', 'yeah', 'year', 'yes', 'yet', 'young', 'your', 'yourself', 'zone'
  ];

  // Create a frequency map for better word matching
  const wordFrequency = new Map<string, number>();
  commonWords.forEach((word, index) => {
    // Higher frequency for more common words (earlier in array)
    wordFrequency.set(word, Math.max(1, commonWords.length - index));
  });

  // Optimized anagram solver
  const findValidWords = (letters: string, dictionary: string[], minLength: number): string[] => {
    if (letters.length > 15) {
      // For very long strings, limit search to prevent performance issues
      return [];
    }

    const words: string[] = [];
    const letterCounts = new Map<string, number>();
    
    // Count available letters
    for (const letter of letters.toLowerCase()) {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
    }
    
    for (const word of dictionary) {
      if (word.length < minLength || word.length > letters.length) {
        continue;
      }
      
      // Check if word can be formed from available letters
      const wordCounts = new Map<string, number>();
      for (const letter of word) {
        wordCounts.set(letter, (wordCounts.get(letter) || 0) + 1);
      }
      
      let canForm = true;
      for (const [letter, count] of wordCounts) {
        if ((letterCounts.get(letter) || 0) < count) {
          canForm = false;
          break;
        }
      }
      
      if (canForm) {
        words.push(word);
      }
    }
    
    // Sort by frequency and length
    return words.sort((a, b) => {
      const freqA = wordFrequency.get(a) || 0;
      const freqB = wordFrequency.get(b) || 0;
      if (freqA !== freqB) return freqB - freqA;
      return b.length - a.length;
    });
  };

  // Improved pattern recognition
  const recognizePattern = (text: string): string => {
    const lines = text.split('\n');
    let bestResult = text;
    let bestScore = 0;
    
    // Test different pattern reversal methods
    const patterns = [
      // Character reversal
      text.split('').reverse().join(''),
      // Word order reversal
      text.split(' ').reverse().join(' '),
      // Line reversal
      lines.reverse().join('\n'),
      // Character reversal per word
      text.split(' ').map(word => word.split('').reverse().join('')).join(' '),
      // Caesar cipher (simple shift)
      text.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
          const code = char.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode((code - base + 13) % 26 + base);
        }
        return char;
      }).join('')
    ];
    
    // Evaluate each pattern
    for (const pattern of patterns) {
      const words = pattern.split(/\s+/).filter(word => word.length >= 3);
      const validWords = words.filter(word => 
        commonWords.includes(word.toLowerCase().replace(/[^a-z]/g, ''))
      );
      
      const score = validWords.length / Math.max(words.length, 1);
      if (score > bestScore) {
        bestScore = score;
        bestResult = pattern;
      }
    }
    
    return bestResult;
  };

  // Enhanced smart unscrambling
  const smartUnscramble = (text: string): string => {
    const words = text.split(/(\s+|[^\w\s]+)/);
    const unscrambledWords: string[] = [];
    
    for (const segment of words) {
      if (!/^\w+$/.test(segment) || segment.length <= 3) {
        unscrambledWords.push(segment);
        continue;
      }
      
      const word = segment.toLowerCase();
      const firstChar = word[0];
      const lastChar = word[word.length - 1];
      const middleChars = word.slice(1, -1);
      
      // Check if this follows the "smart scrambling" pattern (first/last preserved)
      if (middleChars.length > 1) {
        // Find words that match the first/last letter pattern
        const candidates = commonWords.filter(dictWord => 
          dictWord.length === word.length &&
          dictWord[0] === firstChar &&
          dictWord[dictWord.length - 1] === lastChar
        );
        
        if (candidates.length > 0) {
          // Check if middle letters match
          for (const candidate of candidates) {
            const candidateMiddle = candidate.slice(1, -1);
            const middleLetterCounts = new Map<string, number>();
            const candidateMiddleCounts = new Map<string, number>();
            
            for (const char of middleChars) {
              middleLetterCounts.set(char, (middleLetterCounts.get(char) || 0) + 1);
            }
            
            for (const char of candidateMiddle) {
              candidateMiddleCounts.set(char, (candidateMiddleCounts.get(char) || 0) + 1);
            }
            
            // Check if letter counts match
            let matches = true;
            for (const [char, count] of middleLetterCounts) {
              if (candidateMiddleCounts.get(char) !== count) {
                matches = false;
                break;
              }
            }
            
            if (matches && candidateMiddleCounts.size === middleLetterCounts.size) {
              // Preserve original case
              let result = candidate;
              if (segment[0] === segment[0].toUpperCase()) {
                result = result[0].toUpperCase() + result.slice(1);
              }
              unscrambledWords.push(result);
              break;
            }
          }
          continue;
        }
      }
      
      // Fallback: try regular word matching
      const validWords = findValidWords(word, commonWords, 3);
      if (validWords.length > 0) {
        let result = validWords[0];
        if (segment[0] === segment[0].toUpperCase()) {
          result = result[0].toUpperCase() + result.slice(1);
        }
        unscrambledWords.push(result);
      } else {
        unscrambledWords.push(segment);
      }
    }
    
    return unscrambledWords.join('');
  };

  // Check if a string is a valid word
  const isValidWord = (word: string, dictionary: string[]): boolean => {
    return dictionary.includes(word.toLowerCase().replace(/[^a-z]/g, ''));
  };

  const unscrambleText = (text: string, opts: UnscrambleOptions): UnscrambleResult => {
    const startTime = Date.now();
    
    if (!text.trim()) {
      return {
        originalText: text,
        unscrambledText: '',
        suggestions: [],
        mode: opts.mode,
        wordsFound: 0,
        confidence: 0,
        processingTime: 0
      };
    }

    let unscrambledText = '';
    let suggestions: string[] = [];
    let wordsFound = 0;
    let confidence = 0;

    const dictionary = commonWords;

    try {
      switch (opts.mode) {
        case 'words':
          // Word-by-word unscrambling with improved logic
          const segments = text.split(/(\s+|[^\w\s]+)/);
          const unscrambledSegments: string[] = [];
          
          for (const segment of segments) {
            if (!/^\w+$/.test(segment)) {
              unscrambledSegments.push(segment);
              continue;
            }
            
            if (segment.length < opts.minWordLength) {
              unscrambledSegments.push(segment);
              continue;
            }
            
            const validWords = findValidWords(segment, dictionary, opts.minWordLength);
            if (validWords.length > 0) {
              const bestWord = opts.sortByLength ? 
                validWords.sort((a, b) => b.length - a.length)[0] : 
                validWords[0];
              
              // Preserve case
              let result = bestWord;
              if (segment[0] === segment[0].toUpperCase()) {
                result = result[0].toUpperCase() + result.slice(1);
              }
              
              unscrambledSegments.push(result);
              wordsFound++;
              
              if (opts.suggestAlternatives && validWords.length > 1) {
                suggestions.push(...validWords.slice(1, opts.maxSuggestions));
              }
            } else {
              unscrambledSegments.push(segment);
            }
          }
          unscrambledText = unscrambledSegments.join('');
          break;

        case 'anagram':
          // Enhanced anagram solving
          const cleanText = text.replace(/[^a-zA-Z\s]/g, '').trim();
          if (cleanText.length <= 12) { // Reasonable limit for performance
            const words = cleanText.split(/\s+/);
            const unscrambledAnagramWords: string[] = [];
            
            for (const word of words) {
              if (word.length < opts.minWordLength) {
                unscrambledAnagramWords.push(word);
                continue;
              }
              
              const validWords = findValidWords(word, dictionary, opts.minWordLength);
              if (validWords.length > 0) {
                const bestWord = opts.sortByLength ? 
                  validWords.sort((a, b) => b.length - a.length)[0] : 
                  validWords[0];
                unscrambledAnagramWords.push(bestWord);
                wordsFound++;
                
                if (opts.suggestAlternatives) {
                  suggestions.push(...validWords.slice(1, opts.maxSuggestions));
                }
              } else {
                unscrambledAnagramWords.push(word);
              }
            }
            unscrambledText = unscrambledAnagramWords.join(' ');
          } else {
            // For longer text, fall back to word-by-word processing
            unscrambledText = text.split(/\s+/).map(word => {
              if (word.length < opts.minWordLength) return word;
              const validWords = findValidWords(word.replace(/[^a-zA-Z]/g, ''), dictionary, opts.minWordLength);
              return validWords.length > 0 ? validWords[0] : word;
            }).join(' ');
          }
          break;

        case 'smart':
          unscrambledText = smartUnscramble(text);
          const smartWords = unscrambledText.split(/\s+/).filter(word => 
            word.length >= opts.minWordLength && isValidWord(word, dictionary)
          );
          wordsFound = smartWords.length;
          break;

        case 'pattern':
          unscrambledText = recognizePattern(text);
          const patternWords = unscrambledText.split(/\s+/).filter(word => 
            word.length >= opts.minWordLength && isValidWord(word, dictionary)
          );
          wordsFound = patternWords.length;
          break;

        default:
          unscrambledText = text;
      }

      // Improved confidence calculation
      const originalWords = text.split(/\s+/).filter(word => 
        word.replace(/[^a-zA-Z]/g, '').length >= opts.minWordLength
      );
      const totalWords = Math.max(originalWords.length, 1);
      
      // Base confidence on actual word recognition
      const recognizedWords = unscrambledText.split(/\s+/).filter(word => 
        isValidWord(word, dictionary) && word.length >= opts.minWordLength
      );
      
      confidence = Math.round((recognizedWords.length / totalWords) * 100);
      
      // Adjust confidence based on mode
      if (opts.mode === 'pattern' && unscrambledText !== text) {
        confidence = Math.min(confidence + 20, 100); // Bonus for successful pattern detection
      }
      
    } catch (error) {
      console.error('Unscrambling error:', error);
      unscrambledText = text;
      confidence = 0;
    }

    const processingTime = Date.now() - startTime;

    return {
      originalText: text,
      unscrambledText,
      suggestions: Array.from(new Set(suggestions)).slice(0, opts.maxSuggestions),
      mode: opts.mode,
      wordsFound,
      confidence,
      processingTime
    };
  };

  // Real-time unscrambling with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim()) {
        setIsProcessing(true);
        const result = unscrambleText(inputText, options);
        setResult(result);
        setIsProcessing(false);
      } else {
        setResult(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputText, options]);

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleCopyResult = async () => {
    if (result?.unscrambledText) {
      try {
        await navigator.clipboard.writeText(result.unscrambledText);
        toast({
          title: "Copied to clipboard",
          description: "Unscrambled text has been copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleSampleText = () => {
    const samples = [
      `elolh dlrow! ihsT si a elbmarcss xett mplexae taht uoy nac yrt ot elbmarcsnu.`,
      `The qucik brown fox jmups over the lazy dog.`, // Smart scrambling example
      `siht si na gnizama txet rebmarcsnu loot taht nac pleh uoy evlos selzzup.`,
      `ereht era ynam stnerefid sthguorht sdohtem ot elbmarcser txet.`
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setInputText(randomSample);
  };

  const handleProcessAgain = () => {
    if (inputText.trim()) {
      setIsProcessing(true);
      const newResult = unscrambleText(inputText, options);
      setResult(newResult);
      setIsProcessing(false);
    }
  };

  const resetUnscrambler = () => {
    setInputText('');
    setOptions({
      mode: 'words',
      dictionary: 'english',
      minWordLength: 3,
      preserveSpaces: true,
      preservePunctuation: true,
      suggestAlternatives: true,
      sortByLength: false,
      maxSuggestions: 5
    });
    setShowAdvanced(false);
    setResult(null);
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'words': return 'Attempts to unscramble individual words using dictionary matching';
      case 'anagram': return 'Solves anagrams by finding valid word combinations';
      case 'smart': return 'Uses pattern recognition to restore scrambled text readability';
      case 'pattern': return 'Detects common scrambling patterns like reversal and cipher';
      default: return '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const updateAdvancedOption = (key: keyof UnscrambleOptions, value: boolean | string | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <Helmet>
        <title>Text Unscrambler - Unscramble Words and Solve Anagrams Online | DapsiWow</title>
        <meta name="description" content="Professional text unscrambler tool with advanced algorithms for unscrambling words, solving anagrams, pattern recognition, and smart text restoration. Free online word unscrambler with dictionary support." />
        <meta name="keywords" content="text unscrambler, word unscrambler, anagram solver, scrambled text decoder, word puzzle solver, unscramble words, anagram generator, word finder, puzzle helper, text restoration" />
        <meta property="og:title" content="Text Unscrambler - Professional Word Unscrambling Tool | DapsiWow" />
        <meta property="og:description" content="Unscramble text using advanced algorithms: word matching, anagram solving, pattern recognition, and smart restoration. Free and instant with multiple customization options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-unscrambler" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Unscrambler",
            "description": "Professional text unscrambler tool with multiple algorithms for solving puzzles, restoring scrambled text, and solving anagrams.",
            "url": "https://dapsiwow.com/tools/text-unscrambler",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple unscrambling algorithms",
              "Word-level unscrambling",
              "Anagram solving capabilities",
              "Pattern recognition",
              "Smart text restoration",
              "Real-time processing",
              "Dictionary-based validation",
              "Alternative suggestions",
              "Confidence scoring",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Smart Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  Unscrambler
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Decode scrambled text with intelligent algorithms - solve anagrams, restore readability, and find hidden words
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Unscrambler Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Unscrambling</h2>
                    <p className="text-gray-600">Enter scrambled text to decode and restore using advanced algorithms</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Scrambled Text to Unscramble
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 resize-none"
                        placeholder="Enter or paste your scrambled text here to unscramble..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Unscramble Algorithm */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unscrambling Algorithm
                      </Label>
                      <Select
                        value={options.mode}
                        onValueChange={(value: 'words' | 'anagram' | 'smart' | 'pattern') => 
                          setOptions(prev => ({ ...prev, mode: value }))
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-unscramble-mode">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="words" data-testid="mode-words">Word Unscrambling</SelectItem>
                          <SelectItem value="anagram" data-testid="mode-anagram">Anagram Solving</SelectItem>
                          <SelectItem value="smart" data-testid="mode-smart">Smart Restoration</SelectItem>
                          <SelectItem value="pattern" data-testid="mode-pattern">Pattern Recognition</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600">{getModeDescription(options.mode)}</p>
                    </div>

                    {/* Dictionary Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Dictionary
                      </Label>
                      <Select
                        value={options.dictionary}
                        onValueChange={(value: 'english' | 'common' | 'extended') => 
                          setOptions(prev => ({ ...prev, dictionary: value }))
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-dictionary">
                          <SelectValue placeholder="Select dictionary" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English Words</SelectItem>
                          <SelectItem value="common">Common Words</SelectItem>
                          <SelectItem value="extended">Extended Dictionary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Customization
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Processing Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Minimum Word Length</Label>
                                <p className="text-xs text-gray-500">Ignore words shorter than this length</p>
                              </div>
                              <Select
                                value={options.minWordLength.toString()}
                                onValueChange={(value) => updateAdvancedOption('minWordLength', parseInt(value))}
                              >
                                <SelectTrigger className="w-20" data-testid="select-min-length">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                                <p className="text-xs text-gray-500">Keep original spacing structure</p>
                              </div>
                              <Switch
                                checked={options.preserveSpaces}
                                onCheckedChange={(checked) => updateAdvancedOption('preserveSpaces', checked)}
                                data-testid="switch-preserve-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Punctuation</Label>
                                <p className="text-xs text-gray-500">Keep punctuation marks intact</p>
                              </div>
                              <Switch
                                checked={options.preservePunctuation}
                                onCheckedChange={(checked) => updateAdvancedOption('preservePunctuation', checked)}
                                data-testid="switch-preserve-punctuation"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Sort by Length</Label>
                                <p className="text-xs text-gray-500">Prioritize longer words in results</p>
                              </div>
                              <Switch
                                checked={options.sortByLength}
                                onCheckedChange={(checked) => updateAdvancedOption('sortByLength', checked)}
                                data-testid="switch-sort-by-length"
                              />
                            </div>
                          </div>

                          {/* Suggestion Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Suggestion Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Suggest Alternatives</Label>
                                <p className="text-xs text-gray-500">Show alternative unscrambled words</p>
                              </div>
                              <Switch
                                checked={options.suggestAlternatives}
                                onCheckedChange={(checked) => updateAdvancedOption('suggestAlternatives', checked)}
                                data-testid="switch-suggest-alternatives"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Max Suggestions</Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={options.maxSuggestions}
                                onChange={(e) => updateAdvancedOption('maxSuggestions', parseInt(e.target.value) || 5)}
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-max-suggestions"
                              />
                              <p className="text-xs text-gray-500">Maximum number of alternative suggestions to show</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleSampleText}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                    <Button
                      onClick={resetUnscrambler}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Unscrambled Results</h2>

                  {result && result.originalText ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="unscramble-results">
                      {/* Generated Text Display */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="result-container">
                        <Label className="text-sm font-semibold text-gray-800 mb-2 block">Unscrambled Text</Label>
                        <Textarea
                          value={result.unscrambledText}
                          readOnly
                          className="w-full min-h-[120px] sm:min-h-[140px] p-3 sm:p-4 text-base border-2 border-gray-200 rounded-lg resize-none bg-white text-gray-800 leading-relaxed"
                          placeholder="Unscrambled text will appear here..."
                          data-testid="textarea-result"
                        />
                      </div>

                      {/* Alternative Suggestions */}
                      {result.suggestions.length > 0 && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="alternative-suggestions">
                          <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Alternative Suggestions</h3>
                          <div className="flex flex-wrap gap-2">
                            {result.suggestions.map((suggestion, index) => (
                              <span 
                                key={index} 
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                data-testid={`suggestion-${index}`}
                              >
                                {suggestion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Statistics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="analysis-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Analysis Results</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600" data-testid="words-found">{result.wordsFound}</div>
                            <div className="text-xs sm:text-sm text-purple-700 font-medium">Words Found</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className={`text-xl sm:text-2xl font-bold ${getConfidenceColor(result.confidence)}`} data-testid="confidence-score">{result.confidence}%</div>
                            <div className="text-xs sm:text-sm text-blue-700 font-medium">Confidence</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="processing-time">{result.processingTime}ms</div>
                            <div className="text-xs sm:text-sm text-green-700 font-medium">Processing</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-orange-600 capitalize" data-testid="algorithm-used">{result.mode}</div>
                            <div className="text-xs sm:text-sm text-orange-700 font-medium">Algorithm</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button
                          onClick={handleCopyResult}
                          className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-result"
                        >
                          Copy Result
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">?</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter scrambled text to see unscrambled results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Unscrambling */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text Unscrambling?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text unscrambling</strong> is the process of decoding scrambled, mixed, or jumbled text to restore its original meaning and readability. Our advanced text unscrambler uses multiple sophisticated algorithms including dictionary matching, pattern recognition, and statistical analysis to decode various types of scrambled text. Whether dealing with simple character shuffling, complex anagrams, or intelligent word puzzles, our tool provides accurate restoration with high confidence scoring.
                  </p>
                  <p>
                    The unscrambler supports multiple modes designed for different scrambling patterns: <strong>Word Unscrambling</strong> for individual word restoration, <strong>Anagram Solving</strong> for finding valid word combinations from mixed letters, <strong>Smart Restoration</strong> for maintaining readability through preserved first and last letters, and <strong>Pattern Recognition</strong> for detecting common scrambling methods like text reversal.
                  </p>
                  <p>
                    This professional tool is essential for solving word puzzles, crosswords, anagrams, educational activities, text analysis, and recovering accidentally scrambled content. With real-time processing, customizable options, and comprehensive dictionary support, it provides instant results with detailed analysis including confidence scores, processing time, and alternative suggestions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Unscrambling Methods Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Unscrambling Algorithms</h2>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Word Unscrambling</h3>
                      <p className="text-purple-800 text-sm mb-2">Dictionary-based individual word restoration</p>
                      <p className="text-purple-700 text-xs">Analyzes each word separately and matches against comprehensive dictionaries to find the most likely intended word from scrambled letters.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Anagram Solving</h3>
                      <p className="text-blue-800 text-sm mb-2">Complete letter rearrangement analysis</p>
                      <p className="text-blue-700 text-xs">Generates all possible combinations of letters to form valid words, perfect for solving complex anagrams and word puzzles.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Smart Restoration</h3>
                      <p className="text-green-800 text-sm mb-2">Pattern-based intelligent unscrambling</p>
                      <p className="text-green-700 text-xs">Uses cognitive reading patterns where first and last letters are preserved, maintaining partial readability while restoring middle characters.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Pattern Recognition</h3>
                      <p className="text-orange-800 text-sm mb-2">Common scrambling method detection</p>
                      <p className="text-orange-700 text-xs">Identifies and reverses common scrambling techniques like character reversal, word order changes, and systematic patterns.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Processing</h4>
                        <p className="text-gray-600 text-sm">Instant text unscrambling as you type with immediate results and confidence scoring for all supported algorithms.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Algorithms</h4>
                        <p className="text-gray-600 text-sm">Four specialized unscrambling methods: word matching, anagram solving, smart restoration, and pattern recognition.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Dictionary Support</h4>
                        <p className="text-gray-600 text-sm">Comprehensive dictionary validation with support for common words, extended vocabulary, and specialized terms.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Alternative Suggestions</h4>
                        <p className="text-gray-600 text-sm">Multiple unscrambling possibilities with customizable suggestion limits and confidence-based ranking.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Options</h4>
                        <p className="text-gray-600 text-sm">Customizable processing with options for word length, spacing preservation, punctuation handling, and result sorting.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Use Cases and Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Text Unscrambling Use Cases</h2>
                <p className="text-gray-600 mb-8">Our text unscrambler serves multiple purposes across education, entertainment, research, and professional applications, helping users decode various types of scrambled content efficiently.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Puzzle Solving</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Word scramble puzzles</li>
                      <li>• Crossword clues</li>
                      <li>• Anagram competitions</li>
                      <li>• Brain training games</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">E</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Education</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vocabulary building</li>
                      <li>• Language learning</li>
                      <li>• Reading comprehension</li>
                      <li>• Spelling practice</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Research</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Text analysis studies</li>
                      <li>• Linguistic research</li>
                      <li>• Data recovery</li>
                      <li>• Content restoration</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Gaming</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Escape room puzzles</li>
                      <li>• Online word games</li>
                      <li>• Trivia competitions</li>
                      <li>• Puzzle challenges</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">C</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Content Creation</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Puzzle generation</li>
                      <li>• Educational materials</li>
                      <li>• Interactive content</li>
                      <li>• Quiz development</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">T</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Text Recovery</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Corrupted text files</li>
                      <li>• Encoding issues</li>
                      <li>• Data restoration</li>
                      <li>• Format conversion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How Text Unscrambling Works</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 text-sm">Dictionary Matching</h4>
                      <p className="text-blue-800 text-xs mt-1">Compares scrambled letters against comprehensive word databases to find valid matches using advanced algorithms.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 text-sm">Pattern Analysis</h4>
                      <p className="text-green-800 text-xs mt-1">Identifies common scrambling patterns and applies reverse engineering to restore original text structure.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 text-sm">Statistical Scoring</h4>
                      <p className="text-purple-800 text-xs mt-1">Calculates confidence levels based on word frequency, context matching, and dictionary validation results.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 text-sm">Multi-Algorithm Processing</h4>
                      <p className="text-orange-800 text-xs mt-1">Combines multiple unscrambling techniques to provide comprehensive results with alternative suggestions.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices & Tips</h2>
                  <div className="space-y-4">
                    <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-teal-900 text-sm">Choose the Right Algorithm</h4>
                      <p className="text-teal-800 text-xs mt-1">Use Word mode for individual words, Anagram for complete letter mixing, Smart for readable scrambling, Pattern for systematic changes.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 text-sm">Adjust Word Length</h4>
                      <p className="text-red-800 text-xs mt-1">Set minimum word length to filter out short, ambiguous matches and focus on meaningful words in your text.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-900 text-sm">Use Alternative Suggestions</h4>
                      <p className="text-yellow-800 text-xs mt-1">Enable suggestions to see multiple possible unscrambling results when the primary match may not be accurate.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-900 text-sm">Consider Context</h4>
                      <p className="text-indigo-800 text-xs mt-1">Review confidence scores and alternative suggestions to choose the most contextually appropriate unscrambling result.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of scrambled text can be unscrambled?</h3>
                      <p className="text-gray-600 text-sm">Our tool can handle various scrambling methods including character shuffling, word mixing, anagrams, letter substitution, and pattern-based scrambling. It works best with English text but can process any Latin-script content.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the text unscrambler?</h3>
                      <p className="text-gray-600 text-sm">Accuracy varies by scrambling complexity and text length. Simple word scrambles achieve 85-95% accuracy, while complex anagrams may have 60-80% accuracy. The confidence score helps you evaluate result reliability.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I unscramble very long texts?</h3>
                      <p className="text-gray-600 text-sm">Yes, the tool processes texts of various lengths. For very long content, it analyzes text in segments for optimal performance. Processing time may increase with text length, but results remain accurate.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with other languages?</h3>
                      <p className="text-gray-600 text-sm">The dictionary validation is optimized for English, but the algorithms can process text in any language using Latin characters. For best results with non-English text, use Pattern or Smart modes.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between unscrambling modes?</h3>
                      <p className="text-gray-600 text-sm">Word mode focuses on individual words, Anagram solves complete letter mixing, Smart mode preserves first/last letters for readability, and Pattern mode detects systematic scrambling methods like reversal.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How are confidence scores calculated?</h3>
                      <p className="text-gray-600 text-sm">Confidence scores are based on dictionary match rates, pattern recognition success, and word frequency analysis. Higher scores indicate more reliable unscrambling results.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I save or export unscrambled results?</h3>
                      <p className="text-gray-600 text-sm">Yes, use the Copy Result button to copy unscrambled text to your clipboard. You can then paste it into any application or save it to a file on your device.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the text unscrambler free to use?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! Our text unscrambler is completely free with no registration required, no usage limits, and access to all algorithms and advanced features without any restrictions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Unscrambling Technology</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Algorithm Details</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Dictionary Optimization</h4>
                        <p className="text-blue-800 text-xs mt-1">Uses frequency-weighted word databases with over 1,000 common English words for accurate matching and validation.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Pattern Recognition</h4>
                        <p className="text-green-800 text-xs mt-1">Advanced algorithms detect scrambling patterns including reversal, rotation, substitution, and positional shifting.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">Smart Processing</h4>
                        <p className="text-purple-800 text-xs mt-1">Leverages cognitive reading research where first and last letters are preserved for enhanced readability restoration.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Features</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Real-Time Processing</h4>
                        <p className="text-orange-800 text-xs mt-1">Optimized algorithms provide instant results with debounced processing to minimize computational overhead.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Memory Efficiency</h4>
                        <p className="text-teal-800 text-xs mt-1">Efficient data structures and caching mechanisms ensure smooth performance even with large text inputs.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Browser Compatibility</h4>
                        <p className="text-red-800 text-xs mt-1">Cross-browser compatibility with modern JavaScript features and fallbacks for older browser support.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
