import fs from "node:fs/promises";
import sharp from "/Users/shraddhapeswani/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js";

const sourceSvg = await fs.readFile("brand-system/mercbex-aceman-front-label.svg", "utf8");
const logoData = (await fs.readFile("brand-system/mercbex-logo.png")).toString("base64");
const qrData = (await fs.readFile("brand-system/mercbex-qr-code.png")).toString("base64");

const products = [
  {
    slug: "seal",
    name: "SEAL",
    active: "TOLFENPYRAD",
    concentration: "15.0% EC",
    mode: "Broad spectrum insect control",
    productSize: 176,
    activeSize: 42,
  },
  {
    slug: "bexapro",
    name: "BEXAPRO",
    active: "CYANTRANILIPROLE",
    concentration: "10.26% OD",
    mode: "Advanced pest protection",
    productSize: 142,
    activeSize: 34,
  },
];

function productLabelSvg(product) {
  return sourceSvg
    .replace(/aria-label="MERCBEX ACEMAN insecticide front label master artwork"/, `aria-label="MERCBEX ${product.name} insecticide front label master artwork"`)
    .replace(/href="mercbex-logo\.png"/g, `href="data:image/png;base64,${logoData}"`)
    .replace(/href="mercbex-qr-code\.png"/g, `href="data:image/png;base64,${qrData}"`)
    .replace(/<text x="0" y="176" class="font product white">ACEMAN<\/text>/, `<text x="0" y="176" class="font white" font-size="${product.productSize}" font-weight="820" letter-spacing="0">${product.name}</text>`)
    .replace(/<text x="0" y="314" class="font medium white" font-weight="650">ACETAMIPRID<\/text>/, `<text x="0" y="314" class="font white" font-size="${product.activeSize}" font-weight="650" letter-spacing="0">${product.active}</text>`)
    .replace(/<text x="0" y="380" class="font medium lime" font-weight="750">20.0% SP<\/text>/, `<text x="0" y="380" class="font medium lime" font-weight="750">${product.concentration}</text>`)
    .replace(/Mode of action: Systemic \+ translaminar action/g, `Mode of action: ${product.mode}`);
}

await fs.mkdir("catalogue/assets/labels", { recursive: true });

for (const product of products) {
  const svg = productLabelSvg(product);
  const svgPath = `catalogue/assets/labels/${product.slug}-front-label.svg`;
  const pngPath = `catalogue/assets/labels/${product.slug}-front-label.png`;

  await fs.writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize(1200, 1800, { fit: "fill" }).png().withMetadata({ density: 300 }).toFile(pngPath);
  console.log(`Generated ${svgPath} and ${pngPath}`);
}
