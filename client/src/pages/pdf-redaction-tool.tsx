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

  const removeSearchTerm = (index: number) => {
    setSettings(prev => ({
      ...prev,
      searchTerms: prev.searchTerms.filter((_, i) => i !== index)
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

  const handleRedact = async () => {
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

  const handleDownload = () => {
    if (!result || !result.downloadUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.modifiedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <Helmet>
        <title>PDF Redaction Tool - Permanently Remove Sensitive Information | ToolsHub</title>
        <meta name="description" content="Professional PDF redaction tool to permanently remove sensitive information, PII, and confidential data. HIPAA compliant, pattern recognition, metadata removal. Free online PDF redactor." />
        <meta name="keywords" content="PDF redaction tool, redact PDF online, remove sensitive information, black out PDF, PDF privacy protection, HIPAA compliant PDF redaction, permanent PDF redaction, sensitive data removal, confidential document redaction, legal PDF redaction, PII removal tool, secure PDF redactor" />
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
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Start Redacting Your PDF Documents
                </h2>
                <p className="text-xl text-gray-600">
                  Upload your PDF file and begin the secure redaction process to permanently remove sensitive information.
                </p>
              </div>

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
                                      onClick={() => removeSearchTerm(index)}
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
                              placeholder="Enter coordinates in format: page,x,y,width,height&#10;Example:&#10;1,100,200,150,20&#10;2,50,300,200,15"
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
                          onClick={handleRedact}
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
                          onClick={handleDownload}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={!result.downloadUrl}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Redacted PDF
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

          {/* Features Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Professional PDF Redaction Features
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Advanced redaction capabilities to permanently remove sensitive information from your PDF documents with military-grade security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeOff className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Permanent Redaction</h3>
                  <p className="text-gray-600">
                    Completely remove sensitive information with black-out redaction that cannot be reversed or recovered by any means.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Pattern Recognition</h3>
                  <p className="text-gray-600">
                    Automatically detect and redact common sensitive data patterns like SSN, phone numbers, email addresses, and credit card numbers.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Metadata Removal</h3>
                  <p className="text-gray-600">
                    Strip document metadata including author information, creation dates, and other hidden data that might contain sensitive details.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Custom Redaction Colors</h3>
                  <p className="text-gray-600">
                    Choose from multiple redaction colors including standard black, white for forms, red for high visibility, and professional blue marking.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Fast Processing</h3>
                  <p className="text-gray-600">
                    Lightning-fast PDF redaction processing that handles large documents efficiently while maintaining document quality and structure.
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Multiple Redaction Methods</h3>
                  <p className="text-gray-600">
                    Text search, pattern-based detection, and coordinate-based redaction methods for precise control over what gets redacted.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How PDF Redaction Works
                </h2>
                <p className="text-xl text-gray-600">
                  Our advanced PDF redaction process ensures complete removal of sensitive information in just a few simple steps.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Upload Your PDF Document</h3>
                    <p className="text-gray-600">
                      Select the PDF file containing sensitive information that needs to be redacted. Our tool supports all standard PDF formats and handles large files efficiently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Configure Redaction Settings</h3>
                    <p className="text-gray-600">
                      Choose your redaction method: search for specific text, use pattern recognition for common sensitive data types, or specify exact coordinates for precise redaction areas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Apply Permanent Redaction</h3>
                    <p className="text-gray-600">
                      Our advanced algorithm permanently removes the specified information, replacing it with solid colored blocks. The original content is completely destroyed and cannot be recovered.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Download Secure PDF</h3>
                    <p className="text-gray-600">
                      Download your fully redacted PDF with all sensitive information permanently removed and metadata stripped for complete privacy protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Common PDF Redaction Use Cases
                </h2>
                <p className="text-xl text-gray-600">
                  Professional-grade PDF redaction for various industries and document types requiring sensitive information protection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Legal Documents</h3>
                  <p className="text-blue-800 mb-4">
                    Redact client names, case numbers, personal identifiers, and confidential information from legal briefs, court documents, and contracts.
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Attorney-client privileged information</li>
                    <li>• Personal identifying information (PII)</li>
                    <li>• Confidential business details</li>
                    <li>• Financial information</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-3">Healthcare Records</h3>
                  <p className="text-green-800 mb-4">
                    HIPAA-compliant redaction of patient information, medical records, insurance details, and other protected health information.
                  </p>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Patient names and dates of birth</li>
                    <li>• Social Security Numbers</li>
                    <li>• Insurance policy numbers</li>
                    <li>• Medical record numbers</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-900 mb-3">Financial Documents</h3>
                  <p className="text-purple-800 mb-4">
                    Secure redaction of account numbers, transaction details, personal financial information, and sensitive banking data.
                  </p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Bank account numbers</li>
                    <li>• Credit card information</li>
                    <li>• Tax identification numbers</li>
                    <li>• Investment account details</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-orange-900 mb-3">Government & Military</h3>
                  <p className="text-orange-800 mb-4">
                    Classification-level redaction for government documents, military reports, and classified information requiring security clearance.
                  </p>
                  <ul className="text-orange-700 text-sm space-y-1">
                    <li>• Classified operational details</li>
                    <li>• Personnel information</li>
                    <li>• Location coordinates</li>
                    <li>• Security protocols</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about PDF redaction and document security.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What is PDF redaction and why is it important?
                  </h3>
                  <p className="text-gray-600">
                    PDF redaction is the process of permanently removing sensitive information from PDF documents by replacing it with colored blocks. Unlike simply highlighting or covering text, redaction completely destroys the original content, making it impossible to recover. This is crucial for legal compliance, privacy protection, and maintaining confidentiality when sharing documents.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Is redacted information truly permanent and unrecoverable?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our PDF redaction tool permanently removes the specified information from the document structure. The original text, images, or data is completely destroyed and replaced with solid colored shapes. This process cannot be undone, and the information cannot be recovered using any software or technique.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What types of sensitive information can be automatically detected?
                  </h3>
                  <p className="text-gray-600">
                    Our pattern recognition feature can automatically detect and redact common sensitive data types including Social Security Numbers (SSN), phone numbers, email addresses, credit card numbers, dates, and ZIP codes. You can also add custom search terms for organization-specific sensitive information.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Does the tool remove metadata from PDF documents?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our redaction tool includes an option to remove document metadata such as author information, creation dates, modification history, and other hidden data that might contain sensitive information. This ensures complete privacy protection beyond just the visible content.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Is this tool suitable for legal and compliance requirements?
                  </h3>
                  <p className="text-gray-600">
                    Our PDF redaction tool is designed to meet professional standards for document privacy and can help with compliance requirements such as HIPAA, FERPA, and legal discovery processes. However, we recommend consulting with your legal or compliance team to ensure the tool meets your specific regulatory requirements.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What file size limitations exist for PDF redaction?
                  </h3>
                  <p className="text-gray-600">
                    Our tool can handle most standard PDF files efficiently. Very large files may take longer to process, but the redaction quality remains consistent. For optimal performance, we recommend files under 100MB, though larger files can still be processed successfully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Privacy Section */}
          <section className="py-16 bg-gray-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-6">
                Your Document Security is Our Priority
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                All PDF redaction processing happens securely with enterprise-grade encryption. Your documents are never stored on our servers and are automatically deleted after processing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">End-to-End Security</h3>
                  <p className="text-gray-400 text-sm">
                    Military-grade encryption protects your documents throughout the redaction process.
                  </p>
                </div>
                
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Data Storage</h3>
                  <p className="text-gray-400 text-sm">
                    Documents are processed in real-time and immediately deleted from our systems.
                  </p>
                </div>
                
                <div className="text-center">
                  <EyeOff className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Privacy</h3>
                  <p className="text-gray-400 text-sm">
                    We never access or view the content of your documents during processing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Professional PDF Redaction for Document Privacy and Compliance
                </h2>
                
                <div className="text-gray-700 space-y-4 leading-relaxed">
                  <p>
                    PDF redaction is an essential process for organizations and individuals who need to permanently remove sensitive information from documents before sharing them publicly or with third parties. Our advanced PDF redaction tool provides military-grade security to ensure that confidential data is completely and irreversibly removed from your PDF documents.
                  </p>
                  
                  <p>
                    Unlike simple highlighting or covering text with black boxes, true PDF redaction permanently destroys the underlying data structure, making it impossible for anyone to recover the original information using any software or technique. This level of security is crucial for legal documents, healthcare records, financial statements, government documents, and any other materials containing personally identifiable information (PII) or classified content.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Advanced Redaction Methods for Every Use Case
                  </h3>
                  
                  <p>
                    Our PDF redaction tool offers three powerful methods to identify and remove sensitive information:
                  </p>
                  
                  <p>
                    <strong>Text-Based Search Redaction:</strong> Simply enter the specific words, phrases, or terms you want to redact. Our tool will scan the entire document and permanently remove all instances of the specified text. This method is perfect for removing names, addresses, phone numbers, or any other known sensitive information.
                  </p>
                  
                  <p>
                    <strong>Pattern Recognition Redaction:</strong> Leverage our intelligent pattern recognition system to automatically detect and redact common types of sensitive data. Our algorithm can identify Social Security Numbers, credit card numbers, phone numbers, email addresses, dates, and ZIP codes without manual input. This feature significantly reduces the risk of overlooking sensitive information.
                  </p>
                  
                  <p>
                    <strong>Coordinate-Based Redaction:</strong> For precise control over redaction areas, specify exact coordinates within your PDF pages. This method is ideal for redacting specific sections, signatures, or any content in known locations across multiple documents with similar layouts.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Compliance and Legal Requirements
                  </h3>
                  
                  <p>
                    Professional PDF redaction is often required to meet various compliance standards and legal requirements. Healthcare organizations must comply with HIPAA regulations when sharing patient information. Educational institutions need to follow FERPA guidelines for student records. Legal firms must redact privileged information in court filings and discovery documents. Government agencies require classification-level redaction for national security documents.
                  </p>
                  
                  <p>
                    Our redaction tool is designed to meet these professional standards by providing complete and permanent removal of sensitive information, comprehensive metadata stripping, and detailed processing reports that can serve as documentation for compliance audits.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Beyond Text: Complete Document Security
                  </h3>
                  
                  <p>
                    Effective PDF redaction goes beyond just removing visible text. Hidden metadata embedded in PDF files can contain sensitive information such as author names, creation dates, revision history, comments, and even deleted content. Our tool automatically strips all metadata from your documents, ensuring complete privacy protection.
                  </p>
                  
                  <p>
                    Additionally, our system provides customizable redaction colors to meet different organizational requirements. Choose from standard black blocks, white rectangles for form fields, high-visibility red marking, or professional blue highlighting. Each color option maintains the same level of permanent information removal while meeting different visual and procedural requirements.
                  </p>
                  
                  <p>
                    Whether you're a legal professional preparing court documents, a healthcare administrator sharing patient records, a government employee handling classified materials, or a business owner protecting confidential information, our PDF redaction tool provides the security, reliability, and ease of use you need to maintain document privacy and meet compliance requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PDFRedactionTool;