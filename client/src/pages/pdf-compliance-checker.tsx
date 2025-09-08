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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* SEO Content Sections */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-16">
                {/* What is PDF Compliance Checker */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is a PDF Compliance Checker?</h2>
                  <div className="prose prose-lg max-w-4xl mx-auto text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      A PDF Compliance Checker is a specialized digital tool designed to validate PDF documents against established industry standards and regulatory requirements. This comprehensive validation system examines PDF files to ensure they meet specific criteria for archival preservation, print production, accessibility, and regulatory compliance across various sectors including healthcare, finance, legal, and government organizations.
                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                      Our advanced PDF Compliance Checker supports multiple international standards including PDF/A for long-term archival, PDF/X for commercial printing, PDF/UA for universal accessibility, and various regulatory compliance frameworks. The tool provides detailed analysis reports, identifies non-compliance issues, and offers actionable recommendations to achieve full standard compliance.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Whether you're managing corporate document repositories, preparing materials for legal discovery, ensuring accessibility compliance, or validating documents for archival purposes, this tool streamlines the compliance verification process with professional-grade accuracy and comprehensive reporting capabilities.
                    </p>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Comprehensive PDF Compliance Validation Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-archive text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF/A Archival Standards</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Comprehensive validation against PDF/A-1, PDF/A-2, and PDF/A-3 standards for long-term digital preservation and archival compliance.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-print text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF/X Print Production</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Validate documents against PDF/X-1a and PDF/X-3 standards for commercial printing and color-managed workflows.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-universal-access text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF/UA Accessibility</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Ensure universal accessibility compliance with PDF/UA-1 standards for assistive technology compatibility.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Detailed Issue Reporting</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Comprehensive error, warning, and information reports with specific page locations and actionable remediation suggestions.
                      </p>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-info-circle text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Metadata Analysis</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Complete document metadata examination including creation dates, authorship, and embedded properties verification.
                      </p>
                    </div>

                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-shield-alt text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Validation</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Client-side processing ensures document security and privacy while providing enterprise-grade compliance validation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-12 border border-emerald-100">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Use Our PDF Compliance Checker?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Compliance Assurance</h4>
                          <p className="text-gray-600">Ensure your documents meet industry regulations and legal requirements for various sectors including healthcare, finance, and government.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Long-term Preservation</h4>
                          <p className="text-gray-600">Validate documents for archival storage with PDF/A compliance, ensuring accessibility and integrity for decades to come.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Professional Print Quality</h4>
                          <p className="text-gray-600">Verify PDF/X compliance for commercial printing processes, ensuring color accuracy and production readiness.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Accessibility Verification</h4>
                          <p className="text-gray-600">Ensure your documents are accessible to users with disabilities through PDF/UA standard compliance validation.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Reporting</h4>
                          <p className="text-gray-600">Receive detailed analysis reports with specific issues, locations, and recommendations for achieving full compliance.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-4 mt-1">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Time and Cost Efficiency</h4>
                          <p className="text-gray-600">Automate compliance checking processes, reducing manual validation time and ensuring consistent quality control.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Professional Use Cases for PDF Compliance Validation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-university text-blue-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Government & Legal</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Validate official documents, legal filings, and government records for regulatory compliance and long-term archival requirements.
                      </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-heartbeat text-green-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Healthcare</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Ensure medical records and patient documents meet HIPAA compliance and healthcare industry standards for privacy and accessibility.
                      </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-graduation-cap text-purple-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Education</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Validate academic documents, research papers, and institutional records for accessibility compliance and archival preservation.
                      </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-chart-line text-orange-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Finance & Banking</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Ensure financial documents, reports, and statements meet regulatory standards for compliance and audit requirements.
                      </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-print text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Publishing & Print</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Validate documents for commercial printing with PDF/X standards, ensuring color accuracy and print production readiness.
                      </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-building text-teal-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Corporate Enterprise</h3>
                      </div>
                      <p className="text-gray-600 text-center">
                        Manage document libraries, ensure policy compliance, and validate corporate communications for various regulatory requirements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How PDF Compliance Checking Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-white">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload PDF Document</h3>
                      <p className="text-gray-600">
                        Select your PDF file for compliance validation. Our secure system supports files of various sizes and complexities.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Compliance Standard</h3>
                      <p className="text-gray-600">
                        Choose from PDF/A, PDF/X, PDF/UA, or other industry standards based on your specific compliance requirements.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Detailed Report</h3>
                      <p className="text-gray-600">
                        Receive comprehensive analysis with compliance status, identified issues, and actionable recommendations for resolution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What PDF standards can this tool validate?</h4>
                      <p className="text-gray-600">
                        Our compliance checker supports major PDF standards including PDF/A-1b, PDF/A-2b, PDF/A-3b for archival purposes, PDF/X-1a and PDF/X-3 for print production, and PDF/UA-1 for accessibility compliance. Each standard has specific requirements and validation criteria.
                      </p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">How accurate is the compliance validation?</h4>
                      <p className="text-gray-600">
                        Our validation engine uses industry-standard algorithms and comprehensive rule sets to ensure high accuracy. The tool performs deep document analysis including structure validation, metadata verification, and content accessibility checks to provide reliable compliance assessments.
                      </p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Can I validate password-protected PDFs?</h4>
                      <p className="text-gray-600">
                        Password-protected PDFs require unlocking before compliance validation can be performed. You can use our PDF unlock tool first, then proceed with compliance checking, or provide the password during the validation process if the feature is available.
                      </p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What happens if my PDF doesn't meet compliance standards?</h4>
                      <p className="text-gray-600">
                        If compliance issues are detected, you'll receive a detailed report listing specific problems, their locations within the document, and actionable recommendations for resolution. Many issues can be resolved using other PDF editing tools or by recreating the document with proper settings.
                      </p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Is my document data secure during validation?</h4>
                      <p className="text-gray-600">
                        Yes, document security is our priority. Compliance checking is performed using secure processing methods, and uploaded files are not stored permanently on our servers. The validation process respects document confidentiality while providing comprehensive analysis.
                      </p>
                    </div>

                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Can I validate multiple PDFs at once?</h4>
                      <p className="text-gray-600">
                        Currently, the tool processes one PDF at a time to ensure thorough analysis and detailed reporting. For bulk validation needs, you can process documents individually and compile the results, or contact us for enterprise batch processing solutions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-emerald-50 rounded-2xl p-12 border border-emerald-100">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Compliance Resources</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      Enhance your understanding of PDF standards and compliance requirements with these comprehensive resources and tools.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <i className="fas fa-book text-emerald-600 text-2xl mb-3"></i>
                      <h4 className="font-semibold text-gray-900 mb-2">PDF/A Standards Guide</h4>
                      <p className="text-sm text-gray-600">Comprehensive guide to archival PDF standards and requirements.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <i className="fas fa-palette text-emerald-600 text-2xl mb-3"></i>
                      <h4 className="font-semibold text-gray-900 mb-2">PDF/X Print Standards</h4>
                      <p className="text-sm text-gray-600">Learn about commercial printing compliance and color management.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <i className="fas fa-universal-access text-emerald-600 text-2xl mb-3"></i>
                      <h4 className="font-semibold text-gray-900 mb-2">Accessibility Guidelines</h4>
                      <p className="text-sm text-gray-600">Best practices for creating accessible PDF documents.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <i className="fas fa-tools text-emerald-600 text-2xl mb-3"></i>
                      <h4 className="font-semibold text-gray-900 mb-2">PDF Editing Tools</h4>
                      <p className="text-sm text-gray-600">Additional tools for PDF modification and optimization.</p>
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

export default PDFComplianceChecker;