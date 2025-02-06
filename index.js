document.addEventListener("DOMContentLoaded", function () {
  const mainContainer = document.querySelector(".mainContainer");
  mainContainer.classList.add("displayNone");
  const loader = document.querySelector(".loader");
  const loaderMsg = document.querySelector(".loader p");
  loaderMsg.textContent = "Loading please wait";

  setInterval(() => {
    loaderMsg.textContent += ".";
    if (loaderMsg.textContent.split(".").length === 5) {
      loaderMsg.textContent = "Loading please wait";
    }
  }, 0.5 * 1000);

  setTimeout(() => {
    mainContainer.classList.remove("displayNone");
    appendCards("necklace");
    appendCards("earrings");
    document.querySelector("body").removeChild(loader);
  }, 6 * 1000);

  document
    .querySelector("#necklace-position-x")
    .addEventListener("input", handleNecklacePosition);

  document
    .querySelector("#necklace-position-y")
    .addEventListener("input", handleNecklacePosition);

  document
    .querySelector("#earrings-position-x")
    .addEventListener("input", handleEarringsPosition);

  document
    .querySelector("#earrings-position-y")
    .addEventListener("input", handleEarringsPosition);

  document
    .querySelector("#earrings-distance")
    .addEventListener("input", handleEarringsPosition);

  document
    .querySelector("#compare")
    .addEventListener("input", handleComparison);

  document
    .querySelector(".downloadPhoto")
    .addEventListener("click", downloadImage);

  document.querySelector(".compare").addEventListener("click", init_comparison);

  document
    .querySelector("#left-arrow")
    .addEventListener("click", () => nextPrevJewelleryHandler("next"));

  document
    .querySelector("#right-arrow")
    .addEventListener("click", () => nextPrevJewelleryHandler("prev"));
});

const appendCards = (id) => {
  const cardsArray = jewelleryConfig[id];
  const container = document.querySelector(`#${id}`);
  container.classList.add("containerStyles");

  cardsArray.forEach((card, index) => {
    const newCard = document.createElement("div");
    newCard.classList.add("card");

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");
    if (card.orgImage) {
      imgContainer.style.backgroundImage = `url("${card.orgImage}")`;
    }

    const heading = document.createElement("h4");
    heading.textContent = card.label;

    const description = document.createElement("span");
    description.textContent = card.description;

    const img = document.createElement("img");
    img.src = card.orgImage ? card.orgImage : card.image;
    img.alt = `Jewellery Photo`;
    img.loading = "lazy";

    newCard.appendChild(heading);
    newCard.appendChild(description);
    newCard.appendChild(imgContainer);
    imgContainer.appendChild(img);

    newCard.addEventListener("click", () => {
      handleTryOn(id, card, index);
    });

    container.appendChild(newCard);
  });
};

const handleTryOn = (id, card, index) => {
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
  if (card.orgImage) {
    jewelleryImgContainer.style.backgroundImage = `url("${card.orgImage}")`;
  }
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

  selectedJewelleryIndex = index;
  position = [];
  init_tryOn(id);
};

function downloadImage() {
  const canvas = document.getElementById("jeeFaceFilterCanvas");
  const filename = "jewellery-image.png";

  const imageURL = canvas.toDataURL("image/png");

  const downloadLink = document.createElement("a");
  downloadLink.href = imageURL;
  downloadLink.download = filename;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function positionController(jewellery_type) {
  if (jewellery_type === "necklace") {
    document.querySelector("#earringsControllers").style.display = "none";
    document.querySelector("#necklaceControllers").style.display = "block";
  } else {
    document.querySelector("#earringsControllers").style.display = "block";
    document.querySelector("#necklaceControllers").style.display = "none";
  }
}

function handleNecklacePosition(e) {
  const { value, name } = e.target;

  if (name === "position-x") {
    position[0] = value / 1000;
  } else {
    position[1] = -value / 100;
  }
  tryOn_necklace();
}

function handleEarringsPosition(e) {
  const { distance, position1, position2 } = earringPosition;
  const { value, name } = e.target;

  if (name === "position-x") {
    position1[0] = value / 100;
    position2[0] = value / 100 - distance;
  } else if (name === "position-y") {
    position1[1] = -value / 1000;
    position2[1] = -value / 1000;
  } else {
    earringPosition.distance = value / 100;
    position1[0] = -earringPosition.distance / 2;
    position2[0] = earringPosition.distance / 2;
  }

  tryOn_earrings();
}

function nextPrevJewelleryHandler(action) {
  const jewelleryArray = [...jewelleryConfig[jewellery_type]];
  const length = jewelleryArray.length;

  if (action === "next") {
    selectedJewelleryIndex = (selectedJewelleryIndex + 1) % length;
  } else {
    selectedJewelleryIndex =
      selectedJewelleryIndex - 1 < 0 ? length - 1 : selectedJewelleryIndex - 1;
  }

  handleTryOn(
    jewellery_type,
    jewelleryArray[selectedJewelleryIndex],
    selectedJewelleryIndex
  );
}
