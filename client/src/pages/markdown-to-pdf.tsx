import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import { FileDown, FileText, Trash2 } from 'lucide-react';

interface PDFOptions {
  paperSize: 'a4' | 'letter' | 'legal';
  fontSize: number;
  fontFamily: 'helvetica' | 'times' | 'courier';
  lineHeight: number;
  margins: number;
  includePageNumbers: boolean;
  pageOrientation: 'portrait' | 'landscape';
}

interface ConversionResult {
  originalMarkdown: string;
  htmlPreview: string;
  wordCount: number;
  characterCount: number;
  timestamp: Date;
}

const MarkdownToPDFConverter = () => {
  const [markdownInput, setMarkdownInput] = useState('# Hello World\n\nThis is a **Markdown to PDF** converter.\n\n## Features\n\n- Convert Markdown to PDF instantly\n- Customizable page settings\n- Real-time preview\n- Download PDF files\n\n> Transform your Markdown documents into professional PDFs with ease!\n\n```javascript\nconst example = "Code blocks are supported";\nconsole.log(example);\n```');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [options, setOptions] = useState<PDFOptions>({
    paperSize: 'a4',
    fontSize: 11,
    fontFamily: 'helvetica',
    lineHeight: 1.5,
    margins: 20,
    includePageNumbers: true,
    pageOrientation: 'portrait'
  });
  const [fileName, setFileName] = useState('document');
  const { toast } = useToast();

  const handlePreview = () => {
    if (!markdownInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some Markdown text to preview.",
        variant: "destructive"
      });
      return;
    }

    try {
      const htmlPreview = marked(markdownInput, {
        breaks: true,
        gfm: true
      }) as string;
      
      const wordCount = markdownInput.trim().split(/\s+/).length;
      const characterCount = markdownInput.length;

      const result: ConversionResult = {
        originalMarkdown: markdownInput,
        htmlPreview,
        wordCount,
        characterCount,
        timestamp: new Date()
      };

      setConversionResult(result);
      setConversionHistory(prev => [result, ...prev.slice(0, 9)]);

      toast({
        title: "Preview Generated",
        description: `Preview ready for ${wordCount} words.`
      });
    } catch (error) {
      toast({
        title: "Preview Error",
        description: "An error occurred while generating preview.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!markdownInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some Markdown text to convert.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse markdown to HTML
      const html = marked(markdownInput, {
        breaks: true,
        gfm: true
      }) as string;

      // Create PDF
      const pageFormat = options.paperSize === 'a4' ? 'a4' : 
                         options.paperSize === 'letter' ? 'letter' : 'legal';
      
      const doc = new jsPDF({
        orientation: options.pageOrientation,
        unit: 'mm',
        format: pageFormat
      });

      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (2 * options.margins);
      const startX = options.margins;
      let currentY = options.margins;

      // Parse HTML and render with formatting
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Stack to track nested list states
      const listStack: Array<{ type: 'ul' | 'ol'; itemNumber: number }> = [];
      
      const processNode = (node: Node, isBold = false, isItalic = false, isCode = false, xOffset = 0) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.trim()) {
            // Set font style based on formatting
            let fontStyle = 'normal';
            if (isBold && isItalic) fontStyle = 'bolditalic';
            else if (isBold) fontStyle = 'bold';
            else if (isItalic) fontStyle = 'italic';
            
            doc.setFont(options.fontFamily, fontStyle);
            
            if (isCode) {
              doc.setFont('courier', fontStyle);
              doc.setFillColor(240, 240, 240);
              const textWidth = doc.getTextWidth(text);
              doc.rect(startX + xOffset, currentY - 3, textWidth + 2, options.fontSize * 0.4, 'F');
            }
            
            const lines = doc.splitTextToSize(text.trim(), contentWidth - xOffset);
            lines.forEach((line: string) => {
              if (currentY + (options.fontSize * options.lineHeight * 0.3527) > pageHeight - options.margins) {
                doc.addPage();
                currentY = options.margins;
              }
              doc.text(line, startX + xOffset, currentY);
              currentY += options.fontSize * options.lineHeight * 0.3527;
            });
            
            // Reset font
            doc.setFont(options.fontFamily, 'normal');
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();
          
          // Check if we need a new page
          if (currentY + (options.fontSize * options.lineHeight * 0.3527) > pageHeight - options.margins) {
            doc.addPage();
            currentY = options.margins;
          }
          
          // Handle different HTML elements
          switch (tagName) {
            case 'h1':
              doc.setFont(options.fontFamily, 'bold');
              doc.setFontSize(options.fontSize + 8);
              currentY += 5;
              break;
            case 'h2':
              doc.setFont(options.fontFamily, 'bold');
              doc.setFontSize(options.fontSize + 6);
              currentY += 4;
              break;
            case 'h3':
              doc.setFont(options.fontFamily, 'bold');
              doc.setFontSize(options.fontSize + 4);
              currentY += 3;
              break;
            case 'h4':
            case 'h5':
            case 'h6':
              doc.setFont(options.fontFamily, 'bold');
              doc.setFontSize(options.fontSize + 2);
              currentY += 2;
              break;
            case 'p':
              currentY += 2;
              break;
            case 'ul':
              listStack.push({ type: 'ul', itemNumber: 0 });
              currentY += 2;
              break;
            case 'ol':
              listStack.push({ type: 'ol', itemNumber: 0 });
              currentY += 2;
              break;
            case 'li':
              const currentList = listStack[listStack.length - 1];
              if (currentList) {
                currentList.itemNumber++;
                const bullet = currentList.type === 'ol' ? `${currentList.itemNumber}. ` : '• ';
                doc.text(bullet, startX + xOffset, currentY);
                const bulletWidth = doc.getTextWidth(bullet);
                // Process children with indentation
                element.childNodes.forEach(child => {
                  const newBold = isBold || ['strong', 'b'].includes(tagName);
                  const newItalic = isItalic || ['em', 'i'].includes(tagName);
                  const newCode = isCode || ['code', 'pre'].includes(tagName);
                  processNode(child, newBold, newItalic, newCode, xOffset + bulletWidth + 1);
                });
                currentY += 2;
              }
              return; // Don't process children again below
            case 'blockquote':
              doc.setFont(options.fontFamily, 'italic');
              doc.setTextColor(100, 100, 100);
              doc.line(startX + xOffset, currentY - 2, startX + xOffset, currentY + 8);
              break;
            case 'pre':
            case 'code':
              doc.setFont('courier', 'normal');
              doc.setFontSize(options.fontSize - 1);
              doc.setFillColor(245, 245, 245);
              break;
            case 'hr':
              doc.line(startX + xOffset, currentY, startX + xOffset + contentWidth, currentY);
              currentY += 5;
              return;
          }
          
          // Process child nodes (except for li, which is handled above)
          if (tagName !== 'li') {
            element.childNodes.forEach(child => {
              const newBold = isBold || ['strong', 'b'].includes(tagName);
              const newItalic = isItalic || ['em', 'i'].includes(tagName);
              const newCode = isCode || ['code', 'pre'].includes(tagName);
              processNode(child, newBold, newItalic, newCode, xOffset);
            });
          }
          
          // Reset after element
          switch (tagName) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              doc.setFontSize(options.fontSize);
              doc.setFont(options.fontFamily, 'normal');
              currentY += 3;
              break;
            case 'p':
              currentY += 3;
              break;
            case 'ul':
            case 'ol':
              listStack.pop(); // Remove list from stack when exiting
              currentY += 2;
              break;
            case 'blockquote':
              doc.setTextColor(0, 0, 0);
              doc.setFont(options.fontFamily, 'normal');
              currentY += 3;
              break;
            case 'pre':
            case 'code':
              doc.setFontSize(options.fontSize);
              doc.setFont(options.fontFamily, 'normal');
              currentY += 2;
              break;
          }
        }
      };
      
      // Process all nodes
      tempDiv.childNodes.forEach(node => processNode(node));

      // Add page numbers if enabled
      if (options.includePageNumbers) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      }

      // Save the PDF
      const sanitizedFileName = fileName.trim() || 'document';
      doc.save(`${sanitizedFileName}.pdf`);

      toast({
        title: "PDF Downloaded Successfully",
        description: `${sanitizedFileName}.pdf has been saved to your device.`
      });

      // Generate preview
      handlePreview();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Error",
        description: "An error occurred while generating the PDF.",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    setMarkdownInput('');
    setConversionResult(null);
  };

  const resetConverter = () => {
    setMarkdownInput('');
    setConversionResult(null);
    setFileName('document');
    setOptions({
      paperSize: 'a4',
      fontSize: 11,
      fontFamily: 'helvetica',
      lineHeight: 1.5,
      margins: 20,
      includePageNumbers: true,
      pageOrientation: 'portrait'
    });
    setConversionHistory([]);
  };

  const loadSampleMarkdown = () => {
    const sample = `# Markdown to PDF Converter

## Welcome to DapsiWow's Professional Tool

This is a powerful **Markdown to PDF** converter that transforms your text into beautiful, downloadable documents.

### Key Features

- **Real-time Preview**: See your formatted content instantly
- **Customizable Options**: Adjust page size, fonts, margins, and more
- **Professional Output**: Generate clean, well-formatted PDFs
- **GitHub Flavored Markdown**: Full support for tables, code blocks, and more

### How to Use

1. Type or paste your Markdown content
2. Customize PDF settings (optional)
3. Click "Preview" to see the result
4. Click "Download PDF" to save your document

### Supported Markdown Elements

#### Text Formatting
- **Bold text** with double asterisks
- *Italic text* with single asterisks
- ~~Strikethrough~~ with tildes

#### Lists

Unordered list:
- Item one
- Item two
  - Nested item
- Item three

Ordered list:
1. First item
2. Second item
3. Third item

#### Blockquotes

> "Markdown is a lightweight markup language that makes writing on the web easier."

#### Code

Inline code: \`const variable = "value";\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

#### Links and More

Visit [DapsiWow](https://dapsiwow.com) for more tools!

---

**Happy converting!** 🎉`;
    setMarkdownInput(sample);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Markdown to PDF Converter - Convert MD to PDF Online Free | DapsiWow</title>
        <meta name="description" content="Free Markdown to PDF converter tool. Transform Markdown files to professional PDF documents instantly with customizable page settings, fonts, and formatting options." />
        <meta name="keywords" content="markdown to pdf converter, md to pdf, markdown converter, pdf generator, convert markdown, markdown pdf export, online markdown tool, text to pdf, document converter, free pdf maker" />
        <meta property="og:title" content="Markdown to PDF Converter - Convert MD to PDF Online Free | DapsiWow" />
        <meta property="og:description" content="Transform Markdown documents to professional PDFs with our free online converter. Customizable settings, real-time preview, and instant download." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/markdown-to-pdf" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Markdown to PDF Converter",
            "description": "Professional online tool for converting Markdown documents to PDF format with customizable page settings, fonts, margins, and formatting options for creating professional documents.",
            "url": "https://dapsiwow.com/tools/markdown-to-pdf",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Convert Markdown to PDF instantly",
              "Real-time HTML preview",
              "Customizable page size and orientation",
              "Adjustable fonts and margins",
              "GitHub Flavored Markdown support",
              "Download PDF files directly",
              "Page numbering options"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Document Converter</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Markdown to PDF</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Transform Markdown documents into professional PDFs with customizable settings and instant download
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Converter Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Markdown Input</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your Markdown content and configure PDF settings</p>
                  </div>

                  <div className="space-y-6">
                    {/* Markdown Input */}
                    <div className="space-y-3">
                      <Label htmlFor="markdown-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Markdown Content
                      </Label>
                      <Textarea
                        id="markdown-input"
                        placeholder="# Your Title&#10;&#10;Your **markdown** content here..."
                        className="min-h-[250px] sm:min-h-[300px] text-sm font-mono border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        value={markdownInput}
                        onChange={(e) => setMarkdownInput(e.target.value)}
                        data-testid="input-markdown"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                        <span>
                          {markdownInput.length} characters, {markdownInput.trim() ? markdownInput.trim().split(/\s+/).length : 0} words
                        </span>
                        <Button
                          onClick={loadSampleMarkdown}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                          data-testid="button-load-sample"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Load Sample
                        </Button>
                      </div>
                    </div>

                    {/* File Name */}
                    <div className="space-y-3">
                      <Label htmlFor="file-name" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        PDF File Name
                      </Label>
                      <Input
                        id="file-name"
                        type="text"
                        placeholder="document"
                        className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        data-testid="input-filename"
                      />
                    </div>

                    {/* PDF Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">PDF Settings</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paper-size" className="text-sm font-medium mb-2 block">
                            Paper Size
                          </Label>
                          <Select value={options.paperSize} onValueChange={(value: 'a4' | 'letter' | 'legal') => 
                            setOptions(prev => ({ ...prev, paperSize: value }))}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-paper-size">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a4">A4</SelectItem>
                              <SelectItem value="letter">Letter</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="orientation" className="text-sm font-medium mb-2 block">
                            Orientation
                          </Label>
                          <Select value={options.pageOrientation} onValueChange={(value: 'portrait' | 'landscape') => 
                            setOptions(prev => ({ ...prev, pageOrientation: value }))}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-orientation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="font-family" className="text-sm font-medium mb-2 block">
                            Font Family
                          </Label>
                          <Select value={options.fontFamily} onValueChange={(value: 'helvetica' | 'times' | 'courier') => 
                            setOptions(prev => ({ ...prev, fontFamily: value }))}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-font">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="helvetica">Helvetica</SelectItem>
                              <SelectItem value="times">Times</SelectItem>
                              <SelectItem value="courier">Courier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="font-size" className="text-sm font-medium mb-2 block">
                            Font Size: {options.fontSize}pt
                          </Label>
                          <input
                            id="font-size"
                            type="range"
                            min="8"
                            max="16"
                            step="1"
                            value={options.fontSize}
                            onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            data-testid="slider-font-size"
                          />
                        </div>

                        <div>
                          <Label htmlFor="margins" className="text-sm font-medium mb-2 block">
                            Margins: {options.margins}mm
                          </Label>
                          <input
                            id="margins"
                            type="range"
                            min="10"
                            max="40"
                            step="5"
                            value={options.margins}
                            onChange={(e) => setOptions(prev => ({ ...prev, margins: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            data-testid="slider-margins"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="page-numbers" className="text-sm font-medium">
                            Page Numbers
                          </Label>
                          <Switch
                            id="page-numbers"
                            checked={options.includePageNumbers}
                            onCheckedChange={(checked) => 
                              setOptions(prev => ({ ...prev, includePageNumbers: checked }))}
                            data-testid="switch-page-numbers"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                      <Button
                        onClick={handleDownloadPDF}
                        className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transition-colors duration-200"
                        data-testid="button-download-pdf"
                      >
                        <FileDown className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handlePreview}
                          variant="outline"
                          className="h-11 sm:h-12 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl"
                          data-testid="button-preview"
                        >
                          Preview
                        </Button>
                        <Button
                          onClick={resetConverter}
                          variant="outline"
                          className="h-11 sm:h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl"
                          data-testid="button-reset"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 sm:p-8 lg:p-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Preview</h2>

                  {conversionResult ? (
                    <div className="space-y-6" data-testid="conversion-results">
                      {/* HTML Preview */}
                      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
                        <div 
                          className="prose prose-sm sm:prose max-w-none min-h-[300px] max-h-[400px] sm:max-h-[500px] overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: conversionResult.htmlPreview }}
                          data-testid="preview-content"
                        />
                      </div>

                      {/* Document Statistics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm" data-testid="conversion-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Document Statistics</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{conversionResult.characterCount.toLocaleString()}</div>
                            <div className="text-xs sm:text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{conversionResult.wordCount.toLocaleString()}</div>
                            <div className="text-xs sm:text-sm text-green-700 font-medium">Words</div>
                          </div>
                        </div>
                      </div>

                      {/* Conversion History */}
                      {conversionHistory.length > 1 && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                          <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Recent Conversions</h3>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {conversionHistory.slice(1, 6).map((result, index) => (
                              <div 
                                key={index} 
                                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                  setMarkdownInput(result.originalMarkdown);
                                  setConversionResult(result);
                                }}
                                data-testid={`history-item-${index}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600 truncate">
                                      {result.originalMarkdown.slice(0, 50)}...
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {result.wordCount} words • {result.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter Markdown content and click Preview or Download PDF to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What is Markdown to PDF Conversion?</h3>
                <div className="space-y-4 text-sm sm:text-base text-gray-600">
                  <p>
                    Markdown to PDF conversion transforms lightweight Markdown documents into professional, 
                    printable PDF files. This process enables writers, developers, and content creators to 
                    create beautifully formatted documents using simple Markdown syntax that can be shared, 
                    printed, or archived in a universal PDF format.
                  </p>
                  <p>
                    Our professional Markdown to PDF converter supports GitHub Flavored Markdown and provides 
                    extensive customization options for page size, fonts, margins, and formatting. The tool 
                    generates clean, professional PDFs ready for distribution or printing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Why Use Our Markdown to PDF Tool?</h3>
                <div className="space-y-4 text-sm sm:text-base text-gray-600">
                  <p>
                    Professional users choose our Markdown to PDF converter for its reliability, flexibility, 
                    and comprehensive feature set. The tool processes Markdown syntax accurately while providing 
                    full control over PDF output formatting and appearance.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Instant PDF generation with customizable settings</li>
                    <li>Real-time preview before downloading</li>
                    <li>Multiple page sizes and orientations supported</li>
                    <li>Adjustable fonts, margins, and line spacing</li>
                    <li>Optional page numbering for professional documents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Supported Markdown Features</h3>
                <div className="space-y-3 text-sm sm:text-base text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Headers (H1-H6) with automatic hierarchy formatting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Text formatting: bold, italic, strikethrough</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lists: ordered, unordered, and nested structures</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Links and inline code formatting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Code blocks with syntax preservation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Blockquotes and horizontal rules</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tables with proper cell alignment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Professional Use Cases</h3>
                <div className="space-y-3 text-sm sm:text-base text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Technical documentation and user manuals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reports and whitepapers for business distribution</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Academic papers and research documents</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>README files and project documentation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Meeting notes and collaborative documents</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Blog posts and articles for offline reading</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarkdownToPDFConverter;
