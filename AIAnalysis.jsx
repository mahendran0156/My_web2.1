import { useState } from 'react';
import { Brain, Upload, AlertCircle, CheckCircle, TrendingUp, Activity, Heart, Droplet, Wind, Microscope, X } from 'lucide-react';
import { runAIAnalysis } from '../api/auth';
import axios from 'axios';

const AIAnalysis = () => {
  const [analysisType, setAnalysisType] = useState('');
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filePreview, setFilePreview] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const analysisOptions = [
    {
      value: 'risk',
      label: 'Comprehensive Risk Assessment',
      icon: Activity,
      description: 'Complete health risk evaluation across multiple parameters',
      color: 'blue',
      requiresFile: false
    },
    {
      value: 'diagnosis',
      label: 'Disease Prediction',
      icon: Heart,
      description: 'AI-powered disease risk prediction and early detection',
      color: 'red',
      requiresFile: false
    },
    {
      value: 'imaging',
      label: 'Medical Imaging Analysis',
      icon: Wind,
      description: 'Advanced analysis of X-rays, MRI, and CT scans',
      color: 'purple',
      requiresFile: true
    },
    {
      value: 'genomic',
      label: 'Genomic Data Analysis',
      icon: Droplet,
      description: 'Genetic markers and hereditary risk assessment',
      color: 'green',
      requiresFile: false
    },
    {
      value: 'cancer',
      label: 'Cancer Detection',
      icon: Microscope,
      description: 'AI-powered cancer detection from medical images (Benign/Malignant)',
      color: 'pink',
      requiresFile: true,
      imageOnly: true
    }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleCancerDetection = async (formData) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(
        `${API_URL}/predict-cancer`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        }
      );
      
      if (response.data.success) {
        return {
          type: 'cancer',
          predicted_class: response.data.prediction.predicted_class,
          confidence: parseFloat(response.data.prediction.confidence),
          probabilities: {
            benign: parseFloat(response.data.prediction.benign_probability),
            malignant: parseFloat(response.data.prediction.malignant_probability)
          },
          imageUrl: response.data.prediction.imageUrl
        };
      }
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Cancer detection failed');
    }
  };

  const handleAnalysis = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!analysisType) {
      setError('Please select analysis type');
      setLoading(false);
      return;
    }

    const selectedOption = analysisOptions.find(opt => opt.value === analysisType);
    
    if (selectedOption.requiresFile && !file) {
      setError(`This analysis requires a ${selectedOption.imageOnly ? 'medical image' : 'file'} upload`);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    
    try {
      if (analysisType === 'cancer') {
        // Cancer Detection
        if (!file) {
          setError('Please upload a medical image for cancer detection');
          setLoading(false);
          return;
        }
        formData.append('image', file);
        const cancerResult = await handleCancerDetection(formData);
        setResults(cancerResult);
      } else {
        // Regular Health Analysis
        formData.append('analysisType', analysisType);
        if (file) formData.append('file', file);
        
        const res = await runAIAnalysis(formData);
        setResults({ type: 'health', ...res.data.analysis });
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisType('');
    setFile(null);
    setFilePreview(null);
    setResults(null);
    setError('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const getStatusColor = (status) => {
    const colors = {
      'low': 'text-green-600 bg-green-100',
      'moderate': 'text-yellow-600 bg-yellow-100',
      'high': 'text-red-600 bg-red-100',
      'normal': 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">AI-Powered Health Analysis</h1>
        <p className="text-lg text-gray-600">Get intelligent insights from your medical data using advanced AI models</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="h-5 w-5" /></button>
        </div>
      )}

      {!results ? (
        <div className="space-y-6">
          {/* Analysis Type Selection */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              Select Analysis Type
            </h3>
            <form onSubmit={handleAnalysis} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {analysisOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        analysisType === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <input
                        type="radio"
                        name="analysisType"
                        value={option.value}
                        checked={analysisType === option.value}
                        onChange={(e) => setAnalysisType(e.target.value)}
                        className="hidden"
                      />
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          analysisType === option.value 
                            ? `bg-${option.color}-200` 
                            : `bg-${option.color}-100`
                        }`}>
                          <Icon className={`h-6 w-6 text-${option.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          {option.requiresFile && (
                            <span className="inline-block mt-2 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              {option.imageOnly ? '📷 Image Required' : '📎 File Required'}
                            </span>
                          )}
                        </div>
                        {analysisType === option.value && (
                          <CheckCircle className={`h-5 w-5 text-${option.color}-600`} />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* File Upload */}
              {analysisType && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Medical Data {analysisOptions.find(opt => opt.value === analysisType)?.requiresFile && '*'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                      accept={analysisType === 'cancer' ? 'image/png,image/jpeg,image/jpg' : '.csv,.json,.jpg,.jpeg,.png,.pdf'}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        {analysisType === 'cancer' 
                          ? 'Upload Medical Image (PNG, JPG, JPEG)' 
                          : 'Click to upload medical data'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {analysisType === 'cancer' 
                          ? 'Maximum file size: 10MB' 
                          : 'CSV, JSON, Images, or PDF files'}
                      </p>
                    </label>
                    {file && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">Selected:</span> {file.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {filePreview && (
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 animate-fadeIn">
                  <img src={filePreview} alt="Preview" className="w-full max-h-96 object-contain bg-gray-50" />
                </div>
              )}

              <button
                type="submit"
                disabled={!analysisType || loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    {analysisType === 'cancer' ? 'Analyzing Image...' : 'Analyzing Data...'}
                  </>
                ) : (
                  <>
                    <Brain className="h-6 w-6" />
                    {analysisType === 'cancer' ? 'Detect Cancer' : 'Run AI Analysis'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              How It Works
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>Select the type of analysis you want to perform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Upload relevant medical data or images (required for some analyses)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Our advanced AI models will analyze the data using deep learning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <span>Review detailed results and personalized recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {results.type === 'cancer' ? (
            // Cancer Detection Results
            <>
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    Cancer Detection Results
                  </h2>
                  <button onClick={handleReset} className="text-gray-600 hover:text-gray-900 font-semibold">
                    New Analysis
                  </button>
                </div>
                
                {/* Main Result Card */}
                <div className={`p-8 rounded-2xl shadow-xl border-2 ${
                  results.predicted_class === 'benign' 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                }`}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Classification Result
                      </p>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          results.predicted_class === 'benign' 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        } animate-pulse`} />
                        <p className={`text-4xl font-black ${
                          results.predicted_class === 'benign' 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {results.predicted_class.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Confidence Level
                      </p>
                      <p className={`text-5xl font-black ${
                        results.predicted_class === 'benign' 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {results.confidence.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Probability Breakdown */}
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Probability Distribution
                  </h3>
                  
                  {/* Benign Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-3">
                      <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Benign (Non-Cancerous)
                      </span>
                      <span className="text-lg font-black text-green-600">
                        {results.probabilities.benign.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-md"
                        style={{ width: `${results.probabilities.benign}%` }}
                      />
                    </div>
                  </div>

                  {/* Malignant Bar */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Malignant (Cancerous)
                      </span>
                      <span className="text-lg font-black text-red-600">
                        {results.probabilities.malignant.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-md"
                        style={{ width: `${results.probabilities.malignant}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                  <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    Analyze Another Image
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Results
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Health Analysis Results
            <>
              {/* Risk Score Card */}
              <div className={`card ${
                results.riskScore < 30 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' :
                results.riskScore < 60 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' :
                'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Overall Health Risk Score</h3>
                  <button onClick={handleReset} className="text-gray-600 hover:text-gray-900 font-semibold">
                    New Analysis
                  </button>
                </div>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={
                          results.riskScore < 30 ? 'text-green-500' :
                          results.riskScore < 60 ? 'text-yellow-500' :
                          'text-red-500'
                        }
                        strokeWidth="10"
                        strokeDasharray={`${results.riskScore * 3.51} 351`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{results.riskScore}%</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold mb-2 ${
                      results.riskScore < 30 ? 'text-green-700' :
                      results.riskScore < 60 ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {results.riskScore < 30 ? 'Low Risk' :
                       results.riskScore < 60 ? 'Moderate Risk' :
                       'High Risk'}
                    </p>
                    <p className="text-gray-600">
                      Based on comprehensive health data analysis
                    </p>
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  AI Predictions
                </h3>
                <div className="space-y-4">
                  {results.predictions.map((pred, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {pred.status === 'low' || pred.status === 'normal' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{pred.condition}</p>
                            <p className="text-sm text-gray-600">Risk Probability: {pred.probability}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pred.status)}`}>
                          {pred.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            pred.status === 'low' || pred.status === 'normal' ? 'bg-green-500' :
                            pred.status === 'moderate' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: pred.probability }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 pt-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all"
                >
                  New Analysis
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Print Results
                </button>
              </div>
            </>
          )}

          {/* Medical Disclaimer */}
          <div className="card bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-yellow-800 mb-2">Important Medical Disclaimer</p>
                <p className="text-sm text-yellow-700">
                  This AI-powered analysis provides preliminary insights and should not replace professional medical consultation. 
                  Always consult with qualified healthcare professionals for accurate diagnosis, treatment recommendations, and medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
