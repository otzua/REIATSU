import React, { useState } from 'react';
import { Home, Search, Compass, Bookmark, User } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home },
    { id: 'browse', icon: Compass },
    { id: 'search', icon: Search },
    { id: 'list', icon: Bookmark },
  ];

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoCapsule}>
        <span className={styles.logoKanji}>霊</span>
      </div>

      <nav className={styles.navCapsule}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={22} strokeWidth={2} />
          </button>
        ))}
      </nav>

      <div className={styles.accountCapsule}>
        <button className={styles.accountBtn}>
          <User size={22} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
