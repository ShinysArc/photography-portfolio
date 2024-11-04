// components/Modal.js

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/Modal.module.css';
import { useEffect } from 'react';
import { formatDate } from '@/lib/date';
import { X } from 'phosphor-react';

export default function Modal({ image, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
        onClose();
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
    }, [onClose]);
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const { exifData } = image;

  // Filter EXIF data to include only the specified fields
  const filteredExifData = exifData
    ? {
        'Camera': exifData.Model,
        'Lens': exifData.LensModel,
        'Settings': `${exifData.FocalLength}mm 1/${(1 / exifData.ExposureTime).toFixed(0)}s f${exifData.FNumber} ISO${exifData.ISO}`,
        'Date': `${formatDate(exifData.DateTimeOriginal)}`
      }
    : null;

   return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        onClick={onClose}
        initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0)' }}
        animate={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.5)' }}
        exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0)' }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
          <div className={styles.imageWrapper}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={styles.modalImage}
              priority
            />
          </div>
          {filteredExifData && (
            <div className={styles.exifData}>
              <div className={styles.exifLeft}>
                {filteredExifData['Camera'] && (
                  <p>
                    {filteredExifData['Camera']}
                  </p>
                )}
                {filteredExifData['Lens'] && (
                  <p>
                    {filteredExifData['Lens']}
                  </p>
                )}
              </div>
              <div className={styles.exifRight}>
                {filteredExifData['Settings'] && (
                  <p>
                    {filteredExifData['Settings']}
                  </p>
                )}
                {filteredExifData['Date'] && (
                  <p>
                    {filteredExifData['Date']}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
