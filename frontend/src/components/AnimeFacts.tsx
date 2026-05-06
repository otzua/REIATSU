import { motion } from 'framer-motion';
import styles from './AnimeFacts.module.css';

const dummyFacts = [
  { id: 1, anime: 'One Piece', fact: 'Did you know that Eiichiro Oda intended for One Piece to last only 5 years?' },
  { id: 2, anime: 'Naruto', fact: 'The creator of Naruto, Masashi Kishimoto, originally wanted Naruto to be a chef.' },
  { id: 3, anime: 'Attack on Titan', fact: 'The titans in Attack on Titan were inspired by drunk people the creator met at a cafe.' },
];

const AnimeFacts = () => {
  return (
    <section className={styles.factsSection}>
      <div className={styles.header}>
        <div className={styles.accentBar}></div>
        <h2 className={styles.title}>ANIME FACTS</h2>
        <div className={styles.accentBar}></div>
      </div>
      
      <div className={styles.grid}>
        {dummyFacts.map((fact, index) => (
          <motion.div 
            key={fact.id}
            className={styles.factCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, borderColor: 'var(--color-cream)' }}
          >
            <div className={styles.animeTag}>{fact.anime}</div>
            <p className={styles.factText}>{fact.fact}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AnimeFacts;
