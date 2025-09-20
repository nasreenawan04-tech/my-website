
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, ExternalLink, Copy, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const URLExtractor = () => {
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'http' | 'https' | 'ftp' | 'mailto'>('all');
  const { toast } = useToast();

  const extractedUrls = useMemo(() => {
    if (!inputText.trim()) return [];

    // Enhanced URL regex patterns
    const patterns = {
      http: /https?:\/\/(?:www\.)?[-\w@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-\w()@:%_+.~#?&=]*)/gi,
      ftp: /ftp:\/\/(?:www\.)?[-\w@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-\w()@:%_+.~#?&=]*)/gi,
      mailto: /mailto:[-\w.%+]+@[-\w.%+]+\.[A-Za-z]{2,}/gi,
      general: /(?:https?|ftp):\/\/(?:www\.)?[-\w@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-\w()@:%_+.~#?&=]*)|mailto:[-\w.%+]+@[-\w.%+]+\.[A-Za-z]{2,}/gi
    };

    let urls: string[] = [];
    
    if (selectedType === 'all') {
      urls = inputText.match(patterns.general) || [];
    } else if (selectedType === 'http') {
      const httpUrls = inputText.match(patterns.http) || [];
      urls = httpUrls.filter(url => url.startsWith('http://'));
    } else if (selectedType === 'https') {
      const httpsUrls = inputText.match(patterns.http) || [];
      urls = httpsUrls.filter(url => url.startsWith('https://'));
    } else if (selectedType === 'ftp') {
      urls = inputText.match(patterns.ftp) || [];
    } else if (selectedType === 'mailto') {
      urls = inputText.match(patterns.mailto) || [];
    }

    // Remove duplicates and return with metadata
    const uniqueUrls = [...new Set(urls)];
    return uniqueUrls.map((url, index) => ({
      id: index,
      url: url.trim(),
      type: url.startsWith('https://') ? 'HTTPS' : 
            url.startsWith('http://') ? 'HTTP' : 
            url.startsWith('ftp://') ? 'FTP' : 
            url.startsWith('mailto:') ? 'Email' : 'Other',
      domain: extractDomain(url.trim())
    }));
  }, [inputText, selectedType]);

  const extractDomain = (url: string): string => {
    try {
      if (url.startsWith('mailto:')) {
        return url.replace('mailto:', '').split('@')[1] || '';
      }
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const handleCopyAll = () => {
    const allUrls = extractedUrls.map(item => item.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    toast({
      title: "All URLs Copied!",
      description: `${extractedUrls.length} URLs copied to clipboard`,
    });
  };

  const handleDownload = () => {
    const content = extractedUrls.map(item => `${item.url} (${item.type})`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-urls.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete!",
      description: "URLs saved to file",
    });
  };

  const handleClear = () => {
    setInputText('');
    toast({
      title: "Cleared!",
      description: "Input text has been cleared",
    });
  };

  const sampleText = `Check out these websites: 
https://www.example.com/page?id=123
http://oldsite.com
Contact us at mailto:info@company.com
Download from ftp://files.server.com/data.zip
Visit https://secure-site.org for more info`;

  const typeFilters = [
    { key: 'all', label: 'All URLs', count: extractedUrls.length },
    { key: 'https', label: 'HTTPS', count: extractedUrls.filter(u => u.type === 'HTTPS').length },
    { key: 'http', label: 'HTTP', count: extractedUrls.filter(u => u.type === 'HTTP').length },
    { key: 'mailto', label: 'Email', count: extractedUrls.filter(u => u.type === 'Email').length },
    { key: 'ftp', label: 'FTP', count: extractedUrls.filter(u => u.type === 'FTP').length }
  ];

  return (
    <>
      <Helmet>
        <title>URL Extractor Tool - Extract URLs from Text | DapsiWow Tools</title>
        <meta name="description" content="Extract and analyze URLs from any text content. Find HTTP, HTTPS, FTP, and email links with our free URL extractor tool. Copy, download, and filter results." />
        <meta name="keywords" content="url extractor, extract urls from text, link finder, url parser, link extractor tool" />
        <link rel="canonical" href="/tools/url-extractor" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-url-extractor">
        <Header />
        
        <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-24 lg:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base mb-6">
                <span className="font-medium text-blue-700">Advanced URL Detection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-normal tracking-tight overflow-visible mb-6" data-testid="text-page-title">
                <span className="block leading-normal">URL Extractor</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-normal pb-2">
                  Tool
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Extract and analyze all URLs from any text content. Find HTTP, HTTPS, FTP, and email links instantly with advanced filtering and export options.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-12 lg:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Link className="w-5 h-5 text-blue-600" />
                      Input Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Paste your text content here to extract URLs..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[300px] resize-none text-sm leading-relaxed"
                        data-testid="input-text"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{inputText.length.toLocaleString()} characters</span>
                        <span>{inputText.split(/\s+/).filter(word => word.length > 0).length} words</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputText(sampleText)}
                        className="text-xs"
                      >
                        Load Sample
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="text-xs"
                        disabled={!inputText}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <ExternalLink className="w-5 h-5 text-green-600" />
                        Extracted URLs ({extractedUrls.length})
                      </CardTitle>
                      {extractedUrls.length > 0 && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyAll}
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Type Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {typeFilters.map((filter) => (
                        <Button
                          key={filter.key}
                          variant={selectedType === filter.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedType(filter.key as any)}
                          className="text-xs"
                          disabled={filter.count === 0}
                        >
                          {filter.label} ({filter.count})
                        </Button>
                      ))}
                    </div>

                    <Separator className="mb-4" />

                    {/* Results */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {extractedUrls.length > 0 ? (
                        extractedUrls.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.type}
                                  </Badge>
                                  {item.domain && (
                                    <span className="text-xs text-gray-500">
                                      {item.domain}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-mono break-all text-blue-600">
                                  {item.url}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(item.url)}
                                  className="text-xs h-6 px-2"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                {!item.url.startsWith('mailto:') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.url, '_blank')}
                                    className="text-xs h-6 px-2"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Link className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No URLs found in the text</p>
                          <p className="text-xs mt-1">
                            {inputText.trim() ? 'Try different text content' : 'Enter some text to extract URLs'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-white/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Powerful URL Extraction Features
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Advanced tools to find, filter, and export URLs from any text content with precision and ease.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Link className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-Protocol Support</h3>
                  <p className="text-sm text-gray-600">
                    Extract HTTP, HTTPS, FTP, and email links from any text content.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Filtering</h3>
                  <p className="text-sm text-gray-600">
                    Filter URLs by type and protocol for targeted extraction results.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Copy className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Export</h3>
                  <p className="text-sm text-gray-600">
                    Copy to clipboard or download extracted URLs as a text file.
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Duplicate Removal</h3>
                  <p className="text-sm text-gray-600">
                    Automatically removes duplicate URLs for clean results.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                  Complete URL Extraction Solution
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      What is a URL Extractor?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      A URL extractor is a specialized tool that automatically identifies and extracts all URLs from text content. 
                      Whether you're analyzing web content, processing documents, or extracting links from social media posts, 
                      our URL extractor provides fast and accurate results.
                    </p>
                    <p className="text-gray-600">
                      Our tool supports multiple URL protocols including HTTP, HTTPS, FTP, and email addresses, 
                      making it perfect for comprehensive link analysis and content processing tasks.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Key Benefits
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Extract URLs from any text content instantly
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Support for multiple protocols and link types
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Smart filtering and duplicate removal
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Easy export and sharing options
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Common Use Cases
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Content Analysis</h4>
                      <p className="text-sm text-gray-600">
                        Extract links from articles, blog posts, and web content for analysis and verification.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">SEO Research</h4>
                      <p className="text-sm text-gray-600">
                        Identify outbound links and analyze link structure for SEO optimization.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Processing</h4>
                      <p className="text-sm text-gray-600">
                        Process large text files and documents to extract all embedded URLs.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Social Media</h4>
                      <p className="text-sm text-gray-600">
                        Extract links from social media posts and comments for monitoring.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Related Text Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="/tools/text-to-qr-code" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <i className="fas fa-qrcode text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Text to QR Code</h3>
                  <p className="text-gray-600 text-sm">Convert URLs and text to QR codes for easy sharing and mobile access.</p>
                </a>

                <a href="/tools/text-formatter-beautifier" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <i className="fas fa-code text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Text Formatter</h3>
                  <p className="text-gray-600 text-sm">Format and beautify text content with proper structure and indentation.</p>
                </a>

                <a href="/tools/text-statistics-analyzer" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Text Statistics</h3>
                  <p className="text-gray-600 text-sm">Analyze text content with comprehensive statistics and metrics.</p>
                </a>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default URLExtractor;
