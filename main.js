// some globalz:
let THREECAMERA = null;
let ISDETECTED = false;
let FACEMESH = null,
  GROUPOBJ3D = null;

let ANGELMESH1 = null;

const states = {
  notLoaded: -1,
  intro: 0,
  idle: 1,
  fight: 2,
};
let state = states.notLoaded;
let isLoaded = false;

// callback : launched if a face is detected or lost
function detect_callback(isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
  } else {
    console.log("INFO in detect_callback(): LOST");
  }
}

// // build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  const textureAngel = new THREE.TextureLoader().load("./models/sample.png");

  const materialAngel = new THREE.MeshBasicMaterial({
    map: textureAngel,
    transparent: true,
  });

  // Create a plane to display the images
  const geometry = new THREE.PlaneGeometry(1, 1); // Adjust size as needed

  ANGELMESH1 = new THREE.Mesh(geometry, materialAngel);

  // Position the images in front of the face
  ANGELMESH1.position.set(0.075, -2.2, 0);
  ANGELMESH1.scale.set(2.25, 4, 2.25); // Scale image

  ANGELMESH1.visible = true; // Ensure image is visible

  GROUPOBJ3D.add(ANGELMESH1);

  addDragEventListener(GROUPOBJ3D);
  threeStuffs.faceObject.add(GROUPOBJ3D);

  // CREATE THE CAMERA
  THREECAMERA = JeelizThreeHelper.create_camera();
} // end init_threeScene()

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
    NNCPath: "../../../neuralNets/", // path of NN_DEFAULT.json file
    videoSettings: videoSettings,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENED. SORRY BRO :( . ERR =", errCode);
        return;
      }

      console.log("INFO: JEELIZFACEFILTER IS READY");
      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {

      // trigger the render of the THREE.JS SCENE
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }, // end callbackTrack()
  }); // end JEELIZFACEFILTER.init call
}

window.addEventListener("load", main);
