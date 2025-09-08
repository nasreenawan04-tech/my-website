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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PDFPermissionManager;