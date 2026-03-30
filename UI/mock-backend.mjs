import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/ws",
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

console.log("Starting Simulated YOLOv8 Relay Server on Port 8000...");

io.on("connection", (socket) => {
  console.log(`Node connected: ${socket.id}`);

  // Listen for raw frames from the mobile /stream route
  socket.on("process_frame", (data) => {
    // data contains { frame: base64, timestamp }
    
    // Simulate AI Detection (mock pothole randomly)
    const hasDetection = Math.random() > 0.8;
    const detections = [];
    
    if (hasDetection) {
      detections.push({
        bbox: [100, 100, 200, 200], // Fake bounding box
        class: "pothole",
        confidence: 0.89,
        severity: "high"
      });
    }

    // Broadcast the original frame (as if it was annotated) back to the SOC Terminal
    socket.broadcast.emit("annotated_frame", {
      annotatedFrame: data.frame, // Send exact frame back for now
      detections: detections,
      timestamp: data.timestamp
    });
  });

  socket.on("disconnect", () => {
    console.log(`Node disconnected: ${socket.id}`);
  });
});

httpServer.listen(8000, () => {
  console.log("Mock YOLO Relay listening on port 8000!");
});
