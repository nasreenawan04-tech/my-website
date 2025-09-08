import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, CheckCircle, XCircle, AlertTriangle, Shield, Zap, Info } from 'lucide-react';

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  type: 'archival' | 'print' | 'accessibility' | 'security';
}

interface ComplianceCheck {
  standard: string;
  compliant: boolean;
  errors: ComplianceIssue[];
  warnings: ComplianceIssue[];
  info: ComplianceIssue[];
}

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  page?: number;
  suggestion?: string;
}

interface ComplianceResult {
  filename: string;
  fileSize: number;
  totalPages: number;
  checks: ComplianceCheck[];
  overallCompliance: boolean;
  pdfVersion: string;
  metadata: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

const complianceStandards: ComplianceStandard[] = [
  {
    id: 'pdf-a-1b',
    name: 'PDF/A-1b',
    description: 'Basic level archival standard for long-term preservation',
    type: 'archival'
  },
  {
    id: 'pdf-a-2b',
    name: 'PDF/A-2b',
    description: 'Enhanced archival standard with JPEG 2000 and transparency support',
    type: 'archival'
  },
  {
    id: 'pdf-a-3b',
    name: 'PDF/A-3b',
    description: 'Latest archival standard allowing embedded files',
    type: 'archival'
  },
  {
    id: 'pdf-x-1a',
    name: 'PDF/X-1a',
    description: 'Print production standard ensuring color accuracy',
    type: 'print'
  },
  {
    id: 'pdf-x-3',
    name: 'PDF/X-3',
    description: 'Advanced print standard with color management',
    type: 'print'
  },
  {
    id: 'pdf-ua-1',
    name: 'PDF/UA-1',
    description: 'Universal accessibility standard for assistive technologies',
    type: 'accessibility'
  }
];

const PDFComplianceChecker = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<string>('pdf-a-1b');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStandardInfo = (standardId: string) => {
    return complianceStandards.find(s => s.id === standardId);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'archival': return 'bg-blue-100 text-blue-800';
      case 'print': return 'bg-purple-100 text-purple-800';
      case 'accessibility': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const checkCompliance = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('standard', selectedStandard);

      const response = await fetch('/api/check-pdf-compliance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compliance check failed');
      }

      const complianceResult = await response.json();
      setResult(complianceResult);
    } catch (error) {
      console.error('Error checking PDF compliance:', error);
      setError(error instanceof Error ? error.message : 'Error checking PDF compliance. Please try again.');
    }

    setIsProcessing(false);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Compliance Checker - Validate PDF Standards | ToolsHub</title>
        <meta name="description" content="Check PDF compliance with industry standards like PDF/A, PDF/X, and PDF/UA for archival, print, and accessibility requirements." />
        <meta name="keywords" content="PDF compliance, PDF/A validation, PDF/X checker, PDF standards, archival PDF, print PDF" />
        <meta property="og:title" content="PDF Compliance Checker - Validate PDF Standards | ToolsHub" />
        <meta property="og:description" content="Comprehensive PDF compliance validation against industry standards." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-compliance-checker" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-compliance-checker">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check-circle text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Compliance Checker
              </h1>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Validate PDF documents against industry standards including PDF/A for archival, PDF/X for print production, and PDF/UA for accessibility.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File for Compliance Check</h2>
                      
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
                          or click to select a PDF for compliance validation
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

                    {/* Standard Selection */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="standard-selection">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Compliance Standard
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select PDF Standard to Validate Against
                          </label>
                          <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {complianceStandards.map((standard) => (
                                <SelectItem key={standard.id} value={standard.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{standard.name}</span>
                                    <Badge className={`text-xs ${getTypeColor(standard.type)}`}>
                                      {standard.type}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {getStandardInfo(selectedStandard) && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  {getStandardInfo(selectedStandard)?.name}
                                </span>
                                <Badge className={`text-xs ${getTypeColor(getStandardInfo(selectedStandard)?.type || '')}`}>
                                  {getStandardInfo(selectedStandard)?.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-blue-700">
                                {getStandardInfo(selectedStandard)?.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Check Button */}
                        <Button
                          onClick={checkCompliance}
                          disabled={isProcessing}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                          data-testid="button-check-compliance"
                        >
                          {isProcessing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Checking Compliance...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Check PDF Compliance
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          <div className="text-red-800 text-sm">{error}</div>
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {result && (
                      <div className="space-y-6" data-testid="compliance-results">
                        {/* Overall Status */}
                        <div className={`rounded-lg p-6 ${result.overallCompliance ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center mb-4">
                            {result.overallCompliance ? (
                              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600 mr-3" />
                            )}
                            <h3 className={`text-xl font-semibold ${result.overallCompliance ? 'text-green-900' : 'text-red-900'}`}>
                              {result.overallCompliance ? 'PDF is Compliant!' : 'PDF is Not Compliant'}
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{result.filename}</div>
                              <div className="text-sm text-gray-600">File Name</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{result.totalPages}</div>
                              <div className="text-sm text-gray-600">Total Pages</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{result.pdfVersion}</div>
                              <div className="text-sm text-gray-600">PDF Version</div>
                            </div>
                          </div>
                        </div>

                        {/* Compliance Details */}
                        {result.checks.map((check, index) => (
                          <div key={index} className="bg-white border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {getStandardInfo(check.standard)?.name || check.standard}
                                </h4>
                                {check.compliant ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Compliant
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Non-Compliant
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Issues */}
                            <div className="space-y-4">
                              {/* Errors */}
                              {check.errors.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-red-800 mb-2 flex items-center">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Errors ({check.errors.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {check.errors.map((issue, issueIndex) => (
                                      <div key={issueIndex} className={`border rounded-lg p-3 ${getSeverityColor(issue.type)}`}>
                                        <div className="flex items-start gap-2">
                                          {getIssueIcon(issue.type)}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {issue.code}
                                              {issue.page && <span className="text-sm text-gray-600 ml-2">(Page {issue.page})</span>}
                                            </div>
                                            <div className="text-sm text-gray-700 mt-1">{issue.message}</div>
                                            {issue.suggestion && (
                                              <div className="text-sm text-blue-700 mt-2 italic">
                                                💡 {issue.suggestion}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Warnings */}
                              {check.warnings.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Warnings ({check.warnings.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {check.warnings.map((issue, issueIndex) => (
                                      <div key={issueIndex} className={`border rounded-lg p-3 ${getSeverityColor(issue.type)}`}>
                                        <div className="flex items-start gap-2">
                                          {getIssueIcon(issue.type)}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {issue.code}
                                              {issue.page && <span className="text-sm text-gray-600 ml-2">(Page {issue.page})</span>}
                                            </div>
                                            <div className="text-sm text-gray-700 mt-1">{issue.message}</div>
                                            {issue.suggestion && (
                                              <div className="text-sm text-blue-700 mt-2 italic">
                                                💡 {issue.suggestion}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Info */}
                              {check.info.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    Information ({check.info.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {check.info.map((issue, issueIndex) => (
                                      <div key={issueIndex} className={`border rounded-lg p-3 ${getSeverityColor(issue.type)}`}>
                                        <div className="flex items-start gap-2">
                                          {getIssueIcon(issue.type)}
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {issue.code}
                                              {issue.page && <span className="text-sm text-gray-600 ml-2">(Page {issue.page})</span>}
                                            </div>
                                            <div className="text-sm text-gray-700 mt-1">{issue.message}</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No issues */}
                              {check.errors.length === 0 && check.warnings.length === 0 && check.info.length === 0 && (
                                <div className="text-center py-4 text-green-700">
                                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                  <div className="font-medium">No compliance issues found!</div>
                                  <div className="text-sm">This PDF meets all requirements for the selected standard.</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Metadata */}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">PDF Metadata</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                value && (
                                  <div key={key}>
                                    <span className="font-medium text-gray-700 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="ml-2 text-gray-600">{value}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
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

export default PDFComplianceChecker;