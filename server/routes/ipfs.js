const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

// Import services
const ipfsService = require('../services/ipfsService');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  }
});

/**
 * @route   POST /api/ipfs/upload
 * @desc    Upload a file directly to IPFS (without blockchain)
 * @access  Public
 */
router.post(
  '/upload',
  upload.single('file'),
  [
    check('encrypt', 'encrypt must be a boolean').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { encrypt } = req.body;
      const file = req.file;
      const filePath = file.path;
      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload to IPFS
      const ipfsResult = await ipfsService.uploadToIPFS(
        fileBuffer,
        file.originalname,
        encrypt === 'true' || encrypt === true
      );
      
      // Clean up temp file
      fs.unlinkSync(filePath);
      
      res.status(201).json({
        success: true,
        cid: ipfsResult.cid,
        encryptionKey: ipfsResult.encryptionKey,
        name: file.originalname,
        size: file.size,
        fileType: file.mimetype
      });
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/ipfs/:cid
 * @desc    Get a file from IPFS by CID
 * @access  Public
 */
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { filename, type, encryptionKey } = req.query;
    
    // Get file from IPFS
    const fileBuffer = await ipfsService.getFromIPFS(cid, encryptionKey);
    
    // Set response headers
    if (type) {
      res.setHeader('Content-Type', type);
    }
    
    if (filename) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/ipfs/:cid/pin
 * @desc    Pin a file on IPFS
 * @access  Public
 */
router.post('/:cid/pin', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Pin file
    const success = await ipfsService.pinFile(cid);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to pin file' });
    }
    
    res.json({
      success: true,
      cid,
      pinned: true
    });
  } catch (error) {
    console.error('Error pinning file on IPFS:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/ipfs/:cid/pin
 * @desc    Unpin a file from IPFS
 * @access  Public
 */
router.delete('/:cid/pin', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Unpin file
    const success = await ipfsService.unpinFile(cid);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to unpin file' });
    }
    
    res.json({
      success: true,
      cid,
      pinned: false
    });
  } catch (error) {
    console.error('Error unpinning file from IPFS:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 