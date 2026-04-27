import React, { useEffect, useState } from 'react';
import { initializeIntegrations, type IntegrationStatus as IntegrationStatusState } from '@/lib/integrations';

/**
 * Component that displays the integration status
 * Useful for debugging and verifying all services are connected
 */
export const IntegrationStatus: React.FC = () => {
  const [status, setStatus] = useState<IntegrationStatusState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        setLoading(true);
        const integrationStatus = await initializeIntegrations();
        setStatus(integrationStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkIntegrations();
  }, []);

  const getStatusIcon = (isActive: boolean): string => {
    return isActive ? '✓' : '✗';
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800">Checking integrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const services = [
    { name: 'Firebase', active: status.firebase, docs: 'https://firebase.google.com/docs' },
    { name: 'Convex', active: status.convex, docs: 'https://docs.convex.dev/' },
    { name: 'Paystack', active: status.paystack, docs: 'https://paystack.com/developers' },
    { name: 'Mux', active: status.mux, docs: 'https://docs.mux.com/' },
    { name: 'Vercel', active: status.vercel, docs: 'https://vercel.com/docs' },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-4">Integration Status</h3>
      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${getStatusColor(service.active)}`}>
                {getStatusIcon(service.active)}
              </span>
              <span>{service.name}</span>
            </div>
            <a
              href={service.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Docs →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationStatus;
