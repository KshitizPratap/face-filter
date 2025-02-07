// GLOBAL VARIABLE
let firstCompareJewelleryIdx;
let secondCompareJewelleryIdx;
let isComparisonActive = false;

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

/**
 * - When compare button is clicked this function gets fired
 * - Appends or remove depending of the global variable *isComparisonActive*
 */
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

  if (isComparisonActive) {
    appendCompareJewelleryCards();
    appendPreviewJewelleryImages();
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

    JEWELLERYMESH.forEach((mesh) => {
      GROUPOBJ3D.remove(mesh);
    });

    JEWELLERYMESH = [];
  }
}

/**
 * On the canvas top we can see 2 preview images on both sides
 */
function appendPreviewJewelleryImages() {
  const jewelleryPreviewContainer = document.querySelector(
    ".compareJewelleryContainer"
  );
  firstCompareJewelleryIdx = selectedJewelleryIndex;
  secondCompareJewelleryIdx = selectedJewelleryIndex;
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

  // ----- At first, both meshes are same ----- //
  JEWELLERYMESH.push(JEWELLERYMESH[0]);
  GROUPOBJ3D.add(JEWELLERYMESH[1]);
}

/**
 * When comparison is active we show a list of jewellery so user can choose it for comparison
 */
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

/**
 * - Fires when the jewellery is selected in comparison.
 * - Preview images get change here.
 * - Mesh is also gets updated according to the selected jewellery.
 * @param {number} index contains the index of the selected jewellery
 */
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

  const loader = new THREE.TextureLoader();
  loader.load(
    selectedJewelleryType[index].image,
    function (texture) {
      if (texture) {
        const newTexture = applyGradientFade(texture);

        if (sideSelected === "left") {
          JEWELLERYMESH[0].material.map = newTexture;
          JEWELLERYMESH[0].material.needsUpdate = true;
        } else {
          JEWELLERYMESH[1].material.map = newTexture;
          JEWELLERYMESH[1].material.needsUpdate = true;
        }
      }
    },
    undefined,
    function (err) {
      console.error("Texture loading error:", err);
    }
  );
}

/**
 * The opacity of the meshes are changed according the value provided
 * @param {InputEvent} e The range input provides the value
 */
function handleComparison(e) {
  const { value } = e.target;
  const cutoff = value / 100;

  const comparisonJewelleries = [
    jewelleryConfig[jewellery_type][firstCompareJewelleryIdx].image,
    jewelleryConfig[jewellery_type][secondCompareJewelleryIdx].image,
  ];

  const loader = new THREE.TextureLoader();

  loader.load(comparisonJewelleries[0], function (texture1) {
    loader.load(comparisonJewelleries[1], function (texture2) {
      if (!JEWELLERYMESH[0] || !JEWELLERYMESH[1]) return;

      const newTexture1 = applyGradientFade(texture1);
      const newTexture2 = applyGradientFade(texture2);

      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          texture1: { value: newTexture1 },
          texture2: { value: newTexture2 },
          mixAmount: { value: cutoff },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D texture1;
          uniform sampler2D texture2;
          uniform float mixAmount;
          varying vec2 vUv;

          void main() {
            vec4 tex1 = texture2D(texture1, vUv);
            vec4 tex2 = texture2D(texture2, vUv);
            gl_FragColor = mix(tex1, tex2, mixAmount);
          }
        `,
        transparent: true,
      });

      JEWELLERYMESH[0].material = shaderMaterial;
      JEWELLERYMESH[0].material.needsUpdate = true;
    });
  });

  // Move arrow indicator
  const sliderArrow = document.querySelector(".arrowContainer");
  sliderArrow.style.left = 150 + (value * 3.5 - 175) + "px";
}

/**
 * @returns jewelleryConfig which stores the values of positions, scales and images which are required to make a mesh
 */
function getJewelleryTextureConfig() {
  const {
    position: initialPosition,
    scale,
    image,
  } = jewelleryConfig[jewellery_type][selectedJewelleryIndex];

  if (jewellery_type === "necklace") {
    if (!necklacePosition.length) {
      necklacePosition = [...initialPosition];
    }
    return {
      positions: [necklacePosition],
      scales: [scale],
      images: [image],
    };
  } else {
    const second_position = [-initialPosition[0], ...initialPosition.slice(1)];

    if (!earringPosition.position1.length) {
      earringPosition = {
        position1: [...initialPosition],
        position2: [...second_position],
        distance: 2 * Math.abs(initialPosition[0]),
      };
    }

    return {
      scales: [scale, scale],
      images: [image, image],
      positions: [earringPosition.position1, earringPosition.position2],
    };
  }
}
