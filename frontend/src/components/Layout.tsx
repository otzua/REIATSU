import React from 'react';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer/MusicPlayer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ paddingBottom: '90px' }}>{children}</main>
      <MusicPlayer />
    </>
  );
};

export default Layout;
