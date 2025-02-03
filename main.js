let THREECAMERA = null;
let GROUPOBJ3D = null;
let NECKLACEMASH = null;
let EARRINGMASHES = [null, null];
let FACEMESH = null;
let threeStuffs = null;
let selectedJewelleryIndex = 0;
let jewellery_type = "";
let position = [];
let earringPosition = {
  position1: [],
  position2: [],
  distance: 0,
};

function detect_callback(isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
  } else {
    console.log("INFO in detect_callback(): LOST");
  }
}
/**
 * First function when any jewellery is selected
 * @param {string} j_type earrings or necklace
 */
const init_tryOn = (j_type) => {
  jewellery_type = j_type;
  positionController(jewellery_type);

  switch (jewellery_type) {
    case "necklace":
      removeEarrings();
      tryOn_necklace();
      break;
    case "earrings":
      removeNecklace();
      tryOn_earrings();
      break;
    default:
      console.error("Invalid jewellery type:", jewellery_type);
  }
};

/**
 * Function to remove necklace if earrings are selected
 */
function removeNecklace() {
  if (NECKLACEMASH) {
    GROUPOBJ3D.remove(NECKLACEMASH);
    NECKLACEMASH = null;
  }
}

/**
 * Function to remove earrings if necklace is selected
 */
function removeEarrings() {
  EARRINGMASHES.forEach((mesh, index) => {
    if (mesh) {
      GROUPOBJ3D.remove(mesh);
      EARRINGMASHES[index] = null;
    }
  });
}

/**
 * Necklace specific data destructuring
 */
function tryOn_necklace() {
  const {
    position: _position,
    scale,
    image,
  } = necklaceArray[selectedJewelleryIndex];

  if (!position.length) {
    position = [..._position];
  }
  loadJewelleryTexture(image, position, scale, "necklace");
}

/**
 * Earrings specific data destructuring
 */
function tryOn_earrings() {
  const { position, scale, image } = earringsArray[selectedJewelleryIndex];
  const second_position = [-position[0], ...position.slice(1)];

  if (!earringPosition.position1.length) {
    earringPosition = {
      position1: [...position],
      position2: [...second_position],
      distance: 2 * Math.abs(position[0]),
    };
  }

  loadJewelleryTexture(image, earringPosition.position1, scale, "earrings", 0);
  loadJewelleryTexture(image, earringPosition.position2, scale, "earrings", 1);
}

/**
 * Load texture and apply it to jewellery mesh
 * @param {string} image - Image URL of the jewellery
 * @param {Array} position - Position array [x, y, z]
 * @param {Array} scale - Scale array [x, y, z]
 * @param {string} type - Jewellery type ("necklace" or "earrings")
 * @param {number} [index] - Used for earrings to determine left/right earring
 */
function loadJewelleryTexture(image, position, scale, type, index = 0) {
  new THREE.TextureLoader().load(
    image,
    function (texture) {
      if (type === "necklace") {
        const fadedTexture = applyGradientFade(texture);
        if (NECKLACEMASH) {
          NECKLACEMASH.material.map = fadedTexture;
          NECKLACEMASH.material.needsUpdate = true;
          NECKLACEMASH.position.set(...position);
          NECKLACEMASH.scale.set(...scale);
        } else {
          NECKLACEMASH = createJewelleryMesh(fadedTexture, position, scale);
        }
      } else if (type === "earrings") {
        if (!EARRINGMASHES[index]) {
          EARRINGMASHES[index] = createJewelleryMesh(texture, position, scale);
        } else {
          EARRINGMASHES[index].material.map = texture;
          EARRINGMASHES[index].material.needsUpdate = true;
          EARRINGMASHES[index].position.set(...position);
          EARRINGMASHES[index].scale.set(...scale);
        }
      }
    },
    undefined,
    function (err) {
      console.error("Texture loading error:", err);
    }
  );
}

/**
 * Makes the faded effect on the top of the necklace image
 * @param {*} texture
 * @returns
 */
function applyGradientFade(texture) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = texture.image;
  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.2, "rgba(0, 0, 0, 1)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create new texture
  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  return newTexture;
}

/**
 * Create a mesh for jewellery
 * @param {THREE.Texture} texture - The loaded texture
 * @param {Array} position - Position array [x, y, z]
 * @param {Array} scale - Scale array [x, y, z]
 * @returns {THREE.Mesh} - Created mesh
 */
function createJewelleryMesh(texture, position, scale) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.visible = true;

  GROUPOBJ3D.add(mesh);
  threeStuffs?.faceObject.add(GROUPOBJ3D);

  THREECAMERA = JeelizThreeHelper.create_camera();

  return mesh;
}

function main() {
  GROUPOBJ3D = new THREE.Object3D();

  JeelizResizer.size_canvas({
    canvasId: "jeeFaceFilterCanvas",
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings);
    },
  });
}

function init_faceFilter(videoSettings) {
  JEELIZFACEFILTER.init({
    canvasId: "jeeFaceFilterCanvas",
    NNCPath: "neuralNets/NN_DEFAULT.json",
    videoSettings,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log(errCode);
        return;
      }

      threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
      init_tryOn("necklace", selectedJewelleryIndex);
    },

    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  });
}

window.addEventListener("load", main);
