import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Eye, X, Lock, ExternalLink } from 'lucide-react';
import { uploadRecord, getRecords, deleteRecord, downloadRecord } from '../api/auth';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: '', file: null });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data.records);
    } catch (err) {
      setError('Failed to fetch records');
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('type', formData.type);
    data.append('file', formData.file);

    try {
      await uploadRecord(data);
      setMessage('Record uploaded successfully!');
      setShowUpload(false);
      setFormData({ title: '', type: '', file: null });
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(id);
        setMessage('Record deleted successfully');
        fetchRecords();
      } catch (err) {
        setError('Failed to delete record');
        console.error(err);
      }
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const res = await downloadRecord(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('Download started');
    } catch (err) {
      setError('Download failed');
      console.error(err);
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const getFileIcon = (type) => {
    const icons = {
      'Lab Report': '🧪',
      'Imaging': '📸',
      'Prescription': '💊',
      'Document': '📄'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">Securely stored on blockchain with PQC encryption</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)} 
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Upload Record
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="h-5 w-5" /></button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="h-5 w-5" /></button>
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            Upload New Medical Record
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Blood Test Results - Oct 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select record type</option>
                <option value="Lab Report">🧪 Lab Report</option>
                <option value="Imaging">📸 Imaging (X-Ray, MRI, CT)</option>
                <option value="Prescription">💊 Prescription</option>
                <option value="Document">📄 General Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="w-full"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max 50MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Upload & Encrypt
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setShowUpload(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="grid gap-4">
        {records.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Records Yet</h3>
            <p className="text-gray-500">Upload your first medical record to get started</p>
          </div>
        ) : (
          records.map(record => (
            <div key={record._id} className="card hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{getFileIcon(record.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                      {record.encrypted && (
                        <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                          <Lock className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-700 font-semibold">Encrypted</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {record.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Uploaded:</span> {new Date(record.uploadDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-2">
                        <span className="font-medium">Blockchain Hash:</span> {record.blockchainHash}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleView(record)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDownload(record._id, record.fileName)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(record._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Record Details</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Record Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{getFileIcon(selectedRecord.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedRecord.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {selectedRecord.type}
                      </span>
                      {selectedRecord.encrypted && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <Lock className="h-4 w-4" />
                          PQC Encrypted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card bg-gray-50">
                    <p className="text-sm text-gray-600 mb-1">Upload Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRecord.uploadDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="card bg-gray-50">
                    <p className="text-sm text-gray-600 mb-1">File Size</p>
                    <p className="font-semibold text-gray-900">
                      {(selectedRecord.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="card bg-gray-50 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">File Name</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{selectedRecord.fileName}</p>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/>
                    </svg>
                    Blockchain Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-blue-600 break-all">{selectedRecord.blockchainHash}</p>
                        <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Verified on Blockchain</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedRecord._id, selectedRecord.fileName)}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download File
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedRecord._id);
                    setShowViewModal(false);
                  }}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
