// script.js - Complete Frontend with Backend Integration

// ==================== CONFIGURATION ====================
const API_URL = 'http://localhost:5000/api';

// ==================== DOM ELEMENTS ====================
const fileInput = document.getElementById('fileinput');
const uploadBtn = document.getElementById('uploadbtn');
const dollForm = document.getElementById('dollform');
const dollPreview = document.querySelector('.doll-preview img');
const nameInput = document.getElementById('name');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');

// ==================== STATE MANAGEMENT ====================
let uploadedImageUrl = null;
let currentDollId = null;
let allDolls = [];

// ==================== INITIALIZATION ====================
console.log('🎭 Voodoo Doll Creator Initialized');
console.log('📡 API URL:', API_URL);

// Test backend connection on load
async function testBackendConnection() {
  try {
    const response = await fetch(API_URL.replace('/api', ''));
    const data = await response.json();
    console.log('✅ Backend Connected:', data.message);
    return true;
  } catch (error) {
    console.log('❌ Backend Connection Failed:', error);
    alert('⚠️ Cannot connect to backend! Make sure server is running on http://localhost:5000');
    return false;
  }
}

// Run connection test
testBackendConnection();

// ==================== UPLOAD IMAGE ====================
uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  
  // Validation
  if (!file) {
    alert('⚠️ Please select an image first!');
    return;
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('⚠️ Invalid file type! Please upload JPEG, PNG, or GIF');
    return;
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    alert('⚠️ File too large! Maximum size is 5MB');
    return;
  }
  
  console.log('📤 Uploading:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  // Show loading state
  uploadBtn.textContent = 'Uploading...';
  uploadBtn.disabled = true;
  uploadBtn.style.opacity = '0.6';
  
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload to backend
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    // Check if request was successful
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    const data = await response.json();
    console.log('✅ Upload Success:', data);
    
    // Save image URL
    uploadedImageUrl = data.imageUrl;
    
    // Update preview
    dollPreview.src = uploadedImageUrl;
    dollPreview.alt = 'Your uploaded voodoo doll';
    dollPreview.style.opacity = '0';
    setTimeout(() => {
      dollPreview.style.transition = 'opacity 0.5s ease';
      dollPreview.style.opacity = '1';
    }, 100);
    
    // Show success message
    alert(`✅ Image uploaded successfully!\n\nFile: ${data.originalName}\nSize: ${(data.size / 1024).toFixed(2)}KB`);
    
  } catch (error) {
    console.error('❌ Upload Error:', error);
    alert(`❌ Upload failed!\n\n${error.message}`);
  } finally {
    // Reset button
    uploadBtn.textContent = 'Upload';
    uploadBtn.disabled = false;
    uploadBtn.style.opacity = '1';
  }
});

// ==================== CREATE DOLL ====================
dollForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form values
  const name = nameInput.value.trim();
  const color = colorInput.value;
  const size = parseInt(sizeInput.value);
  
  // Validation
  if (!name) {
    alert('⚠️ Please enter a name for your doll!');
    nameInput.focus();
    return;
  }
  
  if (name.length < 1 || name.length > 50) {
    alert('⚠️ Name must be between 1 and 50 characters!');
    nameInput.focus();
    return;
  }
  
  if (size < 1 || size > 100) {
    alert('⚠️ Size must be between 1 and 100!');
    sizeInput.focus();
    return;
  }
  
  console.log('🎭 Creating doll:', { name, color, size, imageUrl: uploadedImageUrl });
  
  // Show loading state
  const submitBtn = dollForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.6';
  
  try {
    // Prepare doll data
    const dollData = {
      name,
      color,
      size,
      imageUrl: uploadedImageUrl
    };
    
    // Send to backend
    const response = await fetch(`${API_URL}/dolls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dollData)
    });
    
    // Check if request was successful
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create doll');
    }
    
    const data = await response.json();
    console.log('✅ Doll Created:', data);
    
    // Save current doll ID
    currentDollId = data.doll._id;
    
    // Apply visual effects
    applyDollEffects(data.doll);
    
    // Show success message with doll info
    const successMessage = `
🎉 Doll Created Successfully!

Name: ${data.doll.name}
Color: ${data.doll.color}
Size: ${data.doll.size}
ID: ${data.doll._id}

${data.doll.imageUrl ? '📸 With custom image' : '🎨 Using default doll'}
    `.trim();
    
    alert(successMessage);
    
    // Reset form but keep the preview
    dollForm.reset();
    
    // Reload all dolls
    await loadAllDolls();
    
  } catch (error) {
    console.error('❌ Create Doll Error:', error);
    alert(`❌ Failed to create doll!\n\n${error.message}`);
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }
});

// ==================== LOAD ALL DOLLS ====================
async function loadAllDolls() {
  try {
    console.log('📋 Loading all dolls...');
    
    const response = await fetch(`${API_URL}/dolls`);
    
    if (!response.ok) {
      throw new Error('Failed to load dolls');
    }
    
    const data = await response.json();
    allDolls = data.dolls;
    
    console.log(`✅ Loaded ${allDolls.length} doll(s):`, allDolls);
    
    return allDolls;
    
  } catch (error) {
    console.error('❌ Load Dolls Error:', error);
    return [];
  }
}

// ==================== GET SINGLE DOLL ====================
async function getDoll(dollId) {
  try {
    const response = await fetch(`${API_URL}/dolls/${dollId}`);
    
    if (!response.ok) {
      throw new Error('Doll not found');
    }
    
    const data = await response.json();
    console.log('✅ Loaded doll:', data.doll);
    
    return data.doll;
    
  } catch (error) {
    console.error('❌ Get Doll Error:', error);
    return null;
  }
}

// ==================== DELETE DOLL ====================
async function deleteDoll(dollId) {
  try {
    if (!confirm('Are you sure you want to delete this doll?')) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/dolls/${dollId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete doll');
    }
    
    const data = await response.json();
    console.log('🗑️ Deleted:', data);
    
    alert('✅ Doll deleted successfully!');
    
    // Reload dolls
    await loadAllDolls();
    
    return true;
    
  } catch (error) {
    console.error('❌ Delete Error:', error);
    alert(`❌ Failed to delete doll!\n\n${error.message}`);
    return false;
  }
}

// ==================== ADD PIN TO DOLL ====================
async function addPin(dollId, x, y, color = '#ff0000') {
  try {
    const response = await fetch(`${API_URL}/dolls/${dollId}/pins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ x, y, color })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add pin');
    }
    
    const data = await response.json();
    console.log('📌 Pin added:', data.newPin);
    
    return data.doll;
    
  } catch (error) {
    console.error('❌ Add Pin Error:', error);
    return null;
  }
}

// ==================== VISUAL EFFECTS ====================
function applyDollEffects(doll) {
  if (doll.imageUrl) {
    dollPreview.src = doll.imageUrl;
  }
  
  applyColorEffect(doll.color);
  applySizeEffect(doll.size);
}

function applyColorEffect(color) {
  dollPreview.style.filter = `drop-shadow(0 0 20px ${color}) brightness(1.1)`;
}

function applySizeEffect(size) {
  const scale = size / 50; // 50 is default
  dollPreview.style.transform = `scale(${scale})`;
  dollPreview.style.transition = 'transform 0.3s ease';
}

// ==================== REAL-TIME PREVIEW ====================
colorInput.addEventListener('input', (e) => {
  const color = e.target.value;
  applyColorEffect(color);
});

sizeInput.addEventListener('input', (e) => {
  const size = parseInt(e.target.value);
  applySizeEffect(size);
});

// ==================== CLICK TO ADD PIN ====================
// Click on doll preview to add pins
dollPreview.addEventListener('click', async (e) => {
  if (!currentDollId) {
    alert('⚠️ Please create a doll first before adding pins!');
    return;
  }
  
  // Get click coordinates relative to image
  const rect = dollPreview.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  
  console.log('📌 Adding pin at:', { x, y });
  
  // Add pin to backend
  const updatedDoll = await addPin(currentDollId, x, y, colorInput.value);
  
  if (updatedDoll) {
    // Visual feedback
    createPinElement(x, y, colorInput.value);
    alert(`✅ Pin added at (${x}, ${y})\n\nTotal pins: ${updatedDoll.pins.length}`);
  }
});

// Create visual pin element
function createPinElement(x, y, color) {
  const pin = document.createElement('div');
  pin.className = 'pin';
  pin.style.cssText = `
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${color};
    border-radius: 50%;
    border: 2px solid white;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    cursor: pointer;
    box-shadow: 0 0 10px ${color};
    animation: pinPulse 0.5s ease;
  `;
  
  dollPreview.parentElement.style.position = 'relative';
  dollPreview.parentElement.appendChild(pin);
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save/create doll
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    dollForm.dispatchEvent(new Event('submit'));
  }
  
  // Ctrl/Cmd + U to focus upload input
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault();
    fileInput.click();
  }
});

// ==================== UTILITY FUNCTIONS (For Console Testing) ====================
window.voodooAPI = {
  // Create doll manually
  createDoll: async (name, color, size, imageUrl = null) => {
    const response = await fetch(`${API_URL}/dolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, size, imageUrl })
    });
    return await response.json();
  },
  
  // Get all dolls
  getAllDolls: loadAllDolls,
  
  // Get specific doll
  getDoll: getDoll,
  
  // Delete doll
  deleteDoll: deleteDoll,
  
  // Add pin
  addPin: addPin,
  
  // Test connection
  testConnection: testBackendConnection
};

// ==================== CONSOLE INFO ====================
console.log(`
🎭 Voodoo Doll Creator - Developer Tools

Available commands:
  voodooAPI.getAllDolls()                              - Get all dolls
  voodooAPI.createDoll(name, color, size)              - Create doll
  voodooAPI.getDoll(id)                                - Get specific doll
  voodooAPI.deleteDoll(id)                             - Delete doll
  voodooAPI.addPin(dollId, x, y, color)                - Add pin
  voodooAPI.testConnection()                           - Test backend

Keyboard Shortcuts:
  Ctrl/Cmd + S  - Create doll (submit form)
  Ctrl/Cmd + U  - Upload image

Current State:
  Uploaded Image: ${uploadedImageUrl || 'None'}
  Current Doll ID: ${currentDollId || 'None'}
`);

// Add CSS for pin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pinPulse {
    0% { transform: translate(-50%, -50%) scale(0); }
    50% { transform: translate(-50%, -50%) scale(1.5); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  
  .doll-preview {
    cursor: crosshair;
  }
  
  .pin {
    transition: all 0.3s ease;
  }
  
  .pin:hover {
    transform: translate(-50%, -50%) scale(1.5) !important;
  }
`;
document.head.appendChild(style);