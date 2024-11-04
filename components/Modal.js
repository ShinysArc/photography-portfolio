import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/date';
import { X } from 'phosphor-react';
import { Readex_Pro } from "next/font/google";

const readex = Readex_Pro({ subsets: ["latin"] });

export default function Modal({ image, onClose }) {
  const [closeButtonHover, setCloseButtonHover] = useState(false);
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleResize = () => setWidth(window.innerWidth);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isMobile = width <= 600;

  const { exifData } = image;

  // Filter EXIF data to include only the specified fields
  const filteredExifData = exifData
    ? {
        Camera: exifData.Model,
        Lens: exifData.LensModel,
        Settings: `${exifData.FocalLength}mm 1/${(1 / exifData.ExposureTime).toFixed(
          0
        )}s ƒ/${exifData.FNumber} ISO${exifData.ISO}`,
        Date: `${formatDate(exifData.DateTimeOriginal)}`,
      }
    : null;

  // Define styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const modalContentStyle = {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'inline-block',
    maxWidth: '90vw',
    maxHeight: '90vh',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: closeButtonHover ? '#000000' : '#3e3e3e',
    border: 'none',
    color: '#ffffff',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  };

  const imageWrapperStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const modalImageStyle = {
    maxWidth: '90vw',
    maxHeight: '82vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  };

  const exifDataStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: isMobile ? 'center' : 'space-between',
    alignItems: isMobile ? 'center' : 'stretch',
    padding: '10px 20px',
  };

  const exifLeftStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isMobile ? 'center' : 'flex-start',
    marginBottom: isMobile ? '10px' : undefined,
  };

  const exifRightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isMobile ? 'center' : 'flex-end',
    marginBottom: isMobile ? '10px' : undefined,
  };

  const exifTextStyle = {
    margin: 0,
    fontSize: '14px',
  };

  return (
    <AnimatePresence>
      <motion.div
        style={modalOverlayStyle}
        onClick={onClose}
        initial={{
          backdropFilter: 'blur(0px)',
          //backgroundColor: 'rgba(255,255,255,0)',
        }}
        animate={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
        exit={{
          backdropFilter: 'blur(0px)',
          //backgroundColor: 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          style={modalContentStyle}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={() => setCloseButtonHover(true)}
            onMouseLeave={() => setCloseButtonHover(false)}
          >
            <X />
          </button>
          <div style={imageWrapperStyle}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} style={modalImageStyle} />
          </div>
          {filteredExifData && (
            <div style={exifDataStyle} className={readex.className}>
              <div style={exifLeftStyle}>
                {filteredExifData['Camera'] && (
                  <p style={exifTextStyle}>{filteredExifData['Camera']}</p>
                )}
                {filteredExifData['Lens'] && (
                  <p style={exifTextStyle}>{filteredExifData['Lens']}</p>
                )}
              </div>
              <div style={exifRightStyle}>
                {filteredExifData['Settings'] && (
                  <p style={exifTextStyle}>{filteredExifData['Settings']}</p>
                )}
                {filteredExifData['Date'] && (
                  <p style={exifTextStyle}>{filteredExifData['Date']}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
