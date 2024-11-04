import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Ensure Next.js Image optimization

export default function ImageCard({ image, onImageClick }) {
  const handleClick = () => {
    onImageClick(image);
  };

  // Define inline styles
  const imageCardStyle = {
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    marginBottom: '30px',
    display: 'block', // Ensures the div acts as a block element
  };

  const imageWrapperStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  const imageStyle = {
    objectFit: 'cover',
    width: '100%',
    height: 'auto',
    display: 'block',
  };

  return (
    <motion.div
      style={imageCardStyle}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      <div style={imageWrapperStyle}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          style={imageStyle}
        />
      </div>
    </motion.div>
  );
}
