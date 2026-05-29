import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, User, Link, Mail } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
            
            <div className={styles.banner}>
              <div className={styles.bannerOverlay}></div>
            </div>
            
            <div className={styles.content}>
              <div className={styles.avatar}>
                <img src="https://github.com/otzua.png" alt="Krish Singh" />
              </div>
              
              <div className={styles.headerInfo}>
                <h2 className={styles.name}>Krish Singh</h2>
                <p className={styles.title}>
                  Creator of REIATSU <span className={styles.badge}>Dev</span>
                </p>
              </div>

              <h3 className={styles.sectionTitle}>Connect with me</h3>
              <div className={styles.links}>
                <a href="https://github.com/otzua" target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <Code size={18} className={styles.linkIcon} />
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/krish-dmg/" target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <User size={18} className={styles.linkIcon} />
                  LinkedIn
                </a>
                <a href="https://instagram.com/otaku_bhaiya" target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <Link size={18} className={styles.linkIcon} />
                  Instagram
                </a>
                <a href="mailto:krish.json@gmail.com" className={styles.linkBtn}>
                  <Mail size={18} className={styles.linkIcon} />
                  Email Me
                </a>
              </div>
              
              <h3 className={styles.sectionTitle}>Built With</h3>
              <div className={styles.techStack}>
                <span className={styles.techBadge}>React</span>
                <span className={styles.techBadge}>Vite</span>
                <span className={styles.techBadge}>TypeScript</span>
                <span className={styles.techBadge}>Framer Motion</span>
                <span className={styles.techBadge}>TMDB & Beyond API</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutMe;
