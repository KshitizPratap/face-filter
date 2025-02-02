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
    .querySelector("#position-x")
    .addEventListener("input", handlerXPosition);

  document
    .querySelector("#position-y")
    .addEventListener("input", handlerYPosition);
});

const appendCards = (id, cardsArray) => {
  const container = document.querySelector(`#${id}`);
  container.classList.add("containerStyles");

  cardsArray.forEach((card, index) => {
    const newCard = document.createElement("div");
    newCard.classList.add("card");
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");

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
