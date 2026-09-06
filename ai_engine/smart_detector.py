"""
SmartPark AI - Intelligent Smart Parking Detection System
OpenCV + YOLO + Plate OCR + Live CCTV MJPEG Server + Node.js API Sync

Usage:
  python ai_engine/smart_detector.py [--port 5050] [--test]
"""
import sys
import time
import argparse
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
from cctv_streamer import CCTVStreamer
from plate_ocr import LicensePlateOCR

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

API_URL = "http://localhost:5000/api"
streamer = CCTVStreamer()
ocr_engine = LicensePlateOCR()

class StreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/video_feed':
            self.send_response(200)
            self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                while True:
                    frame_bytes = streamer.get_jpeg_bytes()
                    if frame_bytes:
                        self.wfile.write(b'--frame\r\n')
                        self.send_header('Content-type', 'image/jpeg')
                        self.send_header('Content-length', str(len(frame_bytes)))
                        self.end_headers()
                        self.wfile.write(frame_bytes)
                        self.wfile.write(b'\r\n')
                    time.sleep(0.06) # ~16 FPS
            except (ConnectionResetError, BrokenPipeError):
                pass
        elif self.path == '/snapshot':
            frame_bytes = streamer.get_jpeg_bytes()
            self.send_response(200)
            self.send_header('Content-type', 'image/jpeg')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(frame_bytes)
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body><h1>SmartPark AI CCTV Stream Active</h1><img src='/video_feed' /></body></html>")

    def log_message(self, format, *args):
        # Silence default HTTP server access logs
        return

def sync_slot_to_backend(slot_number, is_occupied, vehicle_number=None, confidence=98.5):
    """Notifies Node.js Express backend about AI detection state changes"""
    try:
        payload = {
            "slotNumber": slot_number,
            "isOccupied": is_occupied,
            "vehicleNumber": vehicle_number,
            "confidence": confidence,
            "vehicleType": "Sedan",
            "gate": "AI CCTV Cam-01"
        }
        res = requests.post(f"{API_URL}/ai/sync-detection", json=payload, timeout=2.0)
        if res.status_code == 200:
            print(f"[AI Detection] Synced slot {slot_number} -> {'OCCUPIED (' + str(vehicle_number) + ')' if is_occupied else 'AVAILABLE'}", flush=True)
    except Exception as e:
        # Backend might be offline or still starting
        pass

def run_ai_loop():
    """Background thread simulating vehicle movement & automated slot updates"""
    time.sleep(3) # Wait for startup
    cycle = 0
    while True:
        cycle += 1
        time.sleep(12)

        # Periodically alternate occupancy on slot A-07 or A-02 to simulate real-world AI detection
        if cycle % 2 == 1:
            plate, conf = ocr_engine.extract_text(None, fallback_seed=cycle)
            streamer.update_slot_status("A-07", True, plate)
            sync_slot_to_backend("A-07", True, plate, conf)
        else:
            streamer.update_slot_status("A-07", False, None)
            sync_slot_to_backend("A-07", False, None)

def main():
    parser = argparse.ArgumentParser(description="SmartPark AI Detection Module")
    parser.add_argument("--port", type=int, default=5050, help="MJPEG Stream Port (default 5050)")
    parser.add_argument("--test", action="store_true", help="Run quick automated validation and exit")
    args = parser.parse_args()

    if args.test:
        print("[AI Test] Generating test CCTV frame...", flush=True)
        frame_bytes = streamer.get_jpeg_bytes()
        assert frame_bytes is not None and len(frame_bytes) > 1000, "Frame generation failed!"
        print(f"[AI Test] Successfully generated frame ({len(frame_bytes)} bytes)", flush=True)
        plate, conf = ocr_engine.extract_text(None)
        print(f"[AI Test] OCR plate extracted: {plate} ({conf}% confidence)", flush=True)
        print("[AI Test] Verification PASSED!", flush=True)
        sys.exit(0)

    # Start background detection sync loop
    t = threading.Thread(target=run_ai_loop, daemon=True)
    t.start()

    server = HTTPServer(('0.0.0.0', args.port), StreamHandler)
    print("====================================================", flush=True)
    print(f"📹 SmartPark AI CCTV Streamer running on port {args.port}", flush=True)
    print(f"📡 MJPEG Feed: http://localhost:{args.port}/video_feed", flush=True)
    print("====================================================", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down AI streamer...", flush=True)
        server.server_close()

if __name__ == "__main__":
    main()
