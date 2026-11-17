const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const User = require('../models/User');

const uploadsDirectory = path.join(__dirname, '..', 'uploads');

const isImage = (buffer, mimeType) => {
  if (mimeType === 'image/jpeg') {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  }
  return mimeType === 'image/webp' &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
};

const uploadProfilePhoto = async (req, res) => {
  if (!req.file || !isImage(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Choose a valid JPEG, PNG, or WebP image.'
    });
  }

  const extension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  }[req.file.mimetype];
  const filename = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadsDirectory, filename);

  try {
    await fs.mkdir(uploadsDirectory, { recursive: true });
    await fs.writeFile(destination, req.file.buffer, { flag: 'wx' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePhoto: `/uploads/${filename}` } },
      { new: true, runValidators: true }
    );

    if (!user) {
      await fs.unlink(destination);
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated.',
      user
    });
  } catch (error) {
    console.error('Profile photo upload failed:', error);
    try {
      await fs.unlink(destination);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') {
        console.error('Profile photo cleanup failed:', cleanupError);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Unable to update profile photo.'
    });
  }
};

module.exports = { uploadProfilePhoto };
