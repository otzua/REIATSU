import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, User, Camera, Mail, Code2, Terminal } from 'lucide-react';
import styles from './AboutMe.module.css';

interface AboutMeProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutMe = ({ isOpen, onClose }: AboutMeProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, rotateX: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "1000px" }}
          >
            <div className={styles.noise}></div>
            
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} strokeWidth={2} />
            </button>
            
            <div className={styles.dossierHeader}>
              <div className={styles.headerLeft}>
                <Terminal size={14} className={styles.headerIcon} />
                <span>AUTHORIZATION: ROOT</span>
              </div>
              <div className={styles.headerRight}>
                <span>ID: REIATSU-01</span>
              </div>
            </div>

            <div className={styles.mainLayout}>
              <div className={styles.leftColumn}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatarDecor}>
                    <svg viewBox="0 0 100 100" className={styles.spinRing}>
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  <img src="https://github.com/otzua.png" alt="Krish Singh" className={styles.avatar} />
                  <div className={styles.statusIndicator}>
                    <div className={styles.statusPulse}></div>
                    <span>ONLINE</span>
                  </div>
                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.identity}>
                  <h2 className={styles.name}>KRISH SINGH</h2>
                  <div className={styles.roleBox}>
                    <span className={styles.roleHighlight}>CREATOR / LEAD ENGINEER</span>
                    <span className={styles.sysText}>// SYSTEM ARCHITECT</span>
                  </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.socialGrid}>
                  <a href="https://github.com/otzua" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <Code size={16} />
                    <span>GITHUB</span>
                  </a>
                  <a href="https://www.linkedin.com/in/krish-dmg/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <User size={16} />
                    <span>LINKEDIN</span>
                  </a>
                  <a href="https://instagram.com/otaku_bhaiya" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <Camera size={16} />
                    <span>INSTAGRAM</span>
                  </a>
                  <a href="mailto:krish.json@gmail.com" className={styles.socialLink}>
                    <Mail size={16} />
                    <span>CONTACT</span>
                  </a>
                </div>

                <div className={styles.techSection}>
                  <div className={styles.techHeader}>
                    <Code2 size={14} />
                    <span>CORE INFRASTRUCTURE</span>
                  </div>
                  <div className={styles.techTags}>
                    <span>REACT 19</span>
                    <span>VITE</span>
                    <span>TYPESCRIPT</span>
                    <span>FRAMER MOTION</span>
                    <span>HONO API</span>
                    <span>FASTAPI</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.barcode}>
              <div className={styles.bars}></div>
              <span>REIATSU.OTZUA.DEV</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutMe;
