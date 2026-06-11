import React, { useState, useEffect } from 'react';
import axios from 'react-redux'; // or standard 'axios' import depending on setup
import axiosInstance from 'axios';

interface SecurePdfViewerProps {
  noteId: string;
  fileIndex?: number;
}

const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({ noteId, fileIndex = 0 }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecurePdf = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        let token = localStorage.getItem('token'); 
        if (!token) {
          throw new Error("Authentication token missing. Please sign in again.");
        }

        token = token.trim();
        // Structure formatting check
        const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        const rawTokenParam = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

        // FIXED: Explicit isolated client context configurations to force credential clearance flags
        const isolatedClient = axiosInstance.create({
          withCredentials: false // Overrides default session cookies blocks on cross-origin handshakes
        });

        const targetEndpoint = `http://localhost:5000/api/notes/${noteId}/view?index=${fileIndex}&token=${encodeURIComponent(rawTokenParam)}`;

        const response = await isolatedClient.get(targetEndpoint, {
          headers: {
            'Authorization': cleanToken,
            'Accept': 'application/pdf'
          },
          responseType: 'blob'
        });

        // Error detection trap inside data payloads
        if (response.data.size < 1000) {
          const payloadText = await response.data.text();
          try {
            const parsedJsonError = JSON.parse(payloadText);
            throw new Error(parsedJsonError.message || "Security access authorization failed.");
          } catch {
            throw new Error("The backend rejected the stream mapping or the asset file index path is corrupted.");
          }
        }

        const fileBlob = new Blob([response.data], { type: 'application/pdf' });
        const localObjectURL = URL.createObjectURL(fileBlob);
        setPdfUrl(localObjectURL);
      } catch (err: any) {
        console.error("❌ Frontend Secure PDF Loader Error:", err);
        setError(err.message || "Could not display secure document preview.");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchSecurePdf();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [noteId, fileIndex]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <p style={{ fontFamily: 'sans-serif', color: '#4b5563', fontSize: '0.95rem' }}>Mounting secure encrypted document stream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#ef4444', padding: '1.25rem', border: '1px solid #fee2e2', borderRadius: '0.5rem', backgroundColor: '#fef2f2', fontFamily: 'sans-serif', margin: '1rem' }}>
        <strong style={{ fontSize: '1.05rem' }}>Security Stream Error:</strong>
        <p style={{ margin: '0.5rem 0 0 0', color: '#b91c1c', fontSize: '0.925rem' }}>{error}</p>
      </div>
    );
  }

    return (
        <div style={{ width: '100%', height: '800px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <iframe 
            src="https://docs.google.com/gview?url=https://res.cloudinary.com/dbeawlpsb/image/upload/v1781107553/notevault/emjv4mles1t60brky2ql.pdf&embedded=true" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            frameBorder={0}
            />
        </div>
    );
};

export default SecurePdfViewer;