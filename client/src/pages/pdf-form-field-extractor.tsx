import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, FormInput, Zap, AlertTriangle, Table, BarChart3, CheckSquare } from 'lucide-react';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'listbox' | 'button' | 'signature' | 'multiline';
  page: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value: string | boolean | string[];
  required: boolean;
  readonly: boolean;
  tooltip: string;
  options?: string[]; // For dropdown/listbox fields
  defaultValue?: string | boolean;
  maxLength?: number; // For text fields
  multiSelect?: boolean; // For listbox fields
  validation?: {
    pattern?: string;
    minValue?: number;
    maxValue?: number;
  };
}

interface ExtractionSettings {
  outputFormat: 'json' | 'csv' | 'xml' | 'excel';
  includeValues: boolean;
  includeCoordinates: boolean;
  includeValidation: boolean;
  groupByPage: boolean;
  filterByType: string[];
}

interface ExtractionResult {
  filename: string;
  totalPages: number;
  totalFields: number;
  fieldsByType: {
    text: number;
    checkbox: number;
    radio: number;
    dropdown: number;
    listbox: number;
    button: number;
    signature: number;
    multiline: number;
  };
  fieldsByPage: Array<{
    page: number;
    fieldCount: number;
    fieldTypes: string[];
  }>;
  fields: FormField[];
  extractionTime: number;
  downloadUrl?: string;
  reportFilename?: string;
}

const fieldTypeIcons = {
  text: FormInput,
  checkbox: CheckSquare,
  radio: CheckSquare,
  dropdown: Table,
  listbox: Table,
  button: FormInput,
  signature: FormInput,
  multiline: FormInput
};

const fieldTypeColors = {
  text: 'bg-blue-100 text-blue-800',
  checkbox: 'bg-green-100 text-green-800',
  radio: 'bg-purple-100 text-purple-800',
  dropdown: 'bg-yellow-100 text-yellow-800',
  listbox: 'bg-orange-100 text-orange-800',
  button: 'bg-red-100 text-red-800',
  signature: 'bg-indigo-100 text-indigo-800',
  multiline: 'bg-pink-100 text-pink-800'
};

const outputFormats = [
  { id: 'json', name: 'JSON', description: 'Structured data format for developers' },
  { id: 'csv', name: 'CSV', description: 'Spreadsheet-compatible format' },
  { id: 'xml', name: 'XML', description: 'Structured markup format' },
  { id: 'excel', name: 'Excel', description: 'Microsoft Excel workbook' }
];

const PDFFormFieldExtractor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ExtractionSettings>({
    outputFormat: 'json',
    includeValues: true,
    includeCoordinates: true,
    includeValidation: true,
    groupByPage: true,
    filterByType: []
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

  const toggleFieldType = (fieldType: string) => {
    setSettings(prev => ({
      ...prev,
      filterByType: prev.filterByType.includes(fieldType)
        ? prev.filterByType.filter(t => t !== fieldType)
        : [...prev.filterByType, fieldType]
    }));
  };

  const extractFormFields = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/extract-form-fields', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form field extraction failed');
      }

      const extractionResult = await response.json();
      setResult(extractionResult);
      setActiveTab('overview');

    } catch (error) {
      console.error('Error extracting form fields:', error);
      setError(error instanceof Error ? error.message : 'Error extracting form fields. Please try again.');
    }

    setIsExtracting(false);
  };

  const downloadData = async () => {
    if (!selectedFile || !result) return;

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/export-form-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to export form data');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `form-fields-${Date.now()}.${settings.outputFormat}`;
      link.click();

    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export form data');
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setActiveTab('overview');
  };

  const getFieldTypeIcon = (type: string) => {
    const IconComponent = fieldTypeIcons[type as keyof typeof fieldTypeIcons] || FormInput;
    return <IconComponent className="w-4 h-4" />;
  };

  const getFieldTypeColor = (type: string) => {
    return fieldTypeColors[type as keyof typeof fieldTypeColors] || 'bg-gray-100 text-gray-800';
  };

  const formatFieldValue = (field: FormField) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.value ? 'Checked' : 'Unchecked';
    }
    if (Array.isArray(field.value)) {
      return field.value.join(', ') || 'No selection';
    }
    return field.value || 'Empty';
  };

  return (
    <>
      <Helmet>
        <title>PDF Form Field Extractor - Extract Interactive Form Data | ToolsHub</title>
        <meta name="description" content="Extract and analyze interactive form fields from PDF documents. Get detailed field information, coordinates, validation rules, and export data." />
        <meta name="keywords" content="PDF form fields, extract PDF forms, PDF form data, interactive PDF fields, form field analysis" />
        <meta property="og:title" content="PDF Form Field Extractor - Extract Interactive Form Data | ToolsHub" />
        <meta property="og:description" content="Professional tool for extracting and analyzing PDF form fields and interactive elements." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-form-field-extractor" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-form-field-extractor">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-list-check text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Form Field Extractor
              </h1>
              <p className="text-xl text-violet-100 max-w-2xl mx-auto">
                Extract and analyze interactive form fields from PDF documents. Get detailed field information, coordinates, validation rules, and export data in multiple formats.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF with Form Fields</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-violet-500 bg-violet-50' 
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
                          or click to select a PDF containing interactive form fields
                        </p>
                        <Button
                          className="bg-violet-600 hover:bg-violet-700 text-white"
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
                      <div className="bg-violet-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-violet-600" />
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
                          <FormInput className="w-5 h-5 mr-2" />
                          Extraction Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Output Format */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Export Format
                            </label>
                            <Select value={settings.outputFormat} onValueChange={(value: 'json' | 'csv' | 'xml' | 'excel') => updateSetting('outputFormat', value)}>
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

                          {/* Field Type Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Filter by Field Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(fieldTypeIcons).map((type) => (
                                <Badge
                                  key={type}
                                  className={`cursor-pointer transition-colors ${
                                    settings.filterByType.includes(type)
                                      ? getFieldTypeColor(type)
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  onClick={() => toggleFieldType(type)}
                                >
                                  {getFieldTypeIcon(type)}
                                  <span className="ml-1 capitalize">{type}</span>
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {settings.filterByType.length === 0 ? 'All field types included' : `${settings.filterByType.length} type(s) selected`}
                            </p>
                          </div>
                        </div>

                        {/* Additional Options */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Include in Export</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.includeValues}
                                onChange={(e) => updateSetting('includeValues', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Field values</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.includeCoordinates}
                                onChange={(e) => updateSetting('includeCoordinates', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Position coordinates</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.includeValidation}
                                onChange={(e) => updateSetting('includeValidation', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Validation rules</span>
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
                          onClick={extractFormFields}
                          disabled={isExtracting}
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                          data-testid="button-extract"
                        >
                          {isExtracting ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Extracting Form Fields...
                            </>
                          ) : (
                            <>
                              <FormInput className="w-4 h-4 mr-2" />
                              Extract Form Fields
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
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-violet-900">Extraction Summary</h3>
                            <Badge className="bg-violet-100 text-violet-800">
                              {result.extractionTime}s extraction
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-violet-900">
                                {result.totalFields}
                              </div>
                              <div className="text-sm text-gray-600">Total Form Fields</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-violet-900">
                                {result.totalPages}
                              </div>
                              <div className="text-sm text-gray-600">Pages Analyzed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-violet-900">
                                {Object.keys(result.fieldsByType).filter(type => result.fieldsByType[type as keyof typeof result.fieldsByType] > 0).length}
                              </div>
                              <div className="text-sm text-gray-600">Field Types Found</div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Results */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger value="fields" className="flex items-center gap-2">
                              <FormInput className="w-4 h-4" />
                              Field List
                            </TabsTrigger>
                            <TabsTrigger value="pages" className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              By Pages
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Field Types Distribution</h4>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(result.fieldsByType).map(([type, count]) => (
                                  count > 0 && (
                                    <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-center mb-2">
                                        {getFieldTypeIcon(type)}
                                        <span className="ml-1 text-2xl font-bold text-gray-900">
                                          {count}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 capitalize">{type} fields</div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="fields" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">All Form Fields</h4>
                              
                              {result.fields.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {result.fields.map((field, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Badge className={getFieldTypeColor(field.type)}>
                                          {getFieldTypeIcon(field.type)}
                                          <span className="ml-1 capitalize">{field.type}</span>
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-gray-900 truncate">
                                            {field.name || `Field ${index + 1}`}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            Page {field.page} • {formatFieldValue(field)}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {field.required && <span className="text-red-600">Required</span>}
                                        {field.readonly && <span className="text-gray-500">Read-only</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No form fields found in this PDF document.
                                </p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="pages" className="space-y-4">
                            <div className="bg-white border rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Fields by Page</h4>
                              
                              {result.fieldsByPage.length > 0 ? (
                                <div className="space-y-3">
                                  {result.fieldsByPage.map((pageInfo, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="font-medium text-gray-900">
                                          Page {pageInfo.page}
                                        </div>
                                        <div className="flex gap-1">
                                          {pageInfo.fieldTypes.map((type, typeIndex) => (
                                            <Badge key={typeIndex} className={getFieldTypeColor(type)}>
                                              {getFieldTypeIcon(type)}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {pageInfo.fieldCount} fields
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-center py-8">
                                  No pages with form fields found.
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            onClick={downloadData}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                            data-testid="button-download-data"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export Form Data ({settings.outputFormat.toUpperCase()})
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
                {/* What is PDF Form Field Extractor */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Form Field Extractor?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      A PDF Form Field Extractor is a specialized digital tool designed to analyze and extract interactive form elements from PDF documents. This powerful utility scans through PDF files to identify, catalog, and extract detailed information about all form fields including text boxes, checkboxes, radio buttons, dropdown menus, signatures, and other interactive elements embedded within the document.
                    </p>
                    <p>
                      Our advanced PDF Form Field Extractor provides comprehensive analysis of form structures, field properties, validation rules, coordinates, and default values. Whether you're conducting form audits, migrating data, analyzing document structures, or preparing forms for digital processing, this tool streamlines the extraction and documentation of interactive PDF elements. It works seamlessly with other PDF management tools like our <a href="/tools/pdf-editor" className="text-violet-600 hover:text-violet-700 underline">PDF Editor</a> and <a href="/tools/pdf-comparison-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Comparison Tool</a> for comprehensive document processing workflows.
                    </p>
                  </div>
                </div>

                {/* How It Works */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our PDF Form Field Extractor Works</h2>
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                        <p className="text-sm text-gray-600">Select your PDF document containing interactive form fields using our secure upload interface</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Configure Options</h3>
                        <p className="text-sm text-gray-600">Choose extraction settings, output format, and field type filters to customize your analysis</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Extract Fields</h3>
                        <p className="text-sm text-gray-600">Our AI-powered engine analyzes and extracts all form field information automatically</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">4</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
                        <p className="text-sm text-gray-600">Download extracted form data in JSON, CSV, XML, or Excel format for further processing</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our PDF Form Field Extractor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-violet-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-violet-900 mb-3 flex items-center">
                        <FormInput className="w-5 h-5 mr-2" />
                        Comprehensive Field Detection
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Extract all interactive form field types including text, radio, and checkbox fields</li>
                        <li>• Identify text boxes, checkboxes, and radio buttons with precision</li>
                        <li>• Detect dropdown lists and multi-select fields automatically</li>
                        <li>• Find signature fields and button elements for complete form mapping</li>
                        <li>• Support for complex nested form structures and groupings</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Detailed Field Analysis
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Extract field coordinates and positioning data for layout analysis</li>
                        <li>• Capture validation rules and field constraints</li>
                        <li>• Document default values and current field states</li>
                        <li>• Identify required field and read-only properties</li>
                        <li>• Analyze field relationships and dependencies</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Multiple Export Formats
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• JSON format for seamless developer integration and API usage</li>
                        <li>• CSV export for spreadsheet analysis and data processing</li>
                        <li>• XML structure for enterprise system compatibility</li>
                        <li>• Excel workbooks for business reporting and documentation</li>
                        <li>• Customizable export templates for specific requirements</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-yellow-900 mb-3 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2" />
                        Advanced Filtering & Security
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Filter extraction by specific field types and properties</li>
                        <li>• Group fields by page location for organized analysis</li>
                        <li>• Include or exclude field values based on privacy requirements</li>
                        <li>• Secure processing with automatic file deletion</li>
                        <li>• Batch processing for multiple PDF forms</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Benefits from PDF Form Field Extraction?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-violet-900 mb-3">Students & Researchers</h3>
                      <p className="text-gray-700 mb-3">Extract form data from academic surveys, research questionnaires, and thesis documents for statistical analysis and data processing.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Analyze survey form structures</li>
                        <li>• Extract research data efficiently</li>
                        <li>• Prepare forms for digital analysis</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Business Professionals</h3>
                      <p className="text-gray-700 mb-3">Streamline business form processing, automate data collection workflows, and prepare for digital transformation initiatives.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Audit business form structures</li>
                        <li>• Prepare for form automation</li>
                        <li>• Document compliance requirements</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Developers & Engineers</h3>
                      <p className="text-gray-700 mb-3">Extract form schemas for application development, API integration, and automated form processing systems.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Generate form schemas automatically</li>
                        <li>• Build form validation systems</li>
                        <li>• Create API integrations</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Legal & Compliance Teams</h3>
                      <p className="text-gray-700 mb-3">Analyze legal document forms, extract signature requirements, and ensure regulatory compliance across form collections.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Audit legal form compliance</li>
                        <li>• Document signature requirements</li>
                        <li>• Standardize form structures</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">Healthcare Organizations</h3>
                      <p className="text-gray-700 mb-3">Extract patient form data, analyze medical questionnaires, and prepare healthcare forms for electronic health record systems.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Process patient intake forms</li>
                        <li>• Migrate to digital health systems</li>
                        <li>• Ensure HIPAA compliance</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Government Agencies</h3>
                      <p className="text-gray-700 mb-3">Modernize government forms, extract citizen application data, and prepare for digital government services transformation.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Digitize government forms</li>
                        <li>• Improve citizen services</li>
                        <li>• Ensure accessibility compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Benefits of Using Our PDF Form Field Extractor</h2>
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Efficiency & Productivity</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Automate manual form field documentation processes, saving 90% of analysis time</span>
                          </li>
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Process multiple PDF forms simultaneously with batch processing capabilities</span>
                          </li>
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Instantly generate detailed reports and export data in multiple formats</span>
                          </li>
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Integrate seamlessly with existing workflows and document management systems</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Accuracy & Reliability</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Eliminate human errors in field identification with AI-powered precision</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Ensure complete field discovery including hidden and nested elements</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Provide consistent extraction results across different PDF types and versions</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Maintain data integrity throughout the extraction and export process</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Practical Use Cases for PDF Form Field Extraction</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-violet-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Transformation & Form Migration</h3>
                      <p className="text-gray-700 mb-2">Extract field definitions from legacy PDF forms to recreate them in modern web applications, mobile apps, or cloud-based document management systems. Perfect for organizations moving from paper-based processes to digital workflows.</p>
                      <p className="text-sm text-gray-600">Combine with our <a href="/tools/pdf-editor" className="text-violet-600 hover:text-violet-700 underline">PDF Editor</a> to modify forms before extraction, or use our <a href="/tools/pdf-to-images-enhanced" className="text-violet-600 hover:text-violet-700 underline">PDF to Images tool</a> to create visual references.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Integration & Database Design</h3>
                      <p className="text-gray-700 mb-2">Analyze form structures to design optimal database schemas, create automated data processing workflows, and establish field mapping for enterprise systems integration.</p>
                      <p className="text-sm text-gray-600">Works seamlessly with our <a href="/tools/pdf-comparison-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Comparison Tool</a> to identify form changes over time.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Auditing & Quality Assurance</h3>
                      <p className="text-gray-700 mb-2">Document all form fields and validation rules to ensure regulatory compliance, standardization across organization forms, and adherence to accessibility guidelines (ADA, WCAG).</p>
                      <p className="text-sm text-gray-600">Use alongside our <a href="/tools/pdf-redaction-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Redaction Tool</a> for sensitive data handling.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Analytics & User Experience Optimization</h3>
                      <p className="text-gray-700 mb-2">Study form design patterns, analyze field usage statistics, and identify user interaction points to optimize form layouts, reduce abandonment rates, and improve completion rates.</p>
                      <p className="text-sm text-gray-600">Enhance your workflow with our <a href="/tools/compress-pdf-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Compressor</a> to optimize form file sizes for better performance.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Testing & Validation</h3>
                      <p className="text-gray-700 mb-2">Extract form field information to generate automated test scripts, validate form functionality, and ensure consistent behavior across different platforms and devices.</p>
                      <p className="text-sm text-gray-600">Complement with our <a href="/tools/pdf-bookmark-extractor" className="text-violet-600 hover:text-violet-700 underline">PDF Bookmark Extractor</a> for comprehensive document analysis.</p>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools for Complete Document Processing</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-6">Enhance your PDF form field extraction workflow with our comprehensive suite of PDF processing tools:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-900 mb-2">PDF Editing & Modification</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <a href="/tools/pdf-editor" className="text-violet-600 hover:text-violet-700 underline">PDF Editor</a> - Edit forms before extraction</li>
                          <li>• <a href="/tools/pdf-margin-adjuster" className="text-violet-600 hover:text-violet-700 underline">PDF Margin Adjuster</a> - Optimize form layouts</li>
                          <li>• <a href="/tools/pdf-page-resizer" className="text-violet-600 hover:text-violet-700 underline">PDF Page Resizer</a> - Adjust form dimensions</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-900 mb-2">Data Extraction & Analysis</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <a href="/tools/pdf-bookmark-extractor" className="text-violet-600 hover:text-violet-700 underline">PDF Bookmark Extractor</a> - Extract navigation data</li>
                          <li>• <a href="/tools/pdf-comparison-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Comparison Tool</a> - Compare form versions</li>
                          <li>• <a href="/tools/pdf-to-images-enhanced" className="text-violet-600 hover:text-violet-700 underline">PDF to Images</a> - Visual form analysis</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-900 mb-2">Security & Compliance</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <a href="/tools/pdf-redaction-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Redaction Tool</a> - Remove sensitive data</li>
                          <li>• <a href="/tools/protect-pdf-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Protection Tool</a> - Secure forms</li>
                          <li>• <a href="/tools/pdf-permission-manager" className="text-violet-600 hover:text-violet-700 underline">PDF Permission Manager</a> - Control access</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications & Supported Features</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Field Types</h3>
                        <ul className="space-y-1 text-gray-700">
                          <li>• <strong>Text fields</strong> (single-line and multi-line with character limits)</li>
                          <li>• <strong>Checkbox groups</strong> and individual checkboxes with states</li>
                          <li>• <strong>Radio button groups</strong> with selection validation</li>
                          <li>• <strong>Dropdown menus</strong> and combo boxes with option lists</li>
                          <li>• <strong>List boxes</strong> with single and multi-select capabilities</li>
                          <li>• <strong>Digital signature fields</strong> with security properties</li>
                          <li>• <strong>Button elements</strong> including submit and reset actions</li>
                          <li>• <strong>Date and time pickers</strong> with format specifications</li>
                          <li>• <strong>File upload fields</strong> with type restrictions</li>
                          <li>• <strong>Calculated fields</strong> with formula extraction</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Formats & Integration</h3>
                        <ul className="space-y-1 text-gray-700">
                          <li>• <strong>JSON</strong> - Structured data for API integration and web applications</li>
                          <li>• <strong>CSV</strong> - Tabular format for Excel and database import</li>
                          <li>• <strong>XML</strong> - Enterprise-compatible structured markup</li>
                          <li>• <strong>Excel (.xlsx)</strong> - Native spreadsheet format with multiple sheets</li>
                          <li>• <strong>SQL</strong> - Database schema generation for direct import</li>
                          <li>• <strong>Custom formats</strong> - API-based custom export options</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Processing Capabilities</h3>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Support for PDF versions 1.3 to 2.0</li>
                          <li>• Encrypted and password-protected PDFs</li>
                          <li>• Forms with JavaScript validation</li>
                          <li>• Multi-page form processing</li>
                          <li>• Batch processing up to 100 files</li>
                          <li>• Maximum file size: 100MB per PDF</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices for PDF Form Field Extraction</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Preparation Tips</h3>
                      <ul className="space-y-2 text-green-800">
                        <li>• Ensure PDFs contain interactive form fields (not just fillable text)</li>
                        <li>• Use our <a href="/tools/pdf-repair-tool" className="text-green-700 hover:text-green-800 underline">PDF Repair Tool</a> to fix corrupted forms first</li>
                        <li>• Remove passwords using our <a href="/tools/pdf-permission-manager" className="text-green-700 hover:text-green-800 underline">Permission Manager</a> if needed</li>
                        <li>• Test with a single page first for large multi-page forms</li>
                        <li>• Back up original files before processing</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Optimization Strategies</h3>
                      <ul className="space-y-2 text-blue-800">
                        <li>• Use field type filters to focus on specific form elements</li>
                        <li>• Group by page for better organization of large forms</li>
                        <li>• Include coordinates for layout reconstruction projects</li>
                        <li>• Export validation rules for form recreation accuracy</li>
                        <li>• Choose JSON format for developer integration projects</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Features for Power Users</h2>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-robot text-white text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-purple-900 mb-2">AI-Powered Analysis</h3>
                        <p className="text-purple-700 text-sm">Advanced machine learning algorithms detect complex form patterns and nested field relationships.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-layers text-white text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Batch Processing</h3>
                        <p className="text-indigo-700 text-sm">Process multiple PDF forms simultaneously with consistent extraction rules and consolidated reporting.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-code text-white text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">API Integration</h3>
                        <p className="text-blue-700 text-sm">Programmatic access to extraction capabilities for automated workflows and custom integrations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry Applications */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Industry-Specific Applications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <h3 className="text-xl font-semibold text-blue-900 mb-3">Healthcare & Medical</h3>
                      <p className="text-gray-700 mb-3">Extract patient intake forms, medical questionnaires, and consent forms for EMR integration and HIPAA compliance documentation.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Patient registration forms analysis</li>
                        <li>• Medical history questionnaire extraction</li>
                        <li>• Insurance claim form processing</li>
                        <li>• Prescription and treatment consent forms</li>
                      </ul>
                    </div>
                    <div className="bg-white border-l-4 border-green-500 p-6 rounded-r-lg">
                      <h3 className="text-xl font-semibold text-green-900 mb-3">Financial Services</h3>
                      <p className="text-gray-700 mb-3">Process loan applications, account opening forms, and regulatory compliance documents with precision and security.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Loan application form analysis</li>
                        <li>• KYC and AML document processing</li>
                        <li>• Investment account opening forms</li>
                        <li>• Insurance claim and policy forms</li>
                      </ul>
                    </div>
                    <div className="bg-white border-l-4 border-purple-500 p-6 rounded-r-lg">
                      <h3 className="text-xl font-semibold text-purple-900 mb-3">Education & Research</h3>
                      <p className="text-gray-700 mb-3">Analyze academic forms, research surveys, and administrative documents for data collection and institutional compliance.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Student enrollment and registration forms</li>
                        <li>• Research consent and survey forms</li>
                        <li>• Academic assessment and evaluation forms</li>
                        <li>• Grant application and reporting forms</li>
                      </ul>
                    </div>
                    <div className="bg-white border-l-4 border-red-500 p-6 rounded-r-lg">
                      <h3 className="text-xl font-semibold text-red-900 mb-3">Government & Public Sector</h3>
                      <p className="text-gray-700 mb-3">Modernize citizen service forms, extract permit applications, and ensure accessibility compliance for public-facing documents.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Permit and license application forms</li>
                        <li>• Tax and revenue collection forms</li>
                        <li>• Public service request forms</li>
                        <li>• Regulatory compliance documentation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can this tool extract data from protected or encrypted PDF forms?</h3>
                      <p className="text-gray-700">Our PDF Form Field Extractor can analyze form structures in most PDFs, including password-protected documents. However, extraction capabilities may be limited for heavily encrypted files with strict permissions. For best results, remove password protection using our <a href="/tools/pdf-permission-manager" className="text-violet-600 hover:text-violet-700 underline">PDF Permission Manager</a> first.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool extract actual form data or just field definitions?</h3>
                      <p className="text-gray-700">Our tool can extract both field definitions (names, types, validation rules, coordinates) and current field values if present in the PDF. You can choose which information to include in your export through the extraction settings. This makes it perfect for both form analysis and data migration projects.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure is the extraction process? What happens to my PDF files?</h3>
                      <p className="text-gray-700">Your PDF files are processed securely using encrypted connections and are automatically deleted from our servers within 1 hour of extraction completion. We prioritize your data privacy and security, and never store or share your documents. For additional security, consider using our <a href="/tools/pdf-redaction-tool" className="text-violet-600 hover:text-violet-700 underline">PDF Redaction Tool</a> to remove sensitive information before extraction.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I extract fields from scanned PDF forms or image-based documents?</h3>
                      <p className="text-gray-700">This tool works specifically with interactive PDF forms that have embedded form fields created by PDF authoring software. For scanned PDFs or image-based forms, you would need OCR (Optical Character Recognition) processing first to convert them to interactive forms. Our tool is designed for fillable PDF forms, not static scanned documents.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What file size limits apply, and can I process multiple PDFs at once?</h3>
                      <p className="text-gray-700">Individual PDF files can be up to 100MB in size. Our tool supports batch processing of multiple PDF forms simultaneously (up to 100 files per batch), making it efficient for large-scale form analysis projects. Processing time varies based on form complexity and file size.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which export format should I choose for my specific use case?</h3>
                      <p className="text-gray-700">Choose based on your intended use: <strong>JSON</strong> for web development and API integration, <strong>CSV</strong> for spreadsheet analysis and database import, <strong>XML</strong> for enterprise system integration, and <strong>Excel</strong> for business reporting and documentation. Each format includes different levels of detail and structure optimization.</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-8 text-center text-white">
                  <h2 className="text-2xl font-bold mb-4">Ready to Extract Your PDF Form Fields?</h2>
                  <p className="text-lg mb-6">Upload your PDF form above and start extracting detailed field information in seconds. No registration required, completely free to use.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Start Extracting Now
                    </a>
                    <a href="/tools/pdf-tools" className="bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-800 transition-colors">
                      Explore More PDF Tools
                    </a>
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

export default PDFFormFieldExtractor;