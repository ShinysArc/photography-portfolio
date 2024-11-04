// components/ImageCard.js

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from '../styles/ImageCard.module.css';

export default function ImageCard({ image, onImageClick }) {
  const handleClick = () => {
    onImageClick(image);
  };

  return (
    <motion.div
      className={styles.imageCard}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={styles.image}
        />
      </div>
    </motion.div>
  );
}
