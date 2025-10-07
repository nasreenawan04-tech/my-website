
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, Unlock, Upload, Download, Shield, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PDFEncryptionTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('encrypt');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleProcess = async () => {
    if (!file || !password) {
      setError('Please select a PDF file and enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('password', password);
      formData.append('action', activeTab);

      const response = await fetch('/api/pdf-encrypt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab === 'encrypt' 
        ? `encrypted_${file.name}` 
        : `decrypted_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`PDF ${activeTab === 'encrypt' ? 'encrypted' : 'decrypted'} successfully!`);
      setFile(null);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Encryption Tool - Secure Your PDF Files | DapsiWow</title>
        <meta name="description" content="Free online PDF encryption and decryption tool. Password protect your PDF files with strong encryption or decrypt protected PDFs securely in your browser." />
        <meta name="keywords" content="pdf encryption, pdf password protect, secure pdf, decrypt pdf, pdf security, online pdf encryption" />
        <link rel="canonical" href="https://dapsiwow.com/tools/pdf-encryption-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ToolHeroSection
            title="PDF Encryption Tool"
            description="Secure your PDF files with password protection or decrypt protected PDFs"
            icon={<Shield className="w-8 h-8" />}
            category="Security"
          />

          <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">PDF Encryption & Decryption</CardTitle>
                  <CardDescription>
                    Password protect your PDFs or decrypt password-protected files securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="encrypt">
                        <Lock className="w-4 h-4 mr-2" />
                        Encrypt PDF
                      </TabsTrigger>
                      <TabsTrigger value="decrypt">
                        <Unlock className="w-4 h-4 mr-2" />
                        Decrypt PDF
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="encrypt">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="encrypt-file" className="text-base font-medium mb-2 block">
                            Select PDF File
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="encrypt-file"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="flex-1"
                            />
                            <Upload className="w-5 h-5 text-gray-400" />
                          </div>
                          {file && (
                            <p className="text-sm text-gray-600 mt-2">
                              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="encrypt-password" className="text-base font-medium mb-2 block">
                            Enter Password
                          </Label>
                          <Input
                            id="encrypt-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a strong password"
                            className="w-full"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Password must be at least 6 characters long
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="decrypt">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="decrypt-file" className="text-base font-medium mb-2 block">
                            Select Encrypted PDF File
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="decrypt-file"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="flex-1"
                            />
                            <Upload className="w-5 h-5 text-gray-400" />
                          </div>
                          {file && (
                            <p className="text-sm text-gray-600 mt-2">
                              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="decrypt-password" className="text-base font-medium mb-2 block">
                            Enter Password
                          </Label>
                          <Input
                            id="decrypt-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter the PDF password"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleProcess}
                    disabled={!file || !password || loading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    size="lg"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        {activeTab === 'encrypt' ? <Lock className="w-5 h-5 mr-2" /> : <Unlock className="w-5 h-5 mr-2" />}
                        {activeTab === 'encrypt' ? 'Encrypt PDF' : 'Decrypt PDF'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Features Section */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                  <CardContent className="pt-6">
                    <Shield className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Strong Encryption</h3>
                    <p className="text-sm text-gray-600">
                      Uses industry-standard AES-256 encryption to protect your PDF files
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <FileText className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Privacy First</h3>
                    <p className="text-sm text-gray-600">
                      All processing happens securely on our server with no file storage
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <Download className="w-12 h-12 text-purple-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Instant Download</h3>
                    <p className="text-sm text-gray-600">
                      Download your encrypted or decrypted PDF immediately after processing
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">How secure is PDF encryption?</h3>
                    <p className="text-gray-600">
                      We use AES-256 encryption, the same standard used by banks and government agencies. 
                      Your password is never stored, and files are deleted immediately after processing.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Can I decrypt a PDF without the password?</h3>
                    <p className="text-gray-600">
                      No, you must have the correct password to decrypt a PDF. There is no way to recover 
                      a forgotten password from an encrypted PDF.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">What happens to my files?</h3>
                    <p className="text-gray-600">
                      Your files are processed securely and deleted immediately after encryption or decryption. 
                      We do not store any files or passwords on our servers.
                    </p>
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

export default PDFEncryptionTool;
