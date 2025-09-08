import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Download, EyeOff, Shield, Zap, AlertTriangle, Target, Settings } from 'lucide-react';

interface RedactionSettings {
  mode: 'text' | 'coordinates' | 'pattern';
  color: string;
  searchTerms: string[];
  patterns: string[];
  coordinates: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  caseSensitive: boolean;
  wholeWords: boolean;
  removeMetadata: boolean;
}

interface RedactionResult {
  filename: string;
  totalPages: number;
  redactionsApplied: number;
  redactionsByPage: Array<{
    page: number;
    count: number;
    terms: string[];
  }>;
  downloadUrl: string;
  modifiedFilename: string;
  metadata: {
    originalSize: number;
    redactedSize: number;
    processingTime: number;
  };
}

const commonPatterns = [
  { id: 'ssn', name: 'Social Security Numbers', pattern: '\\d{3}-\\d{2}-\\d{4}', description: 'XXX-XX-XXXX format' },
  { id: 'phone', name: 'Phone Numbers', pattern: '\\(\\d{3}\\)\\s*\\d{3}-\\d{4}', description: '(XXX) XXX-XXXX format' },
  { id: 'email', name: 'Email Addresses', pattern: '[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}', description: 'email@domain.com format' },
  { id: 'credit-card', name: 'Credit Card Numbers', pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}', description: '16-digit numbers' },
  { id: 'date', name: 'Dates', pattern: '\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}', description: 'MM/DD/YYYY or similar' },
  { id: 'zipcode', name: 'ZIP Codes', pattern: '\\d{5}(-\\d{4})?', description: 'XXXXX or XXXXX-XXXX' }
];

const redactionColors = [
  { id: 'black', name: 'Black', value: '#000000', description: 'Standard redaction color' },
  { id: 'white', name: 'White', value: '#FFFFFF', description: 'White blocks for forms' },
  { id: 'red', name: 'Red', value: '#DC2626', description: 'High visibility marking' },
  { id: 'blue', name: 'Blue', value: '#2563EB', description: 'Professional marking' }
];

const PDFRedactionTool = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<RedactionSettings>({
    mode: 'text',
    color: '#000000',
    searchTerms: [],
    patterns: [],
    coordinates: [],
    caseSensitive: false,
    wholeWords: true,
    removeMetadata: true
  });
  const [result, setResult] = useState<RedactionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const addSearchTerm = () => {
    if (searchInput.trim() && !settings.searchTerms.includes(searchInput.trim())) {
      setSettings(prev => ({
        ...prev,
        searchTerms: [...prev.searchTerms, searchInput.trim()]
      }));
      setSearchInput('');
    }
  };

  const removeSearchTerm = (term: string) => {
    setSettings(prev => ({
      ...prev,
      searchTerms: prev.searchTerms.filter(t => t !== term)
    }));
  };

  const togglePattern = (patternId: string) => {
    const pattern = commonPatterns.find(p => p.id === patternId);
    if (!pattern) return;

    setSettings(prev => ({
      ...prev,
      patterns: prev.patterns.includes(pattern.pattern)
        ? prev.patterns.filter(p => p !== pattern.pattern)
        : [...prev.patterns, pattern.pattern]
    }));
  };

  const updateSetting = <K extends keyof RedactionSettings>(key: K, value: RedactionSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const performRedaction = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/redact-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF redaction failed');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      // Get redaction metadata from headers
      const redactionsApplied = parseInt(response.headers.get('X-Redactions-Applied') || '0');
      const processingTime = parseInt(response.headers.get('X-Processing-Time') || '0');

      // Extract additional metadata from headers
      const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1');
      const redactionDetails = response.headers.get('X-Redaction-Details');
      
      let redactionsByPage: Array<{ page: number; count: number; terms: string[] }> = [];
      if (redactionDetails) {
        try {
          redactionsByPage = JSON.parse(redactionDetails);
        } catch (parseError) {
          console.warn('Failed to parse redaction details:', parseError);
        }
      }

      setResult({
        filename: selectedFile.name,
        totalPages,
        redactionsApplied,
        redactionsByPage,
        downloadUrl,
        modifiedFilename: `redacted-${selectedFile.name}`,
        metadata: {
          originalSize: selectedFile.size,
          redactedSize: blob.size,
          processingTime
        }
      });
    } catch (error) {
      console.error('Error redacting PDF:', error);
      setError(error instanceof Error ? error.message : 'Error redacting PDF. Please try again.');
    }

    setIsProcessing(false);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setSettings({
      mode: 'text',
      color: '#000000',
      searchTerms: [],
      patterns: [],
      coordinates: [],
      caseSensitive: false,
      wholeWords: true,
      removeMetadata: true
    });
    setSearchInput('');
  };

  const getColorInfo = (colorValue: string) => {
    return redactionColors.find(c => c.value === colorValue) || redactionColors[0];
  };

  return (
    <>
      <Helmet>
        <title>PDF Redaction Tool - Permanently Remove Sensitive Information | ToolsHub</title>
        <meta name="description" content="Securely redact sensitive information from PDFs. Permanently black out confidential data, personal information, and classified content." />
        <meta name="keywords" content="PDF redaction, redact PDF, black out PDF, remove sensitive information, PDF privacy, secure PDF" />
        <meta property="og:title" content="PDF Redaction Tool - Permanently Remove Sensitive Information | ToolsHub" />
        <meta property="og:description" content="Professional PDF redaction tool for permanently removing sensitive information." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-redaction-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-redaction-tool">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-gray-800 via-gray-700 to-black text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-secret text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Redaction Tool
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Permanently remove sensitive information from PDF documents. Securely black out confidential data, personal details, and classified content with professional-grade redaction.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File for Redaction</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-gray-600 bg-gray-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a PDF containing sensitive information
                        </p>
                        <Button
                          className="bg-gray-800 hover:bg-gray-900 text-white"
                          data-testid="button-select-file"
                        >
                          Select PDF File
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          data-testid="input-file"
                        />
                      </div>
                    </div>

                    {/* Security Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-1">Security Notice</h4>
                          <p className="text-sm text-red-700">
                            Redaction permanently removes information from your PDF. This process cannot be undone. 
                            Ensure you have a backup of the original document before proceeding. The redacted areas 
                            will be completely blacked out and unrecoverable.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Info */}
                    {selectedFile && (
                      <div className="bg-gray-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)}
                            </div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Redaction Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="redaction-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Redaction Settings
                        </h3>
                        
                        {/* Redaction Mode */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Redaction Method
                          </label>
                          <Select value={settings.mode} onValueChange={(value: 'text' | 'coordinates' | 'pattern') => updateSetting('mode', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Search & Redact Text</SelectItem>
                              <SelectItem value="pattern">Pattern-Based Redaction</SelectItem>
                              <SelectItem value="coordinates">Coordinate-Based Redaction</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            {settings.mode === 'text' && 'Search for specific words or phrases to redact'}
                            {settings.mode === 'pattern' && 'Use predefined patterns to find sensitive data'}
                            {settings.mode === 'coordinates' && 'Specify exact locations to redact'}
                          </p>
                        </div>

                        {/* Redaction Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Redaction Color
                          </label>
                          <Select value={settings.color} onValueChange={(value: string) => updateSetting('color', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {redactionColors.map((color) => (
                                <SelectItem key={color.id} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded border border-gray-300"
                                      style={{ backgroundColor: color.value }}
                                    ></div>
                                    <span>{color.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            {getColorInfo(settings.color)?.description}
                          </p>
                        </div>

                        {/* Text Search Mode */}
                        {settings.mode === 'text' && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Search Terms</h4>
                            
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={searchInput}
                                  onChange={(e) => setSearchInput(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addSearchTerm()}
                                  placeholder="Enter text to redact (e.g., 'John Doe', 'Confidential')"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  data-testid="input-search-term"
                                />
                                <Button
                                  onClick={addSearchTerm}
                                  disabled={!searchInput.trim()}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  data-testid="button-add-term"
                                >
                                  Add Term
                                </Button>
                              </div>

                              {settings.searchTerms.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {settings.searchTerms.map((term, index) => (
                                    <Badge
                                      key={index}
                                      className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                                      onClick={() => removeSearchTerm(term)}
                                      data-testid={`badge-term-${index}`}
                                    >
                                      {term} ×
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={settings.caseSensitive}
                                    onChange={(e) => updateSetting('caseSensitive', e.target.checked)}
                                    className="rounded"
                                  />
                                  Case sensitive
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={settings.wholeWords}
                                    onChange={(e) => updateSetting('wholeWords', e.target.checked)}
                                    className="rounded"
                                  />
                                  Whole words only
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pattern Mode */}
                        {settings.mode === 'pattern' && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Common Sensitive Data Patterns</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {commonPatterns.map((pattern) => (
                                <div
                                  key={pattern.id}
                                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    settings.patterns.includes(pattern.pattern)
                                      ? 'border-green-300 bg-green-100'
                                      : 'border-gray-200 bg-white hover:border-green-200'
                                  }`}
                                  onClick={() => togglePattern(pattern.id)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-gray-900">{pattern.name}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{pattern.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Coordinates Mode */}
                        {settings.mode === 'coordinates' && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Coordinate-Based Redaction</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              This mode allows you to specify exact locations to redact by coordinates. 
                              You would typically use a PDF viewer to identify the coordinates of sensitive areas.
                            </p>
                            <Textarea
                              placeholder="Enter coordinates in format: page,x,y,width,height (one per line)&#10;Example:&#10;1,100,200,150,20&#10;2,50,300,200,15"
                              className="w-full h-24 text-sm"
                              onChange={(e) => {
                                // Parse coordinate input - simplified for demo
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                const coords = lines.map(line => {
                                  const [page, x, y, width, height] = line.split(',').map(n => parseInt(n.trim()));
                                  return { page: page || 1, x: x || 0, y: y || 0, width: width || 0, height: height || 0 };
                                });
                                updateSetting('coordinates', coords);
                              }}
                            />
                          </div>
                        )}

                        {/* Additional Options */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Additional Options</h4>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={settings.removeMetadata}
                              onChange={(e) => updateSetting('removeMetadata', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Remove document metadata</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Removes author, creation date, and other metadata that might contain sensitive information
                          </p>
                        </div>

                        {/* Redact Button */}
                        <Button
                          onClick={performRedaction}
                          disabled={isProcessing || (settings.mode === 'text' && settings.searchTerms.length === 0) || (settings.mode === 'pattern' && settings.patterns.length === 0)}
                          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3"
                          data-testid="button-redact"
                        >
                          {isProcessing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Redacting PDF...
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Redact PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          <div className="text-red-800 text-sm">{error}</div>
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {result && (
                      <div className="bg-gray-900 text-white rounded-lg p-6" data-testid="redaction-results">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                          <EyeOff className="w-5 h-5 mr-2" />
                          Redaction Complete
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {result.redactionsApplied}
                            </div>
                            <div className="text-sm text-gray-300">Items Redacted</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {result.totalPages}
                            </div>
                            <div className="text-sm text-gray-300">Pages Processed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {result.metadata.processingTime}s
                            </div>
                            <div className="text-sm text-gray-300">Processing Time</div>
                          </div>
                        </div>

                        <Separator className="my-4 bg-gray-700" />

                        <div className="mb-6">
                          <h4 className="font-medium mb-2">File Information</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>Original: {formatFileSize(result.metadata.originalSize)}</div>
                            <div>Redacted: {formatFileSize(result.metadata.redactedSize)}</div>
                            <div>Filename: {result.modifiedFilename}</div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-white hover:bg-gray-100 text-gray-900"
                          data-testid="button-download"
                        >
                          <a href={result.downloadUrl} download={result.modifiedFilename}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Redacted PDF
                          </a>
                        </Button>

                        <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
                          ⚠️ The redacted information has been permanently removed and cannot be recovered. 
                          Store this file securely and verify all sensitive data has been properly redacted.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PDFRedactionTool;