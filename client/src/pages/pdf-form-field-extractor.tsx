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
                      Our advanced PDF Form Field Extractor provides comprehensive analysis of form structures, field properties, validation rules, coordinates, and default values. Whether you're conducting form audits, migrating data, analyzing document structures, or preparing forms for digital processing, this tool streamlines the extraction and documentation of interactive PDF elements.
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
                        <p className="text-sm text-gray-600">Select your PDF document containing interactive form fields</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Configure Options</h3>
                        <p className="text-sm text-gray-600">Choose extraction settings, output format, and field filters</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Extract Fields</h3>
                        <p className="text-sm text-gray-600">Analyze and extract all form field information automatically</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">4</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
                        <p className="text-sm text-gray-600">Download extracted form data in your preferred format</p>
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
                        <li>• Extract all interactive form field types</li>
                        <li>• Identify text boxes, checkboxes, and radio buttons</li>
                        <li>• Detect dropdown lists and multi-select fields</li>
                        <li>• Find signature fields and button elements</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Detailed Field Analysis
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Field coordinates and positioning data</li>
                        <li>• Validation rules and constraints</li>
                        <li>• Default values and current field states</li>
                        <li>• Required field and read-only properties</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Multiple Export Formats
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• JSON format for developer integration</li>
                        <li>• CSV export for spreadsheet analysis</li>
                        <li>• XML structure for system compatibility</li>
                        <li>• Excel workbooks for business reporting</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-yellow-900 mb-3 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2" />
                        Advanced Filtering
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Filter by specific field types</li>
                        <li>• Group fields by page location</li>
                        <li>• Include or exclude field values</li>
                        <li>• Customizable extraction settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses PDF Form Field Extractors?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-violet-900 mb-3">Business Analysts</h3>
                      <p className="text-gray-700">Analyze form structures, document data flows, and prepare for digital transformation initiatives.</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Engineers</h3>
                      <p className="text-gray-700">Extract form schemas for data migration projects and automated form processing systems.</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Compliance Officers</h3>
                      <p className="text-gray-700">Audit form fields for regulatory compliance and document standardization requirements.</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Web Developers</h3>
                      <p className="text-gray-700">Convert PDF forms to web forms by extracting field definitions and validation rules.</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">Legal Professionals</h3>
                      <p className="text-gray-700">Analyze legal document forms, extract signature requirements, and document form structures.</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">IT Administrators</h3>
                      <p className="text-gray-700">Document enterprise form assets and prepare for form modernization projects.</p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Using a PDF Form Field Extractor</h2>
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Efficiency & Productivity</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Automate manual form field documentation processes</span>
                          </li>
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Save hours of manual form analysis work</span>
                          </li>
                          <li className="flex items-start">
                            <Zap className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Process multiple PDF forms simultaneously</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Accuracy & Reliability</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Eliminate human errors in field identification</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Ensure complete field discovery and documentation</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Provide consistent extraction results</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Form Field Extraction</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-violet-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Migration Projects</h3>
                      <p className="text-gray-700">Extract field definitions from legacy PDF forms to recreate them in modern web applications or document management systems.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Integration</h3>
                      <p className="text-gray-700">Analyze form structures to design database schemas and automated data processing workflows for form submissions.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Auditing</h3>
                      <p className="text-gray-700">Document all form fields and validation rules to ensure regulatory compliance and standardization across organization forms.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Analysis</h3>
                      <p className="text-gray-700">Study form design patterns, field usage statistics, and user interaction points to optimize form layouts and user experience.</p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Field Types</h3>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Text fields (single-line and multi-line)</li>
                          <li>• Checkbox and radio button groups</li>
                          <li>• Dropdown menus and list boxes</li>
                          <li>• Digital signature fields</li>
                          <li>• Button elements and submit actions</li>
                          <li>• Date and time picker fields</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Formats</h3>
                        <ul className="space-y-1 text-gray-700">
                          <li>• JSON - For developer integration</li>
                          <li>• CSV - For spreadsheet analysis</li>
                          <li>• XML - For system compatibility</li>
                          <li>• Excel - For business reporting</li>
                          <li>• Custom formats available on request</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can this tool extract data from protected PDF forms?</h3>
                      <p className="text-gray-700">Our PDF Form Field Extractor can analyze form structures in most PDFs, including password-protected documents. However, extraction capabilities may be limited for heavily encrypted files with strict permissions.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool extract actual form data or just field definitions?</h3>
                      <p className="text-gray-700">The tool can extract both field definitions (names, types, validation rules) and current field values if present in the PDF. You can choose which information to include in your export through the extraction settings.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to my PDF files after extraction?</h3>
                      <p className="text-gray-700">Your PDF files are processed securely and temporarily. Files are automatically deleted from our servers after extraction is complete. We prioritize your data privacy and security.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I extract fields from scanned PDF forms?</h3>
                      <p className="text-gray-700">This tool works with interactive PDF forms that have embedded form fields. For scanned PDFs or image-based forms, you would need OCR processing first to convert them to interactive forms.</p>
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

export default PDFFormFieldExtractor;