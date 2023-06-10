from flask import Flask, request, jsonify, send_file
import os
import time
import datetime
from ultralytics import YOLO
from core import annotate
import ast


# Loading the YOLO model
#model = YOLO('yolov8n.pt')
#model = YOLO('aerial-airport.onnx')
model = YOLO('coco.onnx')


app = Flask(__name__)

# Define a list to store the objects
objects = []

current_datetime = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

@app.route("/", methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        # Check if a file is present in the request
        if 'file' not in request.files:
            return "No file uploaded"

        file = request.files['file']
        objects = ast.literal_eval(request.form.getlist('objects')[0])  # Get the list of objects from the request
        print("Received objects:", objects)
        # Check if the file is empty
        if file.filename == '':
            return "Empty file uploaded"

        # Save the file to a temporary location
        uploadedFileName = f"{current_datetime}_{file.filename}"
        file_path = os.path.join('incoming', uploadedFileName)
        file.save(file_path)

        ret_file_path = annotate(model, file_path, file.filename, objects)


        # Delay for 5 seconds before returning the file
        time.sleep(5)

        # Return the processed file to the user
        return send_file(ret_file_path, as_attachment=True)
        

    return "Hello World!"

@app.route("/getallobjects", methods=['GET'])
def get_all_objects():
    global objects


    #objects = [
    #{'id': 0, 'name': 'plane'}
    #]
    
    objects = [
    {'id': 0, 'name': 'person'},
    {'id': 1, 'name': 'bicycle'},
    {'id': 2, 'name': 'car'},
    {'id': 3, 'name': 'motorcycle'},
    {'id': 4, 'name': 'airplane'},
    {'id': 5, 'name': 'bus'},
    {'id': 6, 'name': 'train'},
    {'id': 7, 'name': 'truck'},
    {'id': 8, 'name': 'boat'},
    {'id': 9, 'name': 'traffic light'},
    {'id': 10, 'name': 'fire hydrant'},
    {'id': 11, 'name': 'stop sign'},
    {'id': 12, 'name': 'parking meter'},
    {'id': 13, 'name': 'bench'},
    {'id': 14, 'name': 'bird'},
    {'id': 15, 'name': 'cat'},
    {'id': 16, 'name': 'dog'},
    {'id': 17, 'name': 'horse'},
    {'id': 18, 'name': 'sheep'},
    {'id': 19, 'name': 'cow'},
    {'id': 20, 'name': 'elephant'},
    {'id': 21, 'name': 'bear'},
    {'id': 22, 'name': 'zebra'},
    {'id': 23, 'name': 'giraffe'},
    {'id': 24, 'name': 'backpack'},
    {'id': 25, 'name': 'umbrella'},
    {'id': 26, 'name': 'handbag'},
    {'id': 27, 'name': 'tie'},
    {'id': 28, 'name': 'suitcase'},
    {'id': 29, 'name': 'frisbee'},
    {'id': 30, 'name': 'skis'},
    {'id': 31, 'name': 'snowboard'},
    {'id': 32, 'name': 'sports ball'},
    {'id': 33, 'name': 'kite'},
    {'id': 34, 'name': 'baseball bat'},
    {'id': 35, 'name': 'baseball glove'},
    {'id': 36, 'name': 'skateboard'},
    {'id': 37, 'name': 'surfboard'},
    {'id': 38, 'name': 'tennis racket'},
    {'id': 39, 'name': 'bottle'},
    {'id': 40, 'name': 'wine glass'},
    {'id': 41, 'name': 'cup'},
    {'id': 42, 'name': 'fork'},
    {'id': 43, 'name': 'knife'},
    {'id': 44, 'name': 'spoon'},
    {'id': 45, 'name': 'bowl'},
    {'id': 46, 'name': 'banana'},
    {'id': 47, 'name': 'apple'},
    {'id': 48, 'name': 'sandwich'},
    {'id': 49, 'name': 'orange'},
    {'id': 50, 'name': 'broccoli'},
    {'id': 51, 'name': 'carrot'},
    {'id': 52, 'name': 'hot dog'},
    {'id': 53, 'name': 'pizza'},
    {'id': 54, 'name': 'donut'},
    {'id': 55, 'name': 'cake'},
    {'id': 56, 'name': 'chair'},
    {'id': 57, 'name': 'couch'},
    {'id': 58, 'name': 'potted plant'},
    {'id': 59, 'name': 'bed'},
    {'id': 60, 'name': 'dining table'},
    {'id': 61, 'name': 'toilet'},
    {'id': 62, 'name': 'tv'},
    {'id': 63, 'name': 'laptop'},
    {'id': 64, 'name': 'mouse'},
    {'id': 65, 'name': 'remote'},
    {'id': 66, 'name': 'keyboard'},
    {'id': 67, 'name': 'cell phone'},
    {'id': 68, 'name': 'microwave'},
    {'id': 69, 'name': 'oven'},
    {'id': 70, 'name': 'toaster'},
    {'id': 71, 'name': 'sink'},
    {'id': 72, 'name': 'refrigerator'},
    {'id': 73, 'name': 'book'},
    {'id': 74, 'name': 'clock'},
    {'id': 75, 'name': 'vase'},
    {'id': 76, 'name': 'scissors'},
    {'id': 77, 'name': 'teddy bear'},
    {'id': 78, 'name': 'hair drier'},
    {'id': 79, 'name': 'toothbrush'}
    ]

    # Return the list of objects as JSON response
    return jsonify(objects)

if __name__ == "__main__":
    app.run()
