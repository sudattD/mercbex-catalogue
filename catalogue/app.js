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
    mockup: "assets/mockups/aceman-single-bottle-white-studio-base.png",
  },
];

let selectedCategoryId = "insecticide";
let selectedProductId = "aceman";
let selectedPreview = "studio";

// Custom overrides for the edit panel — starts empty (uses product defaults)
const editOverrides = {
  name: "",
  active: "",
  concentration: "",
  mode: "",
  panelColor: "",
  netContent: "1 L",
  // Font size overrides (empty = use auto sizing from labelSvg)
  nameSize: "",
  activeSize: "",
  concSize: "",
  modeSize: "",
  contentSize: "",
  badgeText: "",
  badgeColor: "",
};

const categoryList = document.querySelector("#categoryList");
const productsGrid = document.querySelector("#productsGrid");
const categoryTitle = document.querySelector("#categoryTitle");
const categoryPill = document.querySelector("#categoryPill");
const selectedName = document.querySelector("#selectedName");
const labelPreview = document.querySelector("#labelPreview");
const bottlePreview = document.querySelector("#bottlePreview");
const downloadButton = document.querySelector("#downloadSvg");
let zoomLevel = 100;
const printButton = document.querySelector("#printLabel");
const previewTabs = document.querySelectorAll("[data-preview]");

function applyPreviewZoom() {
  document.getElementById("zoomValue").textContent = `${zoomLevel}%`;
  labelPreview.style.width = `${zoomLevel}%`;
  labelPreview.style.maxWidth = "none";
  bottlePreview.style.setProperty("--preview-scale", String(zoomLevel / 100));
}

async function imageToDataUrl(path) {
  const response = await fetch(new URL(path, window.location.href));
  if (!response.ok) throw new Error(`Could not load ${path}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function serializedSelfContainedLabelSvg() {
  const svg = labelPreview.querySelector("svg");
  if (!svg) return "";

  const clone = svg.cloneNode(true);
  const [logoDataUrl, qrDataUrl] = await Promise.all([
    imageToDataUrl("../brand-system/mercbex-logo.png"),
    imageToDataUrl("../brand-system/mercbex-qr-code.png"),
  ]);

  clone.querySelectorAll("image").forEach((image) => {
    const href = image.getAttribute("href") || image.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
    if (href.includes("mercbex-logo")) {
      image.setAttribute("href", logoDataUrl);
      image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", logoDataUrl);
    }
    if (href.includes("mercbex-qr-code")) {
      image.setAttribute("href", qrDataUrl);
      image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", qrDataUrl);
    }
  });

  return new XMLSerializer().serializeToString(clone);
}

function downloadSvgString(svgString, filename) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

window.serializedSelfContainedLabelSvg = serializedSelfContainedLabelSvg;

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
        <p class="formula">Use the ACEMAN master preview to create and test future labels.</p>
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
            ${product.mockup ? `<img class="product-mockup-thumb" src="${product.mockup}" alt="${product.name} bottle mockup base" />` : `<div class="mockup-pending">Mockup<br />pending</div>`}
          </div>
        </button>
      `;
    })
    .join("");
}

function labelSvg(product, category, overrides = {}) {
  const overrideName = (overrides.name || "").trim() || product.name;
  const overrideActive = (overrides.active || "").trim() || product.active;
  const overrideConc = (overrides.concentration || "").trim() || product.concentration;
  const overrideMode = (overrides.mode || "").trim() || product.mode;
  const overrideColor = (overrides.panelColor || "").trim() || category.color;
  const overrideNetContent = (overrides.netContent || "").trim() || "1 L";

  // Net content font sizing — manual override or auto based on length
  const netContentSize = (overrides.contentSize || "").trim() || (overrideNetContent.length > 6 ? 62 : overrideNetContent.length > 4 ? 76 : 92);

  // Use manual font size if set, otherwise auto-size based on length
  const productSize = (overrides.nameSize || "").trim() || (overrideName.length > 7 ? 132 : overrideName.length > 5 ? 146 : 162);
  const activeSize = (overrides.activeSize || "").trim() || (overrideActive.length > 13 ? 34 : 42);
  const concSize = (overrides.concSize || "").trim() || "42";
  const modeSize = (overrides.modeSize || "").trim() || "31";

  // Color overrides — custom color picker wins over dropdown preset
  const nameColor = (overrides.nameColorCustom || overrides.nameColor || "").trim();
  const activeColor = (overrides.activeColorCustom || overrides.activeColor || "").trim();
  const concColor = (overrides.concColorCustom || overrides.concColor || "").trim();
  const modeColor = (overrides.modeColorCustom || overrides.modeColor || "").trim();
  const categoryLabel = ((overrides.badgeText || "").trim() || category.name).toUpperCase();
  const badgeColor = (overrides.badgeColorCustom || overrides.badgeColor || "").trim() || "#F6A400";
  const panelColor = overrideColor;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="4in" height="6in" viewBox="0 0 1200 1800" role="img" aria-label="MERCBEX ${overrideName} print label">
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
      <path d="M100 380 C290 294 470 338 642 393 C790 441 930 423 1100 330" stroke="#FFFFFF" stroke-width="20" opacity="0.28" fill="none"/>
      <path d="M100 460 C300 382 462 414 638 470 C800 521 934 502 1100 420" stroke="#FFFFFF" stroke-width="6" opacity="0.22" fill="none"/>
      <path d="M100 540 C308 466 468 496 640 554 C800 608 936 590 1100 510" stroke="#FFFFFF" stroke-width="5" opacity="0.16" fill="none"/>
      <path d="M100 1042 C315 960 468 995 636 1051 C790 1103 940 1085 1100 1005" stroke="#FFFFFF" stroke-width="14" opacity="0.32" fill="none"/>
      <path d="M100 1130 C296 1050 456 1076 632 1136 C790 1190 940 1170 1100 1090" stroke="#FFFFFF" stroke-width="5" opacity="0.18" fill="none"/>
      <rect x="724" y="382" width="368" height="600" fill="url(#molecules)" opacity="0.95"/>
      <path d="M890 470 C970 580 960 690 875 790 C820 690 825 575 890 470 Z" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.18"/>
      <path d="M885 512 C883 600 880 695 875 775" stroke="#FFFFFF" stroke-width="3" opacity="0.16"/>
      <path d="M882 590 C922 570 950 542 970 508" stroke="#FFFFFF" stroke-width="3" opacity="0.14" fill="none"/>
      <path d="M879 660 C918 644 948 618 972 580" stroke="#FFFFFF" stroke-width="3" opacity="0.14" fill="none"/>
    </g>

    <g transform="translate(220 320)">
      <rect x="0" y="0" width="${Math.max(232, categoryLabel.length * 17)}" height="58" rx="29" fill="${badgeColor}"/>
      <text x="${Math.max(232, categoryLabel.length * 17) / 2}" y="38" text-anchor="middle" class="font micro white" font-weight="700">${categoryLabel}</text>
    </g>

    <g transform="translate(220 438)">
      <text x="0" y="0" class="font small white" font-weight="600">SYSTEMIC CROP PROTECTION</text>
      <text x="0" y="176" class="font" font-size="${productSize}" font-weight="820" letter-spacing="0" fill="${nameColor || '#FFFFFF'}">${overrideName}</text>
      <path d="M0 218 C160 246 335 246 536 218" stroke="#FFFFFF" stroke-width="9" fill="none" opacity="0.45"/>
      <text x="0" y="314" class="font" font-size="${activeSize}" font-weight="650" letter-spacing="0" fill="${activeColor || '#FFFFFF'}">${overrideActive}</text>
      <text x="0" y="390" class="font" font-size="${concSize}" font-weight="750" fill="${concColor || '#76B82A'}">${overrideConc}</text>
      <text x="0" y="448" class="font" font-size="${modeSize}" font-weight="500" fill="${modeColor || '#FFFFFF'}">Mode of action: ${overrideMode}</text>
    </g>

    <path d="M108 1206 C250 1132 399 1116 581 1178 C758 1238 935 1222 1092 1164 L1092 1500 C926 1538 750 1538 580 1482 C392 1419 252 1436 108 1512 Z" fill="#F7F9F8"/>
    <path d="M108 1206 C250 1132 399 1116 581 1178 C758 1238 935 1222 1092 1164" stroke="#BFC5C8" stroke-width="5" opacity="0.75" fill="none"/>

    <rect x="144" y="1268" width="912" height="156" rx="30" fill="#FFFFFF" opacity="0.82"/>
    <g transform="translate(300 1288)">
      <g transform="translate(0 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="${panelColor}" stroke-width="4"/>
        <path d="M20 38 L32 50 L55 22" stroke="${panelColor}" stroke-width="5" fill="none"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">High</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Efficacy</text>
      </g>
      <g transform="translate(280 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="${panelColor}" stroke-width="4"/>
        <path d="M36 16 L36 56 M16 36 L56 36 M22 22 L50 50 M50 22 L22 50" stroke="${panelColor}" stroke-width="4"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">Broad</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Spectrum</text>
      </g>
      <g transform="translate(560 0)">
        <circle cx="36" cy="36" r="32" fill="none" stroke="${panelColor}" stroke-width="4"/>
        <path d="M36 18 C52 28 58 40 54 55 C43 66 28 66 18 55 C14 40 21 28 36 18 Z" stroke="${panelColor}" stroke-width="4" fill="none"/>
        <path d="M36 28 L36 47 L48 47" stroke="${panelColor}" stroke-width="4" fill="none"/>
        <text x="36" y="92" text-anchor="middle" class="font micro charcoal" font-weight="650">Long</text>
        <text x="36" y="124" text-anchor="middle" class="font micro charcoal" font-weight="650">Control</text>
      </g>
    </g>

    <g transform="translate(220 1550)">
      <text x="0" y="0" class="font micro grey" font-weight="650">NET CONTENT</text>
      <text x="0" y="54" class="font" font-size="${netContentSize}" font-weight="760" fill="${panelColor}">${overrideNetContent}</text>
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

  const activeOverrides = {
    name: editOverrides.name || product.name,
    active: editOverrides.active || product.active,
    concentration: editOverrides.concentration || product.concentration,
    mode: editOverrides.mode || product.mode,
    panelColor: editOverrides.panelColor || category.color,
    netContent: editOverrides.netContent || "1 L",
    nameSize: editOverrides.nameSize || "",
    activeSize: editOverrides.activeSize || "",
    concSize: editOverrides.concSize || "",
    modeSize: editOverrides.modeSize || "",
    contentSize: editOverrides.contentSize || "",
    badgeText: editOverrides.badgeText || "",
    badgeColor: editOverrides.badgeColor || "",
    nameColor: editOverrides.nameColor || "",
    nameColorCustom: editOverrides.nameColorCustom || "",
    activeColor: editOverrides.activeColor || "",
    activeColorCustom: editOverrides.activeColorCustom || "",
    concColor: editOverrides.concColor || "",
    concColorCustom: editOverrides.concColorCustom || "",
    modeColor: editOverrides.modeColor || "",
    modeColorCustom: editOverrides.modeColorCustom || "",
    badgeColorCustom: editOverrides.badgeColorCustom || "",
  };

  selectedName.textContent = activeOverrides.name;
  setThemeColor(activeOverrides.panelColor);
  labelPreview.innerHTML = labelSvg(product, category, activeOverrides);

  // Sync edit panel fields
  document.getElementById("editProductName").value = editOverrides.name || product.name;
  document.getElementById("editActive").value = editOverrides.active || product.active;
  document.getElementById("editConcentration").value = editOverrides.concentration || product.concentration;
  document.getElementById("editMode").value = editOverrides.mode || product.mode;
  document.getElementById("editColor").value = activeOverrides.panelColor;
  document.getElementById("editNetContent").value = editOverrides.netContent || "1 L";
  document.getElementById("editNameSize").value = editOverrides.nameSize || "";
  document.getElementById("editActiveSize").value = editOverrides.activeSize || "";
  document.getElementById("editConcSize").value = editOverrides.concSize || "";
  document.getElementById("editModeSize").value = editOverrides.modeSize || "";
  document.getElementById("editContentSize").value = editOverrides.contentSize || "";
  document.getElementById("editBadgeText").value = editOverrides.badgeText || "";
  document.getElementById("editBadgeColor").value = editOverrides.badgeColor || "";
  document.getElementById("editBadgeColorCustom").value = editOverrides.badgeColorCustom || "#F6A400";
  document.getElementById("editNameColor").value = editOverrides.nameColor || "";
  document.getElementById("editNameColorCustom").value = editOverrides.nameColorCustom || "#FFFFFF";
  document.getElementById("editActiveColor").value = editOverrides.activeColor || "";
  document.getElementById("editActiveColorCustom").value = editOverrides.activeColorCustom || "#FFFFFF";
  document.getElementById("editConcColor").value = editOverrides.concColor || "";
  document.getElementById("editConcColorCustom").value = editOverrides.concColorCustom || "#76B82A";
  document.getElementById("editModeColor").value = editOverrides.modeColor || "";
  document.getElementById("editModeColorCustom").value = editOverrides.modeColorCustom || "#FFFFFF";
  const studioMarkup = product.mockup ? `
      <figure class="bottle-composite" aria-label="${activeOverrides.name} live studio bottle preview">
        <div class="bottle-image-wrap">
          <img class="bottle-bg" src="${product.mockup}" alt="${activeOverrides.name} blank bottle mockup base" />
          <div class="bottle-label-overlay">
            ${labelSvg(product, category, activeOverrides)}
          </div>
          <div class="bottle-laminate bottle-laminate-left" aria-hidden="true"></div>
          <div class="bottle-laminate bottle-laminate-center" aria-hidden="true"></div>
          <div class="bottle-edge-shadow bottle-edge-shadow-left" aria-hidden="true"></div>
          <div class="bottle-edge-shadow bottle-edge-shadow-right" aria-hidden="true"></div>
        </div>
      </figure>
    ` : `
      <div class="mockup-empty" style="--category-color: ${category.color}">
        <img src="../brand-system/mercbex-logo.png" alt="MERCBEX" />
        <p>${product.name}</p>
        <strong>Studio bottle base pending</strong>
        <span>Add the blank bottle source to preview the current label.</span>
      </div>
    `;

  bottlePreview.innerHTML = studioMarkup;
  labelPreview.hidden = selectedPreview !== "label";
  bottlePreview.hidden = selectedPreview === "label";
  downloadButton.disabled = selectedPreview !== "label";

  applyPreviewZoom();
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
  bottlePreview.hidden = selectedPreview === "label";
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

// --- Preview tab handlers ---

previewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedPreview = tab.dataset.preview;
    previewTabs.forEach((button) => {
      button.setAttribute("aria-selected", String(button === tab));
    });
    renderLabel();
  });
});

// --- Edit panel handlers ---

function applyOverride(field) {
  return (e) => {
    editOverrides[field] = e.target.value;
    renderLabel();
  };
}

document.getElementById("editProductName").addEventListener("input", applyOverride("name"));
document.getElementById("editActive").addEventListener("input", applyOverride("active"));
document.getElementById("editConcentration").addEventListener("input", applyOverride("concentration"));
document.getElementById("editMode").addEventListener("input", applyOverride("mode"));
document.getElementById("editColor").addEventListener("input", applyOverride("panelColor"));
document.getElementById("editNetContent").addEventListener("change", applyOverride("netContent"));

document.getElementById("editNameSize").addEventListener("change", applyOverride("nameSize"));
document.getElementById("editActiveSize").addEventListener("change", applyOverride("activeSize"));
document.getElementById("editConcSize").addEventListener("change", applyOverride("concSize"));
document.getElementById("editModeSize").addEventListener("change", applyOverride("modeSize"));
document.getElementById("editContentSize").addEventListener("change", applyOverride("contentSize"));
document.getElementById("editBadgeText").addEventListener("input", applyOverride("badgeText"));
document.getElementById("editBadgeColor").addEventListener("change", applyOverride("badgeColor"));
document.getElementById("editNameColor").addEventListener("change", applyOverride("nameColor"));
document.getElementById("editActiveColor").addEventListener("change", applyOverride("activeColor"));
document.getElementById("editConcColor").addEventListener("change", applyOverride("concColor"));
document.getElementById("editModeColor").addEventListener("change", applyOverride("modeColor"));

// Custom color pickers
document.getElementById("editBadgeColorCustom").addEventListener("input", applyOverride("badgeColorCustom"));
document.getElementById("editNameColorCustom").addEventListener("input", applyOverride("nameColorCustom"));
document.getElementById("editActiveColorCustom").addEventListener("input", applyOverride("activeColorCustom"));
document.getElementById("editConcColorCustom").addEventListener("input", applyOverride("concColorCustom"));
document.getElementById("editModeColorCustom").addEventListener("input", applyOverride("modeColorCustom"));

document.getElementById("resetEditPanel").addEventListener("click", () => {
  Object.keys(editOverrides).forEach((k) => { editOverrides[k] = k === "netContent" ? "1 L" : ""; });
  renderLabel();
});

downloadButton.addEventListener("click", async () => {
  if (downloadButton.disabled) return;
  const product = productById(selectedProductId);
  const downloadName = (editOverrides.name || "").trim() || product.name;
  const svgString = await serializedSelfContainedLabelSvg();
  if (!svgString) return;
  downloadSvgString(svgString, `mercbex-${downloadName.toLowerCase()}-label.svg`);
});

// --- Zoom slider ---

document.getElementById("zoomSlider").addEventListener("input", (e) => {
  zoomLevel = parseInt(e.target.value, 10);
  applyPreviewZoom();
});

// --- Save Label to disk ---
document.getElementById("saveLabel").addEventListener("click", async () => {
  const product = productById(selectedProductId);
  const downloadName = (editOverrides.name || "").trim() || product.name;
  const svgString = await serializedSelfContainedLabelSvg();
  if (!svgString) return;
  downloadSvgString(svgString, `mercbex-${downloadName.toLowerCase()}-label.svg`);

  // Also display a message
  const btn = document.getElementById("saveLabel");
  const origText = btn.textContent;
  btn.textContent = "✓ Saved!";
  btn.style.background = "#76B82A";
  setTimeout(() => {
    btn.textContent = origText;
    btn.style.background = "";
  }, 2000);
});

printButton.addEventListener("click", () => {
  selectedPreview = "label";
  previewTabs.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.preview === "label"));
  });
  renderLabel();
  window.print();
});

window.addEventListener("afterprint", () => {
  selectedPreview = "studio";
  previewTabs.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.preview === "studio"));
  });
  renderLabel();
});

updateView();
