
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Download, Upload, FileText, BarChart3, Check } from 'lucide-react';

interface SentenceCountResult {
  totalSentences: number;
  declarativeSentences: number;
  interrogativeSentences: number;
  exclamatorySentences: number;
  imperativeSentences: number;
  complexSentences: number;
  compoundSentences: number;
  simpleSentences: number;
  averageWordsPerSentence: number;
  averageCharactersPerSentence: number;
  longestSentence: number;
  shortestSentence: number;
  longestSentenceText: string;
  shortestSentenceText: string;
  words: number;
  characters: number;
  charactersNoSpaces: number;
  readingTime: number;
  speakingTime: number;
  sentences: string[];
}

const SentenceCounter = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentenceCountResult | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateSentenceCount = (inputText: string): SentenceCountResult => {
    if (inputText.trim() === '') {
      return {
        totalSentences: 0,
        declarativeSentences: 0,
        interrogativeSentences: 0,
        exclamatorySentences: 0,
        imperativeSentences: 0,
        complexSentences: 0,
        compoundSentences: 0,
        simpleSentences: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerSentence: 0,
        longestSentence: 0,
        shortestSentence: 0,
        longestSentenceText: '',
        shortestSentenceText: '',
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        readingTime: 0,
        speakingTime: 0,
        sentences: []
      };
    }

    // Improved sentence splitting algorithm
    // Handle abbreviations, decimal numbers, and common exceptions
    let processedText = inputText;
    
    // Protect common abbreviations
    const abbreviations = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Sr.', 'Jr.', 'etc.', 'vs.', 'Inc.', 'Ltd.', 'Co.', 'Corp.'];
    abbreviations.forEach(abbr => {
      processedText = processedText.replace(new RegExp(abbr.replace('.', '\\.'), 'g'), abbr.replace('.', '<<<DOT>>>'));
    });

    // Split into sentences using multiple delimiters
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const matches = processedText.match(sentenceRegex) || [];
    
    // Restore abbreviations
    const sentences = matches
      .map(s => s.replace(/<<<DOT>>>/g, '.').trim())
      .filter(sentence => sentence.length > 0 && /\S/.test(sentence));

    // If no sentences found with regex, treat entire text as one sentence if it has content
    if (sentences.length === 0 && inputText.trim().length > 0) {
      sentences.push(inputText.trim());
    }

    const totalSentences = sentences.length;

    // Analyze sentence types by examining the ending punctuation
    let declarativeSentences = 0;
    let interrogativeSentences = 0;
    let exclamatorySentences = 0;
    let imperativeSentences = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.endsWith('?')) {
        interrogativeSentences++;
      } else if (trimmed.endsWith('!')) {
        exclamatorySentences++;
      } else if (trimmed.endsWith('.')) {
        // Check if it's imperative (starts with verb, usually short and direct)
        const words = trimmed.split(/\s+/);
        const firstWord = words[0]?.toLowerCase();
        const imperativeVerbs = ['go', 'come', 'take', 'give', 'make', 'do', 'stop', 'start', 'try', 'use', 'get', 'put', 'call', 'write', 'read', 'open', 'close', 'turn', 'show', 'tell', 'ask', 'help', 'let', 'leave', 'wait', 'listen', 'look', 'watch', 'remember', 'forget', 'bring', 'keep', 'hold', 'send', 'buy', 'sell', 'eat', 'drink', 'run', 'walk', 'sit', 'stand', 'stay', 'move', 'think', 'believe', 'know', 'understand', 'follow', 'check', 'add', 'remove', 'delete', 'save', 'load', 'install', 'download', 'upload', 'click', 'press', 'enter', 'select', 'choose', 'find', 'search', 'create', 'build', 'design', 'plan', 'organize', 'prepare', 'finish', 'complete', 'submit', 'send', 'share', 'post', 'publish', 'update', 'edit', 'change', 'modify', 'fix', 'repair', 'clean', 'wash', 'dry', 'cook', 'bake', 'cut', 'slice', 'pour', 'mix', 'stir', 'heat', 'cool', 'freeze', 'melt', 'fill', 'empty', 'pack', 'unpack', 'wrap', 'unwrap', 'fold', 'unfold', 'hang', 'attach', 'connect', 'disconnect', 'plug', 'unplug', 'switch', 'push', 'pull', 'lift', 'lower', 'raise', 'drop', 'throw', 'catch', 'kick', 'hit', 'touch', 'feel', 'smell', 'taste', 'hear', 'see', 'notice', 'observe', 'examine', 'inspect', 'test', 'measure', 'count', 'calculate', 'compare', 'contrast', 'analyze', 'study', 'learn', 'teach', 'explain', 'describe', 'discuss', 'talk', 'speak', 'say', 'answer', 'reply', 'respond', 'react', 'agree', 'disagree', 'accept', 'reject', 'approve', 'deny', 'allow', 'permit', 'forbid', 'ban', 'block', 'prevent', 'protect', 'defend', 'attack', 'fight', 'argue', 'debate', 'vote', 'elect', 'choose', 'decide', 'determine', 'conclude', 'summarize', 'review', 'revise', 'correct', 'improve', 'enhance', 'upgrade', 'downgrade', 'increase', 'decrease', 'expand', 'reduce', 'grow', 'shrink', 'extend', 'shorten', 'lengthen', 'widen', 'narrow', 'deepen', 'strengthen', 'weaken', 'enable', 'disable', 'activate', 'deactivate', 'initialize', 'terminate', 'begin', 'end', 'continue', 'pause', 'resume', 'restart', 'reset', 'refresh', 'reload', 'restore', 'backup', 'copy', 'paste', 'duplicate', 'move', 'transfer', 'export', 'import', 'format', 'convert', 'transform', 'translate', 'interpret', 'encode', 'decode', 'encrypt', 'decrypt', 'compress', 'decompress', 'zip', 'unzip', 'extract', 'insert', 'append', 'prepend', 'replace', 'substitute', 'swap', 'exchange', 'trade', 'barter', 'negotiate', 'bargain', 'bid', 'offer', 'propose', 'suggest', 'recommend', 'advise', 'warn', 'alert', 'notify', 'inform', 'announce', 'declare', 'proclaim', 'state', 'claim', 'assert', 'affirm', 'confirm', 'verify', 'validate', 'authenticate', 'authorize', 'grant', 'revoke', 'cancel', 'abort', 'quit', 'exit', 'escape', 'avoid', 'evade', 'dodge', 'skip', 'ignore', 'disregard', 'overlook', 'neglect', 'omit', 'exclude', 'eliminate', 'erase', 'clear', 'wipe', 'destroy', 'demolish', 'ruin', 'damage', 'harm', 'hurt', 'injure', 'wound', 'heal', 'cure', 'treat', 'care', 'nurture', 'support', 'assist', 'aid', 'serve', 'provide', 'supply', 'deliver', 'distribute', 'allocate', 'assign', 'designate', 'appoint', 'nominate', 'elect', 'hire', 'employ', 'recruit', 'enlist', 'enroll', 'register', 'join', 'participate', 'contribute', 'donate', 'give', 'offer', 'present', 'award', 'reward', 'compensate', 'pay', 'spend', 'invest', 'save', 'deposit', 'withdraw', 'transfer', 'loan', 'borrow', 'lend', 'rent', 'lease', 'own', 'possess', 'acquire', 'obtain', 'gain', 'earn', 'win', 'lose', 'waste', 'squander', 'conserve', 'preserve', 'maintain', 'sustain', 'continue', 'persist', 'persevere', 'endure', 'survive', 'live', 'exist', 'be', 'become', 'remain', 'stay', 'rest', 'relax', 'enjoy', 'appreciate', 'value', 'respect', 'honor', 'admire', 'praise', 'compliment', 'congratulate', 'celebrate', 'commemorate', 'remember', 'recall', 'recollect', 'reminisce', 'reflect', 'ponder', 'consider', 'contemplate', 'meditate', 'pray', 'worship', 'adore', 'love', 'like', 'prefer', 'favor', 'choose', 'pick', 'elect', 'vote', 'support', 'back', 'endorse', 'sponsor', 'promote', 'advertise', 'market', 'sell', 'buy', 'purchase', 'shop', 'browse', 'explore', 'discover', 'uncover', 'reveal', 'expose', 'display', 'exhibit', 'demonstrate', 'illustrate', 'depict', 'portray', 'represent', 'symbolize', 'signify', 'mean', 'imply', 'suggest', 'indicate', 'point', 'direct', 'guide', 'lead', 'conduct', 'manage', 'control', 'regulate', 'govern', 'rule', 'command', 'order', 'instruct', 'direct', 'supervise', 'oversee', 'monitor', 'watch', 'guard', 'protect'];
        
        if (imperativeVerbs.includes(firstWord) && words.length < 15) {
          imperativeSentences++;
        } else {
          declarativeSentences++;
        }
      } else {
        declarativeSentences++;
      }
    });

    // Analyze sentence complexity
    let complexSentences = 0;
    let compoundSentences = 0;
    let simpleSentences = 0;

    sentences.forEach(sentence => {
      const hasSubordinatingConjunction = /\b(because|since|although|though|while|if|unless|until|when|whenever|where|wherever|whether|after|before|as|than)\b/i.test(sentence);
      const hasCoordinatingConjunction = /\b(and|but|or|nor|for|yet|so)\b/i.test(sentence);
      const hasMultipleClauses = (sentence.match(/,/g) || []).length >= 2;

      if (hasSubordinatingConjunction || hasMultipleClauses) {
        complexSentences++;
      } else if (hasCoordinatingConjunction) {
        compoundSentences++;
      } else {
        simpleSentences++;
      }
    });

    // Calculate word and character counts
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;

    // Calculate sentence statistics
    const sentenceLengths = sentences.map(sentence => {
      const sentenceWords = sentence.trim().split(/\s+/).filter(word => word.length > 0);
      return sentenceWords.length;
    });

    const sentenceCharLengths = sentences.map(sentence => sentence.length);

    const averageWordsPerSentence = totalSentences > 0 ? Math.round((words / totalSentences) * 10) / 10 : 0;
    const averageCharactersPerSentence = totalSentences > 0 ? Math.round((characters / totalSentences) * 10) / 10 : 0;
    
    const longestSentence = sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0;
    const shortestSentence = sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0;

    // Find actual longest and shortest sentence text
    const longestIndex = sentenceLengths.indexOf(longestSentence);
    const shortestIndex = sentenceLengths.indexOf(shortestSentence);
    const longestSentenceText = longestIndex >= 0 ? sentences[longestIndex] : '';
    const shortestSentenceText = shortestIndex >= 0 ? sentences[shortestIndex] : '';

    // Reading time (average 238 words per minute for silent reading)
    const readingTime = Math.ceil(words / 238);

    // Speaking time (average 150 words per minute for speaking)
    const speakingTime = Math.ceil(words / 150);

    return {
      totalSentences,
      declarativeSentences,
      interrogativeSentences,
      exclamatorySentences,
      imperativeSentences,
      complexSentences,
      compoundSentences,
      simpleSentences,
      averageWordsPerSentence,
      averageCharactersPerSentence,
      longestSentence,
      shortestSentence,
      longestSentenceText,
      shortestSentenceText,
      words,
      characters,
      charactersNoSpaces,
      readingTime,
      speakingTime,
      sentences
    };
  };

  // Real-time calculation as user types
  useEffect(() => {
    const result = calculateSentenceCount(text);
    setResult(result);
  }, [text]);

  const handleClear = () => {
    setText('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (result) {
      const stats = `📊 SENTENCE ANALYSIS REPORT
${'='.repeat(50)}

📈 SENTENCE STATISTICS
• Total Sentences: ${result.totalSentences}
• Average Words/Sentence: ${result.averageWordsPerSentence}
• Average Characters/Sentence: ${result.averageCharactersPerSentence}

📝 SENTENCE TYPES
• Declarative (.): ${result.declarativeSentences}
• Interrogative (?): ${result.interrogativeSentences}
• Exclamatory (!): ${result.exclamatorySentences}
• Imperative: ${result.imperativeSentences}

🔍 SENTENCE COMPLEXITY
• Simple Sentences: ${result.simpleSentences}
• Compound Sentences: ${result.compoundSentences}
• Complex Sentences: ${result.complexSentences}

📏 SENTENCE LENGTH ANALYSIS
• Longest Sentence: ${result.longestSentence} words
• Shortest Sentence: ${result.shortestSentence} words

📖 TEXT METRICS
• Total Words: ${result.words}
• Total Characters: ${result.characters}
• Characters (no spaces): ${result.charactersNoSpaces}

⏱️ TIME ESTIMATES
• Reading Time: ${result.readingTime} minute(s)
• Speaking Time: ${result.speakingTime} minute(s)

Generated by DapsiWow Sentence Counter
https://dapsiwow.com/tools/sentence-counter`;
      
      try {
        await navigator.clipboard.writeText(stats);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownload = () => {
    if (result) {
      const stats = `SENTENCE ANALYSIS REPORT
${'='.repeat(50)}

SENTENCE STATISTICS
Total Sentences: ${result.totalSentences}
Average Words/Sentence: ${result.averageWordsPerSentence}
Average Characters/Sentence: ${result.averageCharactersPerSentence}

SENTENCE TYPES
Declarative (.): ${result.declarativeSentences}
Interrogative (?): ${result.interrogativeSentences}
Exclamatory (!): ${result.exclamatorySentences}
Imperative: ${result.imperativeSentences}

SENTENCE COMPLEXITY
Simple Sentences: ${result.simpleSentences}
Compound Sentences: ${result.compoundSentences}
Complex Sentences: ${result.complexSentences}

SENTENCE LENGTH ANALYSIS
Longest Sentence: ${result.longestSentence} words
"${result.longestSentenceText}"

Shortest Sentence: ${result.shortestSentence} words
"${result.shortestSentenceText}"

TEXT METRICS
Total Words: ${result.words}
Total Characters: ${result.characters}
Characters (no spaces): ${result.charactersNoSpaces}

TIME ESTIMATES
Reading Time: ${result.readingTime} minute(s)
Speaking Time: ${result.speakingTime} minute(s)

ALL SENTENCES
${result.sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Generated by DapsiWow Sentence Counter
https://dapsiwow.com/tools/sentence-counter`;
      
      const blob = new Blob([stats], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentence-analysis.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSampleText = () => {
    const sample = `The sentence counter is an essential tool for writers and editors. It helps analyze text structure and improve readability. How many different sentence types can you identify in this example? 

Declarative sentences make statements and end with periods. They provide information and convey facts. This type of sentence is the most common in written English. Writers use declarative sentences to explain concepts, describe situations, and present arguments.

Have you ever wondered about the optimal sentence length? Research suggests that varying sentence length creates more engaging content. Short sentences grab attention. Longer sentences can provide detailed explanations and help you elaborate on complex ideas with multiple clauses and supporting information that enhance understanding.

Use imperative sentences to give commands or instructions. Start with a strong verb. Make your message clear and direct. This approach ensures your readers understand exactly what action to take.

Amazing discoveries await those who analyze their writing! Exclamatory sentences express strong emotions and create emphasis. They add energy and excitement to your content! Use them sparingly for maximum impact!

Complex sentences contain subordinate clauses that depend on the main clause, while compound sentences join two independent clauses with coordinating conjunctions. Understanding these structures helps writers create sophisticated and varied prose that maintains reader interest throughout longer documents.`;
    setText(sample);
  };

  const getReadabilityAssessment = () => {
    if (!result || result.totalSentences === 0) return null;

    const avgWords = result.averageWordsPerSentence;
    let assessment = '';
    let color = '';

    if (avgWords < 10) {
      assessment = 'Very Easy - Great for general audiences';
      color = 'text-green-600';
    } else if (avgWords < 15) {
      assessment = 'Easy - Ideal for most readers';
      color = 'text-blue-600';
    } else if (avgWords < 20) {
      assessment = 'Moderate - Good for educated audiences';
      color = 'text-yellow-600';
    } else if (avgWords < 25) {
      assessment = 'Difficult - Suitable for academic content';
      color = 'text-orange-600';
    } else {
      assessment = 'Very Difficult - Complex academic writing';
      color = 'text-red-600';
    }

    return { assessment, color };
  };

  const readabilityInfo = getReadabilityAssessment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Sentence Counter - Advanced Text Analysis & Writing Improvement Tool | DapsiWow</title>
        <meta name="description" content="Free professional sentence counter with advanced text analysis. Count sentences, analyze types (declarative, interrogative, exclamatory, imperative), measure complexity, and improve writing quality with detailed readability insights." />
        <meta name="keywords" content="sentence counter, sentence analyzer, text analysis, sentence types, writing tool, grammar checker, text statistics, declarative sentences, interrogative sentences, exclamatory sentences, imperative sentences, readability analysis, writing improvement, sentence complexity, simple sentences, compound sentences, complex sentences" />
        <meta property="og:title" content="Sentence Counter - Advanced Text Analysis & Writing Improvement Tool | DapsiWow" />
        <meta property="og:description" content="Professional sentence counter with comprehensive analysis of sentence types, complexity, and structure. Get detailed writing insights to improve your content quality." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sentence-counter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sentence Counter",
            "description": "Professional sentence counter tool with advanced text analysis, sentence type detection, complexity measurement, and writing improvement insights.",
            "url": "https://dapsiwow.com/tools/sentence-counter",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Count total sentences accurately",
              "Analyze all sentence types",
              "Measure sentence complexity",
              "Calculate reading and speaking time",
              "Identify longest and shortest sentences",
              "Real-time text analysis",
              "Download detailed reports",
              "Copy results to clipboard",
              "Upload text files",
              "Writing improvement insights"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Sentence Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Advanced Sentence</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                  Counter & Analyzer
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Analyze sentence structure, count types, measure complexity, and get professional insights to improve your writing quality
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Main Calculator Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Text Analysis</h2>
                      <p className="text-sm sm:text-base text-gray-600">Enter or upload text for comprehensive sentence analysis</p>
                    </div>
                    {readabilityInfo && result && result.totalSentences > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-blue-200">
                        <div className="text-xs text-gray-600">Readability</div>
                        <div className={`text-xs sm:text-sm font-semibold ${readabilityInfo.color}`}>
                          {readabilityInfo.assessment}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Area */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="text-input" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      Text to Analyze
                    </Label>
                    <textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
                      placeholder="Type, paste, or upload your text here for instant sentence analysis. The tool will automatically detect sentence types, measure complexity, calculate reading time, and provide comprehensive writing insights..."
                      data-testid="textarea-text-input"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{text.length.toLocaleString()} characters</span>
                      {result && <span>{result.totalSentences} sentence{result.totalSentences !== 1 ? 's' : ''} detected</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={handleSampleText}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg"
                      data-testid="button-sample-text"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Load Sample
                    </Button>
                    <label htmlFor="file-upload" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Upload File
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-clear-text"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      disabled={!result || result.totalSentences === 0}
                      data-testid="button-copy-stats"
                    >
                      {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Results'}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      disabled={!result || result.totalSentences === 0}
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {result !== null && result.totalSentences > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
                      Analysis Results
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="sentence-statistics">
                      {/* Total Sentences Highlight */}
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg sm:shadow-xl text-white">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">Total Sentences</div>
                          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold break-all" data-testid="stat-total-sentences">
                            {result.totalSentences.toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm opacity-80">
                            {result.words.toLocaleString()} words • {result.characters.toLocaleString()} characters
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-blue-100">
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 break-all" data-testid="stat-avg-words">
                            {result.averageWordsPerSentence}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Avg Words/Sentence</div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-indigo-100">
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 break-all" data-testid="stat-avg-chars">
                            {result.averageCharactersPerSentence}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Avg Chars/Sentence</div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-teal-100">
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-600 break-all" data-testid="stat-longest">
                            {result.longestSentence}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Longest Sentence</div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-cyan-100">
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-600 break-all" data-testid="stat-shortest">
                            {result.shortestSentence}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Shortest Sentence</div>
                        </div>
                      </div>

                      {/* Sentence Types */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Sentence Types</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Declarative (.)</span>
                              <span className="font-bold text-green-600 text-lg sm:text-xl" data-testid="stat-declarative">
                                {result.declarativeSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Statements and facts</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Interrogative (?)</span>
                              <span className="font-bold text-purple-600 text-lg sm:text-xl" data-testid="stat-interrogative">
                                {result.interrogativeSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Questions</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Exclamatory (!)</span>
                              <span className="font-bold text-orange-600 text-lg sm:text-xl" data-testid="stat-exclamatory">
                                {result.exclamatorySentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Strong emotions</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Imperative</span>
                              <span className="font-bold text-blue-600 text-lg sm:text-xl">
                                {result.imperativeSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Commands</div>
                          </div>
                        </div>
                      </div>

                      {/* Sentence Complexity */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Sentence Complexity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Simple</span>
                              <span className="font-bold text-emerald-600 text-lg sm:text-xl">
                                {result.simpleSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Single clause</div>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Compound</span>
                              <span className="font-bold text-amber-600 text-lg sm:text-xl">
                                {result.compoundSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Multiple clauses</div>
                          </div>
                          <div className="bg-rose-50 rounded-lg p-3 sm:p-4 border border-rose-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm">Complex</span>
                              <span className="font-bold text-rose-600 text-lg sm:text-xl">
                                {result.complexSentences}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Dependent clauses</div>
                          </div>
                        </div>
                      </div>

                      {/* Time Estimates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm">Reading Time</span>
                            <span className="font-bold text-pink-600 text-xl sm:text-2xl" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">At 238 words/min</div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm">Speaking Time</span>
                            <span className="font-bold text-violet-600 text-xl sm:text-2xl">
                              {result.speakingTime} min
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">At 150 words/min</div>
                        </div>
                      </div>

                      {/* Longest & Shortest Sentences */}
                      {result.longestSentenceText && result.shortestSentenceText && (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Longest Sentence ({result.longestSentence} words)</h4>
                            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">{result.longestSentenceText}</p>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Shortest Sentence ({result.shortestSentence} words)</h4>
                            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">{result.shortestSentenceText}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Sentence Counter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A sentence counter is a professional text analysis tool that counts and categorizes sentences in written content. 
                    Our advanced algorithm provides comprehensive insights into sentence structure, types, complexity, and readability 
                    metrics essential for effective writing.
                  </p>
                  <p>
                    This free online sentence counter automatically identifies four main sentence types (declarative, interrogative, 
                    exclamatory, and imperative), analyzes sentence complexity (simple, compound, complex), calculates average lengths, 
                    estimates reading and speaking time, and provides detailed statistics to help writers, students, educators, and 
                    professionals improve their content quality and readability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Sentence Counter</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our professional sentence counter is simple and efficient. The tool provides instant, real-time analysis 
                    as you type or paste your content, delivering comprehensive statistics immediately.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Type, paste, or upload text file (.txt, .doc, .docx)</li>
                    <li>View instant real-time sentence analysis</li>
                    <li>Examine sentence type breakdown and distribution</li>
                    <li>Review complexity metrics and readability scores</li>
                    <li>Analyze longest and shortest sentences</li>
                    <li>Copy results to clipboard for quick sharing</li>
                    <li>Download detailed analysis report as text file</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding All Sentence Types</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Declarative Sentences</h4>
                    <p className="text-sm">Statements that provide information, express facts, or make declarations. They end with periods and constitute the majority of written content in most documents.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Interrogative Sentences</h4>
                    <p className="text-sm">Questions that seek information, clarification, or responses from readers. They end with question marks and actively engage the audience by prompting thought or action.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Exclamatory Sentences</h4>
                    <p className="text-sm">Statements that express strong emotion, surprise, or emphasis. They end with exclamation points and add energy, excitement, and emotional impact to writing when used appropriately.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Imperative Sentences</h4>
                    <p className="text-sm">Commands, instructions, or requests that tell readers to do something. They typically start with verbs and are essential for procedural writing, instructions, and calls to action.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sentence Complexity Analysis</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Simple Sentences</h4>
                    <p className="text-sm">Contain one independent clause with a subject and predicate. Simple sentences are clear, direct, and easy to understand, making them ideal for conveying straightforward information.</p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Compound Sentences</h4>
                    <p className="text-sm">Join two or more independent clauses using coordinating conjunctions (and, but, or, nor, for, yet, so). They connect related ideas of equal importance.</p>
                  </div>
                  <div className="border-l-4 border-rose-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Complex Sentences</h4>
                    <p className="text-sm">Contain one independent clause and one or more dependent clauses connected by subordinating conjunctions. They express sophisticated relationships between ideas and add depth to writing.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Professional Sentence Analysis</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve content readability and flow with data-driven insights</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ensure proper sentence variety and structural balance in writing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize content for better reader engagement and comprehension</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Meet academic, professional, and publishing standards</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhance SEO through improved readability and content quality</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Identify and fix monotonous sentence patterns quickly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Get accurate reading and speaking time estimates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Professional Sentence Counters?</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">Content Writers & Bloggers</h4>
                    <p className="text-gray-600 text-sm">
                      Optimize blog posts, articles, and web content for superior readability and engagement. Ensure optimal sentence 
                      variety to maintain reader interest and improve SEO performance through enhanced content quality and structure.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">Students & Academics</h4>
                    <p className="text-gray-600 text-sm">
                      Improve academic writing, essays, research papers, and dissertations by analyzing sentence structure and complexity. 
                      Meet assignment requirements and enhance writing clarity for better grades and academic recognition.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">Professional Writers & Editors</h4>
                    <p className="text-gray-600 text-sm">
                      Create compelling copy, reports, technical documentation, and business communications with optimal sentence structure. 
                      Maintain consistency across different content types and ensure professional writing standards are met.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800">Teachers & Educators</h4>
                    <p className="text-gray-600 text-sm">
                      Analyze student writing, create teaching materials with appropriate complexity levels, and provide data-driven 
                      feedback on sentence structure and variety to help students improve their writing skills.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features of Our Sentence Counter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Real-time Analysis Engine</h4>
                    <p className="text-gray-600 text-sm">
                      Get instant feedback as you type or edit your content. Our advanced algorithm provides real-time sentence 
                      statistics, helping you make improvements immediately without delays.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mt-6">Comprehensive Statistics Dashboard</h4>
                    <p className="text-gray-600 text-sm">
                      Access detailed metrics including sentence counts by type, complexity analysis, average lengths, reading time, 
                      speaking time, and identification of longest and shortest sentences with actual text excerpts.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-800 mt-6">File Upload Support</h4>
                    <p className="text-gray-600 text-sm">
                      Upload text files (.txt, .doc, .docx) directly for analysis without copy-pasting. Perfect for analyzing 
                      longer documents, manuscripts, or multiple files efficiently.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Export & Download Capabilities</h4>
                    <p className="text-gray-600 text-sm">
                      Download comprehensive analysis reports as text files or copy results to clipboard for use in reports, 
                      documentation, presentations, or further analysis. Perfect for professional workflows.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mt-6">Sample Text Learning Tool</h4>
                    <p className="text-gray-600 text-sm">
                      Use our professionally crafted sample text to understand how different sentence types, complexity levels, 
                      and structures affect overall readability and engagement in various writing contexts.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-800 mt-6">Readability Assessment</h4>
                    <p className="text-gray-600 text-sm">
                      Get instant readability assessment based on average sentence length, helping you optimize content for your 
                      target audience whether general readers, professionals, or academic audiences.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the sentence counting algorithm?</h4>
                      <p className="text-gray-600 text-sm">Our advanced algorithm uses sophisticated punctuation analysis and handles common abbreviations, decimal numbers, and edge cases to provide highly accurate sentence detection for English text content.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the ideal sentence length for readability?</h4>
                      <p className="text-gray-600 text-sm">For most content, 15-20 words per sentence is optimal for readability. However, varying sentence length (mix of short, medium, and long) creates better flow, maintains engagement, and prevents monotony.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for academic writing and research?</h4>
                      <p className="text-gray-600 text-sm">Yes, our tool is perfect for academic writing, research papers, essays, and dissertations. It helps ensure proper sentence structure, appropriate complexity, and meets academic writing standards for various educational levels.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does sentence variety improve writing?</h4>
                      <p className="text-gray-600 text-sm">Varying sentence types (declarative, interrogative, exclamatory, imperative) and complexity (simple, compound, complex) creates rhythm, maintains reader interest, emphasizes key points, and makes content more engaging and memorable.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is the sentence counter completely free?</h4>
                      <p className="text-gray-600 text-sm">Yes, our professional sentence counter is 100% free with no registration, hidden fees, or usage limits. You can analyze unlimited text and access all advanced features at no cost.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does this tool help with SEO optimization?</h4>
                      <p className="text-gray-600 text-sm">Better sentence structure and readability scores are ranking factors for search engines. Well-structured content with appropriate sentence variety increases user engagement, reduces bounce rates, and improves SEO performance.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I analyze text in languages other than English?</h4>
                      <p className="text-gray-600 text-sm">The tool is optimized for English text and uses English punctuation patterns and grammar rules. While it may work with other languages using similar punctuation, accuracy will vary based on language structure.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What file formats can I upload for analysis?</h4>
                      <p className="text-gray-600 text-sm">You can upload .txt (plain text), .doc, and .docx (Microsoft Word) files. The tool extracts the text content and performs comprehensive sentence analysis on the uploaded document.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h3>
                <p className="text-gray-700 mb-8">Enhance your writing analysis with our comprehensive suite of professional text tools designed to improve content quality, readability, and effectiveness.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/word-counter" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors text-xl font-bold">
                      W
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h4>
                    <p className="text-gray-600 text-sm">Count words, characters, paragraphs with detailed reading time estimates, keyword density analysis, and SEO optimization insights.</p>
                  </a>
                  
                  <a href="/tools/character-counter" className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-green-100">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors text-xl font-bold">
                      C
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Character Counter</h4>
                    <p className="text-gray-600 text-sm">Analyze character count, spaces, special characters with social media optimization features for various platforms.</p>
                  </a>
                  
                  <a href="/tools/paragraph-counter" className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-purple-100">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-700 transition-colors text-xl font-bold">
                      P
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Paragraph Counter</h4>
                    <p className="text-gray-600 text-sm">Count and analyze paragraph structure, length distribution for improved content organization and readability.</p>
                  </a>

                  <a href="/tools/text-statistics-analyzer" className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-orange-100">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-700 transition-colors text-xl font-bold">
                      T
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Text Statistics Analyzer</h4>
                    <p className="text-gray-600 text-sm">Comprehensive text analysis with advanced readability scores, lexical diversity, and detailed writing metrics.</p>
                  </a>

                  <a href="/tools/case-converter" className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-700 transition-colors text-xl font-bold">
                      A
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">Case Converter</h4>
                    <p className="text-gray-600 text-sm">Convert text between different cases: uppercase, lowercase, title case, sentence case, and more formatting options.</p>
                  </a>

                  <a href="/tools/duplicate-line-remover" className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group border border-pink-100">
                    <div className="w-12 h-12 bg-pink-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-700 transition-colors text-xl font-bold">
                      D
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600">Duplicate Line Remover</h4>
                    <p className="text-gray-600 text-sm">Remove duplicate lines, sort text, and clean up content for improved organization and clarity.</p>
                  </a>
                </div>
                
                <div className="mt-8 text-center">
                  <a href="/text" className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    View All Text Tools
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SentenceCounter;
