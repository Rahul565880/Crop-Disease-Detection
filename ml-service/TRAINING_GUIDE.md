# 🌾 Crop Disease Detection - Model Training Guide

This guide explains how to train a production-quality AI model for plant disease detection using the PlantVillage dataset.

---

## 📋 Prerequisites

### Hardware Requirements
- **CPU**: Multi-core processor (8+ cores recommended)
- **RAM**: 16GB minimum (32GB recommended)
- **Storage**: 20GB free space
- **GPU**: NVIDIA GPU with CUDA (optional but recommended - 10x faster)

### Software Requirements
- Python 3.8 - 3.11
- TensorFlow 2.x
- pip package manager

---

## 🗂️ Dataset: PlantVillage

The PlantVillage dataset is a benchmark dataset containing 54,306 images of 14 crop plants with 26 diseases.

### Download Dataset Options

#### Option 1: Direct Download (Recommended)
```bash
# Download from Kaggle (requires account)
# 1. Go to: https://www.kaggle.com/datasets/emmarex/plantdisease
# 2. Download the dataset
# 3. Extract to: ml-service/dataset/raw/
```

#### Option 2: Using Kaggle API
```bash
# Install kaggle
pip install kaggle

# Set up API key (get from Kaggle account settings)
# Place kaggle.json in ~/.kaggle/kaggle.json (Linux) or C:\Users\<user>\.kaggle\kaggle.json (Windows)

# Download dataset
kaggle datasets download -d emmarex/plantdisease
unzip plantdisease.zip -d dataset/raw/
```

#### Option 3: Manual Download
1. Visit: https://www.kaggle.com/datasets/emmarex/plantdisease
2. Download the dataset
3. Extract to: `ml-service/dataset/raw/PlantVillage/`

### Expected Dataset Structure
```
dataset/raw/PlantVillage/
├── train/
│   ├── Tomato___Bacterial_spot/
│   ├── Tomato___Early_blight/
│   ├── Tomato___Late_blight/
│   ├── Tomato___Leaf_Mold/
│   ├── Tomato___Septoria_leaf_spot/
│   ├── Tomato___Spider_mites/
│   ├── Tomato___Target_Spot/
│   ├── Tomato___Tomato_Yellow_Leaf_Curl_Virus/
│   ├── Tomato___Tomato_mosaic_virus/
│   ├── Tomato___Healthy/
│   ├── Corn___Common_Rust/
│   ├── Corn___Northern_Leaf_Blight/
│   ├── Corn___Gray_Leaf_Spot/
│   ├── Corn___Healthy/
│   └── ...
└── val/
    └── (same structure)
```

---

## 🚀 Quick Start Training Script

Create `train_production.py` in ml-service folder:

```python
import os
import shutil
import numpy as np
from PIL import Image
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001

# Classes to use (subset for faster training)
SELECTED_CLASSES = [
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites_Two_spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy',
    'Corn___Common_Rust',
    'Corn___Northern_Leaf_Blight',
    'Corn___Gray_Leaf_Spot',
    'Corn___healthy',
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
]

# Disease mapping
DISEASE_MAPPING = {
    'Tomato___Bacterial_spot': {'disease_name': 'Bacterial Spot', 'disease_code': 'bacterial_spot', 'crop_type': 'Tomato'},
    'Tomato___Early_blight': {'disease_name': 'Early Blight', 'disease_code': 'early_blight', 'crop_type': 'Tomato'},
    'Tomato___Late_blight': {'disease_name': 'Late Blight', 'disease_code': 'late_blight', 'crop_type': 'Tomato'},
    'Tomato___Leaf_Mold': {'disease_name': 'Leaf Mold', 'disease_code': 'leaf_mold', 'crop_type': 'Tomato'},
    'Tomato___Septoria_leaf_spot': {'disease_name': 'Septoria Leaf Spot', 'disease_code': 'septoria', 'crop_type': 'Tomato'},
    'Tomato___Spider_mites_Two_spotted_spider_mite': {'disease_name': 'Spider Mites', 'disease_code': 'spider_mites', 'crop_type': 'Tomato'},
    'Tomato___Target_Spot': {'disease_name': 'Target Spot', 'disease_code': 'target_spot', 'crop_type': 'Tomato'},
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {'disease_name': 'Yellow Leaf Curl Virus', 'disease_code': 'tylcv', 'crop_type': 'Tomato'},
    'Tomato___Tomato_mosaic_virus': {'disease_name': 'Tomato Mosaic Virus', 'disease_code': 'tomv', 'crop_type': 'Tomato'},
    'Tomato___healthy': {'disease_name': 'Healthy', 'disease_code': 'healthy', 'crop_type': 'Tomato'},
    'Corn___Common_Rust': {'disease_name': 'Common Rust', 'disease_code': 'common_rust', 'crop_type': 'Corn'},
    'Corn___Northern_Leaf_Blight': {'disease_name': 'Northern Leaf Blight', 'disease_code': 'northern_leaf_blight', 'crop_type': 'Corn'},
    'Corn___Gray_Leaf_Spot': {'disease_name': 'Gray Leaf Spot', 'disease_code': 'gray_leaf_spot', 'crop_type': 'Corn'},
    'Corn___healthy': {'disease_name': 'Healthy', 'disease_code': 'healthy', 'crop_type': 'Corn'},
    'Apple___Apple_scab': {'disease_name': 'Apple Scab', 'disease_code': 'apple_scab', 'crop_type': 'Apple'},
    'Apple___Black_rot': {'disease_name': 'Black Rot', 'disease_code': 'black_rot', 'crop_type': 'Apple'},
    'Apple___Cedar_apple_rust': {'disease_name': 'Cedar Apple Rust', 'disease_code': 'cedar_apple_rust', 'crop_type': 'Apple'},
    'Apple___healthy': {'disease_name': 'Healthy', 'disease_code': 'healthy', 'crop_type': 'Apple'},
    'Potato___Early_blight': {'disease_name': 'Early Blight', 'disease_code': 'early_blight', 'crop_type': 'Potato'},
    'Potato___Late_blight': {'disease_name': 'Late Blight', 'disease_code': 'late_blight', 'crop_type': 'Potato'},
    'Potato___healthy': {'disease_name': 'Healthy', 'disease_code': 'healthy', 'crop_type': 'Potato'},
}

def prepare_dataset():
    """Prepare dataset by copying only selected classes."""
    raw_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'raw', 'PlantVillage')
    train_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'train')
    val_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'val')
    
    for split in ['train', 'val']:
        os.makedirs(os.path.join(train_dir if split == 'train' else val_dir, split), exist_ok=True)
    
    for class_name in SELECTED_CLASSES:
        for split in ['train', 'val']:
            src = os.path.join(raw_dir, split, class_name)
            dst = os.path.join(train_dir if split == 'train' else val_dir, split, class_name)
            
            if os.path.exists(src):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                print(f"Copying {class_name} ({split})...")
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                print(f"Warning: {src} not found")

def create_model(num_classes):
    """Create transfer learning model with MobileNetV2."""
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    base_model.trainable = False
    
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    
    return model

def train():
    """Main training function."""
    print("=" * 60)
    print("Plant Disease Detection - Production Training")
    print("=" * 60)
    
    # Prepare data
    prepare_dataset()
    
    train_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'train')
    val_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'val')
    
    # Data augmentation
    train_datagen = keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='reflect',
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        validation_split=0.1
    )
    
    val_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True,
        subset='training'
    )
    
    val_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False,
        subset='validation'
    )
    
    print(f"\nTraining samples: {train_generator.samples}")
    print(f"Validation samples: {val_generator.samples}")
    print(f"Number of classes: {len(train_generator.class_indices)}")
    
    model = create_model(len(train_generator.class_indices))
    model.summary()
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            'models/best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
            mode='max'
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=0.00001
        ),
        CSVLogger('training_log.csv')
    ]
    
    # Phase 1: Train classifier
    print("\n" + "=" * 60)
    print("Phase 1: Training classifier layers")
    print("=" * 60)
    
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator,
        callbacks=callbacks[:1]
    )
    
    # Phase 2: Fine-tune
    print("\n" + "=" * 60)
    print("Phase 2: Fine-tuning (unfreezing top layers)")
    print("=" * 60)
    
    base_model = model.layers[0]
    base_model.trainable = True
    
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history_fine = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    # Save final model
    model.save('models/plant_disease_model.h5')
    
    # Save labels
    import json
    indices_to_class = {v: k for k, v in train_generator.class_indices.items()}
    
    labels_data = {
        'classes': [indices_to_class[i] for i in range(len(indices_to_class))],
        'class_indices': train_generator.class_indices,
        'disease_mapping': DISEASE_MAPPING
    }
    
    with open('models/class_labels.json', 'w') as f:
        json.dump(labels_data, f, indent=2)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print(f"Final Accuracy: {history_fine.history['val_accuracy'][-1]:.4f}")
    print("Model saved to: models/plant_disease_model.h5")
    print("Labels saved to: models/class_labels.json")
    print("=" * 60)

if __name__ == "__main__":
    train()
```

---

## 🏃 Running the Training

### Step 1: Download Dataset
```bash
# Download from Kaggle (recommended)
# https://www.kaggle.com/datasets/emmarex/plantdisease

# Extract to: ml-service/dataset/raw/PlantVillage/
```

### Step 2: Run Training
```bash
cd ml-service
python train_production.py
```

### Step 3: Monitor Progress
```bash
# Watch training log
tail -f training_log.csv

# Check model checkpoints
ls -la models/
```

---

## 🖥️ Google Colab (Free GPU Training)

For faster training without installing TensorFlow locally:

### 1. Open Google Colab
Go to: https://colab.research.google.com/

### 2. Create New Notebook

### 3. Run This Code:
```python
# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Navigate to your project
%cd /content/drive/MyDrive/'Crop disease detection application'/ml-service

# Install dependencies
!pip install tensorflow kaggle

# Download dataset
!mkdir -p dataset/raw/PlantVillage
!kaggle datasets download -d emmarex/plantdisease
!unzip -q plantdisease.zip -d dataset/raw/PlantVillage/

# Run training
!python train_production.py

# Download trained model
from google.colab import files
files.download('models/plant_disease_model.h5')
files.download('models/class_labels.json')
```

### 4. Upload Model Back
Copy the downloaded model files to `ml-service/models/`

---

## 📊 Expected Results

With the PlantVillage dataset and transfer learning:

| Metric | Expected Value |
|--------|---------------|
| Training Accuracy | 95-99% |
| Validation Accuracy | 90-98% |
| Test Accuracy | 85-95% |

### Confusion Matrix
The model should correctly distinguish between:
- Healthy vs Diseased leaves
- Different disease types
- Different crop types

---

## 🔧 Troubleshooting

### Out of Memory Error
```python
# Reduce batch size
BATCH_SIZE = 16  # or 8
```

### Slow Training
```python
# Use smaller image size
IMG_SIZE = 128  # instead of 224
```

### Low Accuracy
1. Check dataset is properly organized
2. Increase training epochs
3. Try different augmentation
4. Use more data

---

## 📱 Model Optimization (Optional)

After training, optimize for faster inference:

```python
# Convert to TensorFlow Lite
import tensorflow as tf

model = tf.keras.models.load_model('models/plant_disease_model.h5')

# Create TFLite model
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save
with open('models/plant_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

---

## ✅ Next Steps

1. **Download PlantVillage Dataset** from Kaggle
2. **Run training** (50+ epochs for best results)
3. **Test model** with real leaf images
4. **Update ML service** with new model
5. **Deploy** and monitor accuracy

---

## 📚 Additional Resources

- [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease)
- [TensorFlow Tutorial](https://www.tensorflow.org/tutorials/images/transfer_learning)
- [Plant Disease Detection Paper](https://arxiv.org/abs/1511.08060)

---

**Need help?** If you encounter any issues during training, let me know and I can help troubleshoot!
