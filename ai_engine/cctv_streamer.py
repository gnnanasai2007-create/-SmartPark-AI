"""
SmartPark AI - CCTV Camera Feed & AI Overlay Streamer
Generates live annotated video frames with vehicle detections, slot boundaries, and OCR readouts.
Can stream to HTTP MJPEG (accessible directly in web browser or React <img> / canvas tag).
"""
import time
import math
import cv2
import numpy as np

class CCTVStreamer:
    def __init__(self, width=960, height=540):
        self.width = width
        self.height = height
        self.frame_count = 0
        self.fps = 15

        # Slot layout definitions for 8 slots in view
        self.slots = [
            {"id": "A-01", "type": "emergency", "x": 40, "y": 80, "w": 90, "h": 160, "occupied": False, "plate": None},
            {"id": "A-02", "type": "women_safety", "x": 150, "y": 80, "w": 90, "h": 160, "occupied": False, "plate": None},
            {"id": "A-03", "type": "women_safety", "x": 260, "y": 80, "w": 90, "h": 160, "occupied": True, "plate": "KA-04-MB-2210"},
            {"id": "A-04", "type": "ev", "x": 370, "y": 80, "w": 90, "h": 160, "occupied": False, "plate": None},
            {"id": "A-05", "type": "ev", "x": 480, "y": 80, "w": 90, "h": 160, "occupied": True, "plate": "TS-09-EV-8890"},
            {"id": "A-06", "type": "regular", "x": 590, "y": 80, "w": 90, "h": 160, "occupied": True, "plate": "DL-01-AB-1234"},
            {"id": "A-07", "type": "regular", "x": 700, "y": 80, "w": 90, "h": 160, "occupied": False, "plate": None},
            {"id": "A-08", "type": "regular", "x": 810, "y": 80, "w": 90, "h": 160, "occupied": True, "plate": "MH-12-PQ-9009"}
        ]

    def update_slot_status(self, slot_id, is_occupied, plate=None):
        for s in self.slots:
            if s["id"] == slot_id:
                s["occupied"] = is_occupied
                s["plate"] = plate if is_occupied else None
                break

    def generate_frame(self):
        """Draws realistic parking surveillance camera view"""
        self.frame_count += 1
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)

        # Background asphalt
        frame[:] = (38, 38, 42)

        # Driving lane marking
        cv2.line(frame, (20, 290), (self.width - 20, 290), (80, 80, 85), 2)
        cv2.line(frame, (20, 480), (self.width - 20, 480), (80, 80, 85), 2)

        # Dashed lane divider
        for x in range(30, self.width - 40, 50):
            cv2.line(frame, (x, 385), (x + 25, 385), (200, 200, 200), 2)

        # Draw parking bays
        for s in self.slots:
            x, y, w, h = s["x"], s["y"], s["w"], s["h"]
            slot_id = s["id"]
            stype = s["type"]
            is_occ = s["occupied"]

            # Bay boundary outline color based on status:
            # Green = Available, Red = Occupied, Blue = EV, Purple = Women's Safety, Red = Emergency
            if is_occ:
                box_color = (60, 60, 235) # Red (BGR)
                status_text = "OCCUPIED"
            elif stype == "ev":
                box_color = (235, 140, 40) # Blue
                status_text = "EV CHARGE"
            elif stype == "women_safety":
                box_color = (200, 80, 210) # Purple/Pink
                status_text = "WOMEN SAFE"
            elif stype == "emergency":
                box_color = (40, 80, 235) # Amber Red
                status_text = "EMERGENCY"
            else:
                box_color = (70, 205, 80) # Green (BGR)
                status_text = "AVAILABLE"

            # Draw parking bay lines
            cv2.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)

            # Slot ID Tag
            cv2.rectangle(frame, (x, y - 24), (x + w, y), box_color, -1)
            cv2.putText(frame, slot_id, (x + 6, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

            if is_occ:
                # Draw vehicle body (Sedan/SUV contour)
                car_x1, car_y1 = x + 10, y + 15
                car_x2, car_y2 = x + w - 10, y + h - 15

                # Car body
                car_body_color = (120, 110, 115)
                if stype == "ev":
                    car_body_color = (160, 130, 70)
                elif stype == "women_safety":
                    car_body_color = (130, 90, 140)

                cv2.rectangle(frame, (car_x1, car_y1), (car_x2, car_y2), car_body_color, -1)
                cv2.rectangle(frame, (car_x1, car_y1), (car_x2, car_y2), (255, 255, 255), 1)

                # Windshields
                cv2.rectangle(frame, (car_x1 + 6, car_y1 + 18), (car_x2 - 6, car_y1 + 45), (40, 40, 45), -1)
                cv2.rectangle(frame, (car_x1 + 6, car_y2 - 40), (car_x2 - 6, car_y2 - 15), (40, 40, 45), -1)

                # Wheels
                cv2.circle(frame, (car_x1, car_y1 + 30), 4, (20, 20, 20), -1)
                cv2.circle(frame, (car_x2, car_y1 + 30), 4, (20, 20, 20), -1)
                cv2.circle(frame, (car_x1, car_y2 - 30), 4, (20, 20, 20), -1)
                cv2.circle(frame, (car_x2, car_y2 - 30), 4, (20, 20, 20), -1)

                # AI YOLO Detection Bounding Box overlay
                cv2.rectangle(frame, (x + 4, y + 6), (x + w - 4, y + h - 6), (0, 69, 255), 2)
                cv2.putText(frame, "CAR 98%", (x + 8, y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

                # Number Plate Badge
                plate = s["plate"] or "KA-01-AI-2026"
                cv2.rectangle(frame, (x + 12, y + h - 32), (x + w - 12, y + h - 16), (240, 240, 240), -1)
                cv2.putText(frame, plate[:9], (x + 14, y + h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 1)
            else:
                # Status banner for empty slot
                cv2.putText(frame, "EMPTY", (x + 14, y + int(h/2)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 1)

        # Moving car in aisle simulation
        pulse = (self.frame_count % 300) / 300.0
        car_aisle_x = int(30 + pulse * (self.width - 160))
        if pulse < 0.9:
            # Draw passing vehicle
            cv2.rectangle(frame, (car_aisle_x, 345), (car_aisle_x + 110, 415), (70, 100, 140), -1)
            cv2.rectangle(frame, (car_aisle_x, 345), (car_aisle_x + 110, 415), (0, 220, 255), 2)
            cv2.putText(frame, "DETECTING VEHICLE", (car_aisle_x, 335), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 255), 1)
            cv2.putText(frame, "SPEED: 12 km/h", (car_aisle_x, 435), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)

        # Header CCTV OSD (On-Screen Display)
        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.rectangle(frame, (0, 0), (self.width, 42), (20, 20, 25), -1)
        cv2.putText(frame, f"CAM-01: SMARTPARK NORTH WING | {timestamp_str} | FPS: 30.0",
                    (20, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 128), 2)

        # Live REC circle
        if int(time.time() * 2) % 2 == 0:
            cv2.circle(frame, (self.width - 40, 22), 7, (0, 0, 255), -1)
        cv2.putText(frame, "AI LIVE", (self.width - 110, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return frame

    def get_jpeg_bytes(self):
        frame = self.generate_frame()
        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return jpeg.tobytes() if ret else None
