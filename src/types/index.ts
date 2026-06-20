export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'student' | 'expert' | 'admin';
  semester?: number;
  expertise?: string;
}

export type NoteDocType = 'note' | 'paper';

export interface Note {
  _id: string;
  title: string;
  subject: string;
  subjectCode: string;
  docType: NoteDocType;
  semester: number;
  description?: string;
  files: string[];
  uploadedBy: {
    name: string;
    department?: string;
    email?: string;
    role: 'student' | 'expert' | 'admin';
  };
  downloads: number;
  averageRating: number;
  createdAt: string;
}