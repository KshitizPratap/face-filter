import { FaceLandmarker, FilesetResolver } from "mediapipe";
import * as THREE from "three";

const demosSection = document.getElementById("demos");

let faceLandmarker, faceMesh, leftEarring, rightEarring;
let scene, camera, renderer, videoTexture;
let video = document.getElementById("webcam");

// Buffers for stabilizing earrings position
let leftEarBuffer = { x: 0, y: 0 };
let rightEarBuffer = { x: 0, y: 0 };
const alpha = 0.2;

/********************************************************************/
//  Initialize Mediapipe FaceLandmarker
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
    runningMode: "VIDEO",
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
  const canvas = document.getElementById("renderer");
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(640, 480);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
  camera.position.z = 2;

  createFaceMesh();
  createEarrings();
  animate();
}

/********************************************************************/
//  Create a Face Mesh
/********************************************************************/
function createFaceMesh() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  FACE_OVAL_INDICES.forEach(() => {
    shape.lineTo(0, 0);
  });

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    colorWrite: false,
    color: 0xfff,
    side: THREE.DoubleSide,
    opacity: 0,
  });

  faceMesh = new THREE.Mesh(geometry, material);
  faceMesh.scale.set(2, 1.75, 1);
  scene.add(faceMesh);
}

/********************************************************************/
//  Create Earrings Mesh
/********************************************************************/
function createEarrings() {
  const geometry = new THREE.PlaneGeometry(1, 1); // Adjust size

  // Load earring textures
  const leftTexture = new THREE.TextureLoader().load(
    "./models/earrings/earrings_1.png"
  );
  const rightTexture = new THREE.TextureLoader().load(
    "./models/earrings/earrings_1.png"
  );

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  leftTexture.anisotropy = maxAnisotropy;
  rightTexture.anisotropy = maxAnisotropy;

  leftTexture.minFilter = THREE.LinearMipMapLinearFilter;
  leftTexture.magFilter = THREE.LinearFilter;

  rightTexture.minFilter = THREE.LinearMipMapLinearFilter;
  rightTexture.magFilter = THREE.LinearFilter;

  const leftMaterial = new THREE.MeshBasicMaterial({
    map: leftTexture,
    transparent: true,
  });
  const rightMaterial = new THREE.MeshBasicMaterial({
    map: rightTexture,
    transparent: true,
  });

  leftEarring = new THREE.Mesh(geometry, leftMaterial);
  rightEarring = new THREE.Mesh(geometry, rightMaterial);

  // Initial positions (will be updated dynamically)
  leftEarring.position.set(-0.5, 0, 0);
  rightEarring.position.set(0.5, 0, 0);

  leftEarring.scale.set(0.045, 0.125, 0.4);
  rightEarring.scale.set(0.045, 0.125, 0.4);

  faceMesh.add(leftEarring);
  faceMesh.add(rightEarring);
}

/********************************************************************/
//  Update Face Mesh
/********************************************************************/
function updateFaceMesh(landmarks) {
  if (!faceMesh || landmarks.length === 0) return;

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
  faceMesh.geometry.dispose();
  faceMesh.geometry = geometry;
}

/********************************************************************/
//  Update Earrings Position with Smoothing
/********************************************************************/
function updateEarrings(landmarks) {
  if (!leftEarring || !rightEarring || landmarks.length === 0) return;

  let leftX = -(landmarks[LEFT_EAR_BOTTOM].x - 0.5) * 2;
  let leftY = -(landmarks[LEFT_EAR_BOTTOM].y - 0.5) * 2;
  let leftZ = landmarks[LEFT_EAR_BOTTOM].z;

  let rightX = -(landmarks[RIGHT_EAR_BOTTOM].x - 0.5) * 2;
  let rightY = -(landmarks[RIGHT_EAR_BOTTOM].y - 0.5) * 2;
  let rightZ = landmarks[RIGHT_EAR_BOTTOM].z;

  // Smooth position using an exponential moving average
  leftEarBuffer.x = alpha * leftX + (1 - alpha) * leftEarBuffer.x;
  leftEarBuffer.y = alpha * leftY + (1 - alpha) * leftEarBuffer.y;

  rightEarBuffer.x = alpha * rightX + (1 - alpha) * rightEarBuffer.x;
  rightEarBuffer.y = alpha * rightY + (1 - alpha) * rightEarBuffer.y;

  // Update earring positions
  leftEarring.position.set(
    leftEarBuffer.x + 0.035,
    leftEarBuffer.y - 0.07,
    -0.1
  );
  rightEarring.position.set(
    rightEarBuffer.x - 0.05,
    rightEarBuffer.y - 0.07,
    -0.1
  );
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
//  Face Detection & 3D Mesh Update
/********************************************************************/
let lastVideoTime = -1;
async function predictWebcam() {
  let startTimeMs = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);

    if (results.faceLandmarks.length > 0) {
      updateFaceMesh(results.faceLandmarks[0]);
      updateEarrings(results.faceLandmarks[0]);
    }
  }

  window.requestAnimationFrame(predictWebcam);
}

/********************************************************************/
//  Render Loop
/********************************************************************/
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
