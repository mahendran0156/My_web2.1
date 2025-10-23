import { Link } from 'react-router-dom';
import { Shield, Lock, Brain, Cloud, Activity, Database, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Privacy-Preserving <span className="text-blue-600">AI-Driven</span>
            <br />E-Health Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure your medical data with blockchain technology and post-quantum cryptography 
            while leveraging AI for intelligent health insights
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Go to Dashboard
                </Link>
                <Link to="/ai-analysis" className="btn-secondary text-lg px-8 py-4">
                  AI Analysis
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Blockchain Security</h3>
              <p className="text-gray-600">
                Immutable medical records stored on decentralized blockchain network
              </p>
            </div>
            
            <div className="card text-center">
              <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Post-Quantum Encryption</h3>
              <p className="text-gray-600">
                Advanced Kyber-768 and CRYSTALS-Dilithium algorithms for future-proof security
              </p>
            </div>
            
            <div className="card text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Machine learning models for diagnosis prediction and health monitoring
              </p>
            </div>
            
            <div className="card text-center">
              <Cloud className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Cloud Integration</h3>
              <p className="text-gray-600">
                Scalable cloud infrastructure for reliable data access
              </p>
            </div>
            
            <div className="card text-center">
              <Activity className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Live health metrics tracking and instant alerts
              </p>
            </div>
            
            <div className="card text-center">
              <Database className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Privacy Preservation</h3>
              <p className="text-gray-600">
                Zero-knowledge proofs and homomorphic encryption
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SecureHealth?</h2>
          <div className="space-y-4">
            {[
              'Military-grade encryption with post-quantum security',
              'HIPAA compliant data storage and transmission',
              'AI-powered health insights and predictions',
              'Decentralized blockchain for data integrity',
              'Complete patient data ownership',
              '24/7 secure access from anywhere'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Health Data?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users protecting their medical information with cutting-edge technology
            </p>
            <Link 
              to="/signup" 
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
