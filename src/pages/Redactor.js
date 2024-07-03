// PhotoEditor.js
import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { fabric } from 'fabric';

const PhotoEditor = () => {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);
  const [selectedText, setSelectedText] = useState(null);
  const [activeSection, setActiveSection] = useState('crop');
  const [filter, setFilter] = useState('none');
  const [contrast, setContrast] = useState(100);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    const cropper = cropperRef.current.cropper;
    const cropped = cropper.getCroppedCanvas().toDataURL();
    setCroppedImage(cropped);
  };

  useEffect(() => {
    if (croppedImage) {
      const canvas = new fabric.Canvas(canvasRef.current);
      fabricRef.current = canvas;

      fabric.Image.fromURL(croppedImage, (img) => {
        canvas.setWidth(img.width);
        canvas.setHeight(img.height);
        canvas.add(img);
        applyFilterAndContrast();
      });

      // Event listener to handle text selection
      canvas.on('mouse:down', (event) => {
        if (event.target && event.target.type === 'textbox') {
          setSelectedText(event.target);
        } else {
          setSelectedText(null);
        }
      });
    }
  }, [croppedImage]);

  const handleDraw = () => {
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = true;
      fabricRef.current.freeDrawingBrush.color = brushColor;
      fabricRef.current.freeDrawingBrush.width = brushWidth;
    }
  };

  const handleAddText = () => {
    if (fabricRef.current) {
      const text = new fabric.Textbox('Your Text', {
        left: 100,
        top: 100,
        fill: brushColor,
        editable: true,
      });
      fabricRef.current.add(text);
    }
  };

  const handleSave = () => {
    if (fabricRef.current) {
      const dataURL = fabricRef.current.toDataURL();
      console.log(dataURL);
      // Save the current state of the canvas as the new croppedImage
      setCroppedImage(dataURL);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleTextChange = (e) => {
    if (selectedText) {
      selectedText.set('text', e.target.value);
      fabricRef.current.renderAll();
    }
  };

  const handleTextColorChange = (e) => {
    if (selectedText) {
      selectedText.set('fill', e.target.value);
      fabricRef.current.renderAll();
    }
  };

  const handleBrushColorChange = (e) => {
    setBrushColor(e.target.value);
    if (fabricRef.current) {
      fabricRef.current.freeDrawingBrush.color = e.target.value;
    }
  };

  const handleBrushWidthChange = (e) => {
    setBrushWidth(parseInt(e.target.value, 10));
    if (fabricRef.current) {
      fabricRef.current.freeDrawingBrush.width = parseInt(e.target.value, 10);
    }
  };

  const switchSection = (section) => {
    if (activeSection !== section) {
      if (fabricRef.current) {
        fabricRef.current.isDrawingMode = false;
        fabricRef.current.clear();
        fabric.Image.fromURL(croppedImage, (img) => {
          fabricRef.current.setWidth(img.width);
          fabricRef.current.setHeight(img.height);
          fabricRef.current.add(img);
          applyFilterAndContrast();
        });
      }
      setActiveSection(section);
    }
  };

  const applyFilterAndContrast = () => {
    if (fabricRef.current) {
      fabricRef.current.getObjects('image').forEach((img) => {
        img.filters = [];
        if (filter !== 'none') {
          img.filters.push(new fabric.Image.filters[filter]());
        }
        img.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
        img.applyFilters();
      });
      fabricRef.current.renderAll();
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    applyFilterAndContrast();
  };

  const handleContrastChange = (e) => {
    setContrast(e.target.value);
    applyFilterAndContrast();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <button onClick={handleFileUpload}>Upload Image</button>

      <div>
        <button onClick={() => switchSection('crop')}>Crop</button>
        <button onClick={() => switchSection('draw')}>Draw</button>
        <button onClick={() => switchSection('text')}>Text</button>
        <button onClick={() => switchSection('filter')}>Filters</button>
      </div>

      {activeSection === 'crop' && image && (
        <div>
          <Cropper
            src={image}
            style={{ height: 400, width: '100%' }}
            initialAspectRatio={1}
            guides={false}
            cropBoxResizable={true}
            ref={cropperRef}
          />
          <button onClick={applyCrop}>Crop Image</button>
        </div>
      )}

      {croppedImage && (
        <div>
          <h3>Edit Image:</h3>
          <canvas id="canvas" ref={canvasRef} />
        </div>
      )}

      {activeSection === 'draw' && (
        <div>
          <button onClick={handleDraw}>Start Drawing</button>
          <label>
            Brush Color:
            <input type="color" value={brushColor} onChange={handleBrushColorChange} />
          </label>
          <label>
            Brush Width:
            <input type="number" value={brushWidth} onChange={handleBrushWidthChange} />
          </label>
        </div>
      )}

      {activeSection === 'text' && (
        <div>
          <button onClick={handleAddText}>Add Text</button>
          {selectedText && (
            <div>
              <label>
                Edit Text:
                <input type="text" value={selectedText.text} onChange={handleTextChange} />
              </label>
              <label>
                Text Color:
                <input type="color" value={selectedText.fill} onChange={handleTextColorChange} />
              </label>
            </div>
          )}
        </div>
      )}

      {activeSection === 'filter' && (
        <div>
          <label>
            Filter:
            <select value={filter} onChange={handleFilterChange}>
              <option value="none">None</option>
              <option value="Grayscale">Grayscale</option>
              <option value="Invert">Invert</option>
              <option value="Sepia">Sepia</option>
              {/* Add more filters as needed */}
            </select>
          </label>
          <label>
            Contrast:
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={handleContrastChange}
            />
          </label>
        </div>
      )}

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default PhotoEditor;
