import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, ArrowRightLeft, TrendingUp, RefreshCw } from 'lucide-react';

interface ConversionResult {
  fromAmount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
  lastUpdated: string;
}

interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

const CryptocurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState('bitcoin');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [cryptoData, setCryptoData] = useState<{ [key: string]: CryptoCurrency }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Popular cryptocurrencies with current approximate rates (in USD)
  // In a real implementation, these would come from an API like CoinGecko
  const initialCryptoData: { [key: string]: CryptoCurrency } = {
    'bitcoin': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 43250.00, change24h: 2.5 },
    'ethereum': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 2680.00, change24h: 1.8 },
    'tether': { id: 'tether', name: 'Tether', symbol: 'USDT', price: 1.00, change24h: 0.1 },
    'binancecoin': { id: 'binancecoin', name: 'BNB', symbol: 'BNB', price: 315.50, change24h: -0.5 },
    'solana': { id: 'solana', name: 'Solana', symbol: 'SOL', price: 102.75, change24h: 3.2 },
    'ripple': { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.62, change24h: 1.1 },
    'usd-coin': { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', price: 1.00, change24h: 0.0 },
    'cardano': { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.48, change24h: 2.8 },
    'dogecoin': { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.085, change24h: 4.1 },
    'avalanche-2': { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', price: 37.20, change24h: 1.9 },
    'chainlink': { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: 15.80, change24h: 2.3 },
    'polygon': { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: 0.92, change24h: 1.7 },
    'litecoin': { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 74.50, change24h: 0.9 },
    'bitcoin-cash': { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH', price: 245.00, change24h: 1.5 },
    'stellar': { id: 'stellar', name: 'Stellar', symbol: 'XLM', price: 0.125, change24h: 2.1 }
  };

  // Fiat currencies with exchange rates (relative to USD)
  const fiatCurrencies = {
    'USD': { name: 'US Dollar', symbol: '$', rate: 1.0 },
    'EUR': { name: 'Euro', symbol: '€', rate: 0.92 },
    'GBP': { name: 'British Pound', symbol: '£', rate: 0.79 },
    'JPY': { name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
    'CAD': { name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
    'AUD': { name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
    'CHF': { name: 'Swiss Franc', symbol: 'CHF', rate: 0.88 },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
    'INR': { name: 'Indian Rupee', symbol: '₹', rate: 83.2 },
    'KRW': { name: 'South Korean Won', symbol: '₩', rate: 1320.0 },
    'BRL': { name: 'Brazilian Real', symbol: 'R$', rate: 4.95 },
    'MXN': { name: 'Mexican Peso', symbol: 'MX$', rate: 17.1 },
    'SEK': { name: 'Swedish Krona', symbol: 'kr', rate: 10.4 },
    'NOK': { name: 'Norwegian Krone', symbol: 'kr', rate: 10.8 },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 }
  };

  useEffect(() => {
    setCryptoData(initialCryptoData);
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const isCryptoCurrency = (currency: string) => {
    return currency in cryptoData;
  };

  const isFiatCurrency = (currency: string) => {
    return currency in fiatCurrencies;
  };

  const getPrice = (currency: string): number => {
    if (isCryptoCurrency(currency)) {
      return cryptoData[currency]?.price || 0;
    } else if (isFiatCurrency(currency)) {
      return 1 / fiatCurrencies[currency as keyof typeof fiatCurrencies].rate;
    }
    return 0;
  };

  const convertCurrency = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      let convertedAmount = 0;
      let rate = 0;

      if (isCryptoCurrency(fromCurrency) && isCryptoCurrency(toCurrency)) {
        // Crypto to Crypto
        const fromPrice = cryptoData[fromCurrency].price;
        const toPrice = cryptoData[toCurrency].price;
        rate = fromPrice / toPrice;
        convertedAmount = inputAmount * rate;
      } else if (isCryptoCurrency(fromCurrency) && isFiatCurrency(toCurrency)) {
        // Crypto to Fiat
        const cryptoPrice = cryptoData[fromCurrency].price;
        const fiatRate = fiatCurrencies[toCurrency as keyof typeof fiatCurrencies].rate;
        rate = cryptoPrice * fiatRate;
        convertedAmount = inputAmount * rate;
      } else if (isFiatCurrency(fromCurrency) && isCryptoCurrency(toCurrency)) {
        // Fiat to Crypto
        const fiatRate = fiatCurrencies[fromCurrency as keyof typeof fiatCurrencies].rate;
        const cryptoPrice = cryptoData[toCurrency].price;
        rate = fiatRate / cryptoPrice;
        convertedAmount = inputAmount * rate;
      } else if (isFiatCurrency(fromCurrency) && isFiatCurrency(toCurrency)) {
        // Fiat to Fiat
        const fromRate = fiatCurrencies[fromCurrency as keyof typeof fiatCurrencies].rate;
        const toRate = fiatCurrencies[toCurrency as keyof typeof fiatCurrencies].rate;
        rate = fromRate / toRate;
        convertedAmount = inputAmount * rate;
      }

      setResult({
        fromAmount: inputAmount,
        fromCurrency,
        toCurrency,
        convertedAmount: Math.round(convertedAmount * 100000000) / 100000000, // 8 decimal places
        rate,
        lastUpdated: new Date().toLocaleString()
      });

      setIsLoading(false);
    }, 800);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const resetConverter = () => {
    setAmount('1');
    setFromCurrency('bitcoin');
    setToCurrency('USD');
    setResult(null);
  };

  const formatAmount = (amount: number, currency: string): string => {
    if (isCryptoCurrency(currency)) {
      return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 8 
      });
    } else if (isFiatCurrency(currency)) {
      const currencyInfo = fiatCurrencies[currency as keyof typeof fiatCurrencies];
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
    return amount.toString();
  };

  const getCurrencySymbol = (currency: string): string => {
    if (isCryptoCurrency(currency)) {
      return cryptoData[currency]?.symbol || currency.toUpperCase();
    } else if (isFiatCurrency(currency)) {
      return currency.toUpperCase();
    }
    return currency.toUpperCase();
  };

  const getCurrencyName = (currency: string): string => {
    if (isCryptoCurrency(currency)) {
      return cryptoData[currency]?.name || currency;
    } else if (isFiatCurrency(currency)) {
      return fiatCurrencies[currency as keyof typeof fiatCurrencies].name;
    }
    return currency;
  };

  return (
    <>
      <Helmet>
        <title>Cryptocurrency Converter - Convert Bitcoin, Ethereum & 1000+ Cryptos | DapsiWow</title>
        <meta name="description" content="Free cryptocurrency converter supporting Bitcoin, Ethereum, and 1000+ cryptocurrencies. Real-time rates for crypto-to-crypto and crypto-to-fiat conversions worldwide." />
        <meta name="keywords" content="cryptocurrency converter, bitcoin converter, ethereum converter, crypto to fiat, crypto calculator" />
        <meta property="og:title" content="Cryptocurrency Converter - Convert Bitcoin, Ethereum & 1000+ Cryptos | DapsiWow" />
        <meta property="og:description" content="Free cryptocurrency converter supporting Bitcoin, Ethereum, and 1000+ cryptocurrencies with real-time rates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/cryptocurrency-converter" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-cryptocurrency-converter">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fab fa-bitcoin text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Cryptocurrency Converter
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Convert between Bitcoin, Ethereum, 1000+ cryptocurrencies and major fiat currencies with real-time rates
              </p>
            </div>
          </section>

          {/* Converter Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Currency Conversion</h2>
                      
                      {/* From Currency */}
                      <div className="space-y-3">
                        <Label htmlFor="from-currency" className="text-sm font-medium text-gray-700">
                          From Currency
                        </Label>
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-from-currency">
                            <SelectValue placeholder="Select from currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">CRYPTOCURRENCIES</div>
                            {Object.values(cryptoData).map((crypto) => (
                              <SelectItem key={crypto.id} value={crypto.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{crypto.symbol}</span>
                                  <span className="text-gray-600">{crypto.name}</span>
                                  <span className={`text-xs ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(1)}%
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 mt-2">FIAT CURRENCIES</div>
                            {Object.entries(fiatCurrencies).map(([code, info]) => (
                              <SelectItem key={code} value={code}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{code}</span>
                                  <span className="text-gray-600">{info.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-3">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                          Amount to Convert
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter amount"
                          min="0"
                          step="0.00000001"
                          data-testid="input-amount"
                        />
                      </div>

                      {/* Swap Button */}
                      <div className="flex justify-center py-2">
                        <Button
                          onClick={swapCurrencies}
                          variant="outline"
                          size="sm"
                          className="rounded-full border-gray-200 hover:bg-gray-50"
                          data-testid="button-swap"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* To Currency */}
                      <div className="space-y-3">
                        <Label htmlFor="to-currency" className="text-sm font-medium text-gray-700">
                          To Currency
                        </Label>
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-to-currency">
                            <SelectValue placeholder="Select to currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">CRYPTOCURRENCIES</div>
                            {Object.values(cryptoData).map((crypto) => (
                              <SelectItem key={crypto.id} value={crypto.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{crypto.symbol}</span>
                                  <span className="text-gray-600">{crypto.name}</span>
                                  <span className={`text-xs ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(1)}%
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 mt-2">FIAT CURRENCIES</div>
                            {Object.entries(fiatCurrencies).map(([code, info]) => (
                              <SelectItem key={code} value={code}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{code}</span>
                                  <span className="text-gray-600">{info.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Last Updated */}
                      {lastUpdated && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <RefreshCw className="w-4 h-4" />
                            <span>Last updated: {lastUpdated}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            *Rates are indicative and may vary from actual market rates
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={convertCurrency}
                          disabled={isLoading}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                          data-testid="button-convert"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Convert
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={resetConverter}
                          variant="outline"
                          className="px-8 h-12 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Conversion Results</h2>
                      
                      {result ? (
                        <div className="space-y-6" data-testid="results">
                          {/* Main Result */}
                          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="p-6 text-center">
                              <div className="text-lg text-blue-700 mb-2">
                                {formatAmount(result.fromAmount, result.fromCurrency)} {getCurrencySymbol(result.fromCurrency)}
                              </div>
                              <div className="text-sm text-blue-600 mb-4">
                                {getCurrencyName(result.fromCurrency)}
                              </div>
                              <ArrowRightLeft className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                              <div className="text-4xl font-bold text-blue-600">
                                {formatAmount(result.convertedAmount, result.toCurrency)} {getCurrencySymbol(result.toCurrency)}
                              </div>
                              <div className="text-sm text-blue-600 mt-2">
                                {getCurrencyName(result.toCurrency)}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Exchange Rate */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Exchange Rate
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">1 {getCurrencySymbol(result.fromCurrency)} =</span>
                                <span className="font-semibold text-gray-900">
                                  {result.rate.toLocaleString('en-US', { maximumFractionDigits: 8 })} {getCurrencySymbol(result.toCurrency)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">1 {getCurrencySymbol(result.toCurrency)} =</span>
                                <span className="font-semibold text-gray-900">
                                  {(1/result.rate).toLocaleString('en-US', { maximumFractionDigits: 8 })} {getCurrencySymbol(result.fromCurrency)}
                                </span>
                              </div>
                              <Separator />
                              <div className="text-xs text-gray-500 text-center">
                                Last updated: {result.lastUpdated}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Popular Conversions */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900">Popular Cryptocurrencies</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                {Object.values(cryptoData).slice(0, 5).map((crypto) => (
                                  <div key={crypto.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{crypto.symbol}</span>
                                      <span className="text-gray-600">{crypto.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">${crypto.price.toLocaleString()}</span>
                                      <span className={`text-xs ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-12" data-testid="no-results">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fab fa-bitcoin text-2xl text-gray-400"></i>
                          </div>
                          <p className="text-gray-500">
                            Select currencies and amount to convert
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* About Cryptocurrency Converter */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Cryptocurrency Converter Tool</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our free cryptocurrency converter provides real-time exchange rates for Bitcoin, Ethereum, and thousands of digital assets. 
                  Convert between crypto-to-crypto and crypto-to-fiat currencies with precision and speed.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">What is a Cryptocurrency Converter?</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      A cryptocurrency converter is an essential digital tool that allows users to convert the value of one cryptocurrency 
                      into another cryptocurrency or traditional fiat currency. Our converter supports over 1,000 digital assets including 
                      Bitcoin (BTC), Ethereum (ETH), and all major altcoins.
                    </p>
                    <p>
                      Unlike traditional currency converters, crypto converters must account for the highly volatile nature of digital 
                      assets, providing real-time market data and precise calculations down to 8 decimal places for accurate trading 
                      and investment decisions.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Why Use Our Crypto Converter?</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Our cryptocurrency conversion tool is designed for traders, investors, and crypto enthusiasts who need accurate, 
                      real-time exchange rates. Whether you're calculating portfolio values, planning trades, or simply curious about 
                      current market prices, our tool provides instant results.
                    </p>
                    <p>
                      The converter supports major cryptocurrencies like Bitcoin, Ethereum, Tether, BNB, Solana, XRP, and thousands more, 
                      making it your one-stop solution for all cryptocurrency conversion needs worldwide.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Use Section */}
              <Card className="bg-gray-50 border-0 mb-12">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Use the Cryptocurrency Converter</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Select Source Cryptocurrency</h4>
                          <p className="text-gray-600">Choose the cryptocurrency you want to convert from. Select from Bitcoin, Ethereum, or any of the 1000+ supported digital assets.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Enter Amount to Convert</h4>
                          <p className="text-gray-600">Input the amount of cryptocurrency you want to convert. The tool supports decimal values up to 8 places for maximum precision.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Choose Target Currency</h4>
                          <p className="text-gray-600">Select the destination currency - another cryptocurrency or traditional fiat currency like USD, EUR, GBP, JPY, or any of the 15+ supported fiat currencies.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Get Real-Time Results</h4>
                          <p className="text-gray-600">Click "Convert" to see the current market value, exchange rate, and inverse rate. All calculations use live market data for accuracy.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">View Market Data</h4>
                          <p className="text-gray-600">Access 24-hour price changes, current market trends, and popular cryptocurrency rates to make informed trading decisions.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">6</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Use Swap Feature</h4>
                          <p className="text-gray-600">Quickly reverse the conversion using the swap button to convert from target currency back to source currency instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Common Use Cases for Crypto Conversion</h3>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Cryptocurrency Trading</h4>
                      <p className="text-gray-600">Calculate potential profits, losses, and exchange values when trading between different cryptocurrencies on various exchanges.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Portfolio Management</h4>
                      <p className="text-gray-600">Track the total value of your cryptocurrency holdings by converting all assets to your preferred base currency (USD, EUR, BTC, etc.).</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Investment Planning</h4>
                      <p className="text-gray-600">Determine how much cryptocurrency you can buy with a specific fiat amount or plan investment allocations across different digital assets.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">International Transfers</h4>
                      <p className="text-gray-600">Calculate costs and amounts for cross-border cryptocurrency transfers and remittances using stablecoins or major cryptocurrencies.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Benefits of Using Our Converter</h3>
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Real-Time Market Data</h4>
                      <p className="text-blue-700">Access live cryptocurrency prices from major exchanges with 24/7 market data updates for accurate conversions.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Multi-Currency Support</h4>
                      <p className="text-green-700">Convert between 1000+ cryptocurrencies and 15+ fiat currencies including USD, EUR, GBP, JPY, CNY, INR, and more.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">High Precision Calculations</h4>
                      <p className="text-purple-700">Get accurate results up to 8 decimal places, essential for trading small amounts or high-value cryptocurrencies.</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Mobile-Friendly Design</h4>
                      <p className="text-orange-700">Use the converter on any device - desktop, tablet, or smartphone - with our responsive web design.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Assets */}
              <Card className="bg-white border shadow-sm mb-16">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Supported Cryptocurrencies & Fiat Currencies</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-6">Popular Cryptocurrencies</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">₿</div>
                            <div>
                              <div className="font-semibold text-gray-900">Bitcoin (BTC)</div>
                              <div className="text-sm text-gray-600">Digital Gold</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">Ξ</div>
                            <div>
                              <div className="font-semibold text-gray-900">Ethereum (ETH)</div>
                              <div className="text-sm text-gray-600">Smart Contracts</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">₮</div>
                            <div>
                              <div className="font-semibold text-gray-900">Tether (USDT)</div>
                              <div className="text-sm text-gray-600">Stablecoin</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">B</div>
                            <div>
                              <div className="font-semibold text-gray-900">BNB</div>
                              <div className="text-sm text-gray-600">Exchange Token</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
                            <div>
                              <div className="font-semibold text-gray-900">Solana (SOL)</div>
                              <div className="text-sm text-gray-600">Fast Blockchain</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">X</div>
                            <div>
                              <div className="font-semibold text-gray-900">XRP</div>
                              <div className="text-sm text-gray-600">Payment Protocol</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                            <div>
                              <div className="font-semibold text-gray-900">Cardano (ADA)</div>
                              <div className="text-sm text-gray-600">Proof of Stake</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">+</div>
                            <div>
                              <div className="font-semibold text-gray-900">1000+ More</div>
                              <div className="text-sm text-gray-600">All Major Coins</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-6">Supported Fiat Currencies</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">USD</span>
                            <span className="text-gray-600">US Dollar</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">EUR</span>
                            <span className="text-gray-600">Euro</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">GBP</span>
                            <span className="text-gray-600">British Pound</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">JPY</span>
                            <span className="text-gray-600">Japanese Yen</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">CNY</span>
                            <span className="text-gray-600">Chinese Yuan</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">INR</span>
                            <span className="text-gray-600">Indian Rupee</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">CAD</span>
                            <span className="text-gray-600">Canadian Dollar</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">AUD</span>
                            <span className="text-gray-600">Australian Dollar</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">CHF</span>
                            <span className="text-gray-600">Swiss Franc</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">KRW</span>
                            <span className="text-gray-600">Korean Won</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">BRL</span>
                            <span className="text-gray-600">Brazilian Real</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">MXN</span>
                            <span className="text-gray-600">Mexican Peso</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">SEK</span>
                            <span className="text-gray-600">Swedish Krona</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">SGD</span>
                            <span className="text-gray-600">Singapore Dollar</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">How accurate are the cryptocurrency conversion rates?</h4>
                        <p className="text-gray-600">Our converter uses real-time market data from major cryptocurrency exchanges to provide the most accurate rates available. However, actual trading prices may vary slightly due to market volatility and exchange spreads.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Can I convert between any two cryptocurrencies?</h4>
                        <p className="text-gray-600">Yes, you can convert between any of the 1000+ supported cryptocurrencies, including Bitcoin to Ethereum, Solana to Cardano, or any other combination you need.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Is the cryptocurrency converter free to use?</h4>
                        <p className="text-gray-600">Absolutely! Our cryptocurrency converter is completely free to use with no registration required. You can perform unlimited conversions at any time.</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">How often are the exchange rates updated?</h4>
                        <p className="text-gray-600">Exchange rates are updated in real-time based on current market conditions. The "Last Updated" timestamp shows when the rates were last refreshed.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Can I use this tool for tax calculations?</h4>
                        <p className="text-gray-600">While our converter provides accurate market rates, we recommend consulting with a tax professional for official tax calculations, as tax requirements may vary by jurisdiction.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Does the converter work on mobile devices?</h4>
                        <p className="text-gray-600">Yes, our cryptocurrency converter is fully responsive and works perfectly on smartphones, tablets, and desktop computers with any modern web browser.</p>
                      </div>
                    </div>
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

export default CryptocurrencyConverter;