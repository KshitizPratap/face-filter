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
    appendCards("necklace", necklaceArray);
    appendCards("earrings", earringsArray);
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
    .querySelector(".downloadPhoto")
    .addEventListener("click", downloadImage);
});

const appendCards = (id, cardsArray) => {
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
  const img = document.createElement("img");
  img.src = card.orgImage ? card.orgImage : card.image;
  if (jewelleryImgContainer.lastChild) {
    jewelleryImgContainer.removeChild(jewelleryImgContainer.lastChild);
  }
  jewelleryImgContainer.appendChild(img);

  const backdrop = document.createElement("div");
  backdrop.classList.add("backdrop");
  backdrop.addEventListener("click", () => {
    canvasContainer.classList.add("removeCanvasContainer");
    document.querySelector("body").removeChild(backdrop);
  });

  document.querySelector("body").prepend(backdrop);

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
