import sys
import json
import numpy as np
import cv2
from tensorflow import keras
import os

IMG_SIZE = 256
CLASSES = ['benign', 'malignant']

def predict_image(image_path, model_path):
    """
    Predict cancer type for a single image
    """
    try:
        # Load model
        model = keras.models.load_model(model_path)
        
        # Load and preprocess image
        img = cv2.imread(image_path)
        if img is None:
            raise Exception(f"Failed to read image: {image_path}")
        
        img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_normalized = img_rgb.astype('float32') / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        # Make prediction
        predictions = model.predict(img_batch, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx] * 100
        predicted_class = CLASSES[predicted_class_idx]
        
        # Prepare result
        result = {
            'predicted_class': predicted_class,
            'confidence': f"{confidence:.2f}",
            'benign_probability': f"{predictions[0][0]*100:.2f}",
            'malignant_probability': f"{predictions[0][1]*100:.2f}"
        }
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e)
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments'}), file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2]
    
    predict_image(image_path, model_path)
