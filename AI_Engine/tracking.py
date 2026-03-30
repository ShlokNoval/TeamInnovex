import collections
import numpy as np
from config import DMAX_TRACKING

class CentroidTracker:
    def __init__(self, D_max=DMAX_TRACKING, max_disappeared=10):
        self.D_max = D_max
        self.max_disappeared = max_disappeared
        self.next_track_id = 0
        self.objects = {}
        self.disappeared = {}
        self.history = collections.defaultdict(list)

    def register(self, centroid, det):
        self.objects[self.next_track_id] = {
            'centroid': centroid,
            'bbox': det['bbox'],
            'class_name': det['class_name']
        }
        self.disappeared[self.next_track_id] = 0
        self.history[self.next_track_id].append(centroid)
        self.next_track_id += 1

    def deregister(self, track_id):
        del self.objects[track_id]
        del self.disappeared[track_id]
        if track_id in self.history:
            del self.history[track_id]

    def update(self, detections: list) -> dict:
        if len(detections) == 0:
            for track_id in list(self.disappeared.keys()):
                self.disappeared[track_id] += 1
                if self.disappeared[track_id] > self.max_disappeared:
                    self.deregister(track_id)
            return self.objects

        input_centroids = np.zeros((len(detections), 2), dtype="int")
        for i, det in enumerate(detections):
            x, y, w, h = det['bbox']
            input_centroids[i] = (int(x + w / 2), int(y + h / 2))

        if len(self.objects) == 0:
            for i in range(0, len(input_centroids)):
                self.register(input_centroids[i], detections[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = [self.objects[track_id]['centroid'] for track_id in object_ids]
            
            D = np.linalg.norm(np.array(object_centroids)[:, np.newaxis] - input_centroids, axis=2)
            
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                if D[row, col] > self.D_max:
                    continue

                track_id = object_ids[row]
                self.objects[track_id]['centroid'] = input_centroids[col]
                self.objects[track_id]['bbox'] = detections[col]['bbox']
                self.objects[track_id]['class_name'] = detections[col]['class_name']
                self.disappeared[track_id] = 0
                self.history[track_id].append(input_centroids[col])
                
                used_rows.add(row)
                used_cols.add(col)

            unused_rows = set(range(0, D.shape[0])).difference(used_rows)
            unused_cols = set(range(0, D.shape[1])).difference(used_cols)

            for row in unused_rows:
                track_id = object_ids[row]
                self.disappeared[track_id] += 1
                if self.disappeared[track_id] > self.max_disappeared:
                    self.deregister(track_id)
                    
            for col in unused_cols:
                self.register(input_centroids[col], detections[col])

        for track_id in self.objects.keys():
            self.objects[track_id]['velocity_px'] = self.get_velocity(track_id)

        return self.objects

    def get_velocity(self, track_id, frame_interval=1) -> float:
        hist = self.history.get(track_id, [])
        if len(hist) < 2:
            return 0.0
        c1 = hist[-2]
        c2 = hist[-1]
        dist = np.linalg.norm(np.array(c2) - np.array(c1))
        return float(dist / frame_interval)
