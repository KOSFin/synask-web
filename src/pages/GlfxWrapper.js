// GlfxWrapper.js
import React, { useEffect, useRef } from 'react';
import * as glfx from 'glfx';

const GlfxWrapper = ({ image, filter }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = glfx.canvas();
      const texture = canvas.texture(image);

      canvas.draw(texture);

      switch (filter) {
        case 'grayscale':
          canvas.desaturate();
          break;
        // Add more filters as needed
        default:
          break;
      }

      canvas.update();
      canvasRef.current.getContext('2d').drawImage(canvas, 0, 0);
    }
  }, [image, filter]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GlfxWrapper;
