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
import { Calculator } from 'lucide-react';

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

const CholesterolRiskCalculator = () => {
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
    <>
      <Helmet>
        <title>Cholesterol Risk Calculator - Assess Cardiovascular Health Risk | DapsiWow</title>
        <meta name="description" content="Calculate your cholesterol levels and cardiovascular disease risk. Get personalized recommendations based on your lipid profile and risk factors." />
        <meta name="keywords" content="cholesterol calculator, cardiovascular risk assessment, heart disease risk, lipid profile, HDL LDL calculator, cholesterol levels" />
        <meta property="og:title" content="Cholesterol Risk Calculator - Assess Cardiovascular Health Risk | DapsiWow" />
        <meta property="og:description" content="Calculate your cholesterol levels and cardiovascular disease risk with personalized recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/cholesterol-risk-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-cholesterol-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-vial text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Cholesterol Risk Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Assess your cardiovascular health risk based on cholesterol levels and other risk factors
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Cholesterol Levels</h2>
                      
                      {/* Unit System */}
                      <div className="space-y-3">
                        <Label>Unit System</Label>
                        <RadioGroup 
                          value={unitSystem} 
                          onValueChange={setUnitSystem}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mgdl" id="mgdl" data-testid="radio-mgdl" />
                            <Label htmlFor="mgdl">mg/dL (US)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mmol" id="mmol" data-testid="radio-mmol" />
                            <Label htmlFor="mmol">mmol/L (International)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Total Cholesterol */}
                      <div className="space-y-3">
                        <Label htmlFor="total" className="text-sm font-medium text-gray-700">
                          Total Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) *
                        </Label>
                        <Input
                          id="total"
                          type="number"
                          value={totalCholesterol}
                          onChange={(e) => setTotalCholesterol(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'mgdl' ? "200" : "5.2"}
                          min="0"
                          step={unitSystem === 'mgdl' ? "1" : "0.1"}
                          data-testid="input-total-cholesterol"
                        />
                      </div>

                      {/* HDL Cholesterol */}
                      <div className="space-y-3">
                        <Label htmlFor="hdl" className="text-sm font-medium text-gray-700">
                          HDL Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) *
                        </Label>
                        <Input
                          id="hdl"
                          type="number"
                          value={hdlCholesterol}
                          onChange={(e) => setHdlCholesterol(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'mgdl' ? "50" : "1.3"}
                          min="0"
                          step={unitSystem === 'mgdl' ? "1" : "0.1"}
                          data-testid="input-hdl-cholesterol"
                        />
                        <p className="text-xs text-gray-500">"Good" cholesterol</p>
                      </div>

                      {/* LDL Cholesterol */}
                      <div className="space-y-3">
                        <Label htmlFor="ldl" className="text-sm font-medium text-gray-700">
                          LDL Cholesterol ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="ldl"
                          type="number"
                          value={ldlCholesterol}
                          onChange={(e) => setLdlCholesterol(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'mgdl' ? "130" : "3.4"}
                          min="0"
                          step={unitSystem === 'mgdl' ? "1" : "0.1"}
                          data-testid="input-ldl-cholesterol"
                        />
                        <p className="text-xs text-gray-500">"Bad" cholesterol - will be calculated if not provided</p>
                      </div>

                      {/* Triglycerides */}
                      <div className="space-y-3">
                        <Label htmlFor="triglycerides" className="text-sm font-medium text-gray-700">
                          Triglycerides ({unitSystem === 'mgdl' ? 'mg/dL' : 'mmol/L'}) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="triglycerides"
                          type="number"
                          value={triglycerides}
                          onChange={(e) => setTriglycerides(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'mgdl' ? "150" : "1.7"}
                          min="0"
                          step={unitSystem === 'mgdl' ? "1" : "0.1"}
                          data-testid="input-triglycerides"
                        />
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Personal Information</h3>

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="45"
                          min="20"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender *
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCholesterolRisk}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Risk
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Additional Risk Factors & Results Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Risk Factors</h2>

                      {/* Smoking */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Current Smoker <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-smoking">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Diabetes <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={diabetes} onValueChange={setDiabetes}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-diabetes">
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
                        <Label className="text-sm font-medium text-gray-700">
                          High Blood Pressure <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={hypertension} onValueChange={setHypertension}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-hypertension">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Family History of Heart Disease <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={familyHistory} onValueChange={setFamilyHistory}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-family-history">
                            <SelectValue placeholder="Select family history" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Results Section */}
                      <div className="bg-gray-50 rounded-xl p-8 mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Risk Assessment</h2>
                        
                        {result ? (
                          <div className="space-y-4" data-testid="cholesterol-results">
                            {/* Cardiovascular Risk */}
                            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">10-Year CVD Risk</span>
                                <span className={`text-xl font-bold ${getRiskColor(result.cardiovascularRisk)}`} data-testid="text-cvd-risk">
                                  {result.riskPercentage}%
                                </span>
                              </div>
                              <p className={`text-sm ${getRiskColor(result.cardiovascularRisk)}`} data-testid="text-risk-category">
                                {result.cardiovascularRisk}
                              </p>
                            </div>

                            {/* Cholesterol Levels */}
                            <div className="bg-white rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">Your Cholesterol Levels</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Total Cholesterol</span>
                                  <div className="text-right">
                                    <div className="font-medium" data-testid="text-total-value">
                                      {formatCholesterolValue(result.totalCholesterol)}
                                    </div>
                                    <div className={`text-xs ${getLevelColor(result.totalCholesterolLevel)}`}>
                                      {result.totalCholesterolLevel}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">HDL (Good) Cholesterol</span>
                                  <div className="text-right">
                                    <div className="font-medium" data-testid="text-hdl-value">
                                      {formatCholesterolValue(result.hdlCholesterol)}
                                    </div>
                                    <div className={`text-xs ${getLevelColor(result.hdlLevel)}`}>
                                      {result.hdlLevel}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">LDL (Bad) Cholesterol</span>
                                  <div className="text-right">
                                    <div className="font-medium" data-testid="text-ldl-value">
                                      {formatCholesterolValue(result.ldlCholesterol)}
                                    </div>
                                    <div className={`text-xs ${getLevelColor(result.ldlLevel)}`}>
                                      {result.ldlLevel}
                                    </div>
                                  </div>
                                </div>
                                {result.triglycerides > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Triglycerides</span>
                                    <div className="text-right">
                                      <div className="font-medium" data-testid="text-triglycerides-value">
                                        {formatCholesterolValue(result.triglycerides)}
                                      </div>
                                      <div className={`text-xs ${getLevelColor(result.triglyceridesLevel)}`}>
                                        {result.triglyceridesLevel}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Risk Factors */}
                            {result.riskFactors.length > 0 && (
                              <div className="bg-orange-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Risk Factors</h3>
                                <div className="space-y-1" data-testid="risk-factors">
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
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
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
                          <div className="text-center py-8" data-testid="no-results">
                            <i className="fas fa-vial text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">Enter your cholesterol levels to assess cardiovascular risk</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Cholesterol</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Types of Cholesterol</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">HDL (High-Density Lipoprotein)</h4>
                          <p className="text-sm text-gray-600">
                            "Good" cholesterol that removes bad cholesterol from arteries and transports it to the liver for disposal. 
                            Higher levels are protective against heart disease.
                          </p>
                          <p className="text-xs text-green-700 mt-2 font-medium">
                            Target: {'>'}40 mg/dL (men), {'>'}50 mg/dL (women)
                          </p>
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">LDL (Low-Density Lipoprotein)</h4>
                          <p className="text-sm text-gray-600">
                            "Bad" cholesterol that can build up in artery walls, forming plaques that narrow arteries and 
                            increase heart disease risk.
                          </p>
                          <p className="text-xs text-red-700 mt-2 font-medium">
                            Target: {'<'}100 mg/dL (optimal), {'<'}70 mg/dL (high risk)
                          </p>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Triglycerides</h4>
                          <p className="text-sm text-gray-600">
                            Type of fat in blood. High levels often accompany low HDL and increase heart disease risk, 
                            especially when combined with other risk factors.
                          </p>
                          <p className="text-xs text-yellow-700 mt-2 font-medium">
                            Target: {'<'}150 mg/dL
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Factors</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Controllable Factors</h4>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Diet high in saturated and trans fats</li>
                            <li>• Lack of physical activity</li>
                            <li>• Obesity and overweight</li>
                            <li>• Smoking</li>
                            <li>• Excessive alcohol consumption</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">Non-Controllable Factors</h4>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Age (men {'>'}45, women {'>'}55)</li>
                            <li>• Gender (men at higher risk before menopause)</li>
                            <li>• Family history of heart disease</li>
                            <li>• Genetic conditions</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">Medical Conditions</h4>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Diabetes</li>
                            <li>• High blood pressure</li>
                            <li>• Metabolic syndrome</li>
                            <li>• Chronic kidney disease</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Improving Your Cholesterol</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Diet Changes</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Choose lean proteins (fish, poultry, legumes)</li>
                        <li>• Increase fiber intake (oats, beans, fruits)</li>
                        <li>• Use healthy fats (olive oil, nuts, avocados)</li>
                        <li>• Limit saturated fats ({'<'}7% of calories)</li>
                        <li>• Avoid trans fats completely</li>
                        <li>• Include omega-3 rich foods</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle Changes</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Exercise 30+ minutes most days</li>
                        <li>• Maintain healthy weight</li>
                        <li>• Quit smoking</li>
                        <li>• Limit alcohol consumption</li>
                        <li>• Manage stress effectively</li>
                        <li>• Get adequate sleep (7-9 hours)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Management</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Regular cholesterol screening</li>
                        <li>• Work with healthcare provider</li>
                        <li>• Consider statins if indicated</li>
                        <li>• Monitor other risk factors</li>
                        <li>• Follow treatment plans consistently</li>
                        <li>• Track progress with regular testing</li>
                      </ul>
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

export default CholesterolRiskCalculator;