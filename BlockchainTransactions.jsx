import { CheckCircle } from 'lucide-react';

const BlockchainTransactions = () => {
  const transactions = [
    {
      id: 1,
      hash: '0x7f8a9c2b5d...3d2e1f4a6b',
      type: 'Record Upload',
      timestamp: '2025-10-18 08:30:00',
      status: 'confirmed'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blockchain Transactions</h1>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Hash</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b">
                <td className="py-4 px-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </td>
                <td className="py-4 px-4 font-mono text-sm">{tx.hash}</td>
                <td className="py-4 px-4">{tx.type}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlockchainTransactions;
