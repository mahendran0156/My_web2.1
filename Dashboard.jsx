import { Activity, FileText, Brain, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ account }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-blue-500 text-white">
          <p className="text-sm mb-2">Total Records</p>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="card bg-purple-500 text-white">
          <p className="text-sm mb-2">AI Analyses</p>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="card bg-green-500 text-white">
          <p className="text-sm mb-2">Blockchain Txs</p>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="card bg-cyan-500 text-white">
          <p className="text-sm mb-2">Security Score</p>
          <p className="text-3xl font-bold">98%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/records" className="card hover:shadow-xl">
          <FileText className="h-10 w-10 text-blue-600 mb-3" />
          <h3 className="font-semibold text-lg">View Records</h3>
          <p className="text-gray-600 text-sm">Access medical history</p>
        </Link>
        <Link to="/ai-analysis" className="card hover:shadow-xl">
          <Brain className="h-10 w-10 text-purple-600 mb-3" />
          <h3 className="font-semibold text-lg">AI Analysis</h3>
          <p className="text-gray-600 text-sm">Get health insights</p>
        </Link>
        <Link to="/security" className="card hover:shadow-xl">
          <Shield className="h-10 w-10 text-green-600 mb-3" />
          <h3 className="font-semibold text-lg">Security Settings</h3>
          <p className="text-gray-600 text-sm">Manage encryption</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
