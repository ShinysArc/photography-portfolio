import React, { useState } from 'react';

export default function Filter({ activeFilter, onChange }) {
  const categories = ['All', 'Landscape', 'Portrait', 'Street', 'Wildlife'];
  const [hoveredButton, setHoveredButton] = useState(null);

  // Styles
  const filterStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const buttonBaseStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    margin: '0 1rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    position: 'relative',
    outline: 'none',
  };

  const afterBaseStyle = {
    content: '""',
    display: 'block',
    width: '0%',
    height: '2px',
    background: '#000',
    transition: 'width 0.3s',
    position: 'absolute',
    left: 0,
    bottom: '-5px',
  };

  return (
    <div style={filterStyle}>
      {categories.map((category) => {
        const isActive = activeFilter === category;
        const isHovered = hoveredButton === category;

        // Button style
        const buttonStyle = {
          ...buttonBaseStyle,
        };

        // After element style
        const afterStyle = {
          ...afterBaseStyle,
          width: isActive || isHovered ? '100%' : '0%',
        };

        return (
          <button
            key={category}
            style={buttonStyle}
            onClick={() => onChange(category)}
            onMouseEnter={() => setHoveredButton(category)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {category}
            <span style={afterStyle} />
          </button>
        );
      })}
    </div>
  );
}
