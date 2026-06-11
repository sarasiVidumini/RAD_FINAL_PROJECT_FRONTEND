export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'student' | 'expert' | 'admin'; // ← Added 'expert' role natively
  semester?: number;                    // ← Made optional because experts/admins don't have semesters
  expertise?: string;                   // ← Added optional field for domain specialists
}

export interface Note {
  _id: string;
  title: string;
  subject: string;
  semester: number;
  description?: string;
  files: string[];
  uploadedBy: {
    name: string;
    department: string;
    role: 'student' | 'expert' | 'admin';
  };
  downloads: number;
  averageRating: number;
  createdAt: string;
}