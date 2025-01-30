let THREECAMERA = null;
let GROUPOBJ3D = null;
let JEWELLERYMASH = null;
let FACEMESH = null;

let filterSpecs = null;

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
  const texture = textureLoader.load(
    image,
    function (tex) {
      createJewelleryMesh(tex, position, scale);
    },
    undefined,
    function (err) {}
  );
}

/**
 * Create a mash for jewellery
 * @param {*} texture
 * @param {*} position
 * @param {*} scale
 */
function createJewelleryMesh(texture, position, scale) {
  const threeStuffs = JeelizThreeHelper.init(filterSpecs, detect_callback);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(1, 1);
  JEWELLERYMASH = new THREE.Mesh(geometry, material);

  JEWELLERYMASH.position.set(...position);
  JEWELLERYMASH.scale.set(...scale);
  JEWELLERYMASH.visible = true;

  FACEMESH = JeelizThreeHelper.create_threejsOccluder(
    "./models/face/face.json"
  );
  FACEMESH.frustumCulled = false;
  FACEMESH.scale.multiplyScalar(1.1);
  FACEMESH.position.set(0, 0.7, -0.75);
  FACEMESH.renderOrder = 100000;

  GROUPOBJ3D.add(JEWELLERYMASH, FACEMESH);
  addDragEventListener(GROUPOBJ3D);
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
    videoSettings: videoSettings,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENED. SORRY BRO :( . ERR =", errCode);
        return;
      }

      console.log("INFO: JEELIZFACEFILTER IS READY");
      filterSpecs = spec;
      init_threeScene(0);
    },

    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  });
}

window.addEventListener("load", main);
