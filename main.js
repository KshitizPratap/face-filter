let THREECAMERA = null;
let GROUPOBJ3D = null;
let NECKLACEMASH = null;
let EARRINGMASHES = [null, null];
let FACEMESH = null;
let threeStuffs = null;
let selectedJewelleryIndex = 0;

function detect_callback(isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
  } else {
    console.log("INFO in detect_callback(): LOST");
  }
}
/**
 * First function when any jewellery is selected
 * @param {string} jewellery_type earrings or necklace
 * @param {number} selectedJewelleryIndex index from the card array
 */
const init_tryOn = (jewellery_type, selectedJewelleryIndex) => {
  switch (jewellery_type) {
    case "necklace":
      removeEarrings();
      tryOn_necklace(selectedJewelleryIndex);
      break;
    case "earrings":
      removeNecklace();
      tryOn_earrings(selectedJewelleryIndex);
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
 * @param {number} selectedJewelleryIndex
 */
function tryOn_necklace(selectedJewelleryIndex) {
  const { position, scale, image } = necklaceArray[selectedJewelleryIndex];
  loadJewelleryTexture(image, position, scale, "necklace");
}

/**
 * Earrings specific data destructuring
 * @param {number} selectedJewelleryIndex
 */
function tryOn_earrings(selectedJewelleryIndex) {
  const { position, scale, image } = earringsArray[selectedJewelleryIndex];
  const second_position = [-position[0], ...position.slice(1)];

  loadJewelleryTexture(image, position, scale, "earrings", 0);
  loadJewelleryTexture(image, second_position, scale, "earrings", 1);
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
        if (NECKLACEMASH) {
          NECKLACEMASH.material.map = texture;
          NECKLACEMASH.material.needsUpdate = true;
          NECKLACEMASH.position.set(...position);
          NECKLACEMASH.scale.set(...scale);
        } else {
          NECKLACEMASH = createJewelleryMesh(texture, position, scale);
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
