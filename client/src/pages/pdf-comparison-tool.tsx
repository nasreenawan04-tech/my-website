import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Download, Eye, Zap, AlertTriangle, GitCompare, Settings, BarChart3 } from 'lucide-react';

interface ComparisonSettings {
  mode: 'visual' | 'text' | 'structural';
  sensitivity: 'low' | 'medium' | 'high';
  ignoreFormatting: boolean;
  ignoreImages: boolean;
  ignoreMetadata: boolean;
  highlightColor: string;
  outputFormat: 'pdf' | 'html' | 'json';
}

interface ComparisonResult {
  documentsCompared: {
    original: { filename: string; pages: number; size: number; };
    modified: { filename: string; pages: number; size: number; };
  };
  differences: {
    total: number;
    byType: {
      text: number;
      images: number;
      formatting: number;
      structure: number;
    };
    byPage: Array<{
      page: number;
      differences: number;
      changeType: 'added' | 'removed' | 'modified' | 'moved';
      description: string;
    }>;
  };
  similarity: number;
  analysisTime: number;
  downloadUrl?: string;
  reportFilename?: string;
}

const comparisonModes = [
  { id: 'visual', name: 'Visual Comparison', description: 'Compare documents visually pixel by pixel' },
  { id: 'text', name: 'Text Comparison', description: 'Compare text content and detect textual changes' },
  { id: 'structural', name: 'Structural Comparison', description: 'Compare document structure and layout' }
];

const sensitivityLevels = [
  { id: 'low', name: 'Low', description: 'Only major differences' },
  { id: 'medium', name: 'Medium', description: 'Moderate changes and differences' },
  { id: 'high', name: 'High', description: 'All differences including minor formatting' }
];

const highlightColors = [
  { id: 'red', name: 'Red', value: '#DC2626', description: 'Standard change highlighting' },
  { id: 'blue', name: 'Blue', value: '#2563EB', description: 'Professional highlighting' },
  { id: 'green', name: 'Green', value: '#16A34A', description: 'Added content highlighting' },
  { id: 'yellow', name: 'Yellow', value: '#CA8A04', description: 'Modified content highlighting' }
];

const PDFComparisonTool = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [modifiedFile, setModifiedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ComparisonSettings>({
    mode: 'visual',
    sensitivity: 'medium',
    ignoreFormatting: false,
    ignoreImages: false,
    ignoreMetadata: true,
    highlightColor: '#DC2626',
    outputFormat: 'pdf'
  });
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [dragOver, setDragOver] = useState<'original' | 'modified' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const originalFileInputRef = useRef<HTMLInputElement>(null);
  const modifiedFileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null, type: 'original' | 'modified') => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Please select PDF files only.');
      return;
    }

    if (type === 'original') {
      setOriginalFile(file);
    } else {
      setModifiedFile(file);
    }
    
    setError(null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'original' | 'modified') => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(e.dataTransfer.files, type);
  };

  const handleDragOver = (e: React.DragEvent, type: 'original' | 'modified') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const updateSetting = <K extends keyof ComparisonSettings>(key: K, value: ComparisonSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const performComparison = async () => {
    if (!originalFile || !modifiedFile) return;

    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('original', originalFile);
      formData.append('modified', modifiedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/compare-pdfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF comparison failed');
      }

      const comparisonResult = await response.json();
      setResult(comparisonResult);

    } catch (error) {
      console.error('Error comparing PDFs:', error);
      setError(error instanceof Error ? error.message : 'Error comparing PDFs. Please try again.');
    }

    setIsComparing(false);
  };

  const downloadReport = async () => {
    if (!originalFile || !modifiedFile || !result) return;

    try {
      const formData = new FormData();
      formData.append('original', originalFile);
      formData.append('modified', modifiedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/generate-comparison-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate comparison report');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `comparison-report-${Date.now()}.${settings.outputFormat}`;
      link.click();

    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate comparison report');
    }
  };

  const resetTool = () => {
    setOriginalFile(null);
    setModifiedFile(null);
    setResult(null);
    setError(null);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityDescription = (similarity: number) => {
    if (similarity >= 95) return 'Nearly Identical';
    if (similarity >= 90) return 'Very Similar';
    if (similarity >= 70) return 'Moderately Similar';
    if (similarity >= 50) return 'Somewhat Different';
    return 'Very Different';
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'removed': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      case 'moved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Comparison Tool - Compare Documents & Detect Changes | ToolsHub</title>
        <meta name="description" content="Compare two PDF documents to identify differences, changes, and modifications. Visual and text-based comparison with detailed analysis reports." />
        <meta name="keywords" content="PDF comparison, compare PDFs, document diff, PDF changes, document analysis, version comparison" />
        <meta property="og:title" content="PDF Comparison Tool - Compare Documents & Detect Changes | ToolsHub" />
        <meta property="og:description" content="Professional PDF comparison tool for detecting document changes and differences." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-comparison-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-comparison-tool">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-cyan-600 via-blue-500 to-teal-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-balance-scale text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Comparison Tool
              </h1>
              <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
                Compare two PDF documents to identify differences, changes, and modifications. Get detailed analysis with visual highlighting and comprehensive reports.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF Documents to Compare</h2>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Original Document Upload */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Original Document</h3>
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                              dragOver === 'original'
                                ? 'border-cyan-500 bg-cyan-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDrop={(e) => handleDrop(e, 'original')}
                            onDragOver={(e) => handleDragOver(e, 'original')}
                            onDragLeave={handleDragLeave}
                            onClick={() => originalFileInputRef.current?.click()}
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <h4 className="font-medium text-gray-900 mb-2">
                              Drop original PDF here
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              or click to select the baseline document
                            </p>
                            <Button
                              className="bg-cyan-600 hover:bg-cyan-700 text-white"
                              data-testid="button-select-original"
                            >
                              Select Original
                            </Button>
                            
                            <input
                              ref={originalFileInputRef}
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => handleFileSelect(e.target.files, 'original')}
                              className="hidden"
                              data-testid="input-original"
                            />
                          </div>

                          {originalFile && (
                            <div className="mt-4 p-3 bg-cyan-50 rounded-lg" data-testid="original-file-info">
                              <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-cyan-600" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{originalFile.name}</div>
                                  <div className="text-sm text-gray-600">{formatFileSize(originalFile.size)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Modified Document Upload */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Modified Document</h3>
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                              dragOver === 'modified'
                                ? 'border-cyan-500 bg-cyan-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDrop={(e) => handleDrop(e, 'modified')}
                            onDragOver={(e) => handleDragOver(e, 'modified')}
                            onDragLeave={handleDragLeave}
                            onClick={() => modifiedFileInputRef.current?.click()}
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <h4 className="font-medium text-gray-900 mb-2">
                              Drop modified PDF here
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              or click to select the updated document
                            </p>
                            <Button
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                              data-testid="button-select-modified"
                            >
                              Select Modified
                            </Button>
                            
                            <input
                              ref={modifiedFileInputRef}
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => handleFileSelect(e.target.files, 'modified')}
                              className="hidden"
                              data-testid="input-modified"
                            />
                          </div>

                          {modifiedFile && (
                            <div className="mt-4 p-3 bg-teal-50 rounded-lg" data-testid="modified-file-info">
                              <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-teal-600" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{modifiedFile.name}</div>
                                  <div className="text-sm text-gray-600">{formatFileSize(modifiedFile.size)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comparison Settings */}
                    {originalFile && modifiedFile && (
                      <div className="space-y-6" data-testid="comparison-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Comparison Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Comparison Mode */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comparison Mode
                            </label>
                            <Select value={settings.mode} onValueChange={(value: 'visual' | 'text' | 'structural') => updateSetting('mode', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {comparisonModes.map((mode) => (
                                  <SelectItem key={mode.id} value={mode.id}>
                                    {mode.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {comparisonModes.find(m => m.id === settings.mode)?.description}
                            </p>
                          </div>

                          {/* Sensitivity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sensitivity Level
                            </label>
                            <Select value={settings.sensitivity} onValueChange={(value: 'low' | 'medium' | 'high') => updateSetting('sensitivity', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sensitivityLevels.map((level) => (
                                  <SelectItem key={level.id} value={level.id}>
                                    {level.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {sensitivityLevels.find(l => l.id === settings.sensitivity)?.description}
                            </p>
                          </div>

                          {/* Output Format */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Report Format
                            </label>
                            <Select value={settings.outputFormat} onValueChange={(value: 'pdf' | 'html' | 'json') => updateSetting('outputFormat', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF Report</SelectItem>
                                <SelectItem value="html">HTML Report</SelectItem>
                                <SelectItem value="json">JSON Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Additional Options */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Ignore Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.ignoreFormatting}
                                onChange={(e) => updateSetting('ignoreFormatting', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Ignore formatting changes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.ignoreImages}
                                onChange={(e) => updateSetting('ignoreImages', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Ignore image differences</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.ignoreMetadata}
                                onChange={(e) => updateSetting('ignoreMetadata', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Ignore metadata changes</span>
                            </label>
                          </div>
                        </div>

                        {/* Compare Button */}
                        <Button
                          onClick={performComparison}
                          disabled={isComparing}
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3"
                          data-testid="button-compare"
                        >
                          {isComparing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Comparing Documents...
                            </>
                          ) : (
                            <>
                              <GitCompare className="w-4 h-4 mr-2" />
                              Compare Documents
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
                      <div className="space-y-6" data-testid="comparison-results">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-6 border border-cyan-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-cyan-900">Comparison Summary</h3>
                            <Badge className="bg-cyan-100 text-cyan-800">
                              {result.analysisTime}s analysis
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${getSimilarityColor(result.similarity)}`}>
                                {result.similarity}%
                              </div>
                              <div className="text-sm text-gray-600">Similarity</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {getSimilarityDescription(result.similarity)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-cyan-900">
                                {result.differences.total}
                              </div>
                              <div className="text-sm text-gray-600">Total Differences</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-cyan-900">
                                {Math.max(result.documentsCompared.original.pages, result.documentsCompared.modified.pages)}
                              </div>
                              <div className="text-sm text-gray-600">Pages Analyzed</div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Results */}
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger value="differences" className="flex items-center gap-2">
                              <GitCompare className="w-4 h-4" />
                              Differences
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Documents
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Difference Types</h4>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                  <div className="text-2xl font-bold text-red-600">
                                    {result.differences.byType.text}
                                  </div>
                                  <div className="text-sm text-red-700">Text Changes</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {result.differences.byType.images}
                                  </div>
                                  <div className="text-sm text-blue-700">Image Changes</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                  <div className="text-2xl font-bold text-yellow-600">
                                    {result.differences.byType.formatting}
                                  </div>
                                  <div className="text-sm text-yellow-700">Format Changes</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {result.differences.byType.structure}
                                  </div>
                                  <div className="text-sm text-green-700">Structure Changes</div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="differences" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Changes by Page</h4>
                              
                              {result.differences.byPage.length > 0 ? (
                                <div className="space-y-3">
                                  {result.differences.byPage.map((pageInfo, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="font-medium text-gray-900">
                                          Page {pageInfo.page}
                                        </div>
                                        <Badge className={getChangeTypeColor(pageInfo.changeType)}>
                                          {pageInfo.changeType}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {pageInfo.differences} differences
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No significant differences found between the documents.
                                </p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="documents" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white border rounded-lg p-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Original Document</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Filename:</span> {result.documentsCompared.original.filename}</div>
                                  <div><span className="font-medium">Pages:</span> {result.documentsCompared.original.pages}</div>
                                  <div><span className="font-medium">Size:</span> {formatFileSize(result.documentsCompared.original.size)}</div>
                                </div>
                              </div>
                              
                              <div className="bg-white border rounded-lg p-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Modified Document</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Filename:</span> {result.documentsCompared.modified.filename}</div>
                                  <div><span className="font-medium">Pages:</span> {result.documentsCompared.modified.pages}</div>
                                  <div><span className="font-medium">Size:</span> {formatFileSize(result.documentsCompared.modified.size)}</div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            onClick={downloadReport}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                            data-testid="button-download-report"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Comparison Report
                          </Button>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="flex-1 text-gray-600 border-gray-200 hover:bg-gray-50"
                          >
                            Start New Comparison
                          </Button>
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

export default PDFComparisonTool;