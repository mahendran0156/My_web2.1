import mongoose from 'mongoose';

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

export default mongoose.model('Prediction', PredictionSchema);
