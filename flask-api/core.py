import numpy as np
import random
from ultralytics import YOLO
from deep_sort.deep_sort.tracker import Tracker
from deep_sort.deep_sort.nn_matching import NearestNeighborDistanceMetric
from deep_sort.tools.generate_detections import create_box_encoder
from deep_sort.deep_sort.detection import Detection
import cv2
import os
import datetime


def annotate_vid(model, file_path, filename, objects):
    # initiating DeepSort's tracker
    similarity_metric = NearestNeighborDistanceMetric("cosine", 0.4, None)
    tracker = Tracker(similarity_metric)

    # Feature extractor
    feature_extractor = create_box_encoder("./deep_sort/mars-small128.pb", batch_size=1)
    color_tracks = {}

    # loading the appropriate openCV parser and video generator
    cap = cv2.VideoCapture(file_path)
    ret, frame = cap.read()

    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    detectedFileName = f"{current_datetime}_{filename}"
    inter_file_path = "outcoming/inter_" + detectedFileName
    ret_file_path = "outcoming/" + detectedFileName

    inter_file = open(inter_file_path, "x")
    inter_file.close()
    cap_out = cv2.VideoWriter(inter_file_path, cv2.VideoWriter_fourcc(*'mp4v'), cap.get(cv2.CAP_PROP_FPS),
                              (frame.shape[1], frame.shape[0]))

    # Getting the YOLO results of the first frame
    resultss = model(frame)

    while ret:
        for results in resultss:

            # Generating a list of Detection(s) for the current frame
            bboxes, features, scores = ([] for k in range(3))
            for bbox_wrapper in results.boxes.data.tolist():
                min_x, min_y, max_x, max_y, score, class_id = bbox_wrapper
                for id in objects:
                    if class_id == int(id):  # Filter detections by class ID
                        tlwh = (min_x, min_y, max_x - min_x, max_y - min_y)
                        bboxes.append(np.asarray(tlwh))
                        scores.append(score)
            features = feature_extractor(frame, bboxes)

            detections = []
            for k in range(len(bboxes)):
                detections.append(Detection(bboxes[k], scores[k], features[k]))

            # Feeding the Detection(s) to DeepSort's Tracker
            tracker.predict()
            tracker.update(detections)

            # Adding the assigned (colored) detections to the frame
            for track in tracker.tracks:
                if track.track_id not in color_tracks:
                    color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                    while color in color_tracks.values():
                        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                    color_tracks[track.track_id] = color

                cv2.rectangle(frame, (int(track.to_tlbr()[0]), int(track.to_tlbr()[1])),
                              (int(track.to_tlbr()[2]), int(track.to_tlbr()[3])), color_tracks[track.track_id], 3)
                # print(track.to_tlbr())

        # Adding the updated frame to the output video
        cap_out.write(frame)

        # Getting the next frame
        ret, frame = cap.read()
        resultss = model(frame)

    cap.release()
    cap_out.release()

    os.system("ffmpeg -i {} -c:v libx264 -crf 17  -b:v 6000k -maxrate  6000K -bufsize 4M   -movflags -faststart  -preset veryfast -dn  {}".format(inter_file_path, ret_file_path))
    os.remove(inter_file_path)

    return ret_file_path


def annotate_img(model, file_path, filename, objects):
    image = cv2.imread(file_path)

    resultss = model(file_path)
    for result in resultss:
        for box_wrapper in result.boxes.data.tolist():
            min_x, min_y, max_x, max_y, score, class_id = box_wrapper
            
            for id in objects:
                    if class_id == int(id):  # Filter detections by class ID
                        tlbr = (min_x, min_y, max_x, max_y)
                        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                        cv2.rectangle(image, (int(min_x), int(min_y)), (int(max_x), int(max_y)), color, 3)   

    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    detectedFileName = f"{current_datetime}_{filename}"
    ret_file_path = "outcoming/" + detectedFileName

    ret_file = open(ret_file_path, "x")
    ret_file.close()
    cv2.imwrite(ret_file_path, image)

    return ret_file_path


def annotate(model, file_path, filename, objects):

    supported_image_exts = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}

    for ext in supported_image_exts:
        if filename.endswith(ext):
            return annotate_img(model, file_path, filename, objects)
    
    return annotate_vid(model, file_path, filename, objects)
