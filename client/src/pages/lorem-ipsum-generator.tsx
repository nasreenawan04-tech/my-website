
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoremOptions {
  type: 'paragraphs' | 'words' | 'sentences';
  count: number;
  startWithLorem: boolean;
}

export default function LoremIpsumGenerator() {
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

  const resetGenerator = () => {
    setOptions({
      type: 'paragraphs',
      count: 3,
      startWithLorem: true
    });
    setGeneratedText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Lorem Ipsum Generator - Create Professional Placeholder Text | DapsiWow</title>
        <meta name="description" content="Generate Lorem ipsum placeholder text for web design, print layouts, and content mockups. Professional dummy text generator with customizable paragraphs, sentences, and word counts." />
        <meta name="keywords" content="lorem ipsum generator, placeholder text generator, dummy text, filler text, design placeholder, web design text, mockup text, latin text generator, content placeholder" />
        <meta property="og:title" content="Lorem Ipsum Generator - Create Professional Placeholder Text | DapsiWow" />
        <meta property="og:description" content="Free Lorem ipsum generator for designers and developers. Create customizable placeholder text for websites, print designs, and content layouts instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/lorem-ipsum-generator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Lorem Ipsum Generator",
            "description": "Professional Lorem ipsum text generator for creating placeholder content in web design, print layouts, and content mockups with customizable output options.",
            "url": "https://dapsiwow.com/tools/lorem-ipsum-generator",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Generate paragraphs, sentences, or words",
              "Customizable text length",
              "Traditional Lorem ipsum start option",
              "Instant text generation",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Professional Text Generator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Lorem Ipsum
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Generate professional placeholder text for web design, print layouts, and content mockups
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-1.5 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Generation Settings</h2>
                    <p className="text-gray-600">Configure your placeholder text requirements</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Type Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="type-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Generate Type
                      </Label>
                      <Select
                        value={options.type}
                        onValueChange={(value: 'paragraphs' | 'words' | 'sentences') => 
                          setOptions(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-type">
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
                      <Label htmlFor="count-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Number of {options.type.charAt(0).toUpperCase() + options.type.slice(1)}
                      </Label>
                      <Input
                        id="count-input"
                        type="number"
                        min="1"
                        max="50"
                        value={options.count}
                        onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="3"
                        data-testid="input-count"
                      />
                    </div>

                    {/* Start with Lorem Option */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <input
                          id="start-lorem"
                          type="checkbox"
                          checked={options.startWithLorem}
                          onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                          className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-start-lorem"
                        />
                        <label htmlFor="start-lorem" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Start with "Lorem ipsum"
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        Begin with the traditional Lorem ipsum phrase for industry standard placeholder text
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={generateLorem}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-generate"
                      >
                        Generate Text
                      </Button>
                      <Button
                        onClick={resetGenerator}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-1.5 bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Generated Text</h2>
                  
                  {generatedText ? (
                    <div className="space-y-6" data-testid="text-results">
                      {/* Generated Text Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <textarea
                          value={generatedText}
                          readOnly
                          className="w-full h-64 lg:h-80 p-4 text-base border-0 resize-none focus:outline-none bg-transparent text-gray-800 leading-relaxed"
                          placeholder="Generated text will appear here..."
                          data-testid="textarea-generated-text"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleCopy}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-text"
                        >
                          Copy Text
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear-text"
                        >
                          Clear
                        </Button>
                      </div>

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="text-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Text Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{generatedText.length.toLocaleString()}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {generatedText.trim() ? generatedText.trim().split(/\s+/).length.toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-green-700 font-medium">Words</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {generatedText.trim() ? generatedText.split(/[.!?]+/).filter(s => s.trim()).length : 0}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">Sentences</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">¶</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and generate to see placeholder text</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Lorem Ipsum?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Lorem Ipsum is the printing and typesetting industry's standard dummy text since the 1500s. 
                    It's derived from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes 
                    of Good and Evil) by Cicero, written in 45 BC.
                  </p>
                  <p>
                    Our Lorem Ipsum generator creates professional placeholder text that allows designers and 
                    developers to focus on visual elements without being distracted by readable content. The text 
                    maintains natural language patterns while remaining meaningless, making it perfect for mockups 
                    and design layouts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Lorem Ipsum Generator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Lorem Ipsum text prevents content from distracting viewers during the design phase, allowing 
                    focus on typography, layout, and visual hierarchy. It's the industry standard for placeholder 
                    content used by designers worldwide.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Professional industry standard since the 1500s</li>
                    <li>Maintains focus on visual design elements</li>
                    <li>Prevents content bias during layout decisions</li>
                    <li>Consistent text patterns for reliable testing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Generator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Generate paragraphs, sentences, or individual words</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Customizable text length up to 50 units</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Traditional "Lorem ipsum" start option</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant generation with copy functionality</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time text statistics display</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Web design mockups and wireframes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Print design layouts and typography testing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Content management system templates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Marketing material prototypes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Document template creation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Use Cases by Profession */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lorem Ipsum Generator Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Web Designers & Developers</h4>
                    <p className="text-gray-600">
                      Use Lorem ipsum text to fill website templates, test responsive layouts, and demonstrate 
                      content hierarchy without client content distractions. Perfect for wireframes, prototypes, 
                      and client presentations where design takes precedence over content.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Graphic & Print Designers</h4>
                    <p className="text-gray-600">
                      Fill brochures, flyers, magazines, and book layouts to test typography, spacing, and 
                      overall design balance before final content. Essential for professional print design 
                      workflows and client mockup presentations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Marketing Professionals</h4>
                    <p className="text-gray-600">
                      Create marketing material mockups, test email templates, and design promotional content 
                      layouts with consistent placeholder text. Ideal for A/B testing different design approaches 
                      and content structure planning.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Content Managers & Writers</h4>
                    <p className="text-gray-600">
                      Plan content layouts, test blog themes, and design editorial templates before writing 
                      actual articles. Great for testing readability and visual appeal of different text 
                      lengths and content structures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Generation Options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Paragraph Generation</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Generate complete paragraph blocks with multiple sentences, ideal for content areas, 
                      blog post mockups, and article layouts.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Best for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Website content areas</li>
                        <li>Blog post layouts</li>
                        <li>Article templates</li>
                        <li>Document formatting</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Sentence Generation</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Create individual sentences perfect for headlines, captions, and short content blocks 
                      where precise text length control is needed.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Best for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Headlines and titles</li>
                        <li>Image captions</li>
                        <li>Menu items</li>
                        <li>Button labels</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Word Generation</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Generate individual words for testing typography, spacing, and layout designs where 
                      word-level control is essential.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Best for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Typography testing</li>
                        <li>Logo design</li>
                        <li>Brand naming</li>
                        <li>Label design</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History and Origin */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">The History and Origin of Lorem Ipsum</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Ancient Roman Origins</h4>
                    <p className="text-sm">
                      Lorem Ipsum originates from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" 
                      (The Extremes of Good and Evil) by Marcus Tullius Cicero, written in 45 BC. This classical 
                      Latin literature has been adapted over centuries to create the modern placeholder text we 
                      use today.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Renaissance Printing</h4>
                    <p className="text-sm">
                      The text gained popularity during the Renaissance when an unknown printer took a galley of 
                      type and scrambled it to make a type specimen book. It has survived not only five centuries 
                      but also the leap into electronic typesetting, remaining essentially unchanged.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Modern Digital Era</h4>
                    <p className="text-sm">
                      Lorem Ipsum was popularized in the 1960s with the release of Letraset sheets containing 
                      Lorem Ipsum passages, and more recently with desktop publishing software like Aldus 
                      PageMaker including versions of Lorem Ipsum as standard placeholder text.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Industry Standard Today</h4>
                    <p className="text-sm">
                      Today, Lorem Ipsum is the universal standard for placeholder text across web design, 
                      print media, and digital publishing. Our generator continues this tradition while 
                      offering modern customization options for contemporary design workflows.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is Lorem Ipsum used for?</h4>
                      <p className="text-gray-600 text-sm">
                        Lorem Ipsum is used as placeholder text in the printing and typesetting industry. 
                        It allows designers to focus on visual elements without being distracted by readable 
                        content, making it perfect for mockups, templates, and design layouts.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is Lorem Ipsum random text?</h4>
                      <p className="text-gray-600 text-sm">
                        No, Lorem Ipsum is based on classical Latin literature from Cicero's work written in 
                        45 BC. While it has been altered over time to remove meaningful content, it maintains 
                        natural language patterns that make it ideal for design purposes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use Lorem Ipsum for commercial projects?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, Lorem Ipsum is free to use for any purpose, including commercial projects. It's 
                        the industry standard placeholder text and is widely accepted for professional design 
                        and development work across all industries.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much Lorem Ipsum text should I generate?</h4>
                      <p className="text-gray-600 text-sm">
                        The amount depends on your specific needs. For web design, 2-3 paragraphs work well 
                        for content areas. For testing layouts, adjust based on your design requirements. 
                        Our generator allows up to 50 units of any text type.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I start with "Lorem ipsum dolor sit amet"?</h4>
                      <p className="text-gray-600 text-sm">
                        Starting with the traditional phrase is recognizable and professional, widely used 
                        in the design industry. However, you can choose random text for more variety depending 
                        on your specific project requirements.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this Lorem Ipsum generator free?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our Lorem Ipsum generator is completely free with no registration required. 
                        Generate unlimited placeholder text for all your design, development, and content 
                        planning projects without any restrictions.
                      </p>
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
