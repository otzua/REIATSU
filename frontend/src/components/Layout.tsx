import React from 'react';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer/MusicPlayer';

import styles from './Layout.module.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
