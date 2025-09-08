import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, AlertTriangle, CheckCircle, XCircle, Wrench, Zap } from 'lucide-react';

interface RepairSettings {
  fixStructure: boolean;
  recoverText: boolean;
  rebuildXref: boolean;
  removeCorruption: boolean;
  fixEncoding: boolean;
  recoverImages: boolean;
}

interface RepairResult {
  success: boolean;
  originalFile: string;
  repairedFile?: string;
  downloadUrl?: string;
  filename?: string;
  errors: string[];
  warnings: string[];
  recoveredPages: number;
  totalPages: number;
  recoveredElements: {
    text: number;
    images: number;
    fonts: number;
  };
}

const PDFRepairTool = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<RepairSettings>({
    fixStructure: true,
    recoverText: true,
    rebuildXref: true,
    removeCorruption: true,
    fixEncoding: true,
    recoverImages: true,
  });
  const [result, setResult] = useState<RepairResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [repairProgress, setRepairProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
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
    setRepairProgress(0);
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

  const updateSetting = <K extends keyof RepairSettings>(key: K, value: RepairSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const repairPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setRepairProgress(0);
    setCurrentStep('Initializing repair process...');

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('fixStructure', settings.fixStructure.toString());
      formData.append('recoverText', settings.recoverText.toString());
      formData.append('rebuildXref', settings.rebuildXref.toString());
      formData.append('removeCorruption', settings.removeCorruption.toString());
      formData.append('fixEncoding', settings.fixEncoding.toString());
      formData.append('recoverImages', settings.recoverImages.toString());

      // Simulate progress updates
      const progressSteps = [
        { progress: 20, step: 'Analyzing PDF structure...' },
        { progress: 40, step: 'Identifying corruption issues...' },
        { progress: 60, step: 'Rebuilding document structure...' },
        { progress: 80, step: 'Recovering content elements...' },
        { progress: 95, step: 'Finalizing repair...' },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setRepairProgress(progressSteps[stepIndex].progress);
          setCurrentStep(progressSteps[stepIndex].step);
          stepIndex++;
        }
      }, 1000);

      const response = await fetch('/api/repair-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setRepairProgress(100);
      setCurrentStep('Repair complete!');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF repair failed');
      }

      const repairData = await response.json();

      if (repairData.downloadUrl) {
        setResult({
          success: true,
          originalFile: selectedFile.name,
          downloadUrl: repairData.downloadUrl,
          filename: repairData.filename,
          errors: repairData.errors || [],
          warnings: repairData.warnings || [],
          recoveredPages: repairData.recoveredPages || 0,
          totalPages: repairData.totalPages || 0,
          recoveredElements: repairData.recoveredElements || { text: 0, images: 0, fonts: 0 }
        });
      } else {
        setResult({
          success: false,
          originalFile: selectedFile.name,
          errors: repairData.errors || ['Unable to repair PDF'],
          warnings: repairData.warnings || [],
          recoveredPages: 0,
          totalPages: repairData.totalPages || 0,
          recoveredElements: { text: 0, images: 0, fonts: 0 }
        });
      }
    } catch (error) {
      console.error('Error repairing PDF:', error);
      setError(error instanceof Error ? error.message : 'Error repairing PDF. Please try again.');
      setRepairProgress(0);
      setCurrentStep('');
    }

    setIsProcessing(false);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setRepairProgress(0);
    setCurrentStep('');
  };

  return (
    <>
      <Helmet>
        <title>PDF Repair Tool - Fix Corrupted PDFs | ToolsHub</title>
        <meta name="description" content="Advanced PDF repair tool to fix corrupted PDFs and recover readable content from damaged documents." />
        <meta name="keywords" content="PDF repair, fix corrupted PDF, PDF recovery, damaged PDF, PDF fix tool" />
        <meta property="og:title" content="PDF Repair Tool - Fix Corrupted PDFs | ToolsHub" />
        <meta property="og:description" content="Recover and repair corrupted PDF files with advanced restoration techniques." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-repair-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-repair-tool">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-tools text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Repair Tool
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Advanced PDF repair technology to fix corrupted documents and recover readable content from damaged files.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Corrupted PDF File</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop corrupted PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a damaged PDF from your computer
                        </p>
                        <Button
                          className="bg-orange-600 hover:bg-orange-700 text-white"
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

                    {/* Repair Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="repair-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Wrench className="w-5 h-5 mr-2" />
                          Repair Options
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Structure Repair</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="fix-structure"
                                  checked={settings.fixStructure}
                                  onCheckedChange={(checked) => updateSetting('fixStructure', Boolean(checked))}
                                />
                                <label htmlFor="fix-structure" className="text-sm text-gray-700">
                                  Fix PDF document structure
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="rebuild-xref"
                                  checked={settings.rebuildXref}
                                  onCheckedChange={(checked) => updateSetting('rebuildXref', Boolean(checked))}
                                />
                                <label htmlFor="rebuild-xref" className="text-sm text-gray-700">
                                  Rebuild cross-reference table
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="remove-corruption"
                                  checked={settings.removeCorruption}
                                  onCheckedChange={(checked) => updateSetting('removeCorruption', Boolean(checked))}
                                />
                                <label htmlFor="remove-corruption" className="text-sm text-gray-700">
                                  Remove corrupted objects
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Content Recovery</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="recover-text"
                                  checked={settings.recoverText}
                                  onCheckedChange={(checked) => updateSetting('recoverText', Boolean(checked))}
                                />
                                <label htmlFor="recover-text" className="text-sm text-gray-700">
                                  Recover text content
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="recover-images"
                                  checked={settings.recoverImages}
                                  onCheckedChange={(checked) => updateSetting('recoverImages', Boolean(checked))}
                                />
                                <label htmlFor="recover-images" className="text-sm text-gray-700">
                                  Recover images and graphics
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="fix-encoding"
                                  checked={settings.fixEncoding}
                                  onCheckedChange={(checked) => updateSetting('fixEncoding', Boolean(checked))}
                                />
                                <label htmlFor="fix-encoding" className="text-sm text-gray-700">
                                  Fix character encoding issues
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
                              <p className="text-sm text-yellow-700">
                                PDF repair is a complex process. While our tool can fix many corruption issues, 
                                some severely damaged files may not be fully recoverable. The repair process 
                                may take several minutes for large files.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Repair Button */}
                        <Button
                          onClick={repairPDF}
                          disabled={isProcessing}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                          data-testid="button-repair"
                        >
                          {isProcessing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Repairing PDF...
                            </>
                          ) : (
                            <>
                              <Wrench className="w-4 h-4 mr-2" />
                              Start PDF Repair
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Progress Section */}
                    {isProcessing && (
                      <div className="bg-blue-50 rounded-lg p-6" data-testid="repair-progress">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Repair Progress</h3>
                        <Progress value={repairProgress} className="mb-4" />
                        <div className="text-center text-blue-700">{currentStep}</div>
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
                      <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`} data-testid="repair-results">
                        <div className="flex items-center mb-4">
                          {result.success ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mr-2" />
                          )}
                          <h3 className={`text-xl font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                            {result.success ? 'PDF Repair Successful!' : 'PDF Repair Failed'}
                          </h3>
                        </div>

                        {result.success && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-700">
                                  {result.recoveredPages}/{result.totalPages}
                                </div>
                                <div className="text-sm text-green-600">Pages Recovered</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-700">
                                  {result.recoveredElements.text}
                                </div>
                                <div className="text-sm text-green-600">Text Objects</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-700">
                                  {result.recoveredElements.images}
                                </div>
                                <div className="text-sm text-green-600">Images Recovered</div>
                              </div>
                            </div>

                            {result.downloadUrl && (
                              <Button
                                asChild
                                className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
                                data-testid="button-download"
                              >
                                <a href={result.downloadUrl} download={result.filename}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Repaired PDF
                                </a>
                              </Button>
                            )}
                          </>
                        )}

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                              {result.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Errors */}
                        {result.errors.length > 0 && (
                          <div>
                            <h4 className={`font-medium mb-2 ${result.success ? 'text-yellow-800' : 'text-red-800'}`}>
                              {result.success ? 'Issues Found:' : 'Errors:'}
                            </h4>
                            <ul className={`list-disc list-inside text-sm space-y-1 ${result.success ? 'text-yellow-700' : 'text-red-700'}`}>
                              {result.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
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

export default PDFRepairTool;