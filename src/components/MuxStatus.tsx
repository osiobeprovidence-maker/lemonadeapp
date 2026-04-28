import React, { useEffect, useState } from 'react';

/**
 * Mux Connection Status Component
 * Verifies that Mux is properly configured
 */

export interface MuxStatus {
  configured: boolean;
  hasTokenId: boolean;
  hasTokenSecret: boolean;
  error: string | null;
}

export const MuxStatus: React.FC = () => {
  const [status, setStatus] = useState<MuxStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMuxStatus = async () => {
      try {
        const tokenId = import.meta.env.VITE_MUX_TOKEN_ID;
        const tokenSecret = import.meta.env.VITE_MUX_TOKEN_SECRET;

        const hasTokenId = !!tokenId && tokenId !== 'YOUR_MUX_TOKEN_ID';
        const hasTokenSecret = !!tokenSecret && tokenSecret !== 'YOUR_MUX_TOKEN_SECRET';
        const configured = hasTokenId && hasTokenSecret;

        setStatus({
          configured,
          hasTokenId,
          hasTokenSecret,
          error: configured ? null : 'Mux environment variables not properly configured',
        });
      } catch (error) {
        setStatus({
          configured: false,
          hasTokenId: false,
          hasTokenSecret: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    checkMuxStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800">Checking Mux connection...</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.configured) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✓</span>
          <h3 className="font-semibold text-green-800">Mux Connected</h3>
        </div>
        <p className="text-sm text-green-700">
          Mux video integration is properly configured and ready to use.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✗</span>
        <h3 className="font-semibold text-red-800">Mux Not Configured</h3>
      </div>
      <p className="text-sm text-red-700 mb-3">{status.error}</p>
      
      <div className="text-sm text-red-600 space-y-1">
        <div>Token ID: {status.hasTokenId ? '✓ Set' : '✗ Missing'}</div>
        <div>Token Secret: {status.hasTokenSecret ? '✓ Set' : '✗ Missing'}</div>
      </div>

      <div className="mt-3 p-3 bg-red-100 rounded text-xs">
        <p className="font-semibold mb-2">Setup Instructions:</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Go to <a href="https://dashboard.mux.com" target="_blank" rel="noopener noreferrer" className="underline">Mux Dashboard</a></li>
          <li>Generate Access Tokens</li>
          <li>Add to <code className="bg-red-50 px-1">.env.local</code>:
            <pre className="bg-red-100 p-2 mt-1 rounded overflow-auto">
{`VITE_MUX_TOKEN_ID=your_token_id
VITE_MUX_TOKEN_SECRET=your_token_secret`}
            </pre>
          </li>
          <li>Restart your development server</li>
        </ol>
      </div>
    </div>
  );
};

export default MuxStatus;
