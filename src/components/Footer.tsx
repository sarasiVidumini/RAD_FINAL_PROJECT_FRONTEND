// src/components/Footer.tsx
import { LayoutGrid, MessageSquare, Users, Upload, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer = ({ user }: { user: any }) => {
  const location = useLocation();
  
  // Helper to check if the route is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 w-full bg-black border-t border-gray-800 p-2 z-50 md:hidden">
      <nav className="flex justify-around items-center text-gray-100">
        <Link to="/dashboard" className={`p-2 rounded-xl ${isActive('/dashboard') ? "bg-black border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-yellow-500" : "hover:text-white"}`}>
          <LayoutGrid size={24} />
        </Link>
        
        <Link to="/requests" className={`p-2 rounded-xl ${isActive('/requests') ? "bg-black border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-yellow-500" : "hover:text-white"}`}>
          <MessageSquare size={24} />
        </Link>

        <Link to="/group-chat" className={`p-2 rounded-xl ${isActive('/group-chat') ? "bg-black border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-yellow-500" : "hover:text-white"}`}>
          <Users size={24} />
        </Link>

        <Link to="/upload" className={`p-2 rounded-xl ${isActive('/upload') ? "bg-black border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-yellow-500" : "hover:text-white"}`}>
          <Upload size={24} />
        </Link>

        <Link to="/study" className={`p-2 rounded-xl relative ${isActive('/study') ? "bg-black border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-yellow-500" : "hover:text-white"}`}>
          <Brain size={24} />
          {!isActive('/study') && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;