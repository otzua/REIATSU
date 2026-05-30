import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import styles from './AboutMe.module.css';

interface AboutMeProps {
  isOpen: boolean;
  onClose: () => void;
}

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const AboutMe = ({ isOpen, onClose }: AboutMeProps) => {
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isOpen && barcodeRef.current) {
      const t = setTimeout(() => {
        if (barcodeRef.current) {
          try {
            JsBarcode(barcodeRef.current, 'krish.json@gmail.com', {
              format: 'CODE128',
              displayValue: false,
              background: 'transparent',
              lineColor: '#111111',
              margin: 0,
              height: 30,
              width: 1.2,
            });
          } catch (err) {
            console.error('Barcode generation failed:', err);
          }
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleBarcodeClick = () => {
    navigator.clipboard.writeText('krish.json@gmail.com');
    setCopied(true);
    setIsScanning(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.scene}
            initial={{ y: -80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1, transition: { type: 'spring', damping: 24, stiffness: 180 } }}
            exit={{ y: 30, opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CARD */}
            <div className={styles.card}>

              {/* TOP META */}
              <div className={styles.topMeta}>
                <div className={styles.idHeader}>
                  <span className={styles.idText}>ID: KS-001</span>
                  <span className={styles.idStatus}>ACTIVE</span>
                </div>
                <div className={styles.orgBanner}>
                  <span className={styles.orgLabel}>REIATSU</span>
                  <span className={styles.dateLabel}>EST. 2026</span>
                </div>
              </div>

              {/* PHOTO */}
              <div className={styles.photoFrame}>
                <img
                  src="https://github.com/otzua.png"
                  alt="Krish Singh"
                  className={styles.portrait}
                />
                <div className={styles.halftone} />
                {/* Corner tag */}
                <div className={styles.photoTag}>
                  <span>DEV</span>
                </div>
              </div>

              {/* THICK RULE */}
              <div className={styles.thickRule} />

              {/* NAME + BIO */}
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <div className={styles.nameStack}>
                    <span className={styles.nameFirst}>KRISH</span>
                    <span className={styles.nameLast}>SINGH</span>
                  </div>
                  <div className={styles.rightBadgeGroup}>
                    <img src="/logo-square.svg" alt="REIATSU Logo" className={styles.badgeLogo} />
                    <div className={styles.roleTag}>
                      <span className={styles.roleTagLabel}>GOD'S</span>
                      <span className={styles.roleTagLabel}>FAV</span>
                    </div>
                  </div>
                </div>

                <p className={styles.bio}>
                  Built fast, private &amp; beautiful<br />
                  media experiences — from scratch.
                </p>

                {/* BOTTOM */}
                <div className={styles.bottomRow}>
                  <div
                    className={`${styles.barcodeCol} ${isScanning ? styles.scanning : ''}`}
                    onClick={handleBarcodeClick}
                    title="Scan or click to copy email"
                  >
                    <div className={styles.barcodeContainer}>
                      <svg ref={barcodeRef} className={styles.barcodeSvg} />
                      <div className={styles.scanLine} />
                    </div>
                    <span className={`${styles.barcodeLabel} ${copied ? styles.copiedText : ''}`}>
                      {copied ? '✓ COPIED' : 'krish.json@gmail.com'}
                    </span>
                  </div>

                  <div className={styles.socials}>
                    <a href="https://github.com/otzua" target="_blank" rel="noopener noreferrer" className={styles.icon} title="GitHub">
                      <GithubIcon />
                    </a>
                    <a href="https://www.linkedin.com/in/krish-dmg/" target="_blank" rel="noopener noreferrer" className={styles.icon} title="LinkedIn">
                      <LinkedinIcon />
                    </a>
                    <a href="https://instagram.com/otaku_bhaiya" target="_blank" rel="noopener noreferrer" className={styles.icon} title="Instagram">
                      <InstagramIcon />
                    </a>
                    <a href="mailto:krish.json@gmail.com" className={styles.icon} title="Email">
                      <Mail size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AboutMe;
