import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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

  const handleCopyAll = () => {
    if (generatedName) {
      const nameInfo = `Name: ${generatedName.fullName}
First Name: ${generatedName.firstName}
${generatedName.middleName ? `Middle Name: ${generatedName.middleName}\n` : ''}Last Name: ${generatedName.lastName}
Gender: ${generatedName.gender.charAt(0).toUpperCase() + generatedName.gender.slice(1)}
Nationality: ${generatedName.nationality}`;
      navigator.clipboard.writeText(nameInfo);
    }
  };

  // Generate initial name
  useEffect(() => {
    handleGenerateName();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Fake Name Generator - Generate Random Names for Testing | DapsiWow</title>
        <meta name="description" content="Generate realistic fake names for testing purposes. Choose gender, nationality, and customize options to create authentic-looking names instantly." />
        <meta name="keywords" content="fake name generator, random name generator, test names, dummy names, name generator tool, fake identity generator" />
        <meta property="og:title" content="Fake Name Generator - Generate Random Names for Testing" />
        <meta property="og:description" content="Generate realistic fake names with customizable options for testing and development purposes." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/fake-name-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-id-card text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Fake Name Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Generate realistic fake names for testing, development, and privacy protection
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
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generate Options</h2>
                    
                    <div className="space-y-6">
                      {/* Gender Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Gender</Label>
                        <Select 
                          value={options.gender} 
                          onValueChange={(value: 'male' | 'female' | 'both') => updateOption('gender', value)}
                        >
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue />
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
                        <Label className="text-base font-medium">Nationality</Label>
                        <Select 
                          value={options.nationality} 
                          onValueChange={(value: 'american' | 'british' | 'international') => updateOption('nationality', value)}
                        >
                          <SelectTrigger data-testid="select-nationality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="american">American</SelectItem>
                            <SelectItem value="british">British</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Options */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Additional Options</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Include Middle Name</Label>
                              <p className="text-xs text-gray-500">Add a middle name to the generated name</p>
                            </div>
                            <Switch
                              checked={options.includeMiddleName}
                              onCheckedChange={(value) => updateOption('includeMiddleName', value)}
                              data-testid="switch-middle-name"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Include Title</Label>
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

                      {/* Generate Button */}
                      <Button 
                        onClick={handleGenerateName}
                        className="w-full h-12 text-base"
                        data-testid="button-generate-name"
                      >
                        <i className="fas fa-refresh mr-2"></i>
                        Generate New Name
                      </Button>
                    </div>
                  </div>

                  {/* Generated Name Display */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Name</h2>
                    
                    {generatedName && (
                      <div className="space-y-6" data-testid="generated-name-display">
                        {/* Full Name Display */}
                        <div className="bg-blue-50 rounded-lg p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="full-name">
                            {generatedName.fullName}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {generatedName.gender} • {generatedName.nationality}
                          </div>
                        </div>

                        {/* Name Components */}
                        <div className="space-y-4">
                          {generatedName.title && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Title</div>
                                <div className="text-gray-600" data-testid="name-title">{generatedName.title}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedName.title!)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-title"
                              >
                                <i className="fas fa-copy"></i>
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">First Name</div>
                              <div className="text-gray-600" data-testid="first-name">{generatedName.firstName}</div>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(generatedName.firstName)}
                              variant="ghost"
                              size="sm"
                              data-testid="button-copy-first-name"
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
                          </div>

                          {generatedName.middleName && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Middle Name</div>
                                <div className="text-gray-600" data-testid="middle-name">{generatedName.middleName}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(generatedName.middleName!)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-middle-name"
                              >
                                <i className="fas fa-copy"></i>
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Last Name</div>
                              <div className="text-gray-600" data-testid="last-name">{generatedName.lastName}</div>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(generatedName.lastName)}
                              variant="ghost"
                              size="sm"
                              data-testid="button-copy-last-name"
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleCopyToClipboard(generatedName.fullName)}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-copy-full-name"
                          >
                            <i className="fas fa-copy mr-2"></i>
                            Copy Full Name
                          </Button>
                          <Button
                            onClick={handleCopyAll}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-copy-all"
                          >
                            <i className="fas fa-clipboard mr-2"></i>
                            Copy All Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name History */}
                {nameHistory.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Generated Names</h3>
                      <div className="space-y-2">
                        {nameHistory.slice(0, 5).map((name, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900" data-testid={`history-name-${index}`}>
                                {name.fullName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {name.gender} • {name.nationality}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(name.fullName)}
                              variant="ghost"
                              size="sm"
                              data-testid={`button-copy-history-${index}`}
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
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
          {/* What is a Fake Name Generator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Fake Name Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>fake name generator</strong> is a sophisticated tool that creates realistic but completely fictional names for various legitimate purposes including software testing, privacy protection, creative writing, game development, and educational activities. Our advanced <strong>random name generator</strong> uses authentic name databases from different cultures and nationalities to produce believable, culturally appropriate names that maintain statistical accuracy without representing real individuals.
              </p>
              
              <p className="text-gray-700 mb-6">
                This powerful <strong>name generator tool</strong> is essential for developers, writers, researchers, and professionals who need authentic-looking placeholder names for their projects. Whether you're building applications, creating fictional characters, conducting academic research, or protecting your privacy online, our generator provides instant access to realistic names from American, British, and international databases.
              </p>
              
              <p className="text-gray-700 mb-6">
                Unlike simple random generators, our tool intelligently combines first names, middle names, and surnames based on actual naming patterns and cultural conventions. This ensures that generated names sound natural and appropriate for their selected nationality while maintaining complete fictional status for safe, ethical use in any project.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our Fake Name Generator Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Select Options</h3>
                <p className="text-gray-600 text-sm">Choose gender, nationality, and additional preferences like titles and middle names.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Algorithm Processing</h3>
                <p className="text-gray-600 text-sm">Our system intelligently combines names from authentic cultural databases.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Generate Names</h3>
                <p className="text-gray-600 text-sm">Receive realistic, culturally appropriate names with all components.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Copy & Use</h3>
                <p className="text-gray-600 text-sm">Easily copy individual components or complete names for your projects.</p>
              </div>
            </div>
          </div>

          {/* Benefits for Different Audiences */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Different Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Software Developers</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Generate test data for user registration systems</li>
                  <li>• Create realistic database entries for development</li>
                  <li>• Test form validation and user interfaces</li>
                  <li>• Populate demo applications with sample users</li>
                  <li>• Quality assurance and automated testing</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-pen text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Writers & Authors</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Create believable character names for novels</li>
                  <li>• Develop diverse casts with cultural authenticity</li>
                  <li>• Generate names for short stories and scripts</li>
                  <li>• Overcome writer's block with instant inspiration</li>
                  <li>• Maintain consistency in fictional worlds</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Students & Researchers</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Create anonymous survey participants</li>
                  <li>• Generate sample data for academic projects</li>
                  <li>• Protect privacy in research studies</li>
                  <li>• Develop case studies with fictional subjects</li>
                  <li>• Practice data analysis techniques</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-briefcase text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Professionals</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Create customer personas for marketing</li>
                  <li>• Develop training scenarios and examples</li>
                  <li>• Generate sample client lists for presentations</li>
                  <li>• Test CRM systems with dummy contacts</li>
                  <li>• Create realistic business case studies</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-gamepad text-red-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Game Developers</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Generate NPC names for video games</li>
                  <li>• Create diverse character rosters</li>
                  <li>• Populate virtual worlds with realistic inhabitants</li>
                  <li>• Develop culturally appropriate character names</li>
                  <li>• Generate random encounter characters</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy-Conscious Users</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Protect identity during online registrations</li>
                  <li>• Use aliases for social media accounts</li>
                  <li>• Create pen names for creative work</li>
                  <li>• Generate names for testing services</li>
                  <li>• Maintain anonymity in forums and communities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Generator Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customization Options</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Gender Selection:</strong> Choose male, female, or random gender assignment</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Cultural Authenticity:</strong> American, British, and international name databases</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Name Components:</strong> Optional middle names and professional titles</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Format Options:</strong> Full names or individual components</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">User-Friendly Features</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>One-Click Copying:</strong> Instantly copy names to clipboard</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Generation History:</strong> Track recently generated names</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Bulk Generation:</strong> Generate multiple names at once</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-600 mt-1 mr-3"></i>
                    <span><strong>Mobile Optimized:</strong> Works perfectly on all devices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Generator Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="/tools/fake-address-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-map-marker-alt text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Fake Address Generator</h3>
                <p className="text-gray-600 text-sm">Generate realistic addresses for testing and development purposes.</p>
              </a>
              
              <a href="/tools/random-password-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-lock text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Password Generator</h3>
                <p className="text-gray-600 text-sm">Create secure, random passwords with customizable options.</p>
              </a>
              
              <a href="/tools/random-username-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-user text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Username Generator</h3>
                <p className="text-gray-600 text-sm">Generate unique usernames for accounts and online profiles.</p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-paragraph text-red-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Lorem Ipsum Generator</h3>
                <p className="text-gray-600 text-sm">Generate placeholder text for design and development projects.</p>
              </a>
            </div>
          </div>

          {/* Use Cases & Examples */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-World Applications & Examples</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Software Development Scenarios</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">User Registration Testing</h4>
                    <p className="text-gray-600 text-sm">Generate hundreds of realistic names to test user registration forms, database constraints, and user interface validation. Essential for quality assurance and load testing.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Demo Data Population</h4>
                    <p className="text-gray-600 text-sm">Create convincing demo environments with realistic user profiles for client presentations, stakeholder reviews, and product demonstrations.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900">API Testing</h4>
                    <p className="text-gray-600 text-sm">Generate consistent test data for API endpoints, ensuring robust testing of user management systems and data processing workflows.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Creative & Educational Uses</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Character Development</h4>
                    <p className="text-gray-600 text-sm">Authors and screenwriters use our generator to create diverse, culturally authentic character names that enhance story believability and reader engagement.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Academic Research</h4>
                    <p className="text-gray-600 text-sm">Researchers create anonymous participant profiles for studies, ensuring privacy compliance while maintaining realistic data for statistical analysis.</p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Educational Projects</h4>
                    <p className="text-gray-600 text-sm">Students generate sample datasets for database design courses, statistics projects, and computer science assignments requiring realistic personal data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Content - Best Practices */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices for Using Fake Names</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ethical Guidelines</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 mr-3"></i>
                    <span>Always use generated names for legitimate purposes only</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 mr-3"></i>
                    <span>Ensure compliance with privacy laws and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 mr-3"></i>
                    <span>Never use fake names for fraudulent activities</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 mr-3"></i>
                    <span>Respect cultural sensitivity when using international names</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Recommendations</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-3"></i>
                    <span>Generate sufficient variety for comprehensive testing</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-3"></i>
                    <span>Consider cultural context for international applications</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-3"></i>
                    <span>Test edge cases with various name lengths and formats</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-3"></i>
                    <span>Document test data sources for development teams</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are the generated names based on real people?</h3>
                <p className="text-gray-600">No, all generated names are completely fictional. While our tool uses authentic naming patterns and statistical distributions from various cultures, the combinations are entirely random and don't represent actual individuals. This ensures complete safety for testing and development purposes.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use these names for commercial projects?</h3>
                <p className="text-gray-600">Yes, absolutely. Since all generated names are fictional and created through random combinations, you can use them freely for any legitimate purpose including commercial applications, creative works, testing environments, and business projects without any legal concerns.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How culturally accurate are the international names?</h3>
                <p className="text-gray-600">Our international database includes authentic naming patterns from various cultures and regions. We maintain separate databases for different nationalities to ensure cultural appropriateness and linguistic accuracy, though all combinations remain fictional.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between the nationality options?</h3>
                <p className="text-gray-600">American names focus on common US naming patterns, British names use traditional UK conventions, and International includes diverse global names from various cultures. Each database maintains authentic linguistic and cultural characteristics for maximum realism.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how many names I can generate?</h3>
                <p className="text-gray-600">No, you can generate unlimited names using our tool. Whether you need a few names for a small project or hundreds for extensive testing, our generator can handle any volume of requests without restrictions.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you store or track the generated names?</h3>
                <p className="text-gray-600">No, we don't store any generated names on our servers. All name generation happens in your browser, and the recent history feature only maintains names locally in your current session for your convenience.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FakeNameGenerator;