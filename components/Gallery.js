// components/Gallery.js

import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';
import Filter from './Filter';
import Modal from './Modal';
import { AnimatePresence } from 'framer-motion';

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

  // Define inline styles
  const galleryStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px', // Optional padding
  };

  return (
    <div style={galleryStyle}>
      <Filter activeFilter={activeFilter} onChange={handleFilterChange} />
      
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonryGrid"
        columnClassName="masonryGridColumn"
      >
        {filteredImages.map((image) => (
          <ImageCard key={image.id} image={image} onImageClick={handleImageClick} />
        ))}
      </Masonry>
      
      <AnimatePresence>
        {selectedImage && <Modal image={selectedImage} onClose={handleCloseModal} />}
      </AnimatePresence>
    </div>
  );
}

// Define breakpoint columns outside the component for clarity
const breakpointColumnsObj = {
  default: 4,
  1100: 2,
  700: 1,
};
