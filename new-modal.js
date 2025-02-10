import { FaceLandmarker, FilesetResolver } from "mediapipe";
import * as THREE from "three";

const demosSection = document.getElementById("demos");

let faceLandmarker, faceOutline;
let runningMode = "IMAGE";
let scene, camera, renderer, faceMesh, videoTexture;
let video = document.getElementById("webcam");

const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

/********************************************************************/
//  Initialize Mediapipe FaceLandmarker (For 468 Keypoints)
/********************************************************************/
const initializeFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numFaces: 1,
  });
  demosSection.classList.remove("invisible");

  initThreeJS(); // Initialize THREE.js after Mediapipe is ready
};
initializeFaceLandmarker();

/********************************************************************/
//  Initialize THREE.js Scene
/********************************************************************/
function initThreeJS() {
  // Get the existing canvas element
  const canvas = document.getElementById("renderer");

  // Create the THREE.js renderer using the existing canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

  // Set the correct size
  renderer.setSize(640, 480); // Match the canvas size in the HTML

  // Create Scene and Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 600 / 600, 0.1, 1000);
  camera.position.z = 2;

  // Create an initial face mesh
  createFaceMesh();
  animate();
}

/********************************************************************/
//  Create a Face Mesh with Red Material (Supports 468 Keypoints)
/********************************************************************/
function createFaceMesh() {
  const shape = new THREE.Shape();
  const outlineVertices = new Float32Array(FACE_OVAL_INDICES.length * 3);

  // Initialize the shape with the first point
  shape.moveTo(0, 0);

  // Create the face outline shape
  FACE_OVAL_INDICES.forEach((index, i) => {
    shape.lineTo(0, 0); // Temporary, will update dynamically
  });

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff, // White color
    side: THREE.DoubleSide,
  });

  faceOutline = new THREE.Mesh(geometry, material);
  faceOutline.scale.set(1.5, 1.5, 1);
  scene.add(faceOutline);
}

/********************************************************************/
//  Setup Webcam Feed
/********************************************************************/
let enableWebcamButton;
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable webcam
async function enableCam(event) {
  if (!faceLandmarker) {
    alert("Face Landmarker is still loading. Please try again..");
    return;
  }

  enableWebcamButton.classList.add("removed");

  const canvas = document.getElementById("renderer");
  canvas.style.display = "block";

  const constraints = { video: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
      videoTexture = new THREE.VideoTexture(video);
      video.addEventListener("loadeddata", predictWebcam);
    })
    .catch((err) => {
      console.error(err);
    });
}

/********************************************************************/
//  Face Detection & 3D Mesh Update (468 Keypoints)
/********************************************************************/
let lastVideoTime = -1;
async function predictWebcam() {
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: "VIDEO" });
  }

  let startTimeMs = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);

    if (results.faceLandmarks.length > 0) {
      updateFaceMesh(results.faceLandmarks[0]); // Use the first detected face
    }
  }

  window.requestAnimationFrame(predictWebcam);
}

/********************************************************************/
//  Update Face Mesh to Show 468 Keypoints
/********************************************************************/
function updateFaceMesh(landmarks) {
  if (!faceOutline || landmarks.length === 0) return;

  const keypoints = landmarks.map((kp) => [
    -(kp.x - 0.5) * 2, // Flip horizontally
    -(kp.y - 0.5) * 2,
    kp.z * 2,
  ]);

  const shape = new THREE.Shape();
  const firstPoint = keypoints[FACE_OVAL_INDICES[0]];
  shape.moveTo(firstPoint[0], firstPoint[1]);

  FACE_OVAL_INDICES.forEach((index) => {
    const [x, y] = keypoints[index];
    shape.lineTo(x, y);
  });

  const geometry = new THREE.ShapeGeometry(shape);
  faceOutline.geometry.dispose(); // Free old geometry memory
  faceOutline.geometry = geometry;
}

/********************************************************************/
//  Render Loop
/********************************************************************/
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
