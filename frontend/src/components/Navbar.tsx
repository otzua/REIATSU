import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <header className={`${styles.navbar} glass`}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input type="text" placeholder="Search anime..." className={styles.searchInput} />
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn}><Bell size={20} /></button>
        <button className={styles.iconBtn}><User size={20} /></button>
      </div>
    </header>
  );
};

export default Navbar;
