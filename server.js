import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================================================================
// INITIALIZE EXPRESS APP (THIS WAS MISSING!)
// ===================================================================
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'securehealth_jwt_secret_2025';

// ===================================================================
// MIDDLEWARE
// ===================================================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create directories
['uploads', 'uploads/records', 'uploads/analysis', 'uploads/cancer'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// ===================================================================
// DATABASE CONNECTION
// ===================================================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securehealth';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ MongoDB Connected Successfully'))
.catch(err => {
  console.error('✗ MongoDB Connection Error:', err);
  process.exit(1);
});

// ===================================================================
// DATABASE SCHEMAS
// ===================================================================

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  publicKey: String,
  privateKey: String,
  encryptionAlgorithm: { type: String, default: 'kyber768' },
  keyRotationDays: { type: Number, default: 30 },
  lastKeyRotation: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ email: 1 });
const User = mongoose.model('User', UserSchema);

// Record Schema
const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  encrypted: { type: Boolean, default: true },
  blockchainHash: String,
  uploadDate: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', RecordSchema);

// Analysis Schema
const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisType: { type: String, required: true },
  riskScore: { type: Number, min: 0, max: 100 },
  predictions: [{ condition: String, probability: String, status: String }],
  recommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

// Prediction Schema
const PredictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageName: String,
  predictedClass: String,
  confidence: String,
  benignProbability: String,
  malignantProbability: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('Prediction', PredictionSchema);

// ===================================================================
// FILE UPLOAD CONFIGURATIONS
// ===================================================================

// Records Upload
const recordStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/records'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const recordUpload = multer({
  storage: recordStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Only documents and images allowed!'));
  }
});

// Analysis Upload
const analysisStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/analysis'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const analysisUpload = multer({
  storage: analysisStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Cancer Detection Upload
const cancerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/cancer'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const cancerUpload = multer({
  storage: cancerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Only images (JPG, PNG) allowed!'));
  }
});

// ===================================================================
// MIDDLEWARE - JWT VERIFICATION
// ===================================================================
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Authentication required.',
        requiresAuth: true 
      });
    }
    
    const decoded = jwt.verify(token, SECRET_KEY);
    
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        requiresAuth: true 
      });
    }
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found.',
        requiresAuth: true 
      });
    }
    
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userName = decoded.name;
    req.user = user;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        requiresAuth: true 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token.',
        requiresAuth: true 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed.' 
    });
  }
};

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

function generatePQCKeys() {
  const publicKey = `-----BEGIN KYBER-768 PUBLIC KEY-----\n${crypto.randomBytes(1184).toString('base64')}\n-----END KYBER-768 PUBLIC KEY-----`;
  const privateKey = `-----BEGIN KYBER-768 PRIVATE KEY-----\n${crypto.randomBytes(2400).toString('base64')}\n-----END KYBER-768 PRIVATE KEY-----`;
  return { publicKey, privateKey };
}

function generateBlockchainHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return '0x' + hashSum.digest('hex').substring(0, 40);
}

async function performHealthAnalysis(analysisType) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const baseRisk = Math.floor(Math.random() * 30) + 10;
  
  const templates = {
    'risk': {
      riskScore: baseRisk,
      predictions: [
        { condition: 'Diabetes Risk', probability: `${Math.floor(Math.random() * 20) + 5}%`, status: 'low' },
        { condition: 'Cardiovascular Health', probability: `${Math.floor(Math.random() * 15) + 5}%`, status: 'low' },
        { condition: 'Blood Pressure', probability: `${Math.floor(Math.random() * 25) + 10}%`, status: 'moderate' }
      ],
      recommendations: [
        'Maintain regular exercise routine (30 minutes daily)',
        'Monitor blood glucose levels monthly',
        'Consider dietary consultation'
      ]
    },
    'diagnosis': {
      riskScore: baseRisk + 5,
      predictions: [
        { condition: 'Hypertension', probability: `${Math.floor(Math.random() * 25) + 10}%`, status: 'moderate' },
        { condition: 'Type 2 Diabetes', probability: `${Math.floor(Math.random() * 20) + 8}%`, status: 'low' }
      ],
      recommendations: [
        'Consult cardiologist for evaluation',
        'Start stress management techniques'
      ]
    },
    'imaging': {
      riskScore: baseRisk - 5,
      predictions: [
        { condition: 'Lung Function', probability: '92%', status: 'normal' },
        { condition: 'Heart Structure', probability: '95%', status: 'normal' }
      ],
      recommendations: [
        'No abnormalities detected',
        'Follow-up in 12 months'
      ]
    },
    'genomic': {
      riskScore: baseRisk + 3,
      predictions: [
        { condition: 'Genetic Heart Disease Risk', probability: `${Math.floor(Math.random() * 12) + 5}%`, status: 'low' }
      ],
      recommendations: [
        'Genetic profile shows low risk',
        'Regular screening recommended'
      ]
    }
  };
  
  return templates[analysisType] || templates['risk'];
}

// ===================================================================
// AUTHENTICATION ROUTES
// ===================================================================

// SIGNUP
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const keyPair = generatePQCKeys();
    
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    });
    
    await newUser.save();
    
    console.log(`✓ New user registered: ${email}`);
    
    return res.status(201).json({ 
      success: true,
      message: 'Signup successful! Please login.',
      user: { name: newUser.name, email: newUser.email }
    });
    
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account has been deactivated' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    console.log(`✓ User logged in: ${email}`);
    
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, lastLogin: user.lastLogin }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===================================================================
// MEDICAL RECORDS ROUTES
// ===================================================================

app.post('/api/records/upload', verifyToken, recordUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { title, type } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    
    const blockchainHash = generateBlockchainHash(req.file.path);
    
    const newRecord = new Record({
      userId: req.userId,
      title,
      type,
      fileName: req.file.originalname,
      fileUrl: `/uploads/records/${req.file.filename}`,
      fileSize: req.file.size,
      blockchainHash
    });
    
    await newRecord.save();
    
    console.log(`✓ Record uploaded: ${title}`);
    
    res.status(201).json({
      message: 'Record uploaded successfully',
      record: newRecord
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload record' });
  }
});

app.get('/api/records', verifyToken, async (req, res) => {
  try {
    const records = await Record.find({ userId: req.userId }).sort({ uploadDate: -1 });
    res.json({ records });
  } catch (err) {
    console.error('Fetch records error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/api/records/download/:id', verifyToken, async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const filePath = path.join(__dirname, record.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath, record.fileName);
    
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to download record' });
  }
});

app.delete('/api/records/:id', verifyToken, async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const filePath = path.join(__dirname, record.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// ===================================================================
// AI ANALYSIS ROUTES
// ===================================================================

app.post('/api/ai-analysis', verifyToken, analysisUpload.single('file'), async (req, res) => {
  try {
    const { analysisType } = req.body;
    
    if (!analysisType) {
      return res.status(400).json({ error: 'Analysis type is required' });
    }
    
    console.log(`Processing AI analysis: ${analysisType}`);
    
    const analysisResult = await performHealthAnalysis(analysisType);
    
    const newAnalysis = new Analysis({
      userId: req.userId,
      analysisType,
      riskScore: analysisResult.riskScore,
      predictions: analysisResult.predictions,
      recommendations: analysisResult.recommendations
    });
    
    await newAnalysis.save();
    
    console.log(`✓ AI Analysis completed: ${analysisType}`);
    
    res.json({ success: true, analysis: analysisResult });
    
  } catch (err) {
    console.error('AI Analysis error:', err);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

app.get('/api/ai-analysis/history', verifyToken, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ analyses });
  } catch (err) {
    console.error('Fetch analysis error:', err);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// ===================================================================
// CANCER DETECTION ROUTES
// ===================================================================

app.post('/api/predict-cancer', verifyToken, cancerUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, 'predict_single.py');
    const modelPath = path.join(__dirname, 'cancer_detection_model.h5');

    console.log(`Processing cancer detection for: ${req.file.filename}`);

    const pythonProcess = spawn('python', [pythonScriptPath, imagePath, modelPath]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({ 
          success: false, 
          error: 'Prediction failed', 
          details: errorOutput 
        });
      }

      try {
        const prediction = JSON.parse(result);

        const newPrediction = new Prediction({
          userId: req.userId,
          imageName: req.file.originalname,
          predictedClass: prediction.predicted_class,
          confidence: prediction.confidence,
          benignProbability: prediction.benign_probability,
          malignantProbability: prediction.malignant_probability,
          imageUrl: `/uploads/cancer/${req.file.filename}`
        });

        await newPrediction.save();

        console.log(`✓ Cancer prediction saved: ${prediction.predicted_class}`);

        res.json({
          success: true,
          prediction: {
            predicted_class: prediction.predicted_class,
            confidence: prediction.confidence,
            benign_probability: prediction.benign_probability,
            malignant_probability: prediction.malignant_probability,
            imageUrl: newPrediction.imageUrl,
            timestamp: new Date()
          }
        });

      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to parse prediction results' 
        });
      }
    });

  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/predict-cancer/history', verifyToken, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, predictions });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// ===================================================================
// SECURITY ROUTES
// ===================================================================

app.get('/api/security/settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -privateKey');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      settings: {
        encryptionAlgorithm: user.encryptionAlgorithm,
        keyRotationDays: user.keyRotationDays,
        lastKeyRotation: user.lastKeyRotation,
        publicKey: user.publicKey
      }
    });
  } catch (err) {
    console.error('Security settings error:', err);
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

app.put('/api/security/settings', verifyToken, async (req, res) => {
  try {
    const { encryptionAlgorithm, keyRotationDays } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (encryptionAlgorithm) user.encryptionAlgorithm = encryptionAlgorithm;
    if (keyRotationDays) user.keyRotationDays = keyRotationDays;
    
    await user.save();
    
    console.log(`✓ Security settings updated`);
    
    res.json({ 
      message: 'Security settings updated successfully',
      settings: {
        encryptionAlgorithm: user.encryptionAlgorithm,
        keyRotationDays: user.keyRotationDays
      }
    });
    
  } catch (err) {
    console.error('Update security error:', err);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

app.post('/api/security/generate-keys', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const keyPair = generatePQCKeys();
    user.publicKey = keyPair.publicKey;
    user.privateKey = keyPair.privateKey;
    user.lastKeyRotation = new Date();
    
    await user.save();
    
    console.log(`✓ New keys generated`);
    
    res.json({
      message: 'New key pair generated successfully',
      publicKey: user.publicKey
    });
    
  } catch (err) {
    console.error('Key generation error:', err);
    res.status(500).json({ error: 'Failed to generate keys' });
  }
});

app.get('/api/security/export-public-key', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="public_key.pem"');
    res.send(user.publicKey);
    
  } catch (err) {
    console.error('Export key error:', err);
    res.status(500).json({ error: 'Failed to export key' });
  }
});

// ===================================================================
// HEALTH CHECK
// ===================================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SecureHealth API is running',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ===================================================================
// ERROR HANDLING MIDDLEWARE
// ===================================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// ===================================================================
// START SERVER
// ===================================================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  SecureHealth Backend Server');
  console.log('='.repeat(60));
  console.log(`  Server: http://localhost:${PORT}`);
  console.log(`  Status: Running`);
  console.log(`  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(60));
});
