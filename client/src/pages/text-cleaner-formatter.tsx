
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Copy, RefreshCw, Wand2, FileText, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import ToolRecommendations from '@/components/ToolRecommendations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { tools } from '@/data/tools';

interface CleaningOptions {
  removeExtraSpaces: boolean;
  removeExtraLineBreaks: boolean;
  trimLines: boolean;
  removeEmptyLines: boolean;
  normalizeLineBreaks: boolean;
  removeSpecialChars: boolean;
  convertToLowercase: boolean;
  convertToUppercase: boolean;
  removeNumbers: boolean;
  removePunctuation: boolean;
}

const TextCleanerFormatter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [options, setOptions] = useState<CleaningOptions>({
    removeExtraSpaces: true,
    removeExtraLineBreaks: true,
    trimLines: true,
    removeEmptyLines: false,
    normalizeLineBreaks: true,
    removeSpecialChars: false,
    convertToLowercase: false,
    convertToUppercase: false,
    removeNumbers: false,
    removePunctuation: false,
  });
  const [stats, setStats] = useState({
    originalChars: 0,
    cleanedChars: 0,
    charsSaved: 0,
    originalLines: 0,
    cleanedLines: 0,
  });

  const currentTool = tools.find(tool => tool.id === 'text-cleaner-formatter')!;

  const cleanText = (text: string, cleaningOptions: CleaningOptions): string => {
    let cleaned = text;

    // Remove extra spaces
    if (cleaningOptions.removeExtraSpaces) {
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
    }

    // Trim lines
    if (cleaningOptions.trimLines) {
      cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    }

    // Remove empty lines
    if (cleaningOptions.removeEmptyLines) {
      cleaned = cleaned.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // Remove extra line breaks
    if (cleaningOptions.removeExtraLineBreaks) {
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    }

    // Normalize line breaks
    if (cleaningOptions.normalizeLineBreaks) {
      cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Remove special characters
    if (cleaningOptions.removeSpecialChars) {
      cleaned = cleaned.replace(/[^\w\s\n\r]/g, '');
    }

    // Remove numbers
    if (cleaningOptions.removeNumbers) {
      cleaned = cleaned.replace(/\d/g, '');
    }

    // Remove punctuation
    if (cleaningOptions.removePunctuation) {
      cleaned = cleaned.replace(/[^\w\s\n\r]/g, '');
    }

    // Convert case
    if (cleaningOptions.convertToLowercase) {
      cleaned = cleaned.toLowerCase();
    } else if (cleaningOptions.convertToUppercase) {
      cleaned = cleaned.toUpperCase();
    }

    return cleaned;
  };

  const handleClean = () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to clean",
        description: "Please enter some text to clean and format.",
        variant: "destructive",
      });
      return;
    }

    const cleaned = cleanText(inputText, options);
    setOutputText(cleaned);

    // Calculate stats
    const originalLines = inputText.split('\n').length;
    const cleanedLines = cleaned.split('\n').length;
    const charsSaved = inputText.length - cleaned.length;

    setStats({
      originalChars: inputText.length,
      cleanedChars: cleaned.length,
      charsSaved: charsSaved,
      originalLines: originalLines,
      cleanedLines: cleanedLines,
    });

    toast({
      title: "Text cleaned successfully!",
      description: `Removed ${charsSaved} characters and formatted ${cleanedLines} lines.`,
    });
  };

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        title: "Nothing to copy",
        description: "Please clean some text first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied to clipboard!",
        description: "The cleaned text has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setStats({
      originalChars: 0,
      cleanedChars: 0,
      charsSaved: 0,
      originalLines: 0,
      cleanedLines: 0,
    });
  };

  const handleOptionChange = (option: keyof CleaningOptions, checked: boolean) => {
    setOptions(prev => {
      const newOptions = { ...prev, [option]: checked };
      
      // Ensure only one case conversion is selected
      if (option === 'convertToLowercase' && checked) {
        newOptions.convertToUppercase = false;
      } else if (option === 'convertToUppercase' && checked) {
        newOptions.convertToLowercase = false;
      }
      
      return newOptions;
    });
  };

  const loadPreset = (presetName: string) => {
    const presets = {
      basic: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: true,
        trimLines: true,
        removeEmptyLines: false,
        normalizeLineBreaks: true,
        removeSpecialChars: false,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: false,
      },
      aggressive: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: true,
        trimLines: true,
        removeEmptyLines: true,
        normalizeLineBreaks: true,
        removeSpecialChars: true,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: true,
      },
      minimal: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: false,
        trimLines: false,
        removeEmptyLines: false,
        normalizeLineBreaks: true,
        removeSpecialChars: false,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: false,
      },
    };
    
    setOptions(presets[presetName as keyof typeof presets]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Cleaner & Formatter - Remove Extra Spaces, Line Breaks & Format Text | DapsiWow</title>
        <meta name="description" content="Professional text cleaner and formatter tool to remove extra spaces, line breaks, special characters, and format messy text. Clean up copied text, remove formatting issues, and optimize content instantly." />
        <meta name="keywords" content="text cleaner, text formatter, remove extra spaces, clean text online, text cleanup tool, format text, remove line breaks, text processing, clean copied text, text optimization" />
        <meta property="og:title" content="Text Cleaner & Formatter - Professional Text Cleanup Tool | DapsiWow" />
        <meta property="og:description" content="Advanced text cleaning tool to remove extra spaces, line breaks, and formatting issues. Perfect for cleaning copied text and optimizing content." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-cleaner-formatter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Cleaner & Formatter",
            "description": "Professional text cleaning and formatting tool to remove extra spaces, line breaks, special characters, and optimize text content with advanced cleaning options.",
            "url": "https://dapsiwow.com/tools/text-cleaner-formatter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Remove extra spaces and tabs",
              "Clean up line breaks and empty lines",
              "Remove special characters and punctuation",
              "Case conversion options",
              "Multiple cleaning presets",
              "Real-time statistics",
              "One-click copy functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />
      
      <ToolHeroSection
        title="Text Cleaner & Formatter"
        description="Clean up messy text by removing extra spaces, line breaks, and formatting issues. Perfect for cleaning copied text from PDFs, emails, and websites."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Cleaning Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  <span>Cleaning Options</span>
                </CardTitle>
                <CardDescription>
                  Select the cleaning options you want to apply to your text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Presets */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset('basic')}
                    >
                      Basic Clean
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset('aggressive')}
                    >
                      Aggressive Clean
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset('minimal')}
                    >
                      Minimal Clean
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Custom Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Spacing & Lines</h4>
                    {[
                      { key: 'removeExtraSpaces', label: 'Remove extra spaces', desc: 'Collapse multiple spaces into one' },
                      { key: 'removeExtraLineBreaks', label: 'Remove extra line breaks', desc: 'Limit consecutive line breaks' },
                      { key: 'trimLines', label: 'Trim line endings', desc: 'Remove spaces at start/end of lines' },
                      { key: 'removeEmptyLines', label: 'Remove empty lines', desc: 'Delete completely empty lines' },
                      { key: 'normalizeLineBreaks', label: 'Normalize line breaks', desc: 'Convert to standard format' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start space-x-3">
                        <Checkbox
                          id={key}
                          checked={options[key as keyof CleaningOptions]}
                          onCheckedChange={(checked) => handleOptionChange(key as keyof CleaningOptions, checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                            {label}
                          </Label>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Content & Format</h4>
                    {[
                      { key: 'removeSpecialChars', label: 'Remove special characters', desc: 'Keep only letters, numbers, spaces' },
                      { key: 'removeNumbers', label: 'Remove numbers', desc: 'Delete all numeric characters' },
                      { key: 'removePunctuation', label: 'Remove punctuation', desc: 'Delete all punctuation marks' },
                      { key: 'convertToLowercase', label: 'Convert to lowercase', desc: 'Change all text to lowercase' },
                      { key: 'convertToUppercase', label: 'Convert to UPPERCASE', desc: 'Change all text to uppercase' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start space-x-3">
                        <Checkbox
                          id={key}
                          checked={options[key as keyof CleaningOptions]}
                          onCheckedChange={(checked) => handleOptionChange(key as keyof CleaningOptions, checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                            {label}
                          </Label>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Input Text</span>
                </CardTitle>
                <CardDescription>
                  Paste your messy text here to clean and format it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your text here... It can contain extra   spaces,


multiple line breaks, and other formatting issues that need cleaning."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    {inputText.length} characters, {inputText.split('\n').length} lines
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleClean}
                      disabled={!inputText.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Clean Text
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            {outputText && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Cleaned Text</span>
                    </div>
                    <Button
                      onClick={handleCopy}
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Your cleaned and formatted text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-gray-50"
                  />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.cleanedChars}</div>
                      <div className="text-xs text-gray-500">Characters</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.cleanedLines}</div>
                      <div className="text-xs text-gray-500">Lines</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{stats.charsSaved}</div>
                      <div className="text-xs text-gray-500">Chars Removed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.originalChars > 0 ? Math.round((stats.charsSaved / stats.originalChars) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Reduction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.originalLines - stats.cleanedLines}
                      </div>
                      <div className="text-xs text-gray-500">Lines Removed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Text Cleaner & Formatter</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  The Text Cleaner & Formatter is a powerful tool designed to help you clean up messy text that often results from copying content from PDFs, emails, websites, or other formatted documents. When you copy text from these sources, it frequently comes with unwanted formatting, extra spaces, irregular line breaks, and other issues that make the text difficult to read or use.
                </p>

                <h3>Common Text Formatting Issues</h3>
                <ul>
                  <li><strong>Extra Spaces:</strong> Multiple spaces between words or tabs mixed with spaces</li>
                  <li><strong>Line Break Problems:</strong> Inconsistent line endings, too many empty lines, or broken paragraphs</li>
                  <li><strong>Unwanted Characters:</strong> Special characters, hidden formatting codes, or unwanted punctuation</li>
                  <li><strong>Case Issues:</strong> Inconsistent capitalization or need for case conversion</li>
                  <li><strong>Mixed Content:</strong> Numbers or special characters that need to be removed for specific purposes</li>
                </ul>

                <h3>Key Features</h3>
                <ul>
                  <li><strong>Quick Presets:</strong> Choose from Basic, Aggressive, or Minimal cleaning presets for common scenarios</li>
                  <li><strong>Granular Control:</strong> Select specific cleaning options to customize the process for your needs</li>
                  <li><strong>Real-time Statistics:</strong> See exactly how many characters and lines were cleaned</li>
                  <li><strong>One-click Copy:</strong> Easily copy the cleaned text to your clipboard</li>
                  <li><strong>Safe Processing:</strong> All text processing happens in your browser - no data is sent to servers</li>
                </ul>

                <h3>Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4>Content Creation</h4>
                    <ul className="text-sm">
                      <li>Clean up copied research material</li>
                      <li>Format text for blog posts or articles</li>
                      <li>Prepare content for social media</li>
                      <li>Clean up interview transcripts</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Data Processing</h4>
                    <ul className="text-sm">
                      <li>Clean data for spreadsheet import</li>
                      <li>Prepare text for analysis tools</li>
                      <li>Remove formatting for plain text files</li>
                      <li>Standardize text formatting</li>
                    </ul>
                  </div>
                </div>

                <h3>Tips for Best Results</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Start with the "Basic Clean" preset and then customize as needed. For heavily formatted text from PDFs, try the "Aggressive Clean" preset first.
                  </AlertDescription>
                </Alert>

                <p className="mt-4">
                  This tool is particularly useful for writers, researchers, content creators, data analysts, and anyone who frequently works with text from various sources. By automating the cleaning process, you can save significant time and ensure consistent formatting across your documents.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <ToolRecommendations currentTool={currentTool} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5 text-xs">1</Badge>
                    <p className="text-sm">Use "Basic Clean" for most copied text</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5 text-xs">2</Badge>
                    <p className="text-sm">Try "Aggressive Clean" for PDF text</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5 text-xs">3</Badge>
                    <p className="text-sm">Preview results before copying</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="secondary" className="mt-0.5 text-xs">4</Badge>
                    <p className="text-sm">Customize options for specific needs</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TextCleanerFormatter;
