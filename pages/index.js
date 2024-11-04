// pages/index.js

import Gallery from '../components/Gallery';
import Header from '@/components/Header';
import styles from '../styles/Home.module.css';
import fetch from 'node-fetch';

export default function Home({ imagesData }) {
  return (
    <>
      <main className={styles.main}>
        <Gallery imagesData={imagesData} />
      </main>
    </>
  );
}

export async function getStaticProps() {
  const imageURLs = [
    {
      id: 1,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200042.jpg',
      alt: 'Image 1 description',
      category: 'Landscape',
    },
    {
      id: 2,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200020.jpg',
      alt: 'Image 2 description',
      category: 'Portrait',
    },
    {
      id: 3,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200033.jpg',
      alt: 'Image 3 description',
      category: 'Street',
    },
    {
      id: 4,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200033.jpg',
      alt: 'Image 4 description',
      category: 'Street',
    },
    {
      id: 5,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200042.jpg',
      alt: 'Image 1 description',
      category: 'Landscape',
    },
    {
      id: 6,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200020.jpg',
      alt: 'Image 2 description',
      category: 'Portrait',
    },
    {
      id: 7,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200033.jpg',
      alt: 'Image 3 description',
      category: 'Street',
    },
    {
      id: 8,
      src: 'https://photo.stephanegelibert.com/images/photos/20230620%20-%20Sortie%20Nocturne%20-%20St%C3%A9phane%20G.%20-%200033.jpg',
      alt: 'Image 4 description',
      category: 'Street',
    },
    // Add more images here
  ];

  const exifr = require('exifr');
  const sizeOf = require('image-size');
  //const fetch = require('node-fetch');

  const imagesData = [];

  for (const image of imageURLs) {
    try {
      const response = await fetch(image.src);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const exifDataRaw = await exifr.parse(buffer);
      const exifData = JSON.parse(JSON.stringify(exifDataRaw, (key, value) => {
        return value instanceof Date ? value.toISOString() : value;
      }));

      const dimensions = sizeOf(buffer);

      imagesData.push({
        ...image,
        width: dimensions.width,
        height: dimensions.height,
        exifData,
      });
    } catch (error) {
      console.error(`Error processing image ${image.src}:`, error);
      imagesData.push({
        ...image,
        width: 800, // Default values in case of error
        height: 600,
        exifData: null,
      });
    }
  }

  return {
    props: {
      imagesData,
    },
  };
}
