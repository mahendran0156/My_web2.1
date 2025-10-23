import { useState, useEffect } from 'react';
import { Shield, Key, Lock } from 'lucide-react';
import { getSecuritySettings, updateSecuritySettings, generateNewKeys } from '../api/auth';

const SecuritySettings = () => {
  const [encryptionAlgo, setEncryptionAlgo] = useState('kyber768');
  const [keyRotation, setKeyRotation] = useState(30);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSecuritySettings();
      setEncryptionAlgo(res.data.settings.encryptionAlgorithm);
      setKeyRotation(res.data.settings.keyRotationDays);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await updateSecuritySettings({ encryptionAlgorithm: encryptionAlgo, keyRotationDays: keyRotation });
      setMessage('Settings saved!');
    } catch (err) {
      setMessage('Save failed');
    }
  };

  const handleGenerateKeys = async () => {
    try {
      await generateNewKeys();
      setMessage('New keys generated!');
    } catch (err) {
      setMessage('Generation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Security Settings</h1>

      {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{message}</div>}

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold">Post-Quantum Cryptography</h3>
            <p className="text-sm text-gray-600">Quantum-safe encryption enabled</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Encryption Algorithm</h3>
        <select
          value={encryptionAlgo}
          onChange={(e) => setEncryptionAlgo(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="kyber768">Kyber-768</option>
          <option value="dilithium">CRYSTALS-Dilithium</option>
          <option value="falcon">FALCON</option>
        </select>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Key Rotation: {keyRotation} days</h3>
        <input
          type="range"
          min="7"
          max="90"
          value={keyRotation}
          onChange={(e) => setKeyRotation(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Key Management</h3>
        <button onClick={handleGenerateKeys} className="w-full btn-primary mb-2">
          Generate New Key Pair
        </button>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">
        Save Settings
      </button>
    </div>
  );
};

export default SecuritySettings;
