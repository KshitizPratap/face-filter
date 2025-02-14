import {
  handleEarringsPosition,
  handleTryOn,
  nextPrevJewelleryHandler,
} from "./new-modal.js";

document.addEventListener("DOMContentLoaded", function () {
  appendCards("earrings");

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
      handleTryOn(index, card);
    });

    container.appendChild(newCard);
  });
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
