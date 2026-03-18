const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'medconnect/others';
    
    if (file.fieldname === 'certificate') {
      folder = 'medconnect/certificates';
    } else if (file.fieldname === 'prescription') {
      folder = 'medconnect/prescriptions';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
