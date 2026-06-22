import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ClientNavbar from './Navbar';
import Footer from './Footer';

const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-white">
    <ClientNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: 'text-sm font-medium',
        duration: 4000,
        style: { borderRadius: '12px', padding: '12px 16px', fontFamily: 'Poppins, sans-serif' },
        success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
        error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
      }}
    />
  </div>
);

export default PublicLayout;
