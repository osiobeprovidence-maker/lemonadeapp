import React, { useEffect, useState } from 'react';

export interface MuxStatus {
  configured: boolean;
  hasTokenId: boolean;
  error: string | null;
}

export const MuxStatus: React.FC = () => {
  const [status, setStatus] = useState<MuxStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenId = import.meta.env.VITE_MUX_TOKEN_ID;
    const hasTokenId = !!tokenId && tokenId !== 'YOUR_MUX_TOKEN_ID';

    setStatus({
      configured: hasTokenId,
      hasTokenId,
      error: hasTokenId ? null : 'Mux public token ID is not configured',
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800">Checking Mux connection...</p>
      </div>
    );
  }

  if (!status) return null;

  if (status.configured) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">Mux Connected</h3>
        <p className="text-sm text-green-700">
          Mux playback is configured. Upload credentials are checked securely on the server.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
      <h3 className="font-semibold text-red-800 mb-2">Mux Not Configured</h3>
      <p className="text-sm text-red-700 mb-3">{status.error}</p>
      <div className="text-sm text-red-600 space-y-1">
        <div>Token ID: {status.hasTokenId ? 'Set' : 'Missing'}</div>
        <div>Token Secret: checked securely on the server</div>
      </div>
      <pre className="bg-red-100 p-2 mt-3 rounded overflow-auto text-xs">
{`VITE_MUX_TOKEN_ID=your_token_id
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret`}
      </pre>
    </div>
  );
};

export default MuxStatus;
