
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface EncryptionOptions {
  method: 'caesar' | 'atbash' | 'base64' | 'reverse';
  caesarShift: number;
  includeSpaces: boolean;
  caseSensitive: boolean;
}

interface EncryptionResult {
  originalText: string;
  encryptedText: string;
  method: string;
  timestamp: Date;
}

const TextEncryptor = () => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [result, setResult] = useState<EncryptionResult | null>(null);
  const [encryptionHistory, setEncryptionHistory] = useState<EncryptionResult[]>([]);
  const [options, setOptions] = useState<EncryptionOptions>({
    method: 'caesar',
    caesarShift: 3,
    includeSpaces: true,
    caseSensitive: false
  });

  const caesarCipher = (text: string, shift: number, decrypt: boolean = false): string => {
    const actualShift = decrypt ? -shift : shift;
    return text.split('').map(char => {
      if (char.match(/[a-zA-Z]/)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + actualShift + 26) % 26) + base);
      }
      return options.includeSpaces ? char : '';
    }).join('');
  };

  const atbashCipher = (text: string): string => {
    return text.split('').map(char => {
      if (char.match(/[a-zA-Z]/)) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(90 - (code - 65));
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(122 - (code - 97));
        }
      }
      return options.includeSpaces ? char : '';
    }).join('');
  };

  const base64Encode = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      return 'Error: Invalid text for Base64 encoding';
    }
  };

  const base64Decode = (text: string): string => {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (error) {
      return 'Error: Invalid Base64 string';
    }
  };

  const reverseText = (text: string): string => {
    return text.split('').reverse().join('');
  };

  const processText = () => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    try {
      let processedText = inputText;
      
      if (!options.caseSensitive && options.method !== 'base64') {
        processedText = inputText.toLowerCase();
      }

      let outputText = '';
      const isDecrypting = mode === 'decrypt';

      switch (options.method) {
        case 'caesar':
          outputText = caesarCipher(processedText, options.caesarShift, isDecrypting);
          break;
        case 'atbash':
          outputText = atbashCipher(processedText);
          break;
        case 'base64':
          outputText = isDecrypting ? base64Decode(processedText) : base64Encode(processedText);
          break;
        case 'reverse':
          outputText = reverseText(processedText);
          break;
        default:
          outputText = processedText;
      }

      const newResult: EncryptionResult = {
        originalText: inputText,
        encryptedText: outputText,
        method: `${options.method} (${mode})`,
        timestamp: new Date()
      };

      setResult(newResult);
      setEncryptionHistory(prev => [newResult, ...prev.slice(0, 9)]);
    } catch (error) {
      setResult(null);
    }
  };

  const updateOption = <K extends keyof EncryptionOptions>(key: K, value: EncryptionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleSampleText = () => {
    setInputText('Hello World! This is a secret message that needs to be encrypted for security.');
  };

  const resetTool = () => {
    setInputText('');
    setResult(null);
    setMode('encrypt');
    setOptions({
      method: 'caesar',
      caesarShift: 3,
      includeSpaces: true,
      caseSensitive: false
    });
  };

  useEffect(() => {
    if (inputText.trim()) {
      processText();
    } else {
      setResult(null);
    }
  }, [inputText, mode, options]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Encryptor/Decryptor - Encrypt & Decrypt Text Online | DapsiWow</title>
        <meta name="description" content="Free online text encryption and decryption tool. Secure your text with Caesar cipher, Atbash cipher, Base64 encoding, and text reversal methods." />
        <meta name="keywords" content="text encryptor, text decryptor, caesar cipher, atbash cipher, base64 encoder, text encryption, online encryption tool, secure text, cipher tool" />
        <meta property="og:title" content="Text Encryptor/Decryptor - Encrypt & Decrypt Text Online | DapsiWow" />
        <meta property="og:description" content="Free online text encryption tool with multiple cipher methods including Caesar cipher, Atbash cipher, and Base64 encoding." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-encryptor" />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Text Security Tool</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Text Encryptor
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  & Decryptor
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Encrypt and decrypt text using various cipher methods for security and privacy
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Encryption</h2>
                    <p className="text-gray-600">Enter your text to encrypt or decrypt using various cipher methods</p>
                  </div>

                  <div className="space-y-6">
                    {/* Mode Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Operation Mode
                      </Label>
                      <Select
                        value={mode}
                        onValueChange={(value: 'encrypt' | 'decrypt') => setMode(value)}
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="encrypt">Encrypt Text</SelectItem>
                          <SelectItem value="decrypt">Decrypt Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Encryption Method */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Encryption Method
                      </Label>
                      <Select
                        value={options.method}
                        onValueChange={(value: 'caesar' | 'atbash' | 'base64' | 'reverse') => 
                          updateOption('method', value)
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caesar">Caesar Cipher</SelectItem>
                          <SelectItem value="atbash">Atbash Cipher</SelectItem>
                          <SelectItem value="base64">Base64 Encoding</SelectItem>
                          <SelectItem value="reverse">Text Reversal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Caesar Shift (only for Caesar cipher) */}
                    {options.method === 'caesar' && (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Caesar Shift Amount
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="25"
                          value={options.caesarShift}
                          onChange={(e) => updateOption('caesarShift', parseInt(e.target.value) || 3)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Options</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Include Spaces</Label>
                          <p className="text-xs text-gray-500">Preserve spaces in encrypted text</p>
                        </div>
                        <Switch
                          checked={options.includeSpaces}
                          onCheckedChange={(value) => updateOption('includeSpaces', value)}
                        />
                      </div>

                      {options.method !== 'base64' && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Case Sensitive</Label>
                            <p className="text-xs text-gray-500">Preserve letter case</p>
                          </div>
                          <Switch
                            checked={options.caseSensitive}
                            onCheckedChange={(value) => updateOption('caseSensitive', value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {mode === 'encrypt' ? 'Text to Encrypt' : 'Text to Decrypt'}
                      </Label>
                      <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[120px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder={mode === 'encrypt' ? 'Enter your secret message here...' : 'Enter encrypted text to decrypt...'}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="h-12 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                      >
                        Sample Text
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="h-12 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={resetTool}
                        variant="outline"
                        className="h-12 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} Result
                  </h2>

                  {result ? (
                    <div className="space-y-6">
                      {/* Result Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                              {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} Text
                            </span>
                            <Button
                              onClick={() => handleCopyToClipboard(result.encryptedText)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <div className="text-gray-800 font-mono break-all">
                              {result.encryptedText}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Method Info */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Method Used</span>
                          <span className="font-bold text-blue-600">{result.method}</span>
                        </div>
                      </div>

                      {/* Character Count */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {result.originalText.length}
                          </div>
                          <div className="text-sm text-gray-600">Original Length</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {result.encryptedText.length}
                          </div>
                          <div className="text-sm text-gray-600">Result Length</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl text-gray-300 mb-4">🔐</div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">No Result Yet</h3>
                      <p className="text-gray-500">
                        Enter some text to {mode} using your selected method
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TextEncryptor;
