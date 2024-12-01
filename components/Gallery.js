// components/Gallery.js

import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';
import Filter from './Filter';
import Modal from './Modal';
import { AnimatePresence, motion } from 'framer-motion';

// Define breakpoint columns outside the component for clarity
const breakpointColumnsObj = {
  default: 4,
  1100: 2,
  700: 1,
};

export default function Gallery({ imagesData }) {
  const [filteredImages, setFilteredImages] = useState(imagesData);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFilterChange = (category) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredImages(imagesData);
    } else {
      const filtered = imagesData.filter((image) => image.category === category);
      setFilteredImages(filtered);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Define styles
  const styles = {
    gallery: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    masonryGrid: {
      display: 'flex',
      marginLeft: '-30px',
      width: 'auto',
    },
    masonryGridColumn: {
      paddingLeft: '30px',
      backgroundClip: 'padding-box',
    },
  };

  return (
    <div style={styles.gallery}>
      <Filter activeFilter={activeFilter} onChange={handleFilterChange} />
      
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonryGrid"
        columnClassName="masonryGridColumn"
        style={styles.masonryGrid}
      >
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            layout
          >
            <ImageCard 
              image={image} 
              onImageClick={handleImageClick}
            />
          </motion.div>
        ))}
      </Masonry>
      
      <AnimatePresence>
        {selectedImage && (
          <Modal 
            image={selectedImage} 
            onClose={handleCloseModal} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
