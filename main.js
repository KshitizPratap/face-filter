let THREECAMERA = null;
let GROUPOBJ3D = null;
let JEWELLERYMASH = null;
let FACEMESH = null;

let filterSpecs = null;
let threeStuffs = null;
let selectedJewelleryIndex = 0;

function detect_callback(isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
  } else {
    console.log("INFO in detect_callback(): LOST");
  }
}

function init_threeScene(selectedJewelleryIndex) {
  const { position, scale, image } = necklaceArray[selectedJewelleryIndex];

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    image,
    function (texture) {
      if (JEWELLERYMASH) {
        JEWELLERYMASH.material.map = texture;
        JEWELLERYMASH.material.needsUpdate = true;
        JEWELLERYMASH.position.set(...position);
        JEWELLERYMASH.scale.set(...scale);
      } else {
        createJewelleryMesh(texture, position, scale);
      }
    },
    undefined,
    function (err) {
      console.error("Texture loading error:", err);
    }
  );
}

/**
 * Create a mash for jewellery
 * @param {*} texture
 * @param {*} position
 * @param {*} scale
 */
function createJewelleryMesh(texture, position, scale) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(1, 1);
  JEWELLERYMASH = new THREE.Mesh(geometry, material);

  JEWELLERYMASH.position.set(...position);
  JEWELLERYMASH.scale.set(...scale);
  JEWELLERYMASH.visible = true;

  GROUPOBJ3D.add(JEWELLERYMASH);
  threeStuffs.faceObject.add(GROUPOBJ3D);

  THREECAMERA = JeelizThreeHelper.create_camera();
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
    NNCPath: "../../../neuralNets/",
    videoSettings,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log(errCode);
        return;
      }

      threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
      init_threeScene(selectedJewelleryIndex);
    },

    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  });
}

window.addEventListener("load", main);
