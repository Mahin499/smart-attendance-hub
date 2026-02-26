# -*- coding: utf-8 -*-
"""
Created on Sat Feb 14 18:34:45 2026

@author: mahin

Face Recognition Attendance System
This module handles real-time face recognition and attendance marking
using the webcam and a dataset of known faces.
"""

import cv2
import face_recognition
import os
import numpy as np
import csv
from datetime import datetime

# ===============================
# Load Known Faces from Dataset
# ===============================

path = 'dataset'
images = []
classNames = []

myList = os.listdir(path)
print("Loaded Students:", myList)

for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    images.append(curImg)
    classNames.append(os.path.splitext(cl)[0])


def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList


encodeListKnown = findEncodings(images)
print("Encoding Complete ✅")


# ===============================
# Attendance File Handling
# ===============================

attendance_file = 'Attendance.csv'

# Create file if not exists
if not os.path.exists(attendance_file):
    with open(attendance_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Date', 'Time', 'Count'])

attendance_count = {}


def markAttendance(name):
    now = datetime.now()
    dateString = now.strftime('%Y-%m-%d')
    timeString = now.strftime('%H:%M:%S')

    if name not in attendance_count:
        attendance_count[name] = 1
    else:
        attendance_count[name] += 1

    with open(attendance_file, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([name, dateString, timeString, attendance_count[name]])

    print(f"✅ POSITIVE: {name} Attendance Marked | Count: {attendance_count[name]}")


# ===============================
# Start Webcam
# ===============================

cap = cv2.VideoCapture(0)

print("System Started 🎥")

while True:
    success, img = cap.read()
    imgSmall = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgSmall = cv2.cvtColor(imgSmall, cv2.COLOR_BGR2RGB)

    facesCurFrame = face_recognition.face_locations(imgSmall)
    encodesCurFrame = face_recognition.face_encodings(imgSmall, facesCurFrame)

    if len(facesCurFrame) == 0:
        print("❌ NEGATIVE: No Face Detected")

    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)

        matchIndex = np.argmin(faceDis)

        if matches[matchIndex]:
            name = classNames[matchIndex].upper()
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1*4, x2*4, y2*4, x1*4

            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.rectangle(img, (x1, y2-35), (x2, y2), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, name, (x1+6, y2-6),
                        cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)

            markAttendance(name)

        else:
            print("❌ NEGATIVE: Face Not Recognized")

    cv2.imshow('Webcam', img)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
