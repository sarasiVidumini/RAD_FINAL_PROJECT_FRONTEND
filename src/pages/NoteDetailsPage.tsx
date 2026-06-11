import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SecurePdfViewer from '../components/SecurePdfViewer';

interface NoteData {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  files: string[];
}

const NoteDetailsPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoteMetadata = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const targetNote = response.data.find((n: NoteData) => n._id === noteId);
        
        if (!targetNote) {
          throw new Error("The requested document could not be found.");
        }
        
        setNote(targetNote);
      } catch (err: any) {
        console.error("❌ Note Metadata Fetch Error:", err);
        setError(err.message || "Failed to load note details.");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNoteMetadata();
    }
  }, [noteId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading document environment...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ef4444', fontFamily: 'sans-serif' }}>{error}</div>;
  if (!note) return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>No note profile loaded.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', background: '#e5e7eb', border: 'none', borderRadius: '0.375rem', fontWeight: 500 }}
      >
        ← Back to Dashboard
      </button>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>{note.title}</h1>
        <p style={{ color: '#4b5563', margin: '0.25rem 0' }}><strong>Subject:</strong> {note.subject}</p>
        {note.description && <p style={{ color: '#6b7280' }}>{note.description}</p>}
      </div>

      <SecurePdfViewer noteId={note._id} fileIndex={0} />
    </div>
  );
};

export default NoteDetailsPage;