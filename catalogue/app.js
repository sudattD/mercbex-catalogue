const categories = [
  { id: "insecticide", name: "Insecticide", colorName: "Deep Emerald Green", color: "#006B46" },
  { id: "fungicide", name: "Fungicide", colorName: "Orange", color: "#E97822" },
  { id: "herbicide", name: "Herbicide", colorName: "Royal Blue", color: "#1F5FAE" },
  { id: "pgr", name: "Plant Growth Regulator", colorName: "Purple", color: "#6B4FB3" },
  { id: "bio", name: "Bio Products", colorName: "Natural Green", color: "#4F9A38" },
  { id: "micronutrients", name: "Micronutrients", colorName: "Red", color: "#B93636" },
  { id: "adjuvants", name: "Adjuvants", colorName: "Grey", color: "#68706C" },
];

const products = [
  {
    id: "aceman",
    categoryId: "insecticide",
    name: "ACEMAN",
    active: "ACETAMIPRID",
    concentration: "20.0% SP",
    formula: "ACETAMIPRID 20.0% SP",
    mode: "Systemic + translaminar action",
    mockup: "assets/mockups/aceman-bottles.png",
  },
  {
    id: "seal",
    categoryId: "insecticide",
    name: "SEAL",
    active: "TOLFENPYRAD",
    concentration: "15.0% EC",
    formula: "TOLFENPYRAD 15.0% EC",
    mode: "Broad spectrum insect control",
    mockup: "assets/mockups/seal-bottles.png",
  },
  {
    id: "bexapro",
    categoryId: "insecticide",
    name: "BEXAPRO",
    active: "CYANTRANILIPROLE",
    concentration: "10.26% OD",
    formula: "CYANTRANILIPROLE 10.26% OD",
    mode: "Advanced pest protection",
    mockup: "assets/mockups/bexapro-bottles.png",
  },
];

let selectedCategoryId = "insecticide";
let selectedProductId = "aceman";
let selectedPreview = "label";

const categoryList = document.querySelector("#categoryList");
const productsGrid = document.querySelector("#productsGrid");
const categoryTitle = document.querySelector("#categoryTitle");
const categoryPill = document.querySelector("#categoryPill");
const selectedName = document.querySelector("#selectedName");
const labelPreview = document.querySelector("#labelPreview");
const bottlePreview = document.querySelector("#bottlePreview");
const downloadButton = document.querySelector("#downloadSvg");
const printButton = document.querySelector("#printLabel");
const previewTabs = document.querySelectorAll("[data-preview]");

function categoryById(id) {
  return categories.find((category) => category.id === id) || categories[0];
}

function productById(id) {
  return products.find((product) => product.id === id) || products[0];
}

function productsForCategory(categoryId) {
  return products.filter((product) => product.categoryId === categoryId);
}

function setThemeColor(color) {
  document.documentElement.style.setProperty("--category-color", color);
}

function renderCategories() {
  categoryList.innerHTML = categories
    .map((category) => {
      const isSelected = category.id === selectedCategoryId;
      return `
        <button
          class="category-button"
          type="button"
          data-category-id="${category.id}"
          aria-selected="${isSelected}"
          style="--category-color: ${category.color}"
        >
          <span>${category.name}</span>
          <span class="category-swatch" aria-hidden="true"></span>
        </button>
      `;
    })
    .join("");
}

function renderProducts() {
  const category = categoryById(selectedCategoryId);
  const visibleProducts = productsForCategory(selectedCategoryId);

  categoryTitle.textContent = category.name;
  categoryPill.textContent = category.colorName;

  if (!visibleProducts.length) {
    productsGrid.innerHTML = `
      <article class="product-card" aria-selected="false">
        <span class="product-category" style="--category-color: ${category.color}">${category.name}</span>
        <h3>Coming Soon</h3>
        <p class="formula">Products can be added here as the catalogue grows.</p>
      </article>
    `;
    return;
  }

  productsGrid.innerHTML = visibleProducts
    .map((product) => {
      const isSelected = product.id === selectedProductId;
      return `
        <button
          class="product-card"
          type="button"
          data-product-id="${product.id}"
          aria-selected="${isSelected}"
          style="--category-color: ${category.color}"
        >
          <div class="product-card-content">
            <div>
              <span class="product-category">${category.name}</span>
              <h3>${product.name}</h3>
              <p class="formula">${product.formula}</p>
            </div>
            ${product.mockup ? `<img class="product-mockup-thumb" src="${product.mockup}" alt="${product.name} bottle mockup" />` : `<div class="mockup-pending">Mockup<br />pending</div>`}
          </div>
        </button>
      `;
    })
    .join("");
}

function labelSvg(product, category) {
  const productSize = product.name.length > 7 ? 132 : product.name.length > 5 ? 146 : 162;
  const activeSize = product.active.length > 13 ? 34 : 42;
  const categoryLabel = category.name.toUpperCase();
  const panelColor = category.color;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="4in" height="6in" viewBox="0 0 1200 1800" role="img" aria-label="MERCBEX ${product.name} print label">
  <defs>
    <style>
      .font { font-family: Montserrat, Aptos, "Avenir Next", Arial, sans-serif; }
      .white { fill: #ffffff; }
      .lime { fill: #76B82A; }
      .orange { fill: #F6A400; }
      .charcoal { fill: #18211D; }
      .grey { fill: #66716D; }
      .micro { font-size: 24px; letter-spacing: 0; }
      .small { font-size: 31px; letter-spacing: 0; }
      .medium { font-size: 42px; letter-spacing: 0; }
      .pack { font-size: 92px; letter-spacing: 0; font-weight: 760; }
    </style>
    <clipPath id="labelClip"><rect x="108" y="72" width="984" height="1656" rx="42"/></clipPath>
    <clipPath id="panelClip"><path d="M108 290 C270 240 421 256 570 298 C755 351 904 334 1092 246 L1092 1164 C935 1222 758 1238 581 1178 C399 1116 251 1132 108 1206 Z"/></clipPath>
    <pattern id="molecules" width="172" height="148" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="5" fill="#FFFFFF" opacity="0.16"/>
      <circle cx="94" cy="48" r="4" fill="#76B82A" opacity="0.28"/>
      <circle cx="140" cy="104" r="6" fill="#F6A400" opacity="0.16"/>
      <path d="M35 32 L90 47 L135 100" stroke="#FFFFFF" stroke-width="2" opacity="0.14" fill="none"/>
      <path d="M94 52 L62 118" stroke="#BFC5C8" stroke-width="2" opacity="0.18" fill="none"/>
      <circle cx="60" cy="122" r="4" fill="#BFC5C8" opacity="0.24"/>
    </pattern>
  </defs>

  <rect width="1200" height="1800" fill="#F4F6F4"/>
  <rect x="108" y="72" width="984" height="1656" rx="42" fill="#FFFFFF" stroke="#DDE5E1" stroke-width="4"/>
  <g clip-path="url(#labelClip)">
    <rect x="108" y="72" width="984" height="1656" fill="#FFFFFF"/>
    <image href="../brand-system/mercbex-logo.png" x="390" y="112" width="420" height="153" preserveAspectRatio="xMidYMid meet"/>

    <path d="M108 290 C270 240 421 256 570 298 C755 351 904 334 1092 246 L1092 1164 C935 1222 758 1238 581 1178 C399 1116 251 1132 108 1206 Z" fill="${panelColor}"/>
    <g clip-path="url(#panelClip)">
      <path d="M100 380 C290 294 470 338 642 393 C790 441 930 423 1100 330" stroke="#76B82A" stroke-width="20" opacity="0.52" fill="none"/>
      <path d="M100 460 C300 382 462 414 638 470 C800 521 934 502 1100 420" stroke="#FFFFFF" stroke-width="6" opacity="0.22" fill="none"/>
      <path d="M100 540 C308 466 468 496 640 554 C800 608 936 590 1100 510" stroke="#FFFFFF" stroke-width="5" opacity="0.16" fill="none"/>
      <path d="M100 1042 C315 960 468 995 636 1051 C790 1103 940 1085 1100 1005" stroke="#76B82A" stroke-width="14" opacity="0.42" fill="none"/>
      <path d="M100 1130 C296 1050 456 1076 632 1136 C790 1190 940 1170 1100 1090" stroke="#FFFFFF" stroke-width="5" opacity="0.18" fill="none"/>
      <rect x="724" y="382" width="368" height="600" fill="url(#molecules)" opacity="0.95"/>
      <path d="M890 470 C970 580 960 690 875 790 C820 690 825 575 890 470 Z" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.18"/>
      <path d="M885 512 C883 600 880 695 875 775" stroke="#FFFFFF" stroke-width="3" opacity="0.16"/>
      <path d="M882 590 C922 570 950 542 970 508" stroke="#FFFFFF" stroke-width="3" opacity="0.14" fill="none"/>
      <path d="M879 660 C918 644 948 618 972 580" stroke="#FFFFFF" stroke-width="3" opacity="0.14" fill="none"/>
    </g>

    <g transform="translate(220 320)">
      <rect x="0" y="0" width="${Math.max(232, categoryLabel.length * 17)}" height="58" rx="29" fill="#F6A400"/>
      <text x="${Math.max(232, categoryLabel.length * 17) / 2}" y="38" text-anchor="middle" class="font micro white" font-weight="700">${categoryLabel}</text>
    </g>

    <g transform="translate(220 438)">
      <text x="0" y="0" class="font small white" font-weight="600">SYSTEMIC CROP PROTECTION</text>
      <text x="0" y="176" class="font white" font-size="${productSize}" font-weight="820" letter-spacing="0">${product.name}</text>
      <path d="M0 218 C160 246 335 246 536 218" stroke="#F6A400" stroke-width="9" fill="none"/>
      <text x="0" y="314" class="font white" font-size="${activeSize}" font-weight="650" letter-spacing="0">${product.active}</text>
      <text x="0" y="380" class="font lime medium" font-weight="750">${product.concentration}</text>
      <text x="0" y="448" class="font small white" font-weight="500">Mode of action: ${product.mode}</text>
    </g>

    <path d="M108 1206 C250 1132 399 1116 581 1178 C758 1238 935 1222 1092 1164 L1092 1500 C926 1538 750 1538 580 1482 C392 1419 252 1436 108 1512 Z" fill="#F7F9F8"/>
    <path d="M108 1206 C250 1132 399 1116 581 1178 C758 1238 935 1222 1092 1164" stroke="#BFC5C8" stroke-width="5" opacity="0.75" fill="none"/>

    <rect x="220" y="1268" width="760" height="156" rx="30" fill="#FFFFFF" opacity="0.82"/>
    <g transform="translate(288 1310)">
      <g transform="translate(0 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="#006B46" stroke-width="4"/>
        <path d="M20 38 L32 50 L55 22" stroke="#006B46" stroke-width="5" fill="none"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">High</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Efficacy</text>
      </g>
      <g transform="translate(276 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="#006B46" stroke-width="4"/>
        <path d="M36 16 L36 56 M16 36 L56 36 M22 22 L50 50 M50 22 L22 50" stroke="#006B46" stroke-width="4"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">Broad</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Spectrum</text>
      </g>
      <g transform="translate(552 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="#006B46" stroke-width="4"/>
        <path d="M36 18 C52 28 58 40 54 55 C43 66 28 66 18 55 C14 40 21 28 36 18 Z" stroke="#006B46" stroke-width="4" fill="none"/>
        <path d="M36 28 L36 47 L48 47" stroke="#006B46" stroke-width="4" fill="none"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">Long</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Control</text>
      </g>
    </g>

    <g transform="translate(220 1550)">
      <text x="0" y="0" class="font micro grey" font-weight="650">NET CONTENT</text>
      <text x="0" y="76" class="font pack" fill="#007A3D">1 L</text>
      <text x="218" y="20" class="font micro charcoal" font-weight="650">MERCBEX Chemical Science LLP</text>
      <text x="218" y="58" class="font micro grey" font-weight="500">Reg. / Batch / Mfg / Exp / MRP</text>
      <text x="218" y="96" class="font micro grey" font-weight="500">Mfr. address / Customer care</text>
    </g>

    <g transform="translate(846 1454)">
      <rect x="0" y="0" width="204" height="204" rx="14" fill="#FFFFFF" stroke="#DDE5E1" stroke-width="3"/>
      <image href="../brand-system/mercbex-qr-code.png" x="12" y="12" width="180" height="180" preserveAspectRatio="xMidYMid meet"/>
    </g>

    <rect x="108" y="1670" width="984" height="58" fill="#18211D"/>
    <text x="220" y="1708" class="font micro white" font-weight="600">READ LABEL BEFORE USE</text>
    <text x="740" y="1708" class="font micro white" font-weight="500">FOR AGRICULTURAL USE</text>
  </g>
</svg>`;
}

function renderLabel() {
  const product = productById(selectedProductId);
  const category = categoryById(product.categoryId);

  selectedName.textContent = product.name;
  setThemeColor(category.color);
  labelPreview.innerHTML = labelSvg(product, category);
  bottlePreview.innerHTML = `
    ${product.mockup ? `
      <figure class="real-bottle-preview">
        <img src="${product.mockup}" alt="${product.name} realistic bottle mockup" />
      </figure>
    ` : `
      <div class="mockup-empty" style="--category-color: ${category.color}">
        <img src="../brand-system/mercbex-logo.png" alt="MERCBEX" />
        <p>${product.name}</p>
        <strong>Real bottle mockup pending</strong>
        <span>Generate or upload a realistic bottle visual for this SKU.</span>
      </div>
    `}
  `;
  labelPreview.hidden = selectedPreview !== "label";
  bottlePreview.hidden = selectedPreview !== "bottle";
  downloadButton.disabled = selectedPreview !== "label";
}

function renderEmptyLabel(category) {
  selectedName.textContent = category.name;
  labelPreview.innerHTML = `
    <div class="empty-label" style="--category-color: ${category.color}">
      <img src="../brand-system/mercbex-logo.png" alt="MERCBEX" />
      <p>${category.name}</p>
      <strong>Products coming soon</strong>
    </div>
  `;
  bottlePreview.innerHTML = "";
  labelPreview.hidden = false;
  bottlePreview.hidden = true;
  downloadButton.disabled = true;
}

function updateView() {
  const visibleProducts = productsForCategory(selectedCategoryId);

  if (!visibleProducts.some((product) => product.id === selectedProductId)) {
    selectedProductId = visibleProducts[0]?.id || selectedProductId;
  }

  const category = categoryById(selectedCategoryId);
  setThemeColor(category.color);
  renderCategories();
  renderProducts();

  if (visibleProducts.length) {
    renderLabel();
  } else {
    renderEmptyLabel(category);
  }
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category-id]");
  if (!button) return;

  selectedCategoryId = button.dataset.categoryId;
  const firstProduct = productsForCategory(selectedCategoryId)[0];
  if (firstProduct) selectedProductId = firstProduct.id;
  updateView();
});

productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (!button) return;

  selectedProductId = button.dataset.productId;
  renderProducts();
  renderLabel();
});

previewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedPreview = tab.dataset.preview;
    previewTabs.forEach((button) => {
      button.setAttribute("aria-selected", String(button === tab));
    });
    renderLabel();
  });
});

downloadButton.addEventListener("click", () => {
  if (downloadButton.disabled) return;
  const product = productById(selectedProductId);
  const svg = labelPreview.querySelector("svg");
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mercbex-${product.name.toLowerCase()}-label.svg`;
  link.click();
  URL.revokeObjectURL(url);
});

printButton.addEventListener("click", () => {
  selectedPreview = "label";
  previewTabs.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.preview === "label"));
  });
  renderLabel();
  window.print();
});

updateView();
