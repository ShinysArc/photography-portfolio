// components/Gallery.js

import { useState } from 'react';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';
import Filter from './Filter';
import Modal from './Modal';
import styles from '../styles/Gallery.module.css';

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

  return (
    <div className={styles.gallery}>
      <Filter activeFilter={activeFilter} onChange={handleFilterChange} />
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.masonryGrid}
        columnClassName={styles.masonryGridColumn}
      >
        {filteredImages.map((image) => (
          <ImageCard key={image.id} image={image} onImageClick={handleImageClick} />
        ))}
      </Masonry>
      {selectedImage && <Modal image={selectedImage} onClose={handleCloseModal} />}
    </div>
  );
}
