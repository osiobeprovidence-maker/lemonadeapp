import React, { useState } from 'react';

/**
 * Mux Video Upload Component
 * Handles video uploads using Mux Direct Upload API
 */
export const MuxVideoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedAssetId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Import here to avoid issues at component load time
      const { createMuxDirectUploadUrl } = await import('@/lib/mux');

      // Step 1: Get upload URL from Mux
      const uploadUrl = await createMuxDirectUploadUrl(file.name);

      // Step 2: Upload file to Mux
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedAssetId(response.upload_id || 'Upload completed');
          setFile(null);
        } else {
          setError(`Upload failed: ${xhr.statusText}`);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed - network error');
      });

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-4">Mux Video Upload</h3>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {uploadedAssetId && (
        <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded text-green-700">
          ✓ Upload successful! Asset ID: {uploadedAssetId}
        </div>
      )}

      <div className="space-y-3">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm border border-gray-300 rounded p-2"
        />

        {file && (
          <p className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {uploadProgress > 0 && uploading && (
          <div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload to Mux'}
        </button>
      </div>
    </div>
  );
};

export default MuxVideoUpload;
