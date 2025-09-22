
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Copy, Download, RotateCcw, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const TextSummarizer = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState([30]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const summarizeText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simple extractive summarization algorithm
    setTimeout(() => {
      const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      if (sentences.length === 0) {
        setSummary("Unable to generate summary. Please provide longer text with complete sentences.");
        setIsProcessing(false);
        return;
      }

      // Score sentences based on word frequency and position
      const words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFreq: { [key: string]: number } = {};
      
      words.forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      const sentenceScores = sentences.map((sentence, index) => {
        const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        let score = 0;
        
        sentenceWords.forEach(word => {
          if (wordFreq[word]) {
            score += wordFreq[word];
          }
        });
        
        // Boost score for sentences at the beginning
        if (index < sentences.length * 0.3) {
          score *= 1.5;
        }
        
        return { sentence: sentence.trim(), score, index };
      });

      // Sort by score and select top sentences
      const targetLength = Math.max(1, Math.floor(sentences.length * summaryLength[0] / 100));
      const topSentences = sentenceScores
        .sort((a, b) => b.score - a.score)
        .slice(0, targetLength)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);

      setSummary(topSentences.join('. ') + '.');
      setIsProcessing(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'text-summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearAll = () => {
    setInputText('');
    setSummary('');
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const summaryWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <>
      <Helmet>
        <title>Text Summarizer - AI-Powered Summary Generator | DapsiWow</title>
        <meta name="description" content="Free AI text summarizer tool. Generate concise summaries from long articles, documents, and texts. Extract key points and main ideas instantly with our smart summarization algorithm." />
        <meta name="keywords" content="text summarizer, AI summarizer, document summary, article summarizer, text condenser, summary generator, key points extractor" />
        <meta property="og:title" content="Text Summarizer - AI-Powered Summary Generator | DapsiWow" />
        <meta property="og:description" content="Generate concise summaries from long texts instantly with our AI-powered summarization tool." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/text-summarizer" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-text-summarizer">
        <Header />
        
        <ToolHeroSection
          title="Text Summarizer"
          description="Transform lengthy texts into concise, meaningful summaries. Extract key points and main ideas from articles, documents, and any written content."
        />

        <main className="flex-1 bg-neutral-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Input Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="input-text">Enter text to summarize</Label>
                    <Textarea
                      id="input-text"
                      placeholder="Paste your article, document, or any text here to generate a summary..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] mt-2"
                      data-testid="input-text"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary Length: {summaryLength[0]}%</Label>
                    <Slider
                      value={summaryLength}
                      onValueChange={setSummaryLength}
                      max={50}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Brief (10%)</span>
                      <span>Detailed (50%)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={summarizeText} 
                      disabled={!inputText.trim() || isProcessing}
                      className="flex-1"
                      data-testid="button-summarize"
                    >
                      {isProcessing ? 'Generating...' : 'Generate Summary'}
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Summary
                    </span>
                    {summary && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadSummary}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-gray-800 leading-relaxed" data-testid="output-summary">
                          {summary}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{summaryWordCount} words</span>
                        <span>{summary.length} characters</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Your summary will appear here</p>
                      <p className="text-sm">Enter text and click "Generate Summary" to begin</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* How It Works Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>How Our Text Summarizer Works</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Our intelligent text summarizer uses advanced algorithms to analyze your content and extract the most important sentences. 
                  Here's how it works:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Text Analysis</h3>
                    <p className="text-sm text-gray-600">The algorithm breaks down your text into sentences and analyzes word frequency patterns.</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Sentence Scoring</h3>
                    <p className="text-sm text-gray-600">Each sentence receives a relevance score based on keyword importance and position.</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Summary Generation</h3>
                    <p className="text-sm text-gray-600">Top-scored sentences are selected and arranged to create a coherent summary.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Perfect for Multiple Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-newspaper text-2xl text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Articles & News</h3>
                    <p className="text-sm text-gray-600">Quickly digest long articles and news pieces to get the main points.</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-graduation-cap text-2xl text-green-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Research Papers</h3>
                    <p className="text-sm text-gray-600">Extract key findings from academic papers and research documents.</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-file-alt text-2xl text-yellow-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Reports & Documents</h3>
                    <p className="text-sm text-gray-600">Summarize business reports, contracts, and lengthy documents.</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-book text-2xl text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Study Materials</h3>
                    <p className="text-sm text-gray-600">Create concise summaries of textbooks and study materials.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Tips for Better Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">✓ Best Practices</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Use well-structured text with clear sentences</li>
                      <li>• Include complete paragraphs for better context</li>
                      <li>• Text should be at least 100 words for effective summarization</li>
                      <li>• Use formal or semi-formal writing for best results</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">✗ Avoid</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Very short texts or single sentences</li>
                      <li>• Lists without context or bullet points only</li>
                      <li>• Texts with many abbreviations or technical jargon</li>
                      <li>• Poetry or creative writing (works best with prose)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Related Text Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/word-counter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                      <i className="fas fa-calculator text-blue-600 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h3>
                    <p className="text-gray-600 text-sm">Count words, characters, and analyze text statistics.</p>
                  </a>
                  <a href="/tools/text-statistics-analyzer" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                      <i className="fas fa-chart-bar text-green-600 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Text Statistics</h3>
                    <p className="text-gray-600 text-sm">Comprehensive text analysis with readability scores.</p>
                  </a>
                  <a href="/tools/text-cleaner-formatter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
                      <i className="fas fa-broom text-yellow-600 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-600">Text Cleaner</h3>
                    <p className="text-gray-600 text-sm">Clean up messy text and remove formatting issues.</p>
                  </a>
                  <a href="/tools/text-formatter-beautifier" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                      <i className="fas fa-code text-purple-600 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Text Formatter</h3>
                    <p className="text-gray-600 text-sm">Format and beautify code, JSON, XML, and text.</p>
                  </a>
                </div>
                <div className="mt-6 text-center">
                  <a href="/text" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <i className="fas fa-tools mr-2"></i>
                    View All Text Tools
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TextSummarizer;
