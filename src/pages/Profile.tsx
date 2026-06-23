import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user , updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track the file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save the file object
      setPreviewUrl(URL.createObjectURL(file)); // Create local preview
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (selectedFile) {
      formData.append('avatar', selectedFile); 
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedUser = await response.json();
      
      // 2. Call the function we destructured
      updateUser(updatedUser); 
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile information</h1>
        
        <form onSubmit={handleSave} className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold">Public profile</h2>
              <p className="text-zinc-500 text-sm">View and update your profile information</p>
            </div>
            <button type="submit" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)]">
              Save changes
            </button>
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-600" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition text-sm font-medium">
                Upload new photo
              </button>
              <p className="text-xs text-zinc-500">JPG, GIF or PNG. 1MB Max.</p>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
              />
            </div>

            {/* Password Section */}
            <div className="pt-4 space-y-4">
              <h3 className="text-white font-medium">Security</h3>
              <input type="password" placeholder="Current password" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              <input type="password" placeholder="New password" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}