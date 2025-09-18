
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface NameOptions {
  gender: 'male' | 'female' | 'both';
  nationality: 'american' | 'british' | 'international';
  includeMiddleName: boolean;
  includeTitle: boolean;
}

interface GeneratedName {
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: string;
  nationality: string;
}

const FakeNameGenerator = () => {
  const [generatedName, setGeneratedName] = useState<GeneratedName | null>(null);
  const [nameHistory, setNameHistory] = useState<GeneratedName[]>([]);
  const [options, setOptions] = useState<NameOptions>({
    gender: 'both',
    nationality: 'american',
    includeMiddleName: true,
    includeTitle: false
  });

  // Name data
  const names = {
    american: {
      male: {
        first: ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan'],
        middle: ['Lee', 'James', 'Michael', 'Robert', 'William', 'David', 'Richard', 'John', 'Thomas', 'Charles', 'Joseph', 'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']
      },
      female: {
        first: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen'],
        middle: ['Anne', 'Marie', 'Rose', 'Lynn', 'Grace', 'Jane', 'Elizabeth', 'Nicole', 'Michelle', 'Christine', 'Renee', 'Catherine', 'Louise', 'Sue', 'Jean', 'Beth', 'Kay', 'Lee', 'Dawn', 'Joy'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']
      }
    },
    british: {
      male: {
        first: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar', 'William', 'James', 'Henry', 'Leo', 'Alfie', 'Joshua', 'Freddie', 'Ethan', 'Archie', 'Isaac', 'Albert', 'Mason', 'Joe', 'Max', 'Harrison', 'Lucas', 'Mohammad', 'Logan', 'Daniel', 'Edward'],
        middle: ['James', 'William', 'Thomas', 'George', 'Charles', 'John', 'Alexander', 'David', 'Michael', 'Robert', 'Edward', 'Henry', 'Daniel', 'Richard', 'Joseph', 'Christopher', 'Matthew', 'Anthony', 'Mark', 'Andrew'],
        last: ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright', 'Green', 'Harris', 'Cooper', 'King', 'Lee', 'Martin', 'Clarke', 'James', 'Morgan', 'Hughes']
      },
      female: {
        first: ['Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria', 'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora'],
        middle: ['Rose', 'Grace', 'May', 'Jane', 'Anne', 'Elizabeth', 'Louise', 'Claire', 'Marie', 'Catherine', 'Victoria', 'Charlotte', 'Amelia', 'Sophie', 'Emily', 'Faith', 'Hope', 'Joy', 'Belle', 'Eve'],
        last: ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright', 'Green', 'Harris', 'Cooper', 'King', 'Lee', 'Martin', 'Clarke', 'James', 'Morgan', 'Hughes']
      }
    },
    international: {
      male: {
        first: ['Ahmed', 'Chen', 'Raj', 'Carlos', 'Pierre', 'Giovanni', 'Hans', 'Dmitri', 'Yuki', 'Paulo', 'Miguel', 'Antonio', 'François', 'Lars', 'Aleksandr', 'Kim', 'Hassan', 'Samir', 'Diego', 'Marco', 'Felipe', 'Andre', 'Jean', 'Klaus', 'Viktor', 'Omar', 'Ali', 'Mehmet', 'Pablo', 'Rico'],
        middle: ['Mohamed', 'Wei', 'Kumar', 'José', 'Marie', 'Antonio', 'Wilhelm', 'Aleksandrovich', 'Takeshi', 'dos Santos', 'Eduardo', 'Luis', 'Claude', 'Erik', 'Dmitrievich', 'Jong', 'Ibrahim', 'Abdul', 'Alejandro', 'Giuseppe'],
        last: ['Khan', 'Wang', 'Patel', 'Rodriguez', 'Dubois', 'Rossi', 'Müller', 'Petrov', 'Tanaka', 'Silva', 'Hernandez', 'Lopez', 'Martin', 'Larsson', 'Volkov', 'Kim', 'Hassan', 'Al-Farsi', 'Morales', 'Ferrari', 'Santos', 'Ramos', 'Leroy', 'Weber', 'Smirnov', 'Park', 'Abdullah', 'Yılmaz', 'Cruz', 'Torres']
      },
      female: {
        first: ['Fatima', 'Wei', 'Priya', 'Maria', 'Sophie', 'Giulia', 'Anna', 'Olga', 'Yuki', 'Ana', 'Carmen', 'Lucia', 'Marie', 'Astrid', 'Natasha', 'Min', 'Amina', 'Layla', 'Valentina', 'Francesca', 'Camila', 'Beatriz', 'Claire', 'Greta', 'Elena', 'Yasmin', 'Nour', 'Elif', 'Esperanza', 'Paloma'],
        middle: ['Zahra', 'Li', 'Devi', 'José', 'Claire', 'Maria', 'Elisabeth', 'Aleksandrovna', 'Mei', 'dos Santos', 'Isabel', 'Fernanda', 'Anne', 'Ingrid', 'Petrovna', 'Hye', 'Khadija', 'Noura', 'Esperanza', 'Teresa'],
        last: ['Khan', 'Wang', 'Patel', 'Rodriguez', 'Dubois', 'Rossi', 'Müller', 'Petrov', 'Tanaka', 'Silva', 'Hernandez', 'Lopez', 'Martin', 'Larsson', 'Volkov', 'Kim', 'Hassan', 'Al-Farsi', 'Morales', 'Ferrari', 'Santos', 'Ramos', 'Leroy', 'Weber', 'Smirnov', 'Park', 'Abdullah', 'Yılmaz', 'Cruz', 'Torres']
      }
    }
  };

  const titles = {
    male: ['Mr.', 'Dr.', 'Prof.'],
    female: ['Ms.', 'Mrs.', 'Dr.', 'Prof.']
  };

  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateName = (opts: NameOptions): GeneratedName => {
    // Determine gender
    let selectedGender: 'male' | 'female';
    if (opts.gender === 'both') {
      selectedGender = Math.random() < 0.5 ? 'male' : 'female';
    } else {
      selectedGender = opts.gender;
    }

    // Get name data for selected nationality
    const nameData = names[opts.nationality][selectedGender];
    
    // Generate names
    const firstName = getRandomItem(nameData.first);
    const lastName = getRandomItem(nameData.last);
    const middleName = opts.includeMiddleName ? getRandomItem(nameData.middle) : undefined;
    const title = opts.includeTitle ? getRandomItem(titles[selectedGender]) : undefined;

    // Build full name
    const nameParts = [];
    if (title) nameParts.push(title);
    nameParts.push(firstName);
    if (middleName) nameParts.push(middleName);
    nameParts.push(lastName);
    const fullName = nameParts.join(' ');

    return {
      title,
      firstName,
      middleName,
      lastName,
      fullName,
      gender: selectedGender,
      nationality: opts.nationality.charAt(0).toUpperCase() + opts.nationality.slice(1)
    };
  };

  const handleGenerateName = () => {
    const newName = generateName(options);
    setGeneratedName(newName);
    
    // Add to history (keep last 10)
    setNameHistory(prev => {
      const updated = [newName, ...prev.filter(n => n.fullName !== newName.fullName)];
      return updated.slice(0, 10);
    });
  };

  const updateOption = <K extends keyof NameOptions>(key: K, value: NameOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setGeneratedName(null);
  };

  const resetGenerator = () => {
    setOptions({
      gender: 'both',
      nationality: 'american',
      includeMiddleName: true,
      includeTitle: false
    });
    setGeneratedName(null);
  };

  // Generate initial name
  useEffect(() => {
    handleGenerateName();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Fake Name Generator - Create Realistic Test Names | DapsiWow</title>
        <meta name="description" content="Generate realistic fake names for testing, development, and privacy purposes. Support for multiple nationalities with customizable options and instant generation." />
        <meta name="keywords" content="fake name generator, random name generator, test name generator, dummy name generator, mock name, name generator tool, testing names, realistic names, privacy protection" />
        <meta property="og:title" content="Fake Name Generator - Create Realistic Test Names | DapsiWow" />
        <meta property="og:description" content="Free fake name generator for developers and testers. Create realistic test names for multiple nationalities with customizable options instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/fake-name-generator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Fake Name Generator",
            "description": "Professional fake name generator for creating realistic test names for development, testing, and privacy purposes with support for multiple nationalities and cultures.",
            "url": "https://dapsiwow.com/tools/fake-name-generator",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Generate names for American, British, and International cultures",
              "Gender selection with male, female, and random options",
              "Customizable name components: titles, middle names",
              "Instant name generation and copying",
              "Realistic test data for developers and testers",
              "Enhances privacy and security in testing"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Name Generator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
                Fake Name
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                Generate realistic test names for development, testing, and privacy protection
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Generation Settings</h2>
                    <p className="text-gray-600">Configure your name generation preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Gender Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="gender-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender
                      </Label>
                      <Select
                        value={options.gender}
                        onValueChange={(value: 'male' | 'female' | 'both') => 
                          updateOption('gender', value)
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both (Random)</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nationality Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="nationality-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Nationality
                      </Label>
                      <Select
                        value={options.nationality}
                        onValueChange={(value: 'american' | 'british' | 'international') => 
                          updateOption('nationality', value)
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-nationality">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="american">American</SelectItem>
                          <SelectItem value="british">British</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Additional Options</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700">Include Middle Name</Label>
                            <p className="text-xs text-gray-500">Add middle name to the generated name</p>
                          </div>
                          <Switch
                            checked={options.includeMiddleName}
                            onCheckedChange={(value) => updateOption('includeMiddleName', value)}
                            data-testid="switch-middle-name"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700">Include Title</Label>
                            <p className="text-xs text-gray-500">Add title like Mr., Mrs., Dr., Prof.</p>
                          </div>
                          <Switch
                            checked={options.includeTitle}
                            onCheckedChange={(value) => updateOption('includeTitle', value)}
                            data-testid="switch-title"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={handleGenerateName}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-generate-name"
                      >
                        Generate Name
                      </Button>
                      <Button
                        onClick={resetGenerator}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Generated Name</h2>

                  {generatedName ? (
                    <div className="space-y-6" data-testid="name-results">
                      {/* Generated Name Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-2xl lg:text-3xl font-bold text-blue-600 text-center mb-2" data-testid="main-name">
                          {generatedName.fullName}
                        </div>
                        <div className="text-sm text-gray-600 text-center capitalize">
                          {generatedName.gender} • {generatedName.nationality}
                        </div>
                      </div>

                      {/* Name Components */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="name-components">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Name Components</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {generatedName.title && (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title</div>
                              <div className="text-sm font-mono text-gray-900">{generatedName.title}</div>
                            </div>
                          )}
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">First Name</div>
                            <div className="text-sm font-mono text-gray-900">{generatedName.firstName}</div>
                          </div>
                          {generatedName.middleName && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Middle Name</div>
                              <div className="text-sm font-mono text-gray-900">{generatedName.middleName}</div>
                            </div>
                          )}
                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Last Name</div>
                            <div className="text-sm font-mono text-gray-900">{generatedName.lastName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={() => handleCopyToClipboard(generatedName.fullName)}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-name"
                        >
                          Copy Name
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">👤</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and generate to see name</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Fake Name Generator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A fake name generator is a professional development tool that creates realistic but 
                    completely fictional names for testing, privacy protection, and development purposes. 
                    These names follow proper naming conventions while ensuring they don't correspond 
                    to real individuals.
                  </p>
                  <p>
                    Our name generator supports multiple nationalities including American, British, 
                    and international names, providing authentic-looking names that are safe for testing 
                    environments, educational projects, and any scenario where real names would be inappropriate.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use This Name Generator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our fake name generator creates realistic test data that follows authentic naming 
                    patterns, making it perfect for form validation testing, database seeding, and software 
                    development workflows without the risk of using real names.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Completely safe for testing and development</li>
                    <li>Multiple nationality formats and naming styles</li>
                    <li>Customizable name components</li>
                    <li>Professional industry-standard tool</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Generator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for American, British, and international names</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gender selection: male, female, or random</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optional middle names and professional titles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cultural authenticity with proper naming patterns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant generation with copy functionality</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Software testing and quality assurance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Database seeding and development workflows</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Creative writing and character development</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Privacy protection and educational projects</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Game development and character creation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Use Cases by Profession */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Fake Name Generator for Different Professionals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Software Developers & Engineers</h4>
                    <p className="text-gray-600">
                      Use generated names for testing user registration systems, API endpoints, and database operations. 
                      Perfect for unit testing, integration testing, and ensuring your applications handle various 
                      name formats correctly without using real user data.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">QA Testers & Analysts</h4>
                    <p className="text-gray-600">
                      Create comprehensive test datasets with realistic name data for testing user registration 
                      flows, contact management systems, and user profile features. Essential for edge case testing 
                      and international name format validation.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Creative Writers & Authors</h4>
                    <p className="text-gray-600">
                      Generate authentic character names for novels, screenplays, and creative projects. Our 
                      international name database helps create diverse, believable characters while maintaining 
                      cultural authenticity in storytelling.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Game Developers & Designers</h4>
                    <p className="text-gray-600">
                      Create realistic NPC names, character rosters, and player profiles for video games. 
                      Generate names that fit different cultural contexts and gaming scenarios while maintaining 
                      immersion and authenticity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Name Format Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">American Names</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Generate US names with authentic first names, middle names, and surnames. 
                      Includes support for common American naming patterns and regional variations.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Popular American first names</li>
                        <li>Traditional middle name options</li>
                        <li>Common American surnames</li>
                        <li>Gender-appropriate selections</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">British Names</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Create UK names with British naming conventions, traditional surnames, and 
                      cultural naming patterns following authentic British standards.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>British first name traditions</li>
                        <li>Traditional UK middle names</li>
                        <li>Common British surnames</li>
                        <li>Cultural naming authenticity</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">International Names</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Generate diverse international names from various cultures and regions, 
                      maintaining authentic linguistic patterns and cultural appropriateness.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Multi-cultural name database</li>
                        <li>Authentic linguistic patterns</li>
                        <li>Regional naming variations</li>
                        <li>Cultural sensitivity maintained</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Best Practices and Safety */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Best Practices and Safety Guidelines</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Recommended Uses</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Software testing and quality assurance workflows</li>
                      <li>Database seeding and development environments</li>
                      <li>Creative writing and character development</li>
                      <li>Educational projects and programming tutorials</li>
                      <li>Game development and NPC creation</li>
                      <li>Privacy protection in testing scenarios</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mb-2 mt-4">Safety Features</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>All names are completely fictional</li>
                      <li>No real person correspondence guaranteed</li>
                      <li>Safe for testing environments</li>
                      <li>Privacy-compliant data generation</li>
                    </ul>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Important Disclaimers</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">Never Use For:</h5>
                      <ul className="space-y-1 text-sm list-disc list-inside text-red-700">
                        <li>Creating fake identities for fraud</li>
                        <li>Legal documents or official forms</li>
                        <li>Financial applications or services</li>
                        <li>Government registrations</li>
                        <li>Any illegal or unethical activities</li>
                        <li>Impersonation of real individuals</li>
                      </ul>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2 mt-4">Compliance Notes</h4>
                    <p className="text-sm">
                      Generated names are designed for testing and development purposes only. Always ensure 
                      your use case complies with applicable privacy laws and regulations in your jurisdiction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are these names based on real people?</h4>
                      <p className="text-gray-600 text-sm">
                        No, all generated names are completely fictional. While our tool uses authentic naming 
                        patterns from various cultures, the combinations are entirely random and don't represent 
                        actual individuals.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use these for commercial projects?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, you can use generated names for legitimate commercial purposes like software testing, 
                        creative writing, and game development. However, never use them for fraudulent activities 
                        or identity deception.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How culturally accurate are the names?</h4>
                      <p className="text-gray-600 text-sm">
                        Our name databases maintain authentic cultural and linguistic patterns for each nationality. 
                        American, British, and international names follow proper naming conventions while remaining 
                        completely fictional.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this tool free to use?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our fake name generator is completely free with no registration required. 
                        Generate unlimited names for all your testing and development needs without restrictions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Which nationalities are supported?</h4>
                      <p className="text-gray-600 text-sm">
                        Currently, we support American, British, and international names. Each category maintains 
                        authentic naming patterns and cultural appropriateness for realistic test data generation.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I customize the name components?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, you can choose gender preferences, add or remove middle names, include professional 
                        titles, and select from different nationality databases to customize your generated names.
                      </p>
                    </div>
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

export default FakeNameGenerator;
