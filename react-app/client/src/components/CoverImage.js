// CoverImage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CoverImage = ({ videoPath }) => {
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    const extractVideoCover = async () => {
      try {
        const res = await axios.get('/extract-cover', {
          params: {
            videoPath: videoPath,
          },
          responseType: 'arraybuffer',
        });

        const blob = new Blob([res.data], { type: 'image/jpeg' });
        const coverUrl = URL.createObjectURL(blob);

        setCoverImage(coverUrl);
      } catch (err) {
        console.log('Error extracting video cover:', err);
      }
    };

    if (videoPath.toLowerCase().endsWith('.mp4')) {
      extractVideoCover();
    } else {
      setCoverImage(videoPath); // Use the provided image directly
    }

    return () => {
      if (coverImage) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [videoPath]);

  return coverImage ? (
    <img style={{ width: '100%' }} src={'./uploads/17944_jpg.rf.f9daa84fb5656498cc5aa6aa0f745281.jpg'} alt="Cover" />
  ) : null;
};

export default CoverImage;