
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ExtractedURL {
  id: number;
  url: string;
  type: 'HTTPS' | 'HTTP' | 'FTP' | 'Email' | 'Other';
  domain: string;
  isValid: boolean;
}

interface URLStatistics {
  total: number;
  https: number;
  http: number;
  ftp: number;
  email: number;
  unique: number;
  duplicates: number;
  valid: number;
  invalid: number;
}

const URLExtractor = () => {
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'http' | 'https' | 'ftp' | 'mailto'>('all');
  const { toast } = useToast();

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

  const isValidURL = (url: string): boolean => {
    try {
      if (url.startsWith('mailto:')) {
        const email = url.replace('mailto:', '');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractedData = useMemo(() => {
    if (!inputText.trim()) return { urls: [], statistics: null };

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

    // Process URLs with metadata
    const allUrls = urls.map((url, index) => ({
      id: index,
      url: url.trim(),
      type: url.startsWith('https://') ? 'HTTPS' as const : 
            url.startsWith('http://') ? 'HTTP' as const : 
            url.startsWith('ftp://') ? 'FTP' as const : 
            url.startsWith('mailto:') ? 'Email' as const : 'Other' as const,
      domain: extractDomain(url.trim()),
      isValid: isValidURL(url.trim())
    }));

    // Remove duplicates
    const uniqueUrls = allUrls.filter((url, index, self) => 
      index === self.findIndex(u => u.url === url.url)
    );

    // Calculate statistics
    const statistics: URLStatistics = {
      total: allUrls.length,
      https: allUrls.filter(u => u.type === 'HTTPS').length,
      http: allUrls.filter(u => u.type === 'HTTP').length,
      ftp: allUrls.filter(u => u.type === 'FTP').length,
      email: allUrls.filter(u => u.type === 'Email').length,
      unique: uniqueUrls.length,
      duplicates: allUrls.length - uniqueUrls.length,
      valid: uniqueUrls.filter(u => u.isValid).length,
      invalid: uniqueUrls.filter(u => !u.isValid).length
    };

    return { urls: uniqueUrls, statistics };
  }, [inputText, selectedType]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const handleCopyAll = () => {
    const allUrls = extractedData.urls.map(item => item.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    toast({
      title: "All URLs Copied!",
      description: `${extractedData.urls.length} URLs copied to clipboard`,
    });
  };

  const handleDownload = () => {
    const content = extractedData.urls.map(item => `${item.url} (${item.type})`).join('\n');
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

  const handleSampleText = () => {
    setInputText(`Check out these amazing websites and resources:

Visit our main site at https://www.example.com for comprehensive information.
You can also browse our secure portal at https://secure.example.com/login?user=demo&token=abc123
For legacy support, check http://old-site.example.org

Contact our team:
- General inquiries: mailto:info@company.com
- Support questions: mailto:support@helpdesk.org
- Sales team: mailto:sales@business.net

Download resources from our FTP server:
ftp://files.company.com/public/documents.zip
ftp://secure-files.org/private/data.tar.gz

Additional useful links:
https://blog.example.com/latest-updates
https://api.service.com/v2/documentation
http://legacy-system.internal.company.com:8080/admin`);
  };

  const handleClear = () => {
    setInputText('');
  };

  const filteredUrls = extractedData.urls.filter(url => {
    if (selectedType === 'all') return true;
    if (selectedType === 'https') return url.type === 'HTTPS';
    if (selectedType === 'http') return url.type === 'HTTP';
    if (selectedType === 'ftp') return url.type === 'FTP';
    if (selectedType === 'mailto') return url.type === 'Email';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>URL Extractor Tool - Extract URLs from Text | DapsiWow</title>
        <meta name="description" content="Advanced URL extractor tool to find and extract HTTP, HTTPS, FTP, and email links from any text content. Filter, analyze, and export URLs with comprehensive statistics." />
        <meta name="keywords" content="url extractor, extract urls from text, link finder, url parser, link extractor tool, http finder, email extractor, web scraping, url analysis" />
        <meta property="og:title" content="URL Extractor Tool - Extract URLs from Text | DapsiWow" />
        <meta property="og:description" content="Professional URL extraction tool with advanced filtering, statistics, and export options for content analysis and link management." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/url-extractor" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "URL Extractor Tool",
            "description": "Advanced URL extraction tool that finds and analyzes HTTP, HTTPS, FTP, and email links from any text content with comprehensive filtering and export options.",
            "url": "https://dapsiwow.com/tools/url-extractor",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multi-protocol URL extraction",
              "Advanced filtering options",
              "URL validation and statistics",
              "Export and download functionality",
              "Duplicate removal",
              "Domain analysis"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 2xl:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Advanced URL Detection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-normal tracking-tight overflow-visible" data-testid="text-page-title">
                <span className="block leading-normal">URL Extractor</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-normal pb-2">
                  Tool
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Extract and analyze all URLs from any text content with advanced filtering and comprehensive statistics
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Extractor Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">URL Extraction</h2>
                    <p className="text-gray-600">
                      Paste your text content to extract and analyze all URLs with detailed statistics
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text Content
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste your text content here to extract URLs..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Filter Options */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        URL Type Filter
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all', label: 'All URLs' },
                          { key: 'https', label: 'HTTPS' },
                          { key: 'http', label: 'HTTP' },
                          { key: 'mailto', label: 'Email' },
                          { key: 'ftp', label: 'FTP' }
                        ].map((filter) => (
                          <Button
                            key={filter.key}
                            variant={selectedType === filter.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType(filter.key as any)}
                            className="text-sm"
                          >
                            {filter.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Load Sample
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                    {extractedData.urls.length > 0 && (
                      <>
                        <Button
                          onClick={handleCopyAll}
                          className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg"
                          data-testid="button-copy-all"
                        >
                          Copy All
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                          data-testid="button-download"
                        >
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                    Extraction Results
                  </h2>

                  {extractedData.statistics ? (
                    <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                        <TabsTrigger value="urls">URLs</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">{extractedData.statistics.total}</div>
                            <div className="text-sm text-gray-600">Total Found</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{extractedData.statistics.unique}</div>
                            <div className="text-sm text-gray-600">Unique URLs</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-purple-600">{extractedData.statistics.valid}</div>
                            <div className="text-sm text-gray-600">Valid URLs</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-orange-600">{extractedData.statistics.duplicates}</div>
                            <div className="text-sm text-gray-600">Duplicates</div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-600 mb-3">URL Types Distribution</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between">
                              <span className="text-sm">HTTPS:</span>
                              <Badge variant="secondary">{extractedData.statistics.https}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">HTTP:</span>
                              <Badge variant="secondary">{extractedData.statistics.http}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Email:</span>
                              <Badge variant="secondary">{extractedData.statistics.email}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">FTP:</span>
                              <Badge variant="secondary">{extractedData.statistics.ftp}</Badge>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="statistics" className="space-y-4">
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-lg font-bold text-gray-900 mb-3">Validation Summary</div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Valid URLs:</span>
                                <span className="font-semibold text-green-600">{extractedData.statistics.valid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Invalid URLs:</span>
                                <span className="font-semibold text-red-600">{extractedData.statistics.invalid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Success Rate:</span>
                                <span className="font-semibold">
                                  {Math.round((extractedData.statistics.valid / extractedData.statistics.unique) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-lg font-bold text-gray-900 mb-3">Security Analysis</div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Secure (HTTPS):</span>
                                <span className="font-semibold text-green-600">{extractedData.statistics.https}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Insecure (HTTP):</span>
                                <span className="font-semibold text-orange-600">{extractedData.statistics.http}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Security Score:</span>
                                <span className="font-semibold">
                                  {Math.round((extractedData.statistics.https / (extractedData.statistics.https + extractedData.statistics.http)) * 100) || 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="urls" className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                          Extracted URLs ({filteredUrls.length} shown)
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredUrls.map((urlData) => (
                            <div key={urlData.id} className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={urlData.type === 'HTTPS' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {urlData.type}
                                  </Badge>
                                  {urlData.domain && (
                                    <span className="text-xs text-gray-500">{urlData.domain}</span>
                                  )}
                                  {!urlData.isValid && (
                                    <Badge variant="destructive" className="text-xs">Invalid</Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(urlData.url)}
                                  className="text-xs h-6 px-2"
                                >
                                  Copy
                                </Button>
                              </div>
                              <p className="text-sm font-mono break-all text-blue-600">
                                {urlData.url}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">🔗</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">
                        Enter text content to extract and analyze URLs
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is URL Extraction */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is URL Extraction?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>URL extraction</strong> is the process of automatically identifying and retrieving web addresses, email links, and file transfer protocol addresses from text content. This powerful technique enables content analysis, link auditing, and data processing across various digital platforms and documents.
                  </p>
                  <p>
                    Our advanced URL extractor tool uses sophisticated pattern matching algorithms to detect multiple URL protocols including HTTP, HTTPS, FTP, and email addresses. The tool provides comprehensive analysis with validation checking, duplicate removal, and detailed statistics to help you understand your content's link structure.
                  </p>
                  <p>
                    URL extraction is essential for SEO professionals, content managers, data analysts, and web developers who need to process large amounts of text content, audit link structures, or migrate content between platforms while maintaining link integrity.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Multi-Protocol Support</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• HTTPS and HTTP website detection</li>
                        <li>• Email address extraction (mailto:)</li>
                        <li>• FTP server link identification</li>
                        <li>• Custom protocol recognition</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Smart Analysis</h3>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• URL validation and verification</li>
                        <li>• Domain extraction and analysis</li>
                        <li>• Duplicate detection and removal</li>
                        <li>• Security assessment (HTTP vs HTTPS)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Export Options</h3>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Copy individual or all URLs</li>
                        <li>• Download as text file</li>
                        <li>• Filter by protocol type</li>
                        <li>• Batch processing support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases</h2>
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">SEO Auditing</h3>
                      <p className="text-orange-800 text-sm">Extract outbound links from content for SEO analysis, link building campaigns, and competitor research.</p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Content Migration</h3>
                      <p className="text-teal-800 text-sm">Identify and catalog all links when moving content between platforms or updating website structures.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Data Processing</h3>
                      <p className="text-red-800 text-sm">Process large documents, emails, or datasets to extract and catalog all embedded URLs for analysis.</p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Security Analysis</h3>
                      <p className="text-indigo-800 text-sm">Identify insecure HTTP links in content and assess overall link security for compliance purposes.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How to Use Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Extract URLs from Text</h2>
                <p className="text-gray-600 mb-8">Follow this comprehensive guide to effectively extract and analyze URLs from any text content using our advanced tool.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                        <h3 className="font-semibold text-blue-900">Input Your Content</h3>
                      </div>
                      <p className="text-blue-800 text-sm">Paste your text content into the input area. This can include web pages, documents, emails, or any text containing URLs.</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                        <h3 className="font-semibold text-green-900">Choose Filter Type</h3>
                      </div>
                      <p className="text-green-800 text-sm">Select the type of URLs you want to extract: all URLs, HTTPS only, HTTP only, email addresses, or FTP links.</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                        <h3 className="font-semibold text-purple-900">Analyze Results</h3>
                      </div>
                      <p className="text-purple-800 text-sm">Review the extracted URLs with detailed statistics including validation status, security analysis, and duplicate detection.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                        <h3 className="font-semibold text-orange-900">Export Data</h3>
                      </div>
                      <p className="text-orange-800 text-sm">Copy individual URLs, copy all extracted URLs, or download the complete list as a text file for further processing.</p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <h3 className="font-semibold text-red-900 mb-4">Pro Tips</h3>
                      <ul className="text-red-800 text-sm space-y-2">
                        <li>• Use the sample text to understand the tool's capabilities</li>
                        <li>• Filter by protocol type for targeted analysis</li>
                        <li>• Check the statistics tab for comprehensive insights</li>
                        <li>• Validate URLs before using them in production</li>
                      </ul>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-6">
                      <h3 className="font-semibold text-teal-900 mb-4">Best Practices</h3>
                      <ul className="text-teal-800 text-sm space-y-2">
                        <li>• Always verify extracted URLs before implementation</li>
                        <li>• Use HTTPS filtering for security audits</li>
                        <li>• Remove duplicates for clean datasets</li>
                        <li>• Export data for batch processing workflows</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of URLs can this tool extract?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool extracts HTTP, HTTPS, FTP, and email (mailto:) links from any text content. It uses advanced pattern matching to identify URLs even without proper formatting.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the URL validation feature?</h3>
                      <p className="text-gray-600 text-sm">
                        The validation checks URL format and structure but doesn't test if links are active. It verifies syntax compliance with standard URL formats and email address patterns.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I extract URLs from large documents?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, the tool can process large amounts of text efficiently. For very large documents, consider breaking them into smaller sections for optimal performance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does duplicate detection work?</h3>
                      <p className="text-gray-600 text-sm">
                        The tool automatically identifies and removes exact duplicate URLs, showing both the total found and unique count in the statistics panel.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What export formats are available?</h3>
                      <p className="text-gray-600 text-sm">
                        You can copy URLs to clipboard or download as a plain text file. Each URL includes its type classification for easy identification and processing.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool suitable for SEO analysis?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely! The tool provides security analysis (HTTP vs HTTPS), domain extraction, and detailed statistics perfect for SEO audits and link analysis.
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
};

export default URLExtractor;
