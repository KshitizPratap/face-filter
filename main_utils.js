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

function applyComparisonGradient(texture, cutoff) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = texture.image;
  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  gradient.addColorStop(cutoff, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(cutoff, "rgba(0, 0, 0, 1)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create new texture
  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  return newTexture;
}

function init_comparison() {
  const compareContainer = document.querySelector(".comparisonContainer");
  const compareButton = document.querySelector("button.compare span");

  console.dir(compareButton);

  if (
    compareContainer.style.display === "" ||
    compareContainer.style.display === "none"
  ) {
    compareContainer.style.display = "block";
    compareButton.innerText = "Close Compare";
  } else {
    compareContainer.style.display = "none";
    compareButton.innerText = "Compare";
  }
}
