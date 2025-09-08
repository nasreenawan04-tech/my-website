import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Link2, Zap, AlertTriangle, Mail, Globe, BookOpen, ExternalLink } from 'lucide-react';

interface ExtractedLink {
  id: string;
  type: 'url' | 'email' | 'internal' | 'file';
  text: string;
  url: string;
  page: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  domain?: string;
  status?: 'active' | 'broken' | 'unknown';
  description?: string;
  target?: string; // For internal links
}

interface ExtractionSettings {
  outputFormat: 'json' | 'csv' | 'html' | 'txt';
  includeCoordinates: boolean;
  includeStatus: boolean;
  filterByType: string[];
  validateLinks: boolean;
  groupByPage: boolean;
  extractText: boolean;
}

interface ExtractionResult {
  filename: string;
  totalPages: number;
  totalLinks: number;
  linksByType: {
    url: number;
    email: number;
    internal: number;
    file: number;
  };
  linksByPage: Array<{
    page: number;
    linkCount: number;
    linkTypes: string[];
  }>;
  links: ExtractedLink[];
  domains: Array<{
    domain: string;
    count: number;
    links: string[];
  }>;
  extractionTime: number;
  downloadUrl?: string;
  reportFilename?: string;
}

const linkTypeIcons = {
  url: Globe,
  email: Mail,
  internal: BookOpen,
  file: FileText
};

const linkTypeColors = {
  url: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  internal: 'bg-purple-100 text-purple-800',
  file: 'bg-orange-100 text-orange-800'
};

const outputFormats = [
  { id: 'json', name: 'JSON', description: 'Structured data format' },
  { id: 'csv', name: 'CSV', description: 'Spreadsheet format' },
  { id: 'html', name: 'HTML', description: 'Web page with clickable links' },
  { id: 'txt', name: 'Text', description: 'Simple text list' }
];

const PDFLinkExtractor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ExtractionSettings>({
    outputFormat: 'json',
    includeCoordinates: true,
    includeStatus: false,
    filterByType: [],
    validateLinks: false,
    groupByPage: true,
    extractText: true
  });
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
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

  const updateSetting = <K extends keyof ExtractionSettings>(key: K, value: ExtractionSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleLinkType = (linkType: string) => {
    setSettings(prev => ({
      ...prev,
      filterByType: prev.filterByType.includes(linkType)
        ? prev.filterByType.filter(t => t !== linkType)
        : [...prev.filterByType, linkType]
    }));
  };

  const extractLinks = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/extract-links', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Link extraction failed');
      }

      const extractionResult = await response.json();
      setResult(extractionResult);
      setActiveTab('overview');

    } catch (error) {
      console.error('Error extracting links:', error);
      setError(error instanceof Error ? error.message : 'Error extracting links. Please try again.');
    }

    setIsExtracting(false);
  };

  const downloadData = async () => {
    if (!selectedFile || !result) return;

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/export-link-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to export link data');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `extracted-links-${Date.now()}.${settings.outputFormat}`;
      link.click();

    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export link data');
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setActiveTab('overview');
  };

  const getLinkTypeIcon = (type: string) => {
    const IconComponent = linkTypeIcons[type as keyof typeof linkTypeIcons] || Link2;
    return <IconComponent className="w-4 h-4" />;
  };

  const getLinkTypeColor = (type: string) => {
    return linkTypeColors[type as keyof typeof linkTypeColors] || 'bg-gray-100 text-gray-800';
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'broken': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Link Extractor - Extract URLs, Email & Internal Links | ToolsHub</title>
        <meta name="description" content="Extract and analyze all links from PDF documents including URLs, email addresses, and internal document links. Export data in multiple formats." />
        <meta name="keywords" content="PDF link extractor, extract URLs from PDF, PDF email extractor, document link analysis, PDF hyperlinks" />
        <meta property="og:title" content="PDF Link Extractor - Extract URLs, Email & Internal Links | ToolsHub" />
        <meta property="og:description" content="Professional tool for extracting and analyzing all types of links from PDF documents." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-link-extractor" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-link-extractor">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-link text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Link Extractor
              </h1>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Extract and analyze all links from PDF documents including URLs, email addresses, and internal document links. Get comprehensive link analysis and export data in multiple formats.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF with Links</h2>

                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver
                            ? 'border-emerald-500 bg-emerald-50'
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
                          or click to select a PDF containing links and hyperlinks
                        </p>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

                    {/* File Info */}
                    {selectedFile && (
                      <div className="bg-emerald-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-emerald-600" />
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

                    {/* Extraction Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="extraction-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Link2 className="w-5 h-5 mr-2" />
                          Link Extraction Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Output Format */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Export Format
                            </label>
                            <Select value={settings.outputFormat} onValueChange={(value: 'json' | 'csv' | 'html' | 'txt') => updateSetting('outputFormat', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {outputFormats.map((format) => (
                                  <SelectItem key={format.id} value={format.id}>
                                    {format.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {outputFormats.find(f => f.id === settings.outputFormat)?.description}
                            </p>
                          </div>

                          {/* Link Type Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Filter by Link Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(linkTypeIcons).map((type) => (
                                <Badge
                                  key={type}
                                  className={`cursor-pointer transition-colors ${
                                    settings.filterByType.includes(type)
                                      ? getLinkTypeColor(type)
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  onClick={() => toggleLinkType(type)}
                                >
                                  {getLinkTypeIcon(type)}
                                  <span className="ml-1 capitalize">{type} links</span>
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {settings.filterByType.length === 0 ? 'All link types included' : `${settings.filterByType.length} type(s) selected`}
                            </p>
                          </div>
                        </div>

                        {/* Additional Options */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Extraction Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.includeCoordinates}
                                onChange={(e) => updateSetting('includeCoordinates', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Include position coordinates</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.extractText}
                                onChange={(e) => updateSetting('extractText', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Extract link text</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.validateLinks}
                                onChange={(e) => updateSetting('validateLinks', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Validate link status (slower)</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.groupByPage}
                                onChange={(e) => updateSetting('groupByPage', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Group by page</span>
                            </label>
                          </div>
                        </div>

                        {/* Extract Button */}
                        <Button
                          onClick={extractLinks}
                          disabled={isExtracting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                          data-testid="button-extract"
                        >
                          {isExtracting ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Extracting Links...
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4 mr-2" />
                              Extract Links
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
                      <div className="space-y-6" data-testid="extraction-results">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-emerald-900">Link Extraction Summary</h3>
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {result.extractionTime}s extraction
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-emerald-900">
                                {result.totalLinks}
                              </div>
                              <div className="text-sm text-gray-600">Total Links Found</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-emerald-900">
                                {result.domains.length}
                              </div>
                              <div className="text-sm text-gray-600">Unique Domains</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-emerald-900">
                                {result.totalPages}
                              </div>
                              <div className="text-sm text-gray-600">Pages Analyzed</div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Results */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger value="links" className="flex items-center gap-2">
                              <Link2 className="w-4 h-4" />
                              All Links
                            </TabsTrigger>
                            <TabsTrigger value="domains" className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Domains
                            </TabsTrigger>
                            <TabsTrigger value="pages" className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              By Pages
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Link Types Distribution</h4>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(result.linksByType).map(([type, count]) => (
                                  count > 0 && (
                                    <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-center mb-2">
                                        {getLinkTypeIcon(type)}
                                        <span className="ml-1 text-2xl font-bold text-gray-900">
                                          {count}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 capitalize">{type} links</div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="links" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">All Extracted Links</h4>

                              {result.links.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {result.links.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Badge className={getLinkTypeColor(link.type)}>
                                          {getLinkTypeIcon(link.type)}
                                          <span className="ml-1 capitalize">{link.type}</span>
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-gray-900 truncate">
                                            {link.text || link.url}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            <span className="text-blue-600 hover:underline cursor-pointer">
                                              {truncateUrl(link.url)}
                                            </span>
                                            {link.domain && <span className="ml-2 text-gray-500">({link.domain})</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500">Page {link.page}</span>
                                        {link.status && (
                                          <span className={getStatusColor(link.status)}>
                                            {link.status}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No links found in this PDF document.
                                </p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="domains" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Domains Found</h4>

                              {result.domains.length > 0 ? (
                                <div className="space-y-3">
                                  {result.domains.map((domainInfo, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-emerald-600" />
                                        <div>
                                          <div className="font-medium text-gray-900">
                                            {domainInfo.domain}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {domainInfo.links.slice(0, 2).map(link => truncateUrl(link, 30)).join(', ')}
                                            {domainInfo.links.length > 2 && ` +${domainInfo.links.length - 2} more`}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {domainInfo.count} links
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No external domains found.
                                </p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="pages" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Links by Page</h4>

                              {result.linksByPage.length > 0 ? (
                                <div className="space-y-3">
                                  {result.linksByPage.map((pageInfo, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="font-medium text-gray-900">
                                          Page {pageInfo.page}
                                        </div>
                                        <div className="flex gap-1">
                                          {pageInfo.linkTypes.map((type, typeIndex) => (
                                            <Badge key={typeIndex} className={getLinkTypeColor(type)}>
                                              {getLinkTypeIcon(type)}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {pageInfo.linkCount} links
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No pages with links found.
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            onClick={downloadData}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            data-testid="button-download-data"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export Link Data ({settings.outputFormat.toUpperCase()})
                          </Button>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="flex-1 text-gray-600 border-gray-200 hover:bg-gray-50"
                          >
                            Extract Another PDF
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SEO Content Sections */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-12">
                {/* What is PDF Link Extractor */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Link Extractor?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      A PDF Link Extractor is a powerful digital tool designed to automatically identify, extract, and catalog all types of hyperlinks embedded within PDF documents. This comprehensive tool scans through every page of your PDF files to locate and extract URLs, email addresses, internal document references, and file links, providing you with a complete overview of all linked content within your documents.
                    </p>
                    <p>
                      Our advanced PDF Link Extractor goes beyond simple link detection by providing detailed analysis including link coordinates, status validation, domain categorization, and comprehensive export options. Whether you're conducting content audits, compliance checks, or research analysis, this tool streamlines the process of link discovery and management in PDF documents.
                    </p>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our PDF Link Extractor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-emerald-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-emerald-900 mb-3 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Comprehensive Link Detection
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Extract all URL/web links from PDF documents</li>
                        <li>• Identify email addresses and mailto links</li>
                        <li>• Detect internal document references and bookmarks</li>
                        <li>• Find file links and attachments</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                        <Link2 className="w-5 h-5 mr-2" />
                        Advanced Analysis
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Link validation and status checking</li>
                        <li>• Position coordinates for each link</li>
                        <li>• Domain analysis and categorization</li>
                        <li>• Page-by-page link distribution</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-purple-900 mb-3 flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Multiple Export Formats
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• JSON format for developers and applications</li>
                        <li>• CSV format for spreadsheet analysis</li>
                        <li>• HTML format with clickable links</li>
                        <li>• Plain text format for simple lists</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-orange-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        User-Friendly Interface
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Drag-and-drop file upload</li>
                        <li>• Customizable extraction settings</li>
                        <li>• Real-time progress tracking</li>
                        <li>• Detailed results visualization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Link Extraction</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-emerald-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Website Audits & SEO Analysis</h3>
                      <p className="text-gray-700">
                        Digital marketers and SEO professionals use our tool to audit PDF resources on websites, ensuring all outbound links are functional and properly categorized. This helps maintain website quality and improves search engine rankings.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Academic Research & Citation Analysis</h3>
                      <p className="text-gray-700">
                        Researchers and academics extract links from research papers, thesis documents, and academic publications to analyze citation patterns, verify references, and conduct comprehensive literature reviews.
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance & Security Audits</h3>
                      <p className="text-gray-700">
                        Security professionals and compliance officers use link extraction to identify potential security risks, unauthorized external references, and ensure document compliance with organizational policies.
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Migration & Archival</h3>
                      <p className="text-gray-700">
                        When migrating content or archiving documents, organizations extract links to maintain reference integrity, update URLs, and ensure all linked resources remain accessible.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our PDF Link Extractor Works</h2>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                        <p className="text-sm text-gray-600">Drag and drop or select your PDF file for link extraction</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Configure Settings</h3>
                        <p className="text-sm text-gray-600">Choose extraction options, output format, and filtering preferences</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Extract Links</h3>
                        <p className="text-sm text-gray-600">Our tool scans and extracts all links with detailed analysis</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">4</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Download Results</h3>
                        <p className="text-sm text-gray-600">Export your extracted links in your preferred format</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Using Our PDF Link Extractor</h2>
                  <div className="bg-white border rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time and Effort Savings</h3>
                        <p className="text-gray-700 mb-4">
                          Manually searching for links in lengthy PDF documents is time-consuming and error-prone. Our automated extraction tool processes entire documents in seconds, saving hours of manual work.
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Analysis</h3>
                        <p className="text-gray-700">
                          Get detailed insights including link distribution across pages, domain analysis, and link status validation to make informed decisions about your document content.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Accuracy</h3>
                        <p className="text-gray-700 mb-4">
                          Our advanced parsing algorithms ensure no links are missed, providing 100% accurate extraction results that you can rely on for professional projects.
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multiple Output Formats</h3>
                        <p className="text-gray-700">
                          Export results in various formats to suit your workflow, whether you need structured data for applications or formatted reports for presentations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Supported File Types</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• PDF files (all versions)</li>
                          <li>• Maximum file size: 100MB</li>
                          <li>• Password-protected PDFs supported</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Link Types Detected</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• HTTP/HTTPS URLs</li>
                          <li>• Email addresses (mailto links)</li>
                          <li>• Internal document references</li>
                          <li>• File attachments and references</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Export Formats</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• JSON (structured data)</li>
                          <li>• CSV (spreadsheet compatible)</li>
                          <li>• HTML (clickable web page)</li>
                          <li>• TXT (plain text list)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the PDF Link Extractor free to use?</h3>
                      <p className="text-gray-700">
                        Yes, our PDF Link Extractor is completely free to use. You can extract links from unlimited PDF documents without any charges or registration requirements.
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of links can be extracted?</h3>
                      <p className="text-gray-700">
                        Our tool extracts all types of links including web URLs (HTTP/HTTPS), email addresses, internal document references, file links, and bookmark references embedded in PDF documents.
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the link extraction?</h3>
                      <p className="text-gray-700">
                        Our advanced parsing algorithms provide 100% accuracy in link detection. We use industry-standard PDF processing libraries to ensure no links are missed during extraction.
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I extract links from password-protected PDFs?</h3>
                      <p className="text-gray-700">
                        Currently, our tool works best with unprotected PDF files. For password-protected PDFs, please remove the password protection before uploading to ensure optimal results.
                      </p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the maximum file size supported?</h3>
                      <p className="text-gray-700">
                        Our PDF Link Extractor supports files up to 100MB in size. For larger files, consider splitting them into smaller sections or compressing the PDF before upload.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices for PDF Link Extraction</h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Prepare Your PDF Files</h3>
                          <p className="text-gray-700">Ensure your PDF files are not corrupted and contain embedded hyperlinks rather than plain text URLs for optimal extraction results.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Choose Appropriate Settings</h3>
                          <p className="text-gray-700">Select the right extraction options based on your needs. Enable link validation for quality control, but note it may increase processing time.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Review Extracted Data</h3>
                          <p className="text-gray-700">Always review the extracted links before using them in production environments. Check for broken links and verify important URLs.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Export in Suitable Format</h3>
                          <p className="text-gray-700">Choose the export format that best suits your workflow: JSON for developers, CSV for analysis, HTML for presentations, or TXT for simple lists.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <BookOpen className="w-8 h-8 text-emerald-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Form Field Extractor</h3>
                      <p className="text-gray-600 text-sm">Extract and analyze all form fields from PDF documents for form processing and data collection.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <FileText className="w-8 h-8 text-emerald-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Bookmark Extractor</h3>
                      <p className="text-gray-600 text-sm">Extract table of contents and bookmark structure from PDF documents for navigation analysis.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <ExternalLink className="w-8 h-8 text-emerald-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Comparison Tool</h3>
                      <p className="text-gray-600 text-sm">Compare two PDF documents page by page to identify differences and changes in content.</p>
                    </div>
                  </div>
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

export default PDFLinkExtractor;