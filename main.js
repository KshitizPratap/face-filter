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
const init_tryOn = () => {
  THREECAMERA = JeelizThreeHelper.create_camera();

  if (!jewellery_type) {
    return;
  }
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

  positionController(jewellery_type);
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

function handleComparison(e) {
  const { value } = e.target;
  const cutoff = value / 100;

  console.log("[]", { JEWELLERYMESH });

  const loader = new THREE.TextureLoader();
  loader.load(
    jewelleryConfig[jewellery_type][selectedJewelleryIndex].image,
    function (texture) {
      if (texture) {
        const newTexture = applyGradientFade(
          applyComparisonGradient(texture, cutoff)
        );
        JEWELLERYMESH[0].material.map = newTexture;
        // JEWELLERYMESH[0].position.set(0.5, 0, 0); // Move right
        JEWELLERYMESH[0].material.needsUpdate = true;
      }
    },
    undefined,
    function (err) {
      console.error("Texture loading error:", err);
    }
  );

  const sliderArrow = document.querySelector(".arrowContainer");
  sliderArrow.style.left = 150 + (value * 3.5 - 175) + "px";
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
