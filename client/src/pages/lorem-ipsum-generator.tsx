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
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                  {/* Settings Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Generation Settings</h2>
                    
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
                        <SelectTrigger className="w-full min-h-11" data-testid="select-type">
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
                        className="w-full min-h-11 p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        data-testid="input-count"
                      />
                    </div>

                    {/* Start with Lorem Option */}
                    <div className="flex items-center space-x-3 min-h-11 py-2">
                      <input
                        id="start-lorem"
                        type="checkbox"
                        checked={options.startWithLorem}
                        onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        data-testid="checkbox-start-lorem"
                      />
                      <Label htmlFor="start-lorem" className="text-sm font-medium text-gray-700">
                        Start with "Lorem ipsum"
                      </Label>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateLorem}
                      className="w-full min-h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      data-testid="button-generate"
                    >
                      <i className="fas fa-magic mr-2"></i>
                      Generate Lorem Ipsum
                    </Button>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Generated Text</h2>
                    
                    {/* Generated Text Area */}
                    <div className="space-y-3">
                      <Label htmlFor="generated-text" className="text-sm font-medium text-gray-700">
                        Your Lorem Ipsum Text
                      </Label>
                      <textarea
                        id="generated-text"
                        value={generatedText}
                        readOnly
                        className="w-full h-48 sm:h-64 lg:h-80 p-3 sm:p-4 text-sm sm:text-base border border-gray-200 rounded-lg bg-gray-50 resize-none"
                        placeholder="Click 'Generate Lorem Ipsum' to create placeholder text..."
                        data-testid="textarea-generated-text"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1 min-h-11"
                        disabled={!generatedText}
                        data-testid="button-copy-text"
                      >
                        <i className="fas fa-copy mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Copy Text</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1 min-h-11"
                        disabled={!generatedText}
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Clear</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                    </div>

                    {/* Text Statistics */}
                    {generatedText && (
                      <div className="bg-blue-50 rounded-lg p-4" data-testid="text-statistics">
                        <h3 className="font-semibold text-blue-900 mb-2">Text Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Lorem Ipsum Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>Lorem Ipsum Generator</strong> is a powerful text generation tool that creates placeholder content for design and development projects. Our advanced Lorem ipsum generator produces dummy text that mimics natural language patterns without distracting from visual design elements.
              </p>
              
              <p className="text-gray-700 mb-6">
                <strong>Lorem Ipsum</strong> itself is placeholder text commonly used in the printing and typesetting industry since the 1500s. It's derived from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. The text has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>

              <p className="text-gray-700 mb-6">
                Our Lorem ipsum text generator allows you to customize the output by choosing between paragraphs, sentences, or individual words, giving you complete control over the amount and format of placeholder text you need for your projects.
              </p>
            </div>
          </div>

          {/* Benefits and Use Cases */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use a Lorem Ipsum Generator?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Focus on Design:</strong> Removes content distraction during visual design phases</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Professional Standard:</strong> Industry-standard placeholder text recognized worldwide</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Instant Generation:</strong> Create any amount of text instantly with customizable options</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Consistent Length:</strong> Predictable word patterns help with layout planning</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Website Development:</strong> Fill content areas during site construction</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Graphic Design:</strong> Test typography and layout designs</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Print Materials:</strong> Create mockups for brochures and documents</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <p className="text-gray-700"><strong>Content Planning:</strong> Estimate space requirements for future content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases by Audience */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Lorem Ipsum Generator Use Cases by Profession</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎨 Web Designers & Developers</h3>
                  <p className="text-gray-700 mb-3">Use our Lorem ipsum generator to fill website templates, test responsive layouts, and demonstrate content hierarchy without client content distractions.</p>
                  <p className="text-sm text-gray-600">Perfect for wireframes, prototypes, and client presentations.</p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Students & Researchers</h3>
                  <p className="text-gray-700 mb-3">Generate placeholder text for academic document templates, thesis layouts, and research paper formatting without focusing on actual content.</p>
                  <p className="text-sm text-gray-600">Ideal for testing citation styles and document structure.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">✍️ Writers & Bloggers</h3>
                  <p className="text-gray-700 mb-3">Use dummy text to test blog themes, plan content layouts, and design editorial templates before writing actual articles.</p>
                  <p className="text-sm text-gray-600">Great for testing readability and visual appeal of different text lengths.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 Marketing Professionals</h3>
                  <p className="text-gray-700 mb-3">Create marketing material mockups, test email templates, and design promotional content layouts with consistent placeholder text.</p>
                  <p className="text-sm text-gray-600">Essential for A/B testing different design approaches.</p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🖨️ Print Designers</h3>
                  <p className="text-gray-700 mb-3">Fill brochures, flyers, magazines, and book layouts to test typography, spacing, and overall design balance before final content.</p>
                  <p className="text-sm text-gray-600">Standard practice for professional print design workflows.</p>
                </div>

                <div className="border-l-4 border-teal-500 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏢 Business Professionals</h3>
                  <p className="text-gray-700 mb-3">Design presentation templates, corporate documents, and business proposals with appropriate text volume for planning purposes.</p>
                  <p className="text-sm text-gray-600">Helps estimate content requirements and layout constraints.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text & Content Tools</h2>
            <p className="text-gray-700 mb-8">Enhance your text processing workflow with these complementary tools designed for content creators and developers.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/word-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-calculator text-blue-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Word Counter</h3>
                </div>
                <p className="text-gray-600 text-sm">Count words, characters, and paragraphs in your Lorem ipsum or real content to meet specific requirements.</p>
              </a>

              <a href="/tools/character-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-font text-green-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Character Counter</h3>
                </div>
                <p className="text-gray-600 text-sm">Precisely count characters in generated text for social media, meta descriptions, and character-limited content.</p>
              </a>

              <a href="/tools/case-converter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-text-height text-orange-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Case Converter</h3>
                </div>
                <p className="text-gray-600 text-sm">Convert your generated Lorem ipsum text between uppercase, lowercase, title case, and other formatting styles.</p>
              </a>

              <a href="/tools/sentence-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-list-ol text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Sentence Counter</h3>
                </div>
                <p className="text-gray-600 text-sm">Count sentences in your placeholder text to maintain consistent content structure across designs.</p>
              </a>

              <a href="/tools/reverse-text-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-exchange-alt text-red-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Reverse Text</h3>
                </div>
                <p className="text-gray-600 text-sm">Create unique placeholder text variations by reversing Lorem ipsum text for creative design purposes.</p>
              </a>

              <a href="/tools/password-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-key text-indigo-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Password Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate secure passwords for development accounts and test environments while working on projects.</p>
              </a>
            </div>

            <div className="mt-8 text-center">
              <a href="/text" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                <i className="fas fa-tools mr-2"></i>
                Explore All Text Tools
              </a>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Lorem Ipsum Generator FAQ</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Why use Lorem Ipsum instead of real text?</h3>
                  <p className="text-gray-600">Lorem Ipsum prevents content from distracting viewers during design phases, allowing focus on visual elements, typography, and layout rather than readable content. It helps designers and clients concentrate on the visual aspects without getting caught up in the actual text.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is Lorem Ipsum just random text?</h3>
                  <p className="text-gray-600">No, Lorem Ipsum is based on classical Latin literature from Cicero's "de Finibus Bonorum et Malorum" written in 45 BC, though it has been altered over the centuries to remove meaningful content while maintaining natural language patterns.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this Lorem ipsum generator for commercial projects?</h3>
                  <p className="text-gray-600">Yes! Lorem Ipsum is free to use for any purpose, including commercial projects, websites, print materials, and software development. It's the industry standard placeholder text recognized worldwide.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How many words should I generate for my project?</h3>
                  <p className="text-gray-600">It depends on your needs. For web design, 2-3 paragraphs (150-300 words) usually work well. For blog layouts, try 500-800 words. For testing layouts, adjust based on your content areas and design requirements.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between paragraphs, sentences, and words?</h3>
                  <p className="text-gray-600">Paragraphs generate complete text blocks with multiple sentences (ideal for content areas), sentences create individual statements (perfect for headlines or short content), and words generate lists of individual terms (useful for testing spacing and typography).</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I start with "Lorem ipsum dolor sit amet"?</h3>
                  <p className="text-gray-600">Starting with the traditional "Lorem ipsum" phrase is recognizable and professional, but you can choose random text if you prefer more variety. The traditional start is commonly used in the design industry.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the Lorem ipsum text output?</h3>
                  <p className="text-gray-600">Our Lorem ipsum generator offers multiple customization options: choose between paragraphs, sentences, or words; set custom quantities; and decide whether to start with traditional Lorem ipsum text or random content.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this Lorem ipsum generator tool free to use?</h3>
                  <p className="text-gray-600">Yes, our Lorem ipsum generator is completely free with no registration required. Generate unlimited placeholder text for all your design, development, and content planning projects without any restrictions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Content Footer */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional Lorem Ipsum Text Generation</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Our advanced <strong>Lorem ipsum generator</strong> provides the most comprehensive placeholder text solution for modern design and development workflows. Whether you're creating websites, mobile apps, print materials, or digital content, our tool generates professional-quality dummy text that meets industry standards.
              </p>
              
              <p className="text-gray-700 mb-4">
                The Lorem ipsum text generator has been trusted by designers, developers, and content creators worldwide for over two decades. With customizable output options, instant generation, and mobile-friendly interface, it's the perfect tool for any project requiring placeholder content.
              </p>
              
              <p className="text-gray-700">
                Start generating professional Lorem ipsum text today and experience the difference quality placeholder content makes in your design process. Our free Lorem ipsum generator tool is optimized for speed, reliability, and ease of use across all devices and platforms.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoremIpsumGenerator;