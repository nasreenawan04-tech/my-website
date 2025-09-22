
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RotateCcw, FileText, BarChart3, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TextSimilarityChecker = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Calculate Jaccard similarity
  const calculateJaccardSimilarity = (str1: string, str2: string) => {
    const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(word => word.length > 0));
    const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(word => word.length > 0));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  };

  // Calculate Cosine similarity
  const calculateCosineSimilarity = (str1: string, str2: string) => {
    const words1 = str1.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const words2 = str2.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    const allWords = [...new Set([...words1, ...words2])];
    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);
    
    const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));
    
    return magnitude1 === 0 || magnitude2 === 0 ? 0 : (dotProduct / (magnitude1 * magnitude2)) * 100;
  };

  // Calculate Levenshtein distance
  const calculateLevenshteinDistance = (str1: string, str2: string) => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 100 : ((maxLength - matrix[str2.length][str1.length]) / maxLength) * 100;
  };

  // Find common phrases
  const findCommonPhrases = (str1: string, str2: string) => {
    const words1 = str1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const phrases = [];
    
    // Find 2-word phrases
    for (let i = 0; i < words1.length - 1; i++) {
      const phrase = `${words1[i]} ${words1[i + 1]}`;
      if (str2.toLowerCase().includes(phrase)) {
        phrases.push({ text: phrase, length: 2 });
      }
    }
    
    // Find 3-word phrases
    for (let i = 0; i < words1.length - 2; i++) {
      const phrase = `${words1[i]} ${words1[i + 1]} ${words1[i + 2]}`;
      if (str2.toLowerCase().includes(phrase)) {
        phrases.push({ text: phrase, length: 3 });
      }
    }
    
    return phrases.sort((a, b) => b.length - a.length).slice(0, 10);
  };

  const analyzeSimilarity = useCallback(() => {
    if (!text1.trim() || !text2.trim()) {
      toast({
        title: "Error",
        description: "Please enter text in both fields to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const jaccardScore = calculateJaccardSimilarity(text1, text2);
      const cosineScore = calculateCosineSimilarity(text1, text2);
      const levenshteinScore = calculateLevenshteinDistance(text1, text2);
      const averageScore = (jaccardScore + cosineScore + levenshteinScore) / 3;
      const commonPhrases = findCommonPhrases(text1, text2);
      
      // Word analysis
      const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      const uniqueWords1 = new Set(words1);
      const uniqueWords2 = new Set(words2);
      const commonWords = [...uniqueWords1].filter(word => uniqueWords2.has(word));
      
      const analysisResults = {
        scores: {
          jaccard: Math.round(jaccardScore * 100) / 100,
          cosine: Math.round(cosineScore * 100) / 100,
          levenshtein: Math.round(levenshteinScore * 100) / 100,
          average: Math.round(averageScore * 100) / 100
        },
        statistics: {
          text1Length: text1.length,
          text2Length: text2.length,
          text1Words: words1.length,
          text2Words: words2.length,
          commonWords: commonWords.length,
          commonPhrases: commonPhrases.length,
          uniqueWords1: uniqueWords1.size,
          uniqueWords2: uniqueWords2.size
        },
        commonPhrases,
        commonWords: commonWords.slice(0, 20),
        interpretation: getSimilarityInterpretation(averageScore)
      };
      
      setResults(analysisResults);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Similarity score: ${Math.round(averageScore)}%`,
      });
    }, 1000);
  }, [text1, text2, toast]);

  const getSimilarityInterpretation = (score: number) => {
    if (score >= 80) return { level: 'Very High', color: 'bg-red-500', description: 'The texts are highly similar and may indicate significant overlap or potential plagiarism.' };
    if (score >= 60) return { level: 'High', color: 'bg-orange-500', description: 'The texts share substantial similarities and common elements.' };
    if (score >= 40) return { level: 'Moderate', color: 'bg-yellow-500', description: 'The texts have moderate similarities with some shared content.' };
    if (score >= 20) return { level: 'Low', color: 'bg-blue-500', description: 'The texts have limited similarities but share some common elements.' };
    return { level: 'Very Low', color: 'bg-green-500', description: 'The texts are quite different with minimal overlap.' };
  };

  const handleClear = () => {
    setText1('');
    setText2('');
    setResults(null);
  };

  const handleCopyResults = () => {
    if (!results) return;
    
    const resultText = `Text Similarity Analysis Results:
    
Overall Similarity: ${results.scores.average}% (${results.interpretation.level})
Jaccard Similarity: ${results.scores.jaccard}%
Cosine Similarity: ${results.scores.cosine}%
Levenshtein Similarity: ${results.scores.levenshtein}%

Statistics:
- Text 1: ${results.statistics.text1Length} characters, ${results.statistics.text1Words} words
- Text 2: ${results.statistics.text2Length} characters, ${results.statistics.text2Words} words
- Common Words: ${results.statistics.commonWords}
- Common Phrases: ${results.statistics.commonPhrases}

Generated by DapsiWow Text Similarity Checker`;
    
    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied to Clipboard",
      description: "Analysis results copied successfully.",
    });
  };

  const handleExport = () => {
    if (!results) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      analysis: results,
      texts: {
        text1: text1.substring(0, 100) + (text1.length > 100 ? '...' : ''),
        text2: text2.substring(0, 100) + (text2.length > 100 ? '...' : '')
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-similarity-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Analysis results exported successfully.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Text Similarity Checker - Compare Two Texts | DapsiWow</title>
        <meta name="description" content="Compare text similarity with advanced algorithms. Check for plagiarism, content overlap, and text matching using Jaccard, Cosine, and Levenshtein distance methods. Free online text comparison tool." />
        <meta name="keywords" content="text similarity checker, plagiarism checker, text comparison, content similarity, text matching, duplicate content checker, text analysis tool" />
        <link rel="canonical" href="/tools/text-similarity-checker" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <ToolHeroSection
          title="Text Similarity Checker"
          description="Compare two texts using advanced similarity algorithms to detect overlap, similarities, and potential plagiarism with detailed analysis and scoring."
        />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Text 1
                  </CardTitle>
                  <CardDescription>
                    Paste or type the first text you want to compare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your first text here..."
                    value={text1}
                    onChange={(e) => setText1(e.target.value)}
                    className="min-h-[200px] resize-none"
                    maxLength={10000}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{text1.length}/10,000 characters</span>
                    <span>{text1.split(/\s+/).filter(word => word.length > 0).length} words</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Text 2
                  </CardTitle>
                  <CardDescription>
                    Paste or type the second text you want to compare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your second text here..."
                    value={text2}
                    onChange={(e) => setText2(e.target.value)}
                    className="min-h-[200px] resize-none"
                    maxLength={10000}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{text2.length}/10,000 characters</span>
                    <span>{text2.split(/\s+/).filter(word => word.length > 0).length} words</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button 
                onClick={analyzeSimilarity}
                disabled={isAnalyzing || !text1.trim() || !text2.trim()}
                className="flex items-center gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Compare Texts
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Results Section */}
            {results && (
              <div className="space-y-6">
                {/* Overall Similarity Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Overall Similarity</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyResults}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold mb-2">
                        {results.scores.average}%
                      </div>
                      <Badge className={`${results.interpretation.color} text-white`}>
                        {results.interpretation.level} Similarity
                      </Badge>
                      <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                        {results.interpretation.description}
                      </p>
                    </div>
                    <Progress value={results.scores.average} className="w-full h-3" />
                  </CardContent>
                </Card>

                <Tabs defaultValue="scores" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="scores">Similarity Scores</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="phrases">Common Phrases</TabsTrigger>
                    <TabsTrigger value="words">Common Words</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scores">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Jaccard Similarity</CardTitle>
                          <CardDescription>Based on shared unique words</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">{results.scores.jaccard}%</div>
                          <Progress value={results.scores.jaccard} className="h-2" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Cosine Similarity</CardTitle>
                          <CardDescription>Based on word frequency vectors</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">{results.scores.cosine}%</div>
                          <Progress value={results.scores.cosine} className="h-2" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Character Similarity</CardTitle>
                          <CardDescription>Based on character differences</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">{results.scores.levenshtein}%</div>
                          <Progress value={results.scores.levenshtein} className="h-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="statistics">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{results.statistics.text1Words}</div>
                            <div className="text-sm text-gray-600">Text 1 Words</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{results.statistics.text2Words}</div>
                            <div className="text-sm text-gray-600">Text 2 Words</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{results.statistics.commonWords}</div>
                            <div className="text-sm text-gray-600">Common Words</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{results.statistics.commonPhrases}</div>
                            <div className="text-sm text-gray-600">Common Phrases</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="phrases">
                    <Card>
                      <CardHeader>
                        <CardTitle>Common Phrases Found</CardTitle>
                        <CardDescription>Multi-word phrases that appear in both texts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {results.commonPhrases.length > 0 ? (
                          <div className="space-y-2">
                            {results.commonPhrases.map((phrase: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">"{phrase.text}"</span>
                                <Badge variant="secondary">{phrase.length} words</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No common phrases found between the texts.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="words">
                    <Card>
                      <CardHeader>
                        <CardTitle>Common Words</CardTitle>
                        <CardDescription>Individual words that appear in both texts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {results.commonWords.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {results.commonWords.map((word: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-sm">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No common words found between the texts.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Information Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>How Text Similarity Works</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>Our text similarity checker uses three advanced algorithms:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Jaccard Similarity:</strong> Measures overlap between unique word sets</li>
                    <li><strong>Cosine Similarity:</strong> Analyzes word frequency patterns and vector angles</li>
                    <li><strong>Character Similarity:</strong> Compares texts at the character level using edit distance</li>
                  </ul>
                  <p>The final score is an average of all three methods, providing a comprehensive similarity assessment.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Use Cases & Applications</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Plagiarism Detection:</strong> Check for copied content in academic or professional work</li>
                    <li><strong>Content Comparison:</strong> Compare versions of documents or articles</li>
                    <li><strong>Duplicate Detection:</strong> Find similar content across multiple sources</li>
                    <li><strong>Quality Control:</strong> Ensure originality in writing and content creation</li>
                    <li><strong>Research Analysis:</strong> Compare research papers or literature reviews</li>
                    <li><strong>SEO Optimization:</strong> Avoid duplicate content penalties</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* SEO Content */}
            <div className="mt-12 prose prose-lg max-w-none">
              <h2>Advanced Text Similarity Analysis Tool</h2>
              <p>
                The DapsiWow Text Similarity Checker is a comprehensive tool designed to analyze and compare two texts using multiple 
                sophisticated algorithms. Whether you're checking for plagiarism, comparing document versions, or analyzing content 
                overlap, our tool provides accurate and detailed similarity assessments.
              </p>

              <h3>Key Features of Our Text Similarity Checker</h3>
              <p>
                Our tool employs three distinct similarity measurement methods to provide the most accurate results possible. 
                The Jaccard similarity algorithm focuses on unique word overlap, making it excellent for detecting shared vocabulary. 
                The Cosine similarity method analyzes word frequency patterns, providing insights into stylistic similarities. 
                Finally, our character-level analysis using Levenshtein distance captures even subtle textual differences.
              </p>

              <h3>Professional Applications</h3>
              <p>
                This text similarity checker serves various professional and academic needs. Educators can use it to detect potential 
                plagiarism in student submissions, while content creators can ensure their work is original. Researchers benefit from 
                comparing literature and identifying overlapping themes, and SEO professionals can avoid duplicate content issues that 
                might harm search rankings.
              </p>

              <h3>Understanding Similarity Scores</h3>
              <p>
                Our tool provides similarity scores ranging from 0% to 100%, with higher percentages indicating greater similarity. 
                Scores above 80% suggest very high similarity that may warrant further investigation, while scores below 20% indicate 
                largely original or distinct content. The tool also identifies common phrases and shared vocabulary to help you 
                understand exactly where similarities occur.
              </p>

              <h3>Why Choose Our Text Similarity Checker?</h3>
              <p>
                Unlike simple word-counting tools, our similarity checker uses advanced algorithms that consider context, word 
                frequency, and character-level differences. The results include detailed breakdowns of common phrases, shared 
                vocabulary, and statistical analysis. With support for texts up to 10,000 characters each, you can analyze 
                substantial documents while receiving immediate, actionable results.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TextSimilarityChecker;
