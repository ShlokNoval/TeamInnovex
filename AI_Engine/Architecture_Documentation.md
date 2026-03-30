# AI Analysis Engine — Architecture & File Documentation

This document provides a complete breakdown of every file generated in the `AI_Engine/` directory, explaining **why** each file exists and **how** it accomplishes its tasks in the Road Hazard Detection System.

---

## 1. Core Configuration & Environment

### `config.py`
**Why we are using it:** 
In large AI systems, hardcoding threshold values (like minimum confidence) and weights inside Python functions leads to messy code and makes tuning difficult. We need one central place to store all these rules.
**How it works:** 
It stores constants like `CONF_THRESHOLD = 0.45` (for YOLO), `DMAX_TRACKING` (pixel distance to match moving objects), and dictionaries like `POTHOLE_WEIGHTS` (`area`, `conf`, etc). When we want to increase the penalty for animal velocity in the final score, both you and Sarvesh only need to change it in this file.

### `.env.example` & `requirements.txt`
**Why we are using it:** 
To define external dependencies and environment secrets.
**How it works:** 
`requirements.txt` tells `pip` exactly which versions to install (e.g., OpenCV, Ultralytics YOLOv8, FastAPI). `.env.example` provides a template for hidden details like the Ngrok URL and JJ's Backend target URL without committing actual secrets.

---

## 2. Shared Vision Capabilities (Partner's Domain)

### `detector.py`
**Why we are using it:** 
This is the "Eyes" of the system. We need a way to look at raw video frames, find objects dynamically using AI, and draw nice bounding boxes before returning the frame.
**How it works:** 
It initializes the `YOLOv8n` model. On every frame, it runs `detect()`. It checks if the image is too dark (`night_mode`), and if so, it applies CLAHE preprocessing and Gamma Corrections (lightening shadows). It then runs YOLO inference, discards weak predictions using Non-Maximum Suppression (NMS), normalises bounding box sizes, and uses OpenCV to `annotate()` colored boxes, track IDs, and severity alerts.

### `tracking.py`
**Why we are using it:** 
YOLO only finds objects in *one* frame. If a bounding box appears on a cow in frame 1, and another in frame 2, YOLO doesn't know it's the *same* cow. We need tracking to calculate velocity and movement behaviours over time.
**How it works:** 
It implements a mathematically strict **Centroid Tracker**. For every bounding box, it calculates the center point `(x + w/2, y + h/2)`. On the next frame, it finds the Euclidean Distance between old centers and new centers. If the distance is under 50 pixels (`DMAX`), it assigns the exact same ID so we know how fast it's traveling pixel-by-pixel.

---

## 3. Specialized Hazard Logic (Sarvesh & Partner Domains)

### `pothole_engine.py`
**Why we are using it:** 
To determine how dangerous a specific pothole is based on its size and position.
**How it works:** 
It takes the normalized area of a bounding box (`A_norm`), YOLO's confidence, and its position (Center lane is deadlier than Roadside). It applies mathematical weights to combine these into a `Severity_Score`. It also tracks if the pothole is "GROWING" by tracking bounding-box history over successive video frames.

### `animal_engine.py` 
**Why we are using it:** 
To quantify how dangerous a stray animal is on the road. A cow standing on the curb is low-risk, but a dog running across the center lane is critical.
**How it works:** 
It consumes pixel velocity directly from `tracking.py`. If pixel velocity exceeds 20px, it labels the animal as `RUNNING`. It checks if the centroid intersects the mathematical road-zone polygon to flag if it's `on_road` or `approaching`. It then computes an `Animal Risk Score` mapped to Low/Medium/High severity labels.

### `accident_engine.py` 
**Why we are using it:** 
Accidents aren't standalone "objects" YOLO detects naturally, so we have to track optical anomalies and vehicular collisions.
**How it works:** 
It calculates **Intersection over Union (IoU)** between two tracked vehicle bounding boxes. If IoU is high (they overlap), it assumes an impact. It calculates **Optical Flow (Farneback)**, tracking pixel shifts between frames. A massive spike in optical flow standard deviation represents a sudden collision. It also detects "hit and run" behaviour if a car drops its velocity by >70% in 1 frame and immediately exits the scene post-collision.

---

## 4. Integration & Connectivity

### `scoring.py`
**Why we are using it:** 
The administrative dashboard on the UI needs one single number to prioritize notifications rather than sorting through three different engine algorithms.
**How it works:** 
It implements a `Priority Index (PI)` mathematical equation. It takes the Hazard Score and multiplies it by an exponential Time Decay function `exp(-\lambda * \Delta t)`. This ensures older unresolved hazards automatically sink to the bottom of the dashboard while sudden new HIGH severity alerts shoot to the top.

### `app.py`
**Why we are using it:** 
Everything we built above are isolated math files. We need an API layer that connects them to the real world — particularly Shlok's UI feed and JJ's Backend database.
**How it works:** 
It runs on **FastAPI** and opens a `WebSocket` listener. Shlok streams Base64 video images via an Ngrok tunnel to this socket. `app.py` passes the image string into the `detector`, tracks it, pushes it to an engine, and checks the results. If the severity is HIGH, `app.py` immediately issues an outbound `HTTP POST` carrying a JSON payload (containing coordinates, severity, and annotated snapshots) to JJ's backend server so the database is updated in real-time.

---

## 5. Validation

### `tests/` Directory
**Why we are using it:** 
Mathematical scoring functions are incredibly brittle. A small typo in the order-of-operations will result in broken crash alerts.
**How it works:** 
Using `PyTest`, we wrote scripts that input dummy bounding box dimensions or velocity speeds and assert that `pothole_engine.py` or `animal_engine.py` spits out the exact numerical severity rating expected from the prompt formula.
