# Face Recognition Attendance System

Real-time face recognition attendance marking using OpenCV and the `face_recognition` library.

## Requirements

This script requires the following Python packages:

```bash
pip install opencv-python
pip install face-recognition
pip install numpy
```

Or install from requirements.txt:
```bash
pip install -r ml/requirements.txt
```

## Setup

### 1. Create Dataset Directory

Create a `dataset` folder in the project root with student face images:

```
dataset/
├── student1.jpg
├── student2.jpg
├── student3.jpg
└── ...
```

The filename (without extension) will be used as the student name.

### 2. Add Your Images

- Use clear photos of each student's face
- One image per student or multiple images per folder
- JPEG or JPG format recommended
- Recommended resolution: 500x500 pixels minimum

## Usage

Run the script:

```bash
python ml/face_recognition_attendance.py
```

### Controls

- **Q key**: Quit the application
- **Webcam**: Displays real-time video with detected faces

### Output

- Console output shows detection status
- `Attendance.csv` file is created/updated with attendance records
- CSV columns: Name, Date, Time, Count

## How It Works

1. **Load Encodings**: Reads all images from `dataset/` folder and generates face encodings
2. **Webcam Capture**: Captures video frames from the default webcam (ID 0)
3. **Face Detection**: Detects faces in the current frame
4. **Face Recognition**: Compares detected faces with known encodings
5. **Attendance Marking**: Records attendance with timestamp when a match is found

## Output Format

The `Attendance.csv` file looks like:

```
Name,Date,Time,Count
john,2026-02-26,14:30:45,1
john,2026-02-26,14:31:10,2
jane,2026-02-26,14:32:00,1
```

## Troubleshooting

### "No Face Detected" Messages

- Ensure adequate lighting
- Face should be clearly visible to camera
- Check if webcam is working properly

### "Face Not Recognized"

- Ensure student images are in the `dataset/` folder
- Verify image quality and face visibility
- Try with multiple images per student for better accuracy

### ImportError: No module named 'face_recognition'

```bash
pip install face-recognition
```

On some systems, you may also need to install dlib:
```bash
pip install dlib
```

## Future Enhancements

- [ ] Integrate with Supabase database
- [ ] Add confidence threshold configuration
- [ ] Support for multiple students with same encodings
- [ ] Database logging instead of CSV
- [ ] Real-time analytics dashboard
- [ ] Performance optimization for larger datasets

## Author

Created by: mahin  
Date: February 14, 2026
