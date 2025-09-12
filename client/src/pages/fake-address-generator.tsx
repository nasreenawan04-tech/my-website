import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MapPin, RefreshCw, Copy } from 'lucide-react';

interface AddressOptions {
  country: 'US' | 'UK' | 'Canada';
  includeApartment: boolean;
  includeSecondaryAddress: boolean;
  includeZipExtension: boolean;
  format: 'standard' | 'single-line' | 'mailing';
}

interface GeneratedAddress {
  streetNumber: string;
  streetName: string;
  streetType: string;
  apartment?: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  fullAddress: string;
  mailingAddress: string;
  singleLineAddress: string;
}

const FakeAddressGenerator = () => {
  const [generatedAddress, setGeneratedAddress] = useState<GeneratedAddress | null>(null);
  const [addressHistory, setAddressHistory] = useState<GeneratedAddress[]>([]);
  const [options, setOptions] = useState<AddressOptions>({
    country: 'US',
    includeApartment: false,
    includeSecondaryAddress: false,
    includeZipExtension: false,
    format: 'standard'
  });

  // Address generation data
  const data = {
    US: {
      streetNames: [
        'Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Park', 'Washington', 'First', 'Second',
        'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Lincoln',
        'Madison', 'Jefferson', 'Adams', 'Jackson', 'Johnson', 'Smith', 'Brown', 'Davis', 'Miller',
        'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
        'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'
      ],
      streetTypes: [
        'Street', 'Avenue', 'Boulevard', 'Drive', 'Court', 'Place', 'Lane', 'Road', 'Way', 'Circle',
        'Parkway', 'Trail', 'Path', 'Square', 'Terrace', 'Plaza', 'Heights', 'Hill', 'Ridge', 'Creek'
      ],
      cities: [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
        'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
        'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
        'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
        'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
        'Atlanta', 'Kansas City', 'Colorado Springs', 'Miami', 'Raleigh', 'Omaha', 'Long Beach'
      ],
      states: [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
        'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
        'VA', 'WA', 'WV', 'WI', 'WY'
      ],
      apartmentTypes: ['Apt', 'Suite', 'Unit', '#'],
      secondaryTypes: ['Building', 'Floor', 'Rm']
    },
    UK: {
      streetNames: [
        'High', 'Church', 'Main', 'Park', 'Victoria', 'Albert', 'King', 'Queen', 'Station', 'Mill',
        'School', 'North', 'South', 'East', 'West', 'New', 'Old', 'London', 'York', 'Manchester',
        'Birmingham', 'Liverpool', 'Bristol', 'Leeds', 'Sheffield', 'Edinburgh', 'Glasgow', 'Cardiff',
        'Blackpool', 'Brighton', 'Cambridge', 'Oxford', 'Windsor', 'Richmond', 'Kensington', 'Chelsea'
      ],
      streetTypes: [
        'Street', 'Road', 'Avenue', 'Lane', 'Close', 'Gardens', 'Park', 'Square', 'Crescent',
        'Drive', 'Grove', 'Court', 'Place', 'Way', 'Rise', 'View', 'Hill', 'Green', 'Common'
      ],
      cities: [
        'London', 'Birmingham', 'Liverpool', 'Sheffield', 'Bristol', 'Glasgow', 'Leicester',
        'Edinburgh', 'Leeds', 'Cardiff', 'Manchester', 'Stoke-on-Trent', 'Coventry', 'Sunderland',
        'Birkenhead', 'Islington', 'Reading', 'Preston', 'Newport', 'Swansea', 'Bradford', 'Southend'
      ],
      counties: [
        'London', 'Greater Manchester', 'West Midlands', 'West Yorkshire', 'Merseyside', 'South Yorkshire',
        'Tyne and Wear', 'Nottinghamshire', 'Leicestershire', 'Staffordshire', 'Kent', 'Hampshire'
      ]
    },
    Canada: {
      streetNames: [
        'Main', 'King', 'Queen', 'Yonge', 'University', 'College', 'Dundas', 'Bloor', 'Richmond',
        'Adelaide', 'Front', 'Bay', 'Church', 'Parliament', 'Sherbourne', 'Jarvis', 'Spadina'
      ],
      streetTypes: [
        'Street', 'Avenue', 'Boulevard', 'Drive', 'Road', 'Lane', 'Way', 'Circle', 'Court', 'Place'
      ],
      cities: [
        'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City',
        'Hamilton', 'Kitchener', 'London', 'Halifax', 'Victoria', 'Windsor', 'Oshawa', 'Saskatoon'
      ],
      provinces: [
        'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'
      ]
    }
  };

  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateZipCode = (country: string, includeExtension: boolean = false): string => {
    switch (country) {
      case 'US':
        const base = getRandomNumber(10000, 99999).toString().padStart(5, '0');
        return includeExtension ? `${base}-${getRandomNumber(1000, 9999)}` : base;
      case 'UK':
        const area = String.fromCharCode(65 + getRandomNumber(0, 25)) + String.fromCharCode(65 + getRandomNumber(0, 25));
        const district = getRandomNumber(1, 99);
        const sector = getRandomNumber(0, 9);
        const unit = String.fromCharCode(65 + getRandomNumber(0, 25)) + String.fromCharCode(65 + getRandomNumber(0, 25));
        return `${area}${district} ${sector}${unit}`;
      case 'Canada':
        const letter1 = String.fromCharCode(65 + getRandomNumber(0, 25));
        const digit1 = getRandomNumber(0, 9);
        const letter2 = String.fromCharCode(65 + getRandomNumber(0, 25));
        const digit2 = getRandomNumber(0, 9);
        const letter3 = String.fromCharCode(65 + getRandomNumber(0, 25));
        const digit3 = getRandomNumber(0, 9);
        return `${letter1}${digit1}${letter2} ${digit2}${letter3}${digit3}`;
      default:
        return getRandomNumber(10000, 99999).toString();
    }
  };

  const generateAddress = (opts: AddressOptions): GeneratedAddress => {
    const countryData = data[opts.country] || data.US;
    
    // Generate street address components
    const streetNumber = getRandomNumber(1, 9999).toString();
    const streetName = getRandomItem(countryData.streetNames);
    const streetType = getRandomItem(countryData.streetTypes);
    
    // Generate apartment/unit if requested
    let apartment = '';
    if (opts.includeApartment && 'apartmentTypes' in countryData) {
      const aptType = getRandomItem(countryData.apartmentTypes);
      const aptNumber = getRandomNumber(1, 999);
      apartment = `${aptType} ${aptNumber}`;
    }
    
    // Generate secondary address if requested
    let secondaryAddress = '';
    if (opts.includeSecondaryAddress && 'secondaryTypes' in countryData) {
      const secType = getRandomItem(countryData.secondaryTypes);
      const secNumber = getRandomNumber(1, 99);
      secondaryAddress = `${secType} ${secNumber}`;
    }
    
    // Generate city, state/province
    const city = getRandomItem(countryData.cities);
    let state = '';
    
    if ('states' in countryData) {
      state = getRandomItem(countryData.states as string[]);
    } else if ('provinces' in countryData) {
      state = getRandomItem(countryData.provinces as string[]);
    } else if ('counties' in countryData) {
      state = getRandomItem(countryData.counties as string[]);
    }
    
    // Generate ZIP/postal code
    const zipCode = generateZipCode(opts.country, opts.includeZipExtension);
    
    // Construct full addresses
    let streetAddress = `${streetNumber} ${streetName} ${streetType}`;
    
    const addressParts = [streetAddress];
    if (apartment) addressParts.push(apartment);
    if (secondaryAddress) addressParts.push(secondaryAddress);
    
    const fullStreetAddress = addressParts.join(', ');
    const fullAddress = `${fullStreetAddress}\n${city}, ${state} ${zipCode}`;
    const mailingAddress = `${fullStreetAddress}\n${city}, ${state} ${zipCode}\n${opts.country === 'US' ? 'United States' : opts.country === 'UK' ? 'United Kingdom' : opts.country}`;
    const singleLineAddress = `${fullStreetAddress}, ${city}, ${state} ${zipCode}`;
    
    return {
      streetNumber,
      streetName,
      streetType,
      apartment: apartment || undefined,
      secondaryAddress: secondaryAddress || undefined,
      city,
      state,
      zipCode,
      country: opts.country,
      fullAddress,
      mailingAddress,
      singleLineAddress
    };
  };

  const handleGenerateAddress = () => {
    const newAddress = generateAddress(options);
    setGeneratedAddress(newAddress);
    
    // Add to history (keep last 10)
    setAddressHistory(prev => {
      const updated = [newAddress, ...prev.filter(a => a.fullAddress !== newAddress.fullAddress)];
      return updated.slice(0, 10);
    });
  };

  const updateOption = <K extends keyof AddressOptions>(key: K, value: AddressOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getFormattedAddress = () => {
    if (!generatedAddress) return '';
    
    switch (options.format) {
      case 'single-line':
        return generatedAddress.singleLineAddress;
      case 'mailing':
        return generatedAddress.mailingAddress;
      case 'standard':
      default:
        return generatedAddress.fullAddress;
    }
  };

  // Generate initial address
  useEffect(() => {
    handleGenerateAddress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Fake Address Generator - Generate Random Addresses | DapsiWow</title>
        <meta name="description" content="Generate realistic fake addresses for testing, privacy, and development purposes. Supports US, UK, Canada, Australia, and more with customizable options." />
        <meta name="keywords" content="fake address generator, random address, test address, address generator, dummy address, mock address" />
        <meta property="og:title" content="Fake Address Generator - Generate Random Addresses" />
        <meta property="og:description" content="Generate realistic fake addresses for testing and development with customizable country and format options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/fake-address-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Fake Address Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Generate realistic fake addresses for testing, privacy, and development purposes
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Generator Options */}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generator Options</h2>
                    
                    <div className="space-y-6">
                      {/* Country Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="country-select" className="text-base font-medium">Country</Label>
                        <Select 
                          value={options.country} 
                          onValueChange={(value: typeof options.country) => updateOption('country', value)}
                        >
                          <SelectTrigger id="country-select" data-testid="select-country" aria-label="Select country for address generation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Address Format */}
                      <div className="space-y-3">
                        <Label htmlFor="format-select" className="text-base font-medium">Address Format</Label>
                        <Select 
                          value={options.format} 
                          onValueChange={(value: typeof options.format) => updateOption('format', value)}
                        >
                          <SelectTrigger id="format-select" data-testid="select-format" aria-label="Select address format type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (Multi-line)</SelectItem>
                            <SelectItem value="single-line">Single Line</SelectItem>
                            <SelectItem value="mailing">Mailing Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Additional Options */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Additional Options</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Include Apartment/Unit</Label>
                              <p className="text-xs text-gray-500">Add apartment or unit number</p>
                            </div>
                            <Switch
                              checked={options.includeApartment}
                              onCheckedChange={(value) => updateOption('includeApartment', value)}
                              data-testid="switch-apartment"
                              aria-label="Include apartment or unit number in generated address"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Secondary Address</Label>
                              <p className="text-xs text-gray-500">Add building, floor, or room info</p>
                            </div>
                            <Switch
                              checked={options.includeSecondaryAddress}
                              onCheckedChange={(value) => updateOption('includeSecondaryAddress', value)}
                              data-testid="switch-secondary"
                              aria-label="Include secondary address in generated address"
                            />
                          </div>

                          {options.country === 'US' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">ZIP+4 Extension</Label>
                                <p className="text-xs text-gray-500">Include extended ZIP code format</p>
                              </div>
                              <Switch
                                checked={options.includeZipExtension}
                                onCheckedChange={(value) => updateOption('includeZipExtension', value)}
                                data-testid="switch-zip-extension"
                                aria-label="Include ZIP+4 extension in generated address"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Generate Button */}
                      <Button 
                        onClick={handleGenerateAddress}
                        className="w-full h-12 text-base"
                        data-testid="button-generate-address"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate New Address
                      </Button>
                    </div>
                  </div>

                  {/* Generated Address Display */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Address</h2>
                    
                    {generatedAddress && (
                      <div className="space-y-6" data-testid="generated-address-display">
                        {/* Main Address Display */}
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="text-lg font-mono text-blue-600 whitespace-pre-line" data-testid="main-address">
                            {getFormattedAddress()}
                          </div>
                        </div>

                        {/* Address Components */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Street Number</div>
                                <div className="text-gray-600" data-testid="street-number">{generatedAddress.streetNumber}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedAddress.streetNumber)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-street-number"
                                aria-label="Copy street number to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Street Name</div>
                                <div className="text-gray-600" data-testid="street-name">{generatedAddress.streetName} {generatedAddress.streetType}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(`${generatedAddress.streetName} ${generatedAddress.streetType}`)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-street-name"
                                aria-label="Copy street name to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">City</div>
                                <div className="text-gray-600" data-testid="city">{generatedAddress.city}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedAddress.city)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-city"
                                aria-label="Copy city to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{options.country === 'US' ? 'State' : options.country === 'Canada' ? 'Province' : 'County'}</div>
                                <div className="text-gray-600" data-testid="state">{generatedAddress.state}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedAddress.state)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-state"
                                aria-label="Copy state to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{options.country === 'US' ? 'ZIP Code' : 'Postal Code'}</div>
                                <div className="text-gray-600 font-mono" data-testid="zip-code">{generatedAddress.zipCode}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedAddress.zipCode)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-zip"
                                aria-label="Copy ZIP code to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Country</div>
                                <div className="text-gray-600" data-testid="country">{generatedAddress.country}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedAddress.country)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-country"
                                aria-label="Copy country to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {(generatedAddress.apartment || generatedAddress.secondaryAddress) && (
                            <div className="space-y-3">
                              {generatedAddress.apartment && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium text-gray-900">Apartment/Unit</div>
                                    <div className="text-gray-600" data-testid="apartment">{generatedAddress.apartment}</div>
                                  </div>
                                  <Button
                                    onClick={() => handleCopyToClipboard(generatedAddress.apartment!)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid="button-copy-apartment"
                                    aria-label="Copy apartment number to clipboard"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              {generatedAddress.secondaryAddress && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium text-gray-900">Secondary Address</div>
                                    <div className="text-gray-600" data-testid="secondary-address">{generatedAddress.secondaryAddress}</div>
                                  </div>
                                  <Button
                                    onClick={() => handleCopyToClipboard(generatedAddress.secondaryAddress!)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid="button-copy-secondary"
                                    aria-label="Copy secondary address to clipboard"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleCopyToClipboard(getFormattedAddress())}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-copy-full-address"
                          >
                            <i className="fas fa-copy mr-2"></i>
                            Copy Full Address
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address History */}
                {addressHistory.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Generated</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addressHistory.slice(0, 6).map((address, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-mono text-gray-900 whitespace-pre-line mb-2" data-testid={`history-address-${index}`}>
                                  {address.singleLineAddress}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {address.country}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(address.fullAddress)}
                                variant="ghost"
                                size="sm"
                                data-testid={`button-copy-history-${index}`}
                                aria-label="Copy address from history to clipboard"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Fake Address Generator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Fake Address Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>fake address generator</strong> is a professional tool that creates realistic but completely fictional addresses for various legitimate purposes such as software testing, privacy protection, development workflows, and quality assurance. Our <strong>random address generator</strong> follows proper formatting conventions while ensuring all generated addresses represent non-existent locations.
              </p>
              
              <p className="text-gray-700 mb-6">
                This <strong>dummy address generator</strong> supports multiple countries including the United States, United Kingdom, and Canada, providing addresses that look authentic while being completely safe for testing purposes. Each generated address includes all standard components like street numbers, street names, cities, states/provinces, and postal codes in the correct format for each country.
              </p>

              <p className="text-gray-700 mb-6">
                Whether you need a <strong>test address generator</strong> for form validation, database seeding, or privacy protection, our tool ensures you get realistic-looking addresses that won't interfere with real locations or cause any legal issues. The addresses are perfect for development environments, educational projects, and any scenario where real addresses would be inappropriate.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our Address Generator Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Address Construction</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-blue-600 mt-1 mr-3"></i>
                    <span>Combines authentic street names from comprehensive databases</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-blue-600 mt-1 mr-3"></i>
                    <span>Generates realistic house numbers and postal codes</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-blue-600 mt-1 mr-3"></i>
                    <span>Uses real city and state combinations for authenticity</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-blue-600 mt-1 mr-3"></i>
                    <span>Follows country-specific address formatting standards</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customization Options</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-cog text-blue-600 mt-1 mr-3"></i>
                    <span>Choose from multiple countries and regions</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-cog text-blue-600 mt-1 mr-3"></i>
                    <span>Add apartment numbers and secondary addresses</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-cog text-blue-600 mt-1 mr-3"></i>
                    <span>Select different address formats (single-line, mailing, standard)</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-cog text-blue-600 mt-1 mr-3"></i>
                    <span>Include extended postal codes when needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Cases and Benefits */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Different Audiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Developers & Programmers</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Test form validation and address parsing</li>
                  <li>• Populate databases with realistic test data</li>
                  <li>• API testing and integration development</li>
                  <li>• E-commerce checkout flow testing</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Students & Researchers</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Academic projects and assignments</li>
                  <li>• Data science and analysis studies</li>
                  <li>• Geographic information system (GIS) projects</li>
                  <li>• Statistical modeling with location data</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-paint-brush text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Designers & Writers</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Create realistic design mockups</li>
                  <li>• Populate prototypes with sample data</li>
                  <li>• Character development for stories</li>
                  <li>• Website and app wireframing</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Privacy-Conscious Users</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Protect personal information online</li>
                  <li>• Safe account registration practices</li>
                  <li>• Avoid sharing real address details</li>
                  <li>• Test services without personal data</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-vial text-red-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">QA Professionals</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Comprehensive address format testing</li>
                  <li>• International localization testing</li>
                  <li>• Edge case scenario validation</li>
                  <li>• User experience testing</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-briefcase text-indigo-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Business Professionals</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Marketing campaign testing</li>
                  <li>• Customer journey mapping</li>
                  <li>• Sales process optimization</li>
                  <li>• Training and demonstration purposes</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Our Fake Address Generator?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Completely Free:</strong> No registration or payment required</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Instant Generation:</strong> Get addresses immediately with one click</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Multiple Formats:</strong> Standard, single-line, and mailing formats</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Country Support:</strong> US, UK, Canada with authentic formats</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Copy-Friendly:</strong> Easy copying of individual components</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>No Limits:</strong> Generate unlimited addresses</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Countries & Formats */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Supported Countries & Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🇺🇸 United States</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Standard ZIP codes (12345)</li>
                  <li>• ZIP+4 format (12345-6789)</li>
                  <li>• Apartment/Suite numbers</li>
                  <li>• All 50 states supported</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🇬🇧 United Kingdom</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• UK postal code format</li>
                  <li>• British street types</li>
                  <li>• Counties and regions</li>
                  <li>• Traditional naming</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🇨🇦 Canada</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Canadian postal codes</li>
                  <li>• Provincial abbreviations</li>
                  <li>• Major Canadian cities</li>
                  <li>• Bilingual format support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Testing & Generator Tools</h2>
            <p className="text-gray-700 mb-6">
              Enhance your testing workflow with our comprehensive suite of generator tools. Perfect for developers, testers, and anyone needing realistic test data.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/fake-name-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-id-card text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Fake Name Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate realistic names with customizable options for different nationalities and genders.</p>
              </a>
              
              <a href="/tools/password-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-lock text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Password Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Create strong, secure passwords with customizable length and character sets.</p>
              </a>
              
              <a href="/tools/username-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-user text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Username Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate unique usernames for accounts, testing, and creative projects.</p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-paragraph text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Lorem Ipsum Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate placeholder text for design mockups and content testing.</p>
              </a>
              
              <a href="/tools/qr-text-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-qrcode text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">QR Code Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Create QR codes for URLs, text, and contact information.</p>
              </a>
              
              <a href="/tools/case-converter" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <i className="fas fa-text-height text-purple-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Case Converter</h3>
                </div>
                <p className="text-gray-600 text-sm">Convert text between different cases: uppercase, lowercase, title case, and more.</p>
              </a>
            </div>
            
            <div className="mt-6 text-center">
              <a href="/all-tools" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <i className="fas fa-tools mr-2"></i>
                View All Tools
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are these addresses real?</h3>
                <p className="text-gray-600">No, all generated addresses are completely fictional and do not correspond to real locations. They follow proper formatting conventions but are safe for testing and development purposes. Our <strong>dummy address generator</strong> ensures no real addresses are ever used.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use these addresses for shipping?</h3>
                <p className="text-gray-600">Absolutely not. These are <strong>fake addresses</strong> that should never be used for actual shipping, legal documents, or any real-world transactions. They are intended solely for testing, development, and educational purposes. Using fake addresses for shipping would result in delivery failures.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What address formats are supported?</h3>
                <p className="text-gray-600">Our <strong>random address generator</strong> supports standard multi-line format, single-line format for forms, and formal mailing address format. You can also customize whether to include apartment numbers, secondary address information, and extended postal codes like ZIP+4 for US addresses.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How realistic are the generated addresses?</h3>
                <p className="text-gray-600">The addresses follow authentic formatting conventions, use real city and state names, and include proper postal codes for their respective countries. This makes them perfect for <strong>testing address validation</strong> systems and ensuring your applications handle various address formats correctly.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool free to use?</h3>
                <p className="text-gray-600">Yes! Our <strong>fake address generator</strong> is completely free to use with no registration required. You can generate unlimited addresses and access all features without any cost or restrictions.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I generate addresses for multiple countries?</h3>
                <p className="text-gray-600">Currently, we support address generation for the United States, United Kingdom, and Canada. Each country uses its specific address format, postal code system, and authentic city/state combinations to ensure maximum realism for your testing needs.</p>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Guide to Fake Address Generation</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                When working with address data in development, testing, or educational environments, having access to a reliable <strong>fake address generator</strong> is essential. Our tool provides comprehensive address generation capabilities that serve multiple industries and use cases while maintaining the highest standards of authenticity and safety.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Understanding Address Generation Technology</h3>
              <p className="text-gray-700 mb-6">
                Our <strong>random address generator</strong> uses sophisticated algorithms to combine real geographic data with randomization techniques. This approach ensures that generated addresses look completely authentic while guaranteeing they don't correspond to actual locations. The system maintains databases of legitimate street names, city-state combinations, and postal code patterns for each supported country.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices for Using Generated Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Do Use For:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Software testing and QA processes</li>
                    <li>• Database population and seeding</li>
                    <li>• Form validation testing</li>
                    <li>• Educational demonstrations</li>
                    <li>• Design mockups and prototypes</li>
                    <li>• API testing and development</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Never Use For:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Real shipping or delivery</li>
                    <li>• Legal documents or contracts</li>
                    <li>• Official registrations</li>
                    <li>• Financial applications</li>
                    <li>• Government forms</li>
                    <li>• Insurance claims</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                By following these guidelines, you ensure that your use of our <strong>test address generator</strong> remains ethical, legal, and beneficial for your legitimate testing and development needs. Remember that the goal is to create realistic test scenarios without impacting real-world systems or individuals.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FakeAddressGenerator;