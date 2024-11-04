// components/Filter.js

import styles from '../styles/Filter.module.css';

export default function Filter({ activeFilter, onChange }) {
  const categories = ['All', 'Landscape', 'Portrait', 'Street', 'Wildlife'];

  return (
    <div className={styles.filter}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.button} ${activeFilter === category ? styles.active : ''}`}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
