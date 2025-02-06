let THREECAMERA = null;
let GROUPOBJ3D = null;
let FACEMESH = null;
let JEWELLERYMESH = [];
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
  const { position, scale, image } =
    jewelleryConfig[jewellery_type][selectedJewelleryIndex];
  const isNecklace = jewellery_type === "necklace";

  const jewelleryTextureConfig = {
    scales: isNecklace ? [scale] : [scale, scale],
    images: isNecklace ? [image] : [image, image],
    positions: isNecklace
      ? [position]
      : [position, [-position[0], ...position.slice(1)]],
  };

  loadJewelleryTexture({ ...jewelleryTextureConfig });
};

/**
 * Load multiple textures and apply them to a single jewellery mesh.
 * @param {Array} images - Array of image URLs.
 * @param {Array} positions - Array of positions for each image.
 * @param {Array} scales - Array of scales for each image.
 */
function loadJewelleryTexture({ images, positions, scales }) {
  const loader = new THREE.TextureLoader();
  const materials = [];

  images.forEach((image, index) => {
    loader.load(
      image,
      function (texture) {
        if (jewellery_type === "necklace") {
          texture = applyGradientFade(texture);
        }

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        materials.push(material);

        if (index + 1 === images.length) {
          if (JEWELLERYMESH.length === 0) {
            createJewelleryMesh(materials, positions, scales);
          } else if (JEWELLERYMESH.length === 1) {
            if (jewellery_type === "necklace") {
              JEWELLERYMESH[0].material.map = texture;
              JEWELLERYMESH[0].material.needsUpdate = true;
              JEWELLERYMESH[0].position.set(...positions[0]);
              JEWELLERYMESH[0].scale.set(...scales[0]);
            } else if (jewellery_type === "earrings") {
              GROUPOBJ3D.remove(JEWELLERYMESH[0]);
              createJewelleryMesh(materials, positions, scales);
            }
          } else if (JEWELLERYMESH.length === 2) {
            if (jewellery_type === "necklace") {
              GROUPOBJ3D.remove(JEWELLERYMESH[0]);
              GROUPOBJ3D.remove(JEWELLERYMESH[1]);
              createJewelleryMesh(materials, positions, scales);
            } else if (jewellery_type === "earrings") {
              JEWELLERYMESH.forEach((mesh, index) => {
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
                mesh.position.set(...positions[index]);
                mesh.scale.set(...scales[index]);
              });
            }
          }
        }
      },
      undefined,
      function (err) {
        console.error("Texture loading error:", err);
      }
    );
  });
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
 * Create a mesh for jewellery with multiple images.
 * @param {Array} materials - Array of THREE.Material instances.
 * @param {Array} positions - Array of positions for each texture.
 * @param {Array} scales - Array of scales for each texture.
 */
function createJewelleryMesh(materials, positions, scales) {
  const geometry = new THREE.PlaneGeometry(1, 1);

  JEWELLERYMESH = materials.map((material, index) => {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(...positions[index]);
    mesh.scale.set(...scales[index]);
    mesh.visible = true;

    GROUPOBJ3D.add(mesh);
    THREECAMERA = JeelizThreeHelper.create_camera();

    return mesh;
  });

  threeStuffs?.faceObject.add(GROUPOBJ3D);
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
