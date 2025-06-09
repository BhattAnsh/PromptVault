// This script will create a simple colored square as an icon
// We'll replace this with proper icons later

document.addEventListener('DOMContentLoaded', function() {
  const createIcon = (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(0, 0, size, size);
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PV', size/2, size/2);
    
    return canvas.toDataURL();
  };

  // This is just a placeholder for now - in a real extension, 
  // you would use actual image files rather than generating them.
});
