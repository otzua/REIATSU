import { Home, Compass, Clock, Star, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.logo}>
        <h2>REI<span className={styles.accent}>ATSU</span></h2>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/" className={styles.active}><Home size={20} /> <span>Home</span></Link></li>
          <li><Link to="/explore"><Compass size={20} /> <span>Explore</span></Link></li>
          <li><Link to="/recent"><Clock size={20} /> <span>Recent</span></Link></li>
          <li><Link to="/watchlist"><Star size={20} /> <span>Watchlist</span></Link></li>
        </ul>
        
        <div className={styles.divider}></div>
        
        <ul>
          <li><Link to="/settings"><Settings size={20} /> <span>Settings</span></Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
