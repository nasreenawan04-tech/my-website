import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Shield, Lock, Unlock, Eye, EyeOff, Printer, Copy, Edit, Zap, AlertTriangle } from 'lucide-react';

interface PDFPermissions {
  print: boolean;
  printHighQuality: boolean;
  copy: boolean;
  modify: boolean;
  modifyAnnotations: boolean;
  fillForms: boolean;
  extract: boolean;
  assemble: boolean;
  isPasswordProtected: boolean;
  hasOwnerPassword: boolean;
  hasUserPassword: boolean;
}

interface PermissionResult {
  filename: string;
  fileSize: number;
  totalPages: number;
  isEncrypted: boolean;
  permissions: PDFPermissions;
  restrictionLevel: 'none' | 'low' | 'medium' | 'high';
  downloadUrl?: string;
  modifiedFilename?: string;
}

const PDFPermissionManager = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<PermissionResult | null>(null);
  const [modifiedPermissions, setModifiedPermissions] = useState<PDFPermissions | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('view');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRestrictionLevel = (permissions: PDFPermissions): 'none' | 'low' | 'medium' | 'high' => {
    const restrictedCount = Object.entries(permissions).filter(([key, value]) => 
      key !== 'isPasswordProtected' && key !== 'hasOwnerPassword' && key !== 'hasUserPassword' && !value
    ).length;

    if (restrictedCount === 0) return 'none';
    if (restrictedCount <= 2) return 'low';
    if (restrictedCount <= 4) return 'medium';
    return 'high';
  };

  const getRestrictionColor = (level: string) => {
    switch (level) {
      case 'none': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
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
    setModifiedPermissions(null);
    setActiveTab('view');
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

  const analyzePermissions = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const response = await fetch('/api/analyze-pdf-permissions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Permission analysis failed');
      }

      const permissionResult = await response.json();
      setResult(permissionResult);
      setModifiedPermissions({ ...permissionResult.permissions });
    } catch (error) {
      console.error('Error analyzing PDF permissions:', error);
      setError(error instanceof Error ? error.message : 'Error analyzing PDF permissions. Please try again.');
    }

    setIsAnalyzing(false);
  };

  const modifyPermissions = async () => {
    if (!selectedFile || !modifiedPermissions) return;

    setIsModifying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('permissions', JSON.stringify(modifiedPermissions));

      const response = await fetch('/api/modify-pdf-permissions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Permission modification failed');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      if (result) {
        setResult({
          ...result,
          downloadUrl,
          modifiedFilename: `modified-${selectedFile.name}`
        });
      }
    } catch (error) {
      console.error('Error modifying PDF permissions:', error);
      setError(error instanceof Error ? error.message : 'Error modifying PDF permissions. Please try again.');
    }

    setIsModifying(false);
  };

  const updatePermission = <K extends keyof PDFPermissions>(key: K, value: PDFPermissions[K]) => {
    if (modifiedPermissions) {
      setModifiedPermissions(prev => prev ? { ...prev, [key]: value } : null);
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setModifiedPermissions(null);
    setError(null);
    setActiveTab('view');
  };

  const getPermissionIcon = (permission: string, enabled: boolean) => {
    const iconClass = `w-4 h-4 ${enabled ? 'text-green-600' : 'text-red-600'}`;
    
    switch (permission) {
      case 'print':
      case 'printHighQuality':
        return <Printer className={iconClass} />;
      case 'copy':
      case 'extract':
        return <Copy className={iconClass} />;
      case 'modify':
      case 'modifyAnnotations':
      case 'fillForms':
      case 'assemble':
        return <Edit className={iconClass} />;
      default:
        return enabled ? <Eye className={iconClass} /> : <EyeOff className={iconClass} />;
    }
  };

  const permissionLabels = {
    print: 'Print Document',
    printHighQuality: 'Print High Quality',
    copy: 'Copy Text & Images',
    modify: 'Modify Document',
    modifyAnnotations: 'Modify Annotations',
    fillForms: 'Fill Form Fields',
    extract: 'Extract Content',
    assemble: 'Assemble Pages'
  };

  const permissionDescriptions = {
    print: 'Allow printing the document at any quality level',
    printHighQuality: 'Allow high-quality printing (300+ DPI)',
    copy: 'Allow copying text and images from the document',
    modify: 'Allow modifying the document content',
    modifyAnnotations: 'Allow adding, editing, or deleting annotations',
    fillForms: 'Allow filling interactive form fields',
    extract: 'Allow extracting text and graphics for accessibility',
    assemble: 'Allow assembling, rotating, or deleting pages'
  };

  return (
    <>
      <Helmet>
        <title>PDF Permission Manager - Control PDF Access & Security | ToolsHub</title>
        <meta name="description" content="View and modify PDF permissions including print, copy, edit restrictions. Manage PDF security settings and access controls." />
        <meta name="keywords" content="PDF permissions, PDF security, PDF restrictions, PDF access control, modify PDF permissions" />
        <meta property="og:title" content="PDF Permission Manager - Control PDF Access & Security | ToolsHub" />
        <meta property="og:description" content="Comprehensive PDF permission management and security control." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-permission-manager" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-permission-manager">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-shield text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Permission Manager
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                View and modify PDF document permissions including print, copy, edit restrictions. Control access and security settings for your PDFs.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-purple-500 bg-purple-50' 
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
                          or click to select a PDF for permission analysis
                        </p>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white"
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
                            onClick={analyzePermissions}
                            disabled={isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            data-testid="button-analyze"
                          >
                            {isAnalyzing ? (
                              <>
                                <Zap className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Analyze Permissions
                              </>
                            )}
                          </Button>
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
                      <div className="space-y-6" data-testid="permission-results">
                        {/* File Info Summary */}
                        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-purple-900">PDF Security Analysis</h3>
                            <div className="flex items-center gap-2">
                              {result.isEncrypted ? (
                                <Badge className="bg-orange-100 text-orange-800">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Encrypted
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Not Encrypted
                                </Badge>
                              )}
                              <Badge className={getRestrictionColor(result.restrictionLevel)}>
                                {result.restrictionLevel.charAt(0).toUpperCase() + result.restrictionLevel.slice(1)} Restrictions
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-900">{result.filename}</div>
                              <div className="text-sm text-purple-600">File Name</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-900">{result.totalPages}</div>
                              <div className="text-sm text-purple-600">Total Pages</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-900">{formatFileSize(result.fileSize)}</div>
                              <div className="text-sm text-purple-600">File Size</div>
                            </div>
                          </div>
                        </div>

                        {/* Tabs for View/Modify */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="view" className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Permissions
                            </TabsTrigger>
                            <TabsTrigger value="modify" className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Modify Permissions
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="view" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Permissions</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(permissionLabels).map(([key, label]) => {
                                  const enabled = result.permissions[key as keyof PDFPermissions] as boolean;
                                  return (
                                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        {getPermissionIcon(key, enabled)}
                                        <div>
                                          <div className="font-medium text-gray-900">{label}</div>
                                          <div className="text-xs text-gray-600">
                                            {permissionDescriptions[key as keyof typeof permissionDescriptions]}
                                          </div>
                                        </div>
                                      </div>
                                      <Badge className={enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {enabled ? 'Allowed' : 'Restricted'}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Security Status */}
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-3">Security Status</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-2">
                                    {result.permissions.isPasswordProtected ? (
                                      <Lock className="w-4 h-4 text-orange-600" />
                                    ) : (
                                      <Unlock className="w-4 h-4 text-green-600" />
                                    )}
                                    <span className="text-sm">
                                      {result.permissions.isPasswordProtected ? 'Password Protected' : 'No Password'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {result.permissions.hasOwnerPassword ? (
                                      <Shield className="w-4 h-4 text-orange-600" />
                                    ) : (
                                      <Shield className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-sm">
                                      {result.permissions.hasOwnerPassword ? 'Owner Password Set' : 'No Owner Password'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {result.permissions.hasUserPassword ? (
                                      <Eye className="w-4 h-4 text-orange-600" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-sm">
                                      {result.permissions.hasUserPassword ? 'User Password Set' : 'No User Password'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="modify" className="space-y-4">
                            {modifiedPermissions && (
                              <div className="bg-white border rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Modify Permissions</h4>
                                
                                <div className="space-y-4">
                                  {Object.entries(permissionLabels).map(([key, label]) => {
                                    const enabled = modifiedPermissions[key as keyof PDFPermissions] as boolean;
                                    return (
                                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          {getPermissionIcon(key, enabled)}
                                          <div>
                                            <div className="font-medium text-gray-900">{label}</div>
                                            <div className="text-xs text-gray-600">
                                              {permissionDescriptions[key as keyof typeof permissionDescriptions]}
                                            </div>
                                          </div>
                                        </div>
                                        <Switch
                                          checked={enabled}
                                          onCheckedChange={(checked) => updatePermission(key as keyof PDFPermissions, checked)}
                                          data-testid={`switch-${key}`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                  <Button
                                    onClick={modifyPermissions}
                                    disabled={isModifying}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                                    data-testid="button-modify-permissions"
                                  >
                                    {isModifying ? (
                                      <>
                                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                                        Modifying Permissions...
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Apply Permission Changes
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

                        {/* Download Modified PDF */}
                        {result.downloadUrl && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                              <Download className="w-5 h-5 mr-2" />
                              Modified PDF Ready
                            </h4>
                            <p className="text-green-700 mb-4">
                              Your PDF permissions have been successfully modified. Download the updated file below.
                            </p>
                            <Button
                              asChild
                              className="bg-green-600 hover:bg-green-700 text-white"
                              data-testid="button-download"
                            >
                              <a href={result.downloadUrl} download={result.modifiedFilename}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Modified PDF
                              </a>
                            </Button>
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
                {/* What is PDF Permission Manager */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Permission Manager?</h2>
                  <div className="prose prose-lg max-w-4xl mx-auto text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      A PDF Permission Manager is a sophisticated digital tool designed to analyze, view, and modify document access controls and security restrictions embedded within PDF files. This comprehensive utility provides complete visibility into PDF security settings while offering granular control over document permissions including printing, copying, editing, form filling, and content extraction capabilities.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Our advanced PDF Permission Manager goes beyond basic security analysis by providing detailed permission breakdowns, restriction level assessments, and the ability to modify existing security settings. Whether you're managing enterprise document workflows, ensuring compliance requirements, or controlling information access, this tool streamlines PDF security management with professional-grade capabilities.
                    </p>
                  </div>
                </div>

                {/* Key Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Analysis</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Comprehensive analysis of PDF security settings including encryption status, password protection, and detailed permission breakdowns with restriction level assessment.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-edit text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Permission Modification</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Granular control over PDF permissions with the ability to enable or disable printing, copying, editing, form filling, and content extraction capabilities.
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-eye text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Visual Permission Display</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Clear visual representation of current permissions with intuitive icons, status indicators, and detailed descriptions for each security setting.
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-lock text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Encryption Detection</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced detection of PDF encryption methods, password protection levels, and owner/user password configurations with security status reporting.
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-bar text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Restriction Level Analysis</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Intelligent assessment of document restriction levels with color-coded indicators showing none, low, medium, or high security restrictions.
                    </p>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-download text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Download</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Safe download of modified PDF files with updated permission settings, maintaining document integrity while applying new security configurations.
                    </p>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How PDF Permission Management Works</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload PDF Document</h3>
                      <p className="text-gray-600">
                        Select and upload your PDF file using our secure drag-and-drop interface or file browser. The tool accepts all standard PDF versions and formats.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Analyze Security Settings</h3>
                      <p className="text-gray-600">
                        Our advanced engine analyzes the PDF structure to extract all permission settings, encryption status, and security restrictions with detailed breakdowns.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">3</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Modify & Download</h3>
                      <p className="text-gray-600">
                        View current permissions and optionally modify security settings using intuitive controls. Download the updated PDF with new permission configurations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permission Types */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">PDF Permission Types Explained</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <i className="fas fa-print text-purple-600 text-2xl mr-3"></i>
                          <h3 className="text-xl font-semibold text-gray-900">Print Permissions</h3>
                        </div>
                        <div className="space-y-3 text-gray-600">
                          <p><strong>Print Document:</strong> Controls basic printing capabilities at any quality level</p>
                          <p><strong>Print High Quality:</strong> Specifically manages high-resolution printing (300+ DPI) access</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <i className="fas fa-copy text-blue-600 text-2xl mr-3"></i>
                          <h3 className="text-xl font-semibold text-gray-900">Content Permissions</h3>
                        </div>
                        <div className="space-y-3 text-gray-600">
                          <p><strong>Copy Text & Images:</strong> Allows selection and copying of document content</p>
                          <p><strong>Extract Content:</strong> Enables text and graphics extraction for accessibility purposes</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <i className="fas fa-edit text-green-600 text-2xl mr-3"></i>
                          <h3 className="text-xl font-semibold text-gray-900">Editing Permissions</h3>
                        </div>
                        <div className="space-y-3 text-gray-600">
                          <p><strong>Modify Document:</strong> Controls general document content modification capabilities</p>
                          <p><strong>Modify Annotations:</strong> Manages adding, editing, or deleting comments and markups</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <i className="fas fa-wpforms text-orange-600 text-2xl mr-3"></i>
                          <h3 className="text-xl font-semibold text-gray-900">Form & Assembly Permissions</h3>
                        </div>
                        <div className="space-y-3 text-gray-600">
                          <p><strong>Fill Form Fields:</strong> Allows completion of interactive form elements</p>
                          <p><strong>Assemble Pages:</strong> Controls page reordering, rotation, and deletion capabilities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Common Use Cases for PDF Permission Management</h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-building text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Document Management</h3>
                          <p className="text-gray-600">Control access levels for internal documents, reports, and confidential materials with granular permission settings.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-gavel text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Document Security</h3>
                          <p className="text-gray-600">Ensure sensitive legal documents maintain appropriate access controls and prevent unauthorized modifications.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-graduation-cap text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Content Protection</h3>
                          <p className="text-gray-600">Protect educational materials, textbooks, and course content with controlled access and distribution restrictions.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-user-shield text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance & Governance</h3>
                          <p className="text-gray-600">Meet regulatory requirements by ensuring documents maintain proper security controls and access restrictions.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-handshake text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Document Sharing</h3>
                          <p className="text-gray-600">Share documents with clients while maintaining control over printing, copying, and modification capabilities.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-chart-line text-white text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research & IP Protection</h3>
                          <p className="text-gray-600">Protect intellectual property and research findings by controlling document access and distribution permissions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Levels */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Understanding PDF Security Levels</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-unlock text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-green-700 mb-2">No Restrictions</h3>
                      <p className="text-sm text-gray-600">All permissions enabled, no security limitations on document usage or access.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-shield-alt text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-yellow-700 mb-2">Low Security</h3>
                      <p className="text-sm text-gray-600">Minimal restrictions with 1-2 permissions disabled, basic protection level.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-lock text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">Medium Security</h3>
                      <p className="text-sm text-gray-600">Moderate restrictions with 3-4 permissions disabled, balanced security approach.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-ban text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-red-700 mb-2">High Security</h3>
                      <p className="text-sm text-gray-600">Maximum restrictions with 5+ permissions disabled, comprehensive protection.</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
                  <div className="space-y-8">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I remove all restrictions from a password-protected PDF?</h3>
                      <p className="text-gray-600">
                        Our tool can analyze and display permissions for most PDFs, but modifying highly encrypted documents may require owner passwords. The tool will indicate which permissions can be safely modified based on the document's security configuration.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">What happens to the original PDF when I modify permissions?</h3>
                      <p className="text-gray-600">
                        The original PDF remains unchanged. Our tool creates a new PDF with your modified permission settings, allowing you to compare the old and new versions while preserving the original document.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Are there legal considerations when modifying PDF permissions?</h3>
                      <p className="text-gray-600">
                        Yes, only modify permissions on PDFs you own or have explicit authorization to change. Circumventing security measures on copyrighted or protected documents may violate terms of use or copyright laws.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">How accurate is the permission analysis?</h3>
                      <p className="text-gray-600">
                        Our tool provides highly accurate analysis of standard PDF security settings. It can detect most common permission configurations, encryption levels, and security restrictions implemented by major PDF creation tools.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">Ready to Manage Your PDF Permissions?</h2>
                  <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
                    Take control of your document security with our comprehensive PDF permission management tool. Analyze, modify, and secure your PDFs with professional-grade capabilities.
                  </p>
                  <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    Start Managing Permissions Now
                  </button>
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

export default PDFPermissionManager;