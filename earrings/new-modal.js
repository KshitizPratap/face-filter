import { FaceLandmarker, FilesetResolver } from "mediapipe";
import * as THREE from "three";

let JEWELLERYMESH = [];
let earringPosition = {
  position1: [],
  position2: [],
  distance: 0,
};

const demosSection = document.getElementById("demos");
window.selectedJewelleryIndex = 0;
let faceLandmarker, faceMesh;
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
  renderer.setSize(500, 575);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 500 / 575, 0.1, 1000);
  camera.position.z = 2;

  createFaceMesh();
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
  faceMesh.scale.set(2.1, 1.75, 1);
  scene.add(faceMesh);
}

/********************************************************************/
//  Create Earrings Mesh
/********************************************************************/
function createEarrings() {
  if (JEWELLERYMESH[0]) {
    faceMesh.remove(JEWELLERYMESH[0]);
    faceMesh.remove(JEWELLERYMESH[1]);
  }

  const geometry = new THREE.PlaneGeometry(1, 1); // Adjust size
  const { image, position, scale } =
    jewelleryConfig.earrings[selectedJewelleryIndex];
  const second_position = [-position[0], ...position.slice(1)];

  earringPosition = {
    position1: position,
    position2: second_position,
    distance: Math.abs(2 * position[0]),
  };

  // Load earring textures
  const leftTexture = new THREE.TextureLoader().load(image);
  const rightTexture = new THREE.TextureLoader().load(image);

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  leftTexture.anisotropy = maxAnisotropy;
  rightTexture.anisotropy = maxAnisotropy;

  leftTexture.minFilter = THREE.LinearMipMapLinearFilter;
  leftTexture.magFilter = THREE.LinearFilter;

  rightTexture.minFilter = THREE.LinearMipMapLinearFilter;
  rightTexture.magFilter = THREE.LinearFilter;

  const leftMaterial = new THREE.MeshBasicMaterial({
    map: leftTexture,
    opacity: 0,
    transparent: true,
  });
  const rightMaterial = new THREE.MeshBasicMaterial({
    map: rightTexture,
    opacity: 0,
    transparent: true,
  });

  JEWELLERYMESH[0] = new THREE.Mesh(geometry, leftMaterial);
  JEWELLERYMESH[1] = new THREE.Mesh(geometry, rightMaterial);

  JEWELLERYMESH[0].scale.set(...scale);
  JEWELLERYMESH[1].scale.set(...scale);

  faceMesh.add(JEWELLERYMESH[0]);
  faceMesh.add(JEWELLERYMESH[1]);
}

/********************************************************************/
//  Update Face Mesh
/********************************************************************/
function updateFaceMesh(landmarks) {
  if (!faceMesh || landmarks.length === 0) return;

  const keypoints = landmarks.map((kp) => [
    -(kp.x - 0.5) * 2, // Flip horizontally
    -(kp.y - 0.5) * 1.5,
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
  if (!JEWELLERYMESH[0] || !JEWELLERYMESH[1] || landmarks.length === 0) return;

  let leftX = -(landmarks[LEFT_EAR_BOTTOM].x - 0.5) * 2;
  let leftY = -(landmarks[LEFT_EAR_BOTTOM].y - 0.5) * 2;

  let rightX = -(landmarks[RIGHT_EAR_BOTTOM].x - 0.5) * 2;
  let rightY = -(landmarks[RIGHT_EAR_BOTTOM].y - 0.5) * 2;

  let leftCheekX = -(landmarks[LEFT_CHEEK].x - 0.5) * 2;
  let rightCheekX = -(landmarks[RIGHT_CHEEK].x - 0.5) * 2;

  let fadeSpeed = 0.25;

  // Compute target opacity based on position
  let leftTargetOpacity = leftX < leftCheekX ? 0 : 1;
  let rightTargetOpacity = rightX > rightCheekX ? 0 : 1;

  // Smoothly interpolate opacity
  JEWELLERYMESH[0].material.opacity =
    fadeSpeed * leftTargetOpacity +
    (1 - fadeSpeed) * JEWELLERYMESH[0].material.opacity;
  JEWELLERYMESH[1].material.opacity =
    fadeSpeed * rightTargetOpacity +
    (1 - fadeSpeed) * JEWELLERYMESH[1].material.opacity;

  // If opacity reaches near zero, hide completely
  if (JEWELLERYMESH[0].material.opacity < 0.05)
    JEWELLERYMESH[0].visible = false;
  else JEWELLERYMESH[0].visible = true;

  if (JEWELLERYMESH[1].material.opacity < 0.05)
    JEWELLERYMESH[1].visible = false;
  else JEWELLERYMESH[1].visible = true;

  // Smooth position using an exponential moving average
  leftEarBuffer.x = alpha * leftX + (1 - alpha) * leftEarBuffer.x;
  leftEarBuffer.y = alpha * leftY + (1 - alpha) * leftEarBuffer.y;

  rightEarBuffer.x = alpha * rightX + (1 - alpha) * rightEarBuffer.x;
  rightEarBuffer.y = alpha * rightY + (1 - alpha) * rightEarBuffer.y;

  const [x1, y1, z1] = earringPosition.position1;
  const [x2, y2, z2] = earringPosition.position2;

  // Update earring positions
  JEWELLERYMESH[0].position.set(leftEarBuffer.x + x1, leftEarBuffer.y + y1, z1);
  JEWELLERYMESH[1].position.set(
    rightEarBuffer.x + x2,
    rightEarBuffer.y + y2,
    z2
  );
}

/********************************************************************/
//  Setup Webcam Feed
/********************************************************************/

export async function enableCam(index) {
  const canvas = document.getElementById("renderer");
  canvas.style.display = "block";
  selectedJewelleryIndex = index;
  createEarrings();

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

export function nextPrevJewelleryHandler(action) {
  const jewelleryArray = [...jewelleryConfig["earrings"]];
  const length = jewelleryArray.length;

  if (action === "next") {
    selectedJewelleryIndex = (selectedJewelleryIndex + 1) % length;
  } else {
    selectedJewelleryIndex =
      selectedJewelleryIndex - 1 < 0 ? length - 1 : selectedJewelleryIndex - 1;
  }

  handleTryOn(selectedJewelleryIndex, jewelleryArray[selectedJewelleryIndex]);
}

export const handleTryOn = (index, card) => {
  if (!faceLandmarker) {
    alert("Face Landmarker is still loading. Please try again..");
    return;
  }

  const canvasContainer = document.querySelector(".canvasContainer");
  canvasContainer.classList.remove("removeCanvasContainer");

  const tryOnHeading = document.querySelector(
    ".canvasContainer .jewelleryDetails .jewelleryLabel h3"
  );
  tryOnHeading.textContent = card.label;

  const tryOnDescription = document.querySelector(
    ".canvasContainer .jewelleryDetails .jewelleryLabel span"
  );
  tryOnDescription.textContent = card.description;

  const jewelleryImgContainer = document.querySelector(".jewelleryImg");
  jewelleryImgContainer.style.backgroundImage = card.orgImage
    ? `url("${card.orgImage}")`
    : `url("${defaultBgImage}"`;

  const img = document.createElement("img");
  img.src = card.orgImage ? card.orgImage : card.image;
  if (jewelleryImgContainer.lastChild) {
    jewelleryImgContainer.removeChild(jewelleryImgContainer.lastChild);
  }
  jewelleryImgContainer.appendChild(img);

  const hasBackdrop = !!document.querySelector(".backdrop");
  if (!hasBackdrop) {
    const backdrop = document.createElement("div");
    backdrop.classList.add("backdrop");
    backdrop.addEventListener("click", () => {
      canvasContainer.classList.add("removeCanvasContainer");
      document.querySelector("body").removeChild(backdrop);
    });

    document.querySelector("body").prepend(backdrop);
  }

  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
  if (hasGetUserMedia()) {
    enableCam(index);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
};

export function handleEarringsPosition(e) {
  const { distance, position1, position2 } = earringPosition;
  const { value, name } = e.target;

  if (name === "position-x") {
    position1[0] = value / 10000;
    position2[0] = value / 10000 - distance;
  } else if (name === "position-y") {
    position1[1] = -value / 1000;
    position2[1] = -value / 1000;
  } else {
    earringPosition.distance = value / 1000;
    position1[0] = earringPosition.distance / 2;
    position2[0] = -earringPosition.distance / 2;
  }

  predictWebcam();
}
