// GLOBAL VARIABLE
let firstCompareJewelleryIdx;
let secondCompareJewelleryIdx;

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
  const jewellerySelectionContainer = document.querySelector(
    ".jewellerySelectionContainer"
  );
  const carouselArrow = document.querySelectorAll(".canvasContainer img.arrow");
  const compareContainer = document.querySelector(".comparisonContainer");
  const jewelleryDetails = document.querySelector(".jewelleryDetails");
  const compareButton = document.querySelector("button.compare span");
  const jewelleryPreviewContainer = document.querySelector(
    ".compareJewelleryContainer"
  );
  firstCompareJewelleryIdx = selectedJewelleryIndex;
  secondCompareJewelleryIdx = selectedJewelleryIndex;

  if (
    !compareContainer.style.display ||
    compareContainer.style.display === "none"
  ) {
    appendCompareJewelleryCards();
    compareContainer.style.display = "block";
    jewelleryPreviewContainer.style.display = "flex";
    compareButton.innerText = "Close Compare";
    carouselArrow[0].style.display = "none";
    carouselArrow[1].style.display = "none";
    jewelleryDetails.style.display = "none";
  } else {
    compareContainer.style.display = "none";
    jewelleryPreviewContainer.style.display = "none";
    compareButton.innerText = "Compare";
    carouselArrow[0].style.display = "block";
    carouselArrow[1].style.display = "block";
    jewelleryDetails.style.display = "block";

    if (jewellerySelectionContainer) {
      jewellerySelectionContainer.remove();
    }
  }

  // ----- Adding preview images for the comparison ----- //
  const firstJewellery = jewelleryPreviewContainer.children[0];
  const secondJewellery = jewelleryPreviewContainer.children[1];
  const selectedJewellery =
    jewelleryConfig[jewellery_type][selectedJewelleryIndex];

  firstJewellery.addEventListener("click", () => {
    firstJewellery.classList.add("selectedJewellery");
    secondJewellery.classList.remove("selectedJewellery");

    const jewellerySelectionContainer = document.querySelector(
      ".jewellerySelectionContainer"
    );

    jewellerySelectionContainer.children[
      secondCompareJewelleryIdx
    ].classList.remove("selectedJewelleryCard");
    jewellerySelectionContainer.children[
      firstCompareJewelleryIdx
    ].classList.add("selectedJewelleryCard");
  });

  secondJewellery.addEventListener("click", () => {
    firstJewellery.classList.remove("selectedJewellery");
    secondJewellery.classList.add("selectedJewellery");

    const jewellerySelectionContainer = document.querySelector(
      ".jewellerySelectionContainer"
    );
    jewellerySelectionContainer.children[
      firstCompareJewelleryIdx
    ].classList.remove("selectedJewelleryCard");
    jewellerySelectionContainer.children[
      secondCompareJewelleryIdx
    ].classList.add("selectedJewelleryCard");
  });

  firstJewellery.style.backgroundImage = `url("${selectedJewellery.orgImage}")`;
  firstJewellery.classList.add("selectedJewellery");
  secondJewellery.style.backgroundImage = `url("${selectedJewellery.orgImage}")`;

  if (firstJewellery.hasChildNodes()) {
    firstJewellery.children[0].src =
      selectedJewellery.orgImage || selectedJewellery.image;
    secondJewellery.children[0].src =
      selectedJewellery.orgImage || selectedJewellery.image;
  } else {
    const img1 = document.createElement("img");
    img1.src = selectedJewellery.orgImage || selectedJewellery.image;
    const img2 = document.createElement("img");
    img2.src = selectedJewellery.orgImage || selectedJewellery.image;

    firstJewellery.appendChild(img1);
    secondJewellery.appendChild(img2);
  }
}

function appendCompareJewelleryCards() {
  const canvasContainer = document.querySelector(".canvasContainer");

  const jewellerySelectionContainer = document.createElement("div");
  jewellerySelectionContainer.classList.add("jewellerySelectionContainer");
  const selectedJewelleryType = jewelleryConfig[jewellery_type];

  selectedJewelleryType.forEach((card, i) => {
    const newCard = document.createElement("div");
    newCard.classList.add("card");
    if (i === selectedJewelleryIndex) {
      newCard.classList.add("selectedJewelleryCard");
    }

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");
    if (card.orgImage) {
      imgContainer.style.backgroundImage = `url("${card.orgImage}")`;
    }

    const heading = document.createElement("h4");
    heading.textContent = card.label;

    const img = document.createElement("img");
    img.src = card.orgImage ? card.orgImage : card.image;
    img.alt = `Jewellery Photo`;
    img.loading = "lazy";

    newCard.appendChild(heading);
    newCard.appendChild(imgContainer);
    imgContainer.appendChild(img);

    newCard.addEventListener("click", () => {
      handleCompareJewellerySelection(i);
    });

    jewellerySelectionContainer.appendChild(newCard);
  });

  canvasContainer.appendChild(jewellerySelectionContainer);
}

function handleCompareJewellerySelection(index) {
  const jewelleryPreviewContainer = document.querySelector(
    ".compareJewelleryContainer"
  );
  const jewellerySelectionContainer = document.querySelector(
    ".jewellerySelectionContainer"
  );
  const selectedJewelleryType = jewelleryConfig[jewellery_type];
  const firstJewellery = jewelleryPreviewContainer.children[0];
  const secondJewellery = jewelleryPreviewContainer.children[1];
  const sideSelected = firstJewellery.classList.contains("selectedJewellery")
    ? "left"
    : "right";

  if (sideSelected === "left") {
    jewellerySelectionContainer.children[index].classList.add(
      "selectedJewelleryCard"
    );
    jewellerySelectionContainer.children[
      firstCompareJewelleryIdx
    ].classList.remove("selectedJewelleryCard");

    firstJewellery.children[0].src =
      selectedJewelleryType[index].orgImage ||
      selectedJewelleryType[index].image;
    firstJewellery.style.backgroundImage = `url("${selectedJewelleryType[index].orgImage}")`;
    firstCompareJewelleryIdx = index;
  } else {
    jewellerySelectionContainer.children[index].classList.add(
      "selectedJewelleryCard"
    );
    jewellerySelectionContainer.children[
      secondCompareJewelleryIdx
    ].classList.remove("selectedJewelleryCard");

    secondJewellery.children[0].src =
      selectedJewelleryType[index].orgImage ||
      selectedJewelleryType[index].image;
    secondJewellery.style.backgroundImage = `url("${selectedJewelleryType[index].orgImage}")`;
    secondCompareJewelleryIdx = index;
  }
}
