
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CholesterolResult {
  totalCholesterol: number;
  hdlCholesterol: number;
  ldlCholesterol: number;
  triglycerides: number;
  totalCholesterolLevel: string;
  hdlLevel: string;
  ldlLevel: string;
  triglyceridesLevel: string;
  cardiovascularRisk: string;
  riskPercentage: number;
  riskFactors: string[];
  recommendations: string[];
  targetLevels: {
    totalCholesterol: string;
    ldl: string;
    hdl: string;
    triglycerides: string;
  };
}

export default function CholesterolRiskCalculator() {
  const [unitSystem, setUnitSystem] = useState('mgdl');
  const [totalCholesterol, setTotalCholesterol] = useState('');
  const [hdlCholesterol, setHdlCholesterol] = useState('');
  const [ldlCholesterol, setLdlCholesterol] = useState('');
  const [triglycerides, setTriglycerides] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('');
  const [diabetes, setDiabetes] = useState('');
  const [hypertension, setHypertension] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [result, setResult] = useState<CholesterolResult | null>(null);

  const convertToMgDl = (value: number, fromUnit: string) => {
    if (fromUnit === 'mmol') {
      return value * 38.67; // Convert mmol/L to mg/dL
    }
    return value;
  };

  const convertFromMgDl = (value: number, toUnit: string) => {
    if (toUnit === 'mmol') {
      return value / 38.67; // Convert mg/dL to mmol/L
    }
    return value;
  };

  const calculateCholesterolRisk = () => {
    if (!totalCholesterol || !hdlCholesterol || !age || !gender) return;

    // Convert all values to mg/dL for calculations
    const totalChol = convertToMgDl(parseFloat(totalCholesterol), unitSystem);
    const hdlChol = convertToMgDl(parseFloat(hdlCholesterol), unitSystem);
    const ldlChol = ldlCholesterol ? convertToMgDl(parseFloat(ldlCholesterol), unitSystem) : totalChol - hdlChol - (triglycerides ? convertToMgDl(parseFloat(triglycerides), unitSystem) / 5 : 0);
    const triglyceridesValue = triglycerides ? convertToMgDl(parseFloat(triglycerides), unitSystem) : 0;

    // Assess cholesterol levels
    const getTotalCholesterolLevel = (value: number) => {
      if (value < 200) return 'Desirable';
      if (value < 240) return 'Borderline High';
      return 'High';
    };

    const getHDLLevel = (value: number, gender: string) => {
      if (gender === 'male') {
        if (value < 40) return 'Low';
        if (value >= 60) return 'High (Protective)';
        return 'Normal';
      } else {
        if (value < 50) return 'Low';
        if (value >= 60) return 'High (Protective)';
        return 'Normal';
      }
    };

    const getLDLLevel = (value: number) => {
      if (value < 100) return 'Optimal';
      if (value < 130) return 'Near Optimal';
      if (value < 160) return 'Borderline High';
      if (value < 190) return 'High';
      return 'Very High';
    };

    const getTriglyceridesLevel = (value: number) => {
      if (value < 150) return 'Normal';
      if (value < 200) return 'Borderline High';
      if (value < 500) return 'High';
      return 'Very High';
    };

    // Calculate cardiovascular risk using simplified Framingham Risk Score
    let riskScore = 0;
    const ageValue = parseInt(age);
    const riskFactors: string[] = [];

    // Age points
    if (gender === 'male') {
      if (ageValue >= 20 && ageValue <= 34) riskScore -= 9;
      else if (ageValue >= 35 && ageValue <= 39) riskScore -= 4;
      else if (ageValue >= 40 && ageValue <= 44) riskScore += 0;
      else if (ageValue >= 45 && ageValue <= 49) riskScore += 3;
      else if (ageValue >= 50 && ageValue <= 54) riskScore += 6;
      else if (ageValue >= 55 && ageValue <= 59) riskScore += 8;
      else if (ageValue >= 60 && ageValue <= 64) riskScore += 10;
      else if (ageValue >= 65 && ageValue <= 69) riskScore += 11;
      else if (ageValue >= 70 && ageValue <= 74) riskScore += 12;
      else if (ageValue >= 75) riskScore += 13;
    } else {
      if (ageValue >= 20 && ageValue <= 34) riskScore -= 7;
      else if (ageValue >= 35 && ageValue <= 39) riskScore -= 3;
      else if (ageValue >= 40 && ageValue <= 44) riskScore += 0;
      else if (ageValue >= 45 && ageValue <= 49) riskScore += 3;
      else if (ageValue >= 50 && ageValue <= 54) riskScore += 6;
      else if (ageValue >= 55 && ageValue <= 59) riskScore += 8;
      else if (ageValue >= 60 && ageValue <= 64) riskScore += 10;
      else if (ageValue >= 65 && ageValue <= 69) riskScore += 12;
      else if (ageValue >= 70 && ageValue <= 74) riskScore += 14;
      else if (ageValue >= 75) riskScore += 16;
    }

    // Total cholesterol points
    if (totalChol >= 280) {
      riskScore += gender === 'male' ? 11 : 13;
    } else if (totalChol >= 240) {
      riskScore += gender === 'male' ? 8 : 11;
    } else if (totalChol >= 200) {
      riskScore += gender === 'male' ? 5 : 8;
    }

    // HDL points
    if (hdlChol >= 60) {
      riskScore -= 1;
    } else if (hdlChol < 40) {
      riskScore += gender === 'male' ? 2 : 1;
      riskFactors.push('Low HDL cholesterol');
    }

    // Additional risk factors
    if (smokingStatus === 'yes') {
      riskScore += gender === 'male' ? 8 : 9;
      riskFactors.push('Current smoking');
    }

    if (diabetes === 'yes') {
      riskScore += gender === 'male' ? 6 : 6;
      riskFactors.push('Diabetes');
    }

    if (hypertension === 'yes') {
      riskScore += gender === 'male' ? 1 : 2;
      riskFactors.push('High blood pressure');
    }

    if (familyHistory === 'yes') {
      riskScore += 2;
      riskFactors.push('Family history of heart disease');
    }

    if (totalChol >= 240) riskFactors.push('High total cholesterol');
    if (ldlChol >= 160) riskFactors.push('High LDL cholesterol');
    if (triglyceridesValue >= 200) riskFactors.push('High triglycerides');

    // Convert risk score to percentage (simplified)
    let riskPercentage = 0;
    let cardiovascularRisk = '';

    if (riskScore < 0) {
      riskPercentage = 1;
      cardiovascularRisk = 'Very Low Risk';
    } else if (riskScore < 9) {
      riskPercentage = 2;
      cardiovascularRisk = 'Low Risk';
    } else if (riskScore < 12) {
      riskPercentage = 6;
      cardiovascularRisk = 'Moderate Risk';
    } else if (riskScore < 16) {
      riskPercentage = 12;
      cardiovascularRisk = 'High Risk';
    } else {
      riskPercentage = 25;
      cardiovascularRisk = 'Very High Risk';
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (ldlChol >= 160 || totalChol >= 240) {
      recommendations.push('Consult with a healthcare provider about cholesterol-lowering medications');
    }

    if (ldlChol >= 130) {
      recommendations.push('Follow a heart-healthy diet low in saturated and trans fats');
    }

    if (hdlChol < (gender === 'male' ? 40 : 50)) {
      recommendations.push('Increase physical activity to raise HDL cholesterol');
    }

    if (triglyceridesValue >= 150) {
      recommendations.push('Reduce simple carbohydrates and lose weight if overweight');
    }

    if (smokingStatus === 'yes') {
      recommendations.push('Quit smoking - this is the most important change you can make');
    }

    if (riskPercentage < 6) {
      recommendations.push('Maintain healthy lifestyle with regular exercise and balanced diet');
      recommendations.push('Continue annual cholesterol monitoring');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue maintaining your healthy cholesterol levels');
      recommendations.push('Regular monitoring and healthy lifestyle maintenance');
    }

    // Target levels based on risk
    const targetLevels = {
      totalCholesterol: riskPercentage >= 12 ? '< 200 mg/dL' : '< 200 mg/dL',
      ldl: riskPercentage >= 12 ? '< 70 mg/dL' : riskPercentage >= 6 ? '< 100 mg/dL' : '< 130 mg/dL',
      hdl: gender === 'male' ? '> 40 mg/dL' : '> 50 mg/dL',
      triglycerides: '< 150 mg/dL'
    };

    setResult({
      totalCholesterol: unitSystem === 'mgdl' ? totalChol : convertFromMgDl(totalChol, unitSystem),
      hdlCholesterol: unitSystem === 'mgdl' ? hdlChol : convertFromMgDl(hdlChol, unitSystem),
      ldlCholesterol: unitSystem === 'mgdl' ? ldlChol : convertFromMgDl(ldlChol, unitSystem),
      triglycerides: unitSystem === 'mgdl' ? triglyceridesValue : convertFromMgDl(triglyceridesValue, unitSystem),
      totalCholesterolLevel: getTotalCholesterolLevel(totalChol),
      hdlLevel: getHDLLevel(hdlChol, gender),
      ldlLevel: getLDLLevel(ldlChol),
      triglyceridesLevel: getTriglyceridesLevel(triglyceridesValue),
      cardiovascularRisk,
      riskPercentage,
      riskFactors,
      recommendations,
      targetLevels
    });
  };

  const resetCalculator = () => {
    setTotalCholesterol('');
    setHdlCholesterol('');
    setLdlCholesterol('');
    setTriglycerides('');
    setAge('');
    setGender('');
    setSmokingStatus('');
    setDiabetes('');
    setHypertension('');
    setFamilyHistory('');
    setUnitSystem('mgdl');
    setResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very Low Risk':
      case 'Low Risk':
        return 'text-green-600';
      case 'Moderate Risk':
        return 'text-yellow-600';
      case 'High Risk':
        return 'text-orange-600';
      case 'Very High Risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLevelColor = (level: string) => {
    if (level.includes('Desirable') || level.includes('Optimal') || level.includes('Normal') || level.includes('Protective')) {
      return 'text-green-600';
    }
    if (level.includes('Borderline') || level.includes('Near')) {
      return 'text-yellow-600';
    }
    if (level.includes('Low') && !level.includes('Very')) {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  const formatCholesterolValue = (value: number) => {
    const unit = unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L';
    return `${value.toFixed(unitSystem === 'mgdl' ? 0 : 1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Cholesterol Risk Calculator - Free Cardiovascular Risk Assessment | DapsiWow</title>
        <meta name="description" content="Free cholesterol risk calculator to assess your cardiovascular disease risk. Calculate HDL, LDL cholesterol levels and get personalized heart health recommendations with Framingham Risk Score." />
        <meta name="keywords" content="cholesterol calculator, cardiovascular risk assessment, heart disease risk, lipid profile calculator, HDL LDL calculator, cholesterol levels, framingham risk score, heart health assessment, cholesterol screening tool" />
        <meta property="og:title" content="Cholesterol Risk Calculator - Free Cardiovascular Risk Assessment | DapsiWow" />
        <meta property="og:description" content="Calculate your cholesterol levels and cardiovascular disease risk with personalized recommendations. Free online tool with HDL, LDL analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/cholesterol-risk-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Cholesterol Risk Calculator",
            "description": "Free online cholesterol risk calculator to assess cardiovascular disease risk using lipid profile and personal risk factors. Calculate HDL, LDL cholesterol levels with personalized recommendations.",
            "url": "https://dapsiwow.com/tools/cholesterol-risk-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate cardiovascular risk percentage",
              "HDL and LDL cholesterol analysis",
              "Support for mg/dL and mmol/L units",
              "Framingham Risk Score calculation",
              "Personalized health recommendations",
              "Risk factor assessment"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-red-200">
                <span className="text-sm font-medium text-red-700">Professional Cholesterol Assessment</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Cholesterol Risk
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Assess your cardiovascular health risk with comprehensive cholesterol analysis and personalized recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment</h2>
                    <p className="text-gray-600">Enter your cholesterol levels and health information for risk analysis</p>
                  </div>
                  
                  {/* Unit System */}
                  <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
                    <RadioGroup 
                      value={unitSystem} 
                      onValueChange={setUnitSystem}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="mgdl" id="mgdl" data-testid="radio-mgdl" />
                        <Label htmlFor="mgdl" className="text-base">mg/dL (US Standard)</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="mmol" id="mmol" data-testid="radio-mmol" />
                        <Label htmlFor="mmol" className="text-base">mmol/L (International)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Cholesterol */}
                    <div className="space-y-3">
                      <Label htmlFor="total" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Total Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) *
                      </Label>
                      <Input
                        id="total"
                        type="number"
                        value={totalCholesterol}
                        onChange={(e) => setTotalCholesterol(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder={unitSystem === 'mgdl' ? "200" : "5.2"}
                        min="0"
                        step={unitSystem === 'mgdl' ? "1" : "0.1"}
                        data-testid="input-total-cholesterol"
                      />
                    </div>

                    {/* HDL Cholesterol */}
                    <div className="space-y-3">
                      <Label htmlFor="hdl" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        HDL Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) *
                      </Label>
                      <Input
                        id="hdl"
                        type="number"
                        value={hdlCholesterol}
                        onChange={(e) => setHdlCholesterol(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder={unitSystem === 'mgdl' ? "50" : "1.3"}
                        min="0"
                        step={unitSystem === 'mgdl' ? "1" : "0.1"}
                        data-testid="input-hdl-cholesterol"
                      />
                      <p className="text-sm text-gray-500">"Good" cholesterol</p>
                    </div>

                    {/* LDL Cholesterol */}
                    <div className="space-y-3">
                      <Label htmlFor="ldl" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        LDL Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'})
                      </Label>
                      <Input
                        id="ldl"
                        type="number"
                        value={ldlCholesterol}
                        onChange={(e) => setLdlCholesterol(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder={unitSystem === 'mgdl' ? "130" : "3.4"}
                        min="0"
                        step={unitSystem === 'mgdl' ? "1" : "0.1"}
                        data-testid="input-ldl-cholesterol"
                      />
                      <p className="text-sm text-gray-500">"Bad" cholesterol - calculated if not provided</p>
                    </div>

                    {/* Triglycerides */}
                    <div className="space-y-3">
                      <Label htmlFor="triglycerides" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Triglycerides ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'})
                      </Label>
                      <Input
                        id="triglycerides"
                        type="number"
                        value={triglycerides}
                        onChange={(e) => setTriglycerides(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder={unitSystem === 'mgdl' ? "150" : "1.7"}
                        min="0"
                        step={unitSystem === 'mgdl' ? "1" : "0.1"}
                        data-testid="input-triglycerides"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years) *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder="45"
                        min="20"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender *
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Additional Risk Factors</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Smoking */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Current Smoker
                        </Label>
                        <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-smoking">
                            <SelectValue placeholder="Select smoking status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diabetes */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Diabetes
                        </Label>
                        <Select value={diabetes} onValueChange={setDiabetes}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-diabetes">
                            <SelectValue placeholder="Select diabetes status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hypertension */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          High Blood Pressure
                        </Label>
                        <Select value={hypertension} onValueChange={setHypertension}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-hypertension">
                            <SelectValue placeholder="Select blood pressure status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Family History */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Family History of Heart Disease
                        </Label>
                        <Select value={familyHistory} onValueChange={setFamilyHistory}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-family-history">
                            <SelectValue placeholder="Select family history" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCholesterolRisk}
                      className="flex-1 h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Risk
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-red-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Risk Assessment</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="cholesterol-results">
                      {/* Cardiovascular Risk Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">10-Year CVD Risk</div>
                        <div className={`text-4xl font-bold ${getRiskColor(result.cardiovascularRisk)}`} data-testid="text-cvd-risk">
                          {result.riskPercentage}%
                        </div>
                        <div className={`text-lg font-medium mt-2 ${getRiskColor(result.cardiovascularRisk)}`} data-testid="text-risk-category">
                          {result.cardiovascularRisk}
                        </div>
                      </div>

                      {/* Cholesterol Levels Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Cholesterol</span>
                            <div className="text-right">
                              <div className="font-bold text-gray-900" data-testid="text-total-value">
                                {formatCholesterolValue(result.totalCholesterol)}
                              </div>
                              <div className={`text-sm ${getLevelColor(result.totalCholesterolLevel)}`}>
                                {result.totalCholesterolLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">HDL (Good) Cholesterol</span>
                            <div className="text-right">
                              <div className="font-bold text-gray-900" data-testid="text-hdl-value">
                                {formatCholesterolValue(result.hdlCholesterol)}
                              </div>
                              <div className={`text-sm ${getLevelColor(result.hdlLevel)}`}>
                                {result.hdlLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">LDL (Bad) Cholesterol</span>
                            <div className="text-right">
                              <div className="font-bold text-gray-900" data-testid="text-ldl-value">
                                {formatCholesterolValue(result.ldlCholesterol)}
                              </div>
                              <div className={`text-sm ${getLevelColor(result.ldlLevel)}`}>
                                {result.ldlLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                        {result.triglycerides > 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Triglycerides</span>
                              <div className="text-right">
                                <div className="font-bold text-gray-900" data-testid="text-triglycerides-value">
                                  {formatCholesterolValue(result.triglycerides)}
                                </div>
                                <div className={`text-sm ${getLevelColor(result.triglyceridesLevel)}`}>
                                  {result.triglyceridesLevel}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Risk Factors */}
                      {result.riskFactors.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                          <h4 className="font-bold text-orange-800 mb-4 text-lg">Risk Factors</h4>
                          <div className="space-y-2" data-testid="risk-factors">
                            {result.riskFactors.map((factor, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-orange-600 mr-2 mt-1">⚠</span>
                                <span className="text-sm text-gray-600">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Recommendations</h4>
                        <div className="space-y-2" data-testid="recommendations">
                          {result.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span className="text-sm text-gray-600">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">❤</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your cholesterol levels to assess cardiovascular risk</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Cholesterol</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Cholesterol is a waxy, fat-like substance found in your blood that your body needs to build healthy cells. 
                    However, high levels of cholesterol can increase your risk of heart disease and stroke. Our cholesterol 
                    risk calculator helps you understand your cardiovascular risk based on your lipid profile and other health factors.
                  </p>
                  <p>
                    The calculator analyzes your total cholesterol, HDL (good) cholesterol, LDL (bad) cholesterol, and 
                    triglycerides to provide a comprehensive cardiovascular risk assessment. This tool uses established 
                    medical guidelines and the Framingham Risk Score to estimate your 10-year risk of developing cardiovascular disease.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Cholesterol</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">HDL (High-Density Lipoprotein)</h4>
                    <p className="text-sm">"Good" cholesterol that removes bad cholesterol from arteries and transports it to the liver for disposal.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">LDL (Low-Density Lipoprotein)</h4>
                    <p className="text-sm">"Bad" cholesterol that can build up in artery walls, forming plaques that narrow arteries.</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Triglycerides</h4>
                    <p className="text-sm">Type of fat in blood. High levels often accompany low HDL and increase heart disease risk.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use This Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enter your recent cholesterol test results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Choose between mg/dL (US) or mmol/L (international) units</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Provide your age and gender for accurate risk calculation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Include additional risk factors for comprehensive assessment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Get personalized recommendations based on your results</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Optimal Cholesterol Levels</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Total Cholesterol</h4>
                    <p className="text-sm text-green-700">Less than 200 mg/dL (5.2 mmol/L) is desirable</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">HDL Cholesterol</h4>
                    <p className="text-sm text-blue-700">40+ mg/dL (1.0+ mmol/L) for men, 50+ mg/dL (1.3+ mmol/L) for women</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">LDL Cholesterol</h4>
                    <p className="text-sm text-orange-700">Less than 100 mg/dL (2.6 mmol/L) is optimal</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Triglycerides</h4>
                    <p className="text-sm text-purple-700">Less than 150 mg/dL (1.7 mmol/L) is normal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Risk Factors Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Cardiovascular Risk Factors</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Modifiable Risk Factors</h4>
                      <div className="space-y-3">
                        <div className="bg-red-50 rounded-lg p-3">
                          <h5 className="font-medium text-red-800 mb-1">High Cholesterol</h5>
                          <p className="text-sm text-red-700">Elevated LDL and low HDL cholesterol levels</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <h5 className="font-medium text-orange-800 mb-1">Smoking</h5>
                          <p className="text-sm text-orange-700">Damages blood vessels and accelerates atherosclerosis</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <h5 className="font-medium text-yellow-800 mb-1">High Blood Pressure</h5>
                          <p className="text-sm text-yellow-700">Forces heart to work harder and damages arteries</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <h5 className="font-medium text-purple-800 mb-1">Diabetes</h5>
                          <p className="text-sm text-purple-700">High blood sugar damages blood vessels over time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Non-Modifiable Risk Factors</h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-800 mb-1">Age</h5>
                          <p className="text-sm text-gray-700">Men 45+, women 55+ have increased risk</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h5 className="font-medium text-blue-800 mb-1">Gender</h5>
                          <p className="text-sm text-blue-700">Men generally at higher risk before menopause</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <h5 className="font-medium text-green-800 mb-1">Family History</h5>
                          <p className="text-sm text-green-700">Genetic predisposition to heart disease</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <h5 className="font-medium text-indigo-800 mb-1">Race/Ethnicity</h5>
                          <p className="text-sm text-indigo-700">Certain populations have higher cardiovascular risk</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heart-Healthy Lifestyle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Dietary Changes</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Foods to Include:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Fatty fish (salmon, mackerel, sardines)</li>
                        <li>Fiber-rich foods (oats, beans, fruits)</li>
                        <li>Nuts and seeds</li>
                        <li>Olive oil and avocados</li>
                        <li>Plant sterols and stanols</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Foods to Limit:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Saturated fats (red meat, full-fat dairy)</li>
                        <li>Trans fats (processed foods)</li>
                        <li>Refined sugars and carbs</li>
                        <li>Excess sodium</li>
                        <li>Processed and fried foods</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Exercise Guidelines</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 text-sm mb-2">Aerobic Exercise</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>150 minutes moderate intensity per week</li>
                        <li>75 minutes vigorous intensity per week</li>
                        <li>Walking, swimming, cycling, dancing</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 text-sm mb-2">Strength Training</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>2+ days per week</li>
                        <li>All major muscle groups</li>
                        <li>Weight lifting, resistance bands</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Modifications</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="space-y-3">
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-800 text-sm mb-1">Quit Smoking</h4>
                        <p className="text-xs text-red-700">Most important step for cardiovascular health</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-800 text-sm mb-1">Manage Stress</h4>
                        <p className="text-xs text-purple-700">Meditation, yoga, adequate sleep</p>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-800 text-sm mb-1">Weight Management</h4>
                        <p className="text-xs text-orange-700">Maintain healthy BMI (18.5-24.9)</p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-800 text-sm mb-1">Regular Monitoring</h4>
                        <p className="text-xs text-blue-700">Annual cholesterol and blood pressure checks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Management Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Medical Management and Treatment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Cholesterol Medications</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Statins</h5>
                          <p className="text-sm text-blue-700 mb-2">Most commonly prescribed cholesterol-lowering medications</p>
                          <ul className="text-xs text-blue-600 space-y-1">
                            <li>• Block cholesterol production in liver</li>
                            <li>• Reduce LDL by 20-50%</li>
                            <li>• May increase HDL slightly</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2">PCSK9 Inhibitors</h5>
                          <p className="text-sm text-green-700 mb-2">Injectable medications for very high cholesterol</p>
                          <ul className="text-xs text-green-600 space-y-1">
                            <li>• Used when statins aren't effective</li>
                            <li>• Can reduce LDL by 50-60%</li>
                            <li>• Administered twice monthly</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-800 mb-2">Bile Acid Sequestrants</h5>
                          <p className="text-sm text-purple-700 mb-2">Bind to bile acids to lower cholesterol</p>
                          <ul className="text-xs text-purple-600 space-y-1">
                            <li>• Help liver use cholesterol to make bile</li>
                            <li>• Can be combined with statins</li>
                            <li>• May cause digestive side effects</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Monitoring and Follow-up</h4>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h5 className="font-semibold text-red-800 mb-2">Regular Testing</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Lipid panel every 4-6 weeks initially</li>
                            <li>• Every 3-12 months once stable</li>
                            <li>• Liver function tests with statin use</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h5 className="font-semibold text-orange-800 mb-2">Target Goals</h5>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• LDL {'<'} 70 mg/dL for high-risk patients</li>
                            <li>• LDL {'<'} 100 mg/dL for moderate risk</li>
                            <li>• HDL {'>'} 40 mg/dL (men), {'>'} 50 mg/dL (women)</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Side Effect Management</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Monitor for muscle pain with statins</li>
                            <li>• Regular liver enzyme monitoring</li>
                            <li>• Discuss any symptoms with doctor</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I check my cholesterol?</h4>
                      <p className="text-gray-600 text-sm">Adults should have cholesterol checked every 4-6 years starting at age 20. More frequent testing may be needed if you have risk factors or are on medication.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I lower cholesterol without medication?</h4>
                      <p className="text-gray-600 text-sm">Yes, lifestyle changes including diet, exercise, and weight management can significantly lower cholesterol. However, some people may still need medication to reach target levels.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between good and bad cholesterol?</h4>
                      <p className="text-gray-600 text-sm">HDL (good) cholesterol removes excess cholesterol from arteries, while LDL (bad) cholesterol can build up in artery walls, forming dangerous plaques.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there foods that can help lower cholesterol?</h4>
                      <p className="text-gray-600 text-sm">Yes, foods high in soluble fiber (oats, beans), omega-3 fatty acids (fish), and plant sterols (nuts, fortified foods) can help lower cholesterol levels naturally.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this risk calculator?</h4>
                      <p className="text-gray-600 text-sm">This calculator uses established medical formulas like the Framingham Risk Score. However, it's for educational purposes only and shouldn't replace professional medical advice.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my cholesterol is borderline high?</h4>
                      <p className="text-gray-600 text-sm">Borderline high cholesterol (200-239 mg/dL) may require lifestyle changes and closer monitoring. Your doctor will consider your overall risk profile when recommending treatment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do I need to fast before a cholesterol test?</h4>
                      <p className="text-gray-600 text-sm">Fasting is typically required for accurate triglyceride and LDL measurements. Follow your healthcare provider's instructions, usually fasting for 9-12 hours before the test.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can stress affect cholesterol levels?</h4>
                      <p className="text-gray-600 text-sm">Chronic stress can indirectly affect cholesterol by influencing eating habits, physical activity, and sleep patterns. Stress management is an important part of heart health.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prevention and Early Detection */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Prevention and Early Detection</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Prevention Strategies</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-green-800 mb-2">Start Early</h5>
                        <p className="text-sm text-green-700">Heart-healthy habits should begin in childhood and young adulthood to prevent later cardiovascular problems.</p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Know Your Numbers</h5>
                        <p className="text-sm text-blue-700">Regular monitoring of cholesterol, blood pressure, and blood sugar helps identify problems before they become serious.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-purple-800 mb-2">Family Awareness</h5>
                        <p className="text-sm text-purple-700">Understanding your family history helps identify genetic risk factors and guide preventive measures.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Warning Signs</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-red-800 mb-2">Chest Symptoms</h5>
                        <p className="text-sm text-red-700">Chest pain, pressure, or discomfort, especially with physical activity or stress.</p>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-orange-800 mb-2">Shortness of Breath</h5>
                        <p className="text-sm text-orange-700">Difficulty breathing during normal activities or when lying flat.</p>
                      </div>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-yellow-800 mb-2">Other Symptoms</h5>
                        <p className="text-sm text-yellow-700">Fatigue, dizziness, palpitations, or pain in arms, back, neck, or jaw.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ Important: This calculator is for educational purposes only. Always consult with a healthcare professional 
                    for proper diagnosis, treatment, and medical advice. If you experience chest pain or other concerning symptoms, 
                    seek immediate medical attention.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
