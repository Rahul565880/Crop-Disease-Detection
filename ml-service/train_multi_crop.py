import os
import json
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

IMG_SIZE = 224
EPOCHS = 20
BATCH_SIZE = 32

ALL_CLASSES = {
    'Tomato': [
        ('Tomato___Bacterial_Spot', 'Bacterial Spot', 'bacterial_spot'),
        ('Tomato___Early_Blight', 'Early Blight', 'early_blight'),
        ('Tomato___Late_Blight', 'Late Blight', 'late_blight'),
        ('Tomato___Leaf_Mold', 'Leaf Mold', 'leaf_mold'),
        ('Tomato___Septoria_Leaf_Spot', 'Septoria Leaf Spot', 'septoria'),
        ('Tomato___Spider_Mites', 'Spider Mites', 'spider_mites'),
        ('Tomato___Target_Spot', 'Target Spot', 'target_spot'),
        ('Tomato___Yellow_Leaf_Curl_Virus', 'Yellow Leaf Curl Virus', 'ylcv'),
        ('Tomato___Healthy', 'Healthy', 'healthy'),
    ],
    'Corn': [
        ('Corn___Common_Rust', 'Common Rust', 'common_rust'),
        ('Corn___Gray_Leaf_Spot', 'Gray Leaf Spot', 'gray_leaf_spot'),
        ('Corn___Northern_Leaf_Blight', 'Northern Leaf Blight', 'northern_leaf_blight'),
        ('Corn___Healthy', 'Healthy', 'healthy'),
    ],
    'Cotton': [
        ('Cotton___Bacterial_Blight', 'Bacterial Blight', 'bacterial_blight'),
        ('Cotton___Curl_Virus', 'Cotton Leaf Curl Virus', 'cotton_leaf_curl'),
        ('Cotton___Fusarium_Wilt', 'Fusarium Wilt', 'fusarium_wilt'),
        ('Cotton___Healthy', 'Healthy', 'healthy'),
        ('Cotton___Boll_Rot', 'Boll Rot', 'boll_rot'),
    ],
    'Chilli': [
        ('Chilli___Anthracnose', 'Anthracnose', 'anthracnose'),
        ('Chilli___Leaf_Curl', 'Leaf Curl', 'leaf_curl'),
        ('Chilli___Fruit_Rot', 'Fruit Rot', 'fruit_rot'),
        ('Chilli___Powdery_Mildew', 'Powdery Mildew', 'powdery_mildew'),
        ('Chilli___Healthy', 'Healthy', 'healthy'),
    ],
    'Turmeric': [
        ('Turmeric___Leaf_Spot', 'Leaf Spot', 'leaf_spot'),
        ('Turmeric___Rhizome_Rot', 'Rhizome Rot', 'rhizome_rot'),
        ('Turmeric___Shoot_Borer', 'Shoot Borer', 'shoot_borer'),
        ('Turmeric___Healthy', 'Healthy', 'healthy'),
    ],
}

ALL_CLASS_NAMES = []
DISEASE_MAPPING = {}

for crop, diseases in ALL_CLASSES.items():
    for class_name, disease_name, disease_code in diseases:
        ALL_CLASS_NAMES.append(class_name)
        DISEASE_MAPPING[class_name] = {
            'disease_name': disease_name,
            'disease_code': disease_code,
            'crop_type': crop
        }

NUM_CLASSES = len(ALL_CLASS_NAMES)

def create_synthetic_dataset():
    """Create synthetic training dataset for all crop types."""
    print("Creating synthetic training dataset for all crops...")
    
    train_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'train')
    val_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'val')
    
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)
    
    import numpy as np
    from PIL import Image
    
    np.random.seed(42)
    
    for class_name in ALL_CLASS_NAMES:
        train_class_dir = os.path.join(train_dir, class_name)
        val_class_dir = os.path.join(val_dir, class_name)
        os.makedirs(train_class_dir, exist_ok=True)
        os.makedirs(val_class_dir, exist_ok=True)
        
        num_train = 80
        num_val = 20
        
        for i in range(num_train):
            img = generate_leaf_image(class_name, seed=i*1000, is_train=True)
            img.save(os.path.join(train_class_dir, f'img_{i}.jpg'))
        
        for i in range(num_val):
            img = generate_leaf_image(class_name, seed=(i+50)*1000, is_train=False)
            img.save(os.path.join(val_class_dir, f'img_{i}.jpg'))
    
    print(f"Dataset created: {num_train} train, {num_val} val images per class")
    print(f"Total classes: {NUM_CLASSES}")

def generate_leaf_image(class_name, seed=0, is_train=True):
    """Generate synthetic leaf images with disease patterns."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
    
    np.random.seed(seed)
    
    width, height = IMG_SIZE, IMG_SIZE
    img_array = np.zeros((height, width, 3), dtype=np.uint8)
    
    is_healthy = 'Healthy' in class_name
    crop_type = class_name.split('___')[0]
    
    crop_colors = {
        'Tomato': {'base': (70, 120, 50), 'light': (90, 140, 70)},
        'Corn': {'base': (80, 130, 40), 'light': (100, 150, 60)},
        'Cotton': {'base': (60, 110, 45), 'light': (80, 130, 65)},
        'Chilli': {'base': (65, 115, 48), 'light': (85, 135, 68)},
        'Turmeric': {'base': (55, 105, 42), 'light': (75, 125, 62)},
    }
    
    colors = crop_colors.get(crop_type, {'base': (70, 120, 50), 'light': (90, 140, 70)})
    
    for y in range(height):
        for x in range(width):
            noise = np.random.randint(-15, 15, 3)
            leaf_var = int(abs(x - width/2) / width * 20)
            color = np.array(colors['base']) + noise + leaf_var
            img_array[y, x] = np.clip(color, 0, 255).astype(np.uint8)
    
    if is_healthy:
        for _ in range(8):
            y, x = np.random.randint(10, height-10, 2)
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= 4:
                            img_array[y+dy, x+dx] = np.array([50, 90, 35])
    
    elif 'Bacterial' in class_name:
        for _ in range(25):
            y, x = np.random.randint(5, height-8, 2)
            r = np.random.randint(2, 5)
            color = np.array([150, 130, 90])
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= r*r:
                            img_array[y+dy, x+dx] = color
    
    elif 'Blight' in class_name or 'Spot' in class_name:
        num_spots = 12 if 'Late' in class_name else 10
        for _ in range(num_spots):
            y, x = np.random.randint(5, height-20, 2)
            w, h = np.random.randint(12, 25), np.random.randint(10, 18)
            color = np.array([35, 65, 25])
            for dy in range(h):
                for dx in range(w):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        img_array[y+dy, x+dx] = np.clip(color + np.random.randint(-8, 8, 3), 0, 255).astype(np.uint8)
    
    elif 'Rust' in class_name:
        for _ in range(50):
            y, x = np.random.randint(5, height-5, 2)
            r = np.random.randint(2, 5)
            intensity = np.random.randint(160, 200)
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= r*r:
                            img_array[y+dy, x+dx] = np.array([intensity, 80, 40])
    
    elif 'Mold' in class_name or 'Mildew' in class_name:
        for _ in range(40):
            y, x = np.random.randint(5, height-10, 2)
            r = np.random.randint(4, 8)
            color = np.array([180, 180, 120])
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= r*r:
                            img_array[y+dy, x+dx] = np.clip(color + np.random.randint(-20, 20, 3), 0, 255).astype(np.uint8)
    
    elif 'Curl' in class_name or 'Virus' in class_name:
        for _ in range(15):
            y, x = np.random.randint(5, height-15, 2)
            w, h = np.random.randint(15, 30), np.random.randint(10, 20)
            color = np.array([30, 50, 20])
            for dy in range(h):
                for dx in range(w):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        img_array[y+dy, x+dx] = np.clip(color + np.random.randint(-10, 10, 3), 0, 255).astype(np.uint8)
    
    elif 'Septoria' in class_name or 'Target' in class_name:
        for _ in range(30):
            y, x = np.random.randint(5, height-10, 2)
            r = np.random.randint(3, 7)
            color = np.array([130, 100, 70])
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= r*r:
                            img_array[y+dy, x+dx] = color
    
    elif 'Mites' in class_name or 'Borer' in class_name:
        for _ in range(20):
            y, x = np.random.randint(5, height-5, 2)
            r = np.random.randint(1, 3)
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if abs(dy) + abs(dx) <= 2:
                            img_array[y+dy, x+dx] = np.array([40, 30, 20])
    
    elif 'Rot' in class_name or 'Wilt' in class_name:
        num_areas = 8
        for _ in range(num_areas):
            y, x = np.random.randint(5, height-20, 2)
            w, h = np.random.randint(20, 40), np.random.randint(15, 30)
            color = np.array([80, 60, 40]) if 'Rot' in class_name else np.array([100, 80, 60])
            for dy in range(h):
                for dx in range(w):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        img_array[y+dy, x+dx] = np.clip(color + np.random.randint(-15, 15, 3), 0, 255).astype(np.uint8)
    
    elif 'Anthracnose' in class_name or 'Fruit' in class_name:
        for _ in range(25):
            y, x = np.random.randint(5, height-10, 2)
            r = np.random.randint(5, 10)
            for dy in range(-r, r+1):
                for dx in range(-r, r+1):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        if dy*dy + dx*dx <= r*r:
                            intensity = 180 - int((dy*dy + dx*dx) / r / r * 100)
                            img_array[y+dy, x+dx] = np.array([intensity, 60, 40])
    
    elif 'Gray' in class_name:
        for _ in range(35):
            y, x = np.random.randint(5, height-10, 2)
            w, h = np.random.randint(10, 18), np.random.randint(4, 10)
            color = np.array([110, 110, 90])
            for dy in range(h):
                for dx in range(w):
                    if 0 <= y+dy < height and 0 <= x+dx < width:
                        img_array[y+dy, x+dx] = np.clip(color + np.random.randint(-10, 10, 3), 0, 255).astype(np.uint8)
    
    if is_train:
        try:
            from scipy import ndimage
            angle = np.random.randint(-15, 15)
            img_array = ndimage.rotate(img_array, angle, reshape=False, mode='reflect')
            
            if np.random.random() > 0.5:
                img_array = np.fliplr(img_array)
            
            if np.random.random() > 0.7:
                brightness = np.random.uniform(0.85, 1.15)
                img_array = np.clip(img_array * brightness, 0, 255).astype(np.uint8)
        except:
            pass
    
    return Image.fromarray(img_array)

def create_model():
    """Create transfer learning model using MobileNetV2."""
    print(f"Creating model with {NUM_CLASSES} classes...")
    
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
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model():
    """Train the plant disease detection model."""
    print("=" * 60)
    print("Plant Disease Detection - Multi-Crop Model Training")
    print("=" * 60)
    print(f"Total classes: {NUM_CLASSES}")
    print(f"Classes: {ALL_CLASS_NAMES}")
    
    create_synthetic_dataset()
    
    train_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'train')
    val_dir = os.path.join(os.path.dirname(__file__), 'dataset', 'val')
    
    train_datagen = keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='reflect',
        zoom_range=0.2,
        brightness_range=[0.8, 1.2]
    )
    
    val_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    print(f"\nTraining samples: {train_generator.samples}")
    print(f"Validation samples: {val_generator.samples}")
    print(f"Classes: {list(train_generator.class_indices.keys())}")
    
    model = create_model()
    model.summary()
    
    callbacks = [
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
        )
    ]
    
    print("\n" + "=" * 60)
    print("Phase 1: Training classifier layers")
    print("=" * 60)
    
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator,
        callbacks=callbacks[:1]
    )
    
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
        epochs=10,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'plant_disease_model.h5')
    model.save(model_path)
    print(f"\nModel saved to: {model_path}")
    
    class_indices = train_generator.class_indices
    indices_to_class = {v: k for k, v in class_indices.items()}
    
    labels_data = {
        'classes': [indices_to_class[i] for i in range(NUM_CLASSES)],
        'class_indices': class_indices,
        'disease_mapping': DISEASE_MAPPING
    }
    
    labels_path = os.path.join(model_dir, 'class_labels.json')
    with open(labels_path, 'w') as f:
        json.dump(labels_data, f, indent=2)
    print(f"Labels saved to: {labels_path}")
    
    final_train_acc = history_fine.history['accuracy'][-1] if history_fine.history.get('accuracy') else history.history['accuracy'][-1]
    final_val_acc = history_fine.history['val_accuracy'][-1] if history_fine.history.get('val_accuracy') else history.history['val_accuracy'][-1]
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print(f"Final Training Accuracy: {final_train_acc:.4f}")
    print(f"Final Validation Accuracy: {final_val_acc:.4f}")
    print(f"\nSupported Crops: {list(ALL_CLASSES.keys())}")
    print("=" * 60)
    
    return model

if __name__ == "__main__":
    try:
        from scipy import ndimage
    except ImportError:
        import subprocess
        subprocess.check_call(['pip', 'install', 'scipy'])
        from scipy import ndimage
    
    train_model()
