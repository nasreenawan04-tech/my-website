import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoremOptions {
  type: 'paragraphs' | 'words' | 'sentences';
  count: number;
  startWithLorem: boolean;
}

const LoremIpsumGenerator = () => {
  const [options, setOptions] = useState<LoremOptions>({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true
  });
  const [generatedText, setGeneratedText] = useState('');

  // Lorem ipsum word bank
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
    'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit', 'sed',
    'quia', 'consequuntur', 'magni', 'dolores', 'ratione', 'sequi', 'nesciunt',
    'neque', 'porro', 'quisquam', 'dolorem', 'adipisci', 'numquam', 'eius', 'modi',
    'tempora', 'incidunt', 'magnam', 'quaerat', 'voluptatem', 'aliquam', 'quam',
    'nihil', 'molestiae', 'illum', 'fugiat', 'quo', 'voluptas', 'nulla', 'minima',
    'nostrum', 'exercitationem', 'ullam', 'corporis', 'suscipit', 'laboriosam'
  ];

  const generateRandomWords = (count: number, startWithLorem: boolean = false): string[] => {
    const words: string[] = [];
    
    if (startWithLorem && count >= 5) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      count -= 5;
    }
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * loremWords.length);
      words.push(loremWords[randomIndex]);
    }
    
    return words;
  };

  const generateSentence = (startWithLorem: boolean = false): string => {
    const wordCount = Math.floor(Math.random() * 15) + 5; // 5-20 words per sentence
    const words = generateRandomWords(wordCount, startWithLorem);
    
    // Capitalize first word
    if (words.length > 0) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    
    return words.join(' ') + '.';
  };

  const generateParagraph = (startWithLorem: boolean = false): string => {
    const sentenceCount = Math.floor(Math.random() * 6) + 3; // 3-8 sentences per paragraph
    const sentences: string[] = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      const shouldStartWithLorem = startWithLorem && i === 0;
      sentences.push(generateSentence(shouldStartWithLorem));
    }
    
    return sentences.join(' ');
  };

  const generateLorem = () => {
    let result = '';
    
    switch (options.type) {
      case 'words':
        const words = generateRandomWords(options.count, options.startWithLorem);
        if (words.length > 0) {
          words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        }
        result = words.join(' ') + '.';
        break;
        
      case 'sentences':
        const sentences: string[] = [];
        for (let i = 0; i < options.count; i++) {
          const shouldStartWithLorem = options.startWithLorem && i === 0;
          sentences.push(generateSentence(shouldStartWithLorem));
        }
        result = sentences.join(' ');
        break;
        
      case 'paragraphs':
      default:
        const paragraphs: string[] = [];
        for (let i = 0; i < options.count; i++) {
          const shouldStartWithLorem = options.startWithLorem && i === 0;
          paragraphs.push(generateParagraph(shouldStartWithLorem));
        }
        result = paragraphs.join('\n\n');
        break;
    }
    
    setGeneratedText(result);
  };

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
    }
  };

  const handleClear = () => {
    setGeneratedText('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Lorem Ipsum Generator - Generate Placeholder Text | DapsiWow</title>
        <meta name="description" content="Free Lorem Ipsum generator tool to create placeholder text for designs, websites, and documents. Generate paragraphs, sentences, or words instantly." />
        <meta name="keywords" content="lorem ipsum generator, placeholder text, dummy text, filler text, text generator, design placeholder" />
        <meta property="og:title" content="Lorem Ipsum Generator - Generate Placeholder Text" />
        <meta property="og:description" content="Free Lorem Ipsum generator to create placeholder text for designs and websites. Generate custom amounts of paragraphs, sentences, or words." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/lorem-ipsum-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-paragraph text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Lorem Ipsum Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Generate placeholder text for your designs, websites, and documents with customizable options
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="px-16 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Settings Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Generation Settings</h2>
                    
                    {/* Type Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="type-select" className="text-sm font-medium text-gray-700">
                        Generate Type
                      </Label>
                      <Select
                        value={options.type}
                        onValueChange={(value: 'paragraphs' | 'words' | 'sentences') => 
                          setOptions(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="w-full" data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paragraphs">Paragraphs</SelectItem>
                          <SelectItem value="sentences">Sentences</SelectItem>
                          <SelectItem value="words">Words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Count Input */}
                    <div className="space-y-3">
                      <Label htmlFor="count-input" className="text-sm font-medium text-gray-700">
                        Number of {options.type.charAt(0).toUpperCase() + options.type.slice(1)}
                      </Label>
                      <input
                        id="count-input"
                        type="number"
                        min="1"
                        max="50"
                        value={options.count}
                        onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        data-testid="input-count"
                      />
                    </div>

                    {/* Start with Lorem Option */}
                    <div className="flex items-center space-x-3">
                      <input
                        id="start-lorem"
                        type="checkbox"
                        checked={options.startWithLorem}
                        onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        data-testid="checkbox-start-lorem"
                      />
                      <Label htmlFor="start-lorem" className="text-sm font-medium text-gray-700">
                        Start with "Lorem ipsum"
                      </Label>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateLorem}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      data-testid="button-generate"
                    >
                      <i className="fas fa-magic mr-2"></i>
                      Generate Lorem Ipsum
                    </Button>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Generated Text</h2>
                    
                    {/* Generated Text Area */}
                    <div className="space-y-3">
                      <Label htmlFor="generated-text" className="text-sm font-medium text-gray-700">
                        Your Lorem Ipsum Text
                      </Label>
                      <textarea
                        id="generated-text"
                        value={generatedText}
                        readOnly
                        className="w-full h-80 p-4 text-base border border-gray-200 rounded-lg bg-gray-50 resize-none"
                        placeholder="Click 'Generate Lorem Ipsum' to create placeholder text..."
                        data-testid="textarea-generated-text"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1"
                        disabled={!generatedText}
                        data-testid="button-copy-text"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Text
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1"
                        disabled={!generatedText}
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear
                      </Button>
                    </div>

                    {/* Text Statistics */}
                    {generatedText && (
                      <div className="bg-blue-50 rounded-lg p-4" data-testid="text-statistics">
                        <h3 className="font-semibold text-blue-900 mb-2">Text Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-600 font-medium">Characters: </span>
                            <span className="text-gray-700">{generatedText.length.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">Words: </span>
                            <span className="text-gray-700">
                              {generatedText.trim() ? generatedText.trim().split(/\s+/).length.toLocaleString() : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is Lorem Ipsum */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Lorem Ipsum?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Lorem Ipsum</strong> is placeholder text commonly used in the printing and typesetting industry since the 1500s. It's derived from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC.
              </p>
              
              <p className="text-gray-700 mb-6">
                The text has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
              </p>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Lorem Ipsum Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Choose Type</h3>
                    <p className="text-gray-600">Select whether you want to generate paragraphs, sentences, or individual words.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Set Count</h3>
                    <p className="text-gray-600">Specify how many paragraphs, sentences, or words you need for your project.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Choose Starting Option</h3>
                    <p className="text-gray-600">Decide whether to start with the traditional "Lorem ipsum" phrase or random text.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Generate & Copy</h3>
                    <p className="text-gray-600">Click generate to create your text, then copy it for use in your projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-palette text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Web Design</h3>
                <p className="text-gray-600 text-sm">Fill content areas while designing websites and web applications.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-print text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Print Design</h3>
                <p className="text-gray-600 text-sm">Create layouts for brochures, flyers, and printed materials.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Development</h3>
                <p className="text-gray-600 text-sm">Test layouts and templates during software development.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-pencil-alt text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Content Planning</h3>
                <p className="text-gray-600 text-sm">Plan content structure and spacing before writing actual copy.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Why use Lorem Ipsum instead of real text?</h3>
                <p className="text-gray-600">Lorem Ipsum prevents content from distracting viewers during design phases, allowing focus on visual elements and layout rather than readable content.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is Lorem Ipsum just random text?</h3>
                <p className="text-gray-600">No, Lorem Ipsum is based on classical Latin literature from Cicero, though it has been altered over the centuries to remove meaningful content.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for commercial projects?</h3>
                <p className="text-gray-600">Yes! Lorem Ipsum is free to use for any purpose, including commercial projects. It's industry standard placeholder text.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How many words should I generate?</h3>
                <p className="text-gray-600">It depends on your needs. For web design, 2-3 paragraphs usually work well. For testing layouts, you might need more or less depending on your content areas.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoremIpsumGenerator;