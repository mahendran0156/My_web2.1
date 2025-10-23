import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  publicKey: String,
  privateKey: String,
  encryptionAlgorithm: { 
    type: String, 
    default: 'kyber768' 
  },
  keyRotationDays: { 
    type: Number, 
    default: 30 
  },
  lastKeyRotation: { 
    type: Date, 
    default: Date.now 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster queries
UserSchema.index({ email: 1 });

export default mongoose.model('User', UserSchema);
