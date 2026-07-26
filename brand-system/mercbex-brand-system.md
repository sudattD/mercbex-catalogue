# MERCBEX Master Packaging System

Reusable packaging identity for MERCBEX Chemical Science LLP.

This system is built from the supplied MERCBEX logo: deep green agriculture, lime growth energy, warm orange sunrise, white clarity, and a premium scientific finish. The label should feel like an extension of the logo, not a separate graphic style.

The logo must be used as supplied. Do not redraw, approximate, recolor, stretch, or rebuild the mark. Use [mercbex-logo.png](/Users/shraddhapeswani/Documents/mercbex-catalogue-1.1/brand-system/mercbex-logo.png) as the current source asset until a print-ready vector logo is available.

## Brand DNA

The packaging must communicate:

- Modern agriculture
- Growth and healthy crops
- Scientific innovation
- Sustainability
- Trust and professionalism
- Premium quality

## Core Palette

Use logo-derived colors. Green should dominate every label.

| Role | Hex | Usage |
| --- | --- | --- |
| Primary green | `#006B46` | Main MERCBEX identity, insecticide panel, trust |
| Deep logo green | `#007A3D` | Logo frame, rules, details |
| Secondary lime | `#76B82A` | Growth curves, crop rows, leaf accents |
| Golden orange | `#F6A400` | Sunrise/category accent, small highlights |
| Metallic silver | Spot silver / `#BFC5C8` | Premium science accents only |
| White | `#FFFFFF` | HDPE bottle substrate and logo breathing space |
| Charcoal | `#18211D` | Technical text and regulatory footer |
| Cool grey | `#66716D` | Secondary text |

CMYK starting points:

- Primary green: 100 / 0 / 80 / 45
- Lime: 45 / 0 / 100 / 0
- Orange: 0 / 35 / 100 / 0
- Charcoal: 75 / 55 / 65 / 75
- Silver: use spot metallic ink or foil where possible

## Design Language

MERCBEX packaging uses soft agricultural technology forms:

- Flowing leaf curves
- Crop-row arcs
- Sunrise-inspired orange accent
- Leaf vein patterns
- Subtle molecular structures
- Light scientific overlays

Avoid sharp industrial diagonals, heavy blocks, harsh techno patterns, or overly dense bold typography.

## Master Label Architecture

The master front label is split into three zones.

### Top White Brand Zone

- MERCBEX logo centered with generous white space, sized as a trust mark rather than the dominant selling element.
- Logo is placed as the exact supplied artwork and kept smaller than the product name.
- Category appears as a compact orange or white badge connected to the main panel.
- No heavy background behind the logo.

### Main Colour Field

- Occupies approximately 60-70% of the front label.
- Soft curved top and bottom transitions.
- Dominated by category color, with MERCBEX green always present.
- Contains product name, active ingredient, concentration, mode of action, and benefits.
- Includes subtle right-side molecular graphics, crop contour lines, and leaf-vein marks at low tint.

### Bottom Technical Zone

- White or very light background for regulatory clarity.
- Icons, net content, registration placeholders, manufacturer details, batch/MRP fields.
- Clean and consistent across all SKUs.

## Typography

Use a modern sans serif family with open counters and clear numerals.

Recommended:

- `Montserrat`
- `Aptos`
- `Avenir Next`
- `Gotham`

Hierarchy:

- Product name: bold/extra-bold, uppercase, largest element.
- Category: semibold, compact.
- Active ingredient and concentration: semibold.
- Mode of action and support claim: medium.
- Regulatory details: regular.

Keep spacing clean. Product names must be readable from 3-5 metres.

## Category Colour System

Only the main colour field changes. Logo zone, bottom zone, typography, icon style, and layout remain identical. Benefit claims should appear once, in the icon row, to avoid repetition.

| Category | Main Panel Color |
| --- | --- |
| Insecticide | Deep Emerald Green `#006B46` |
| Herbicide | Royal Blue `#1F5FAE` |
| Fungicide | Orange `#E97822` |
| Plant Growth Regulator | Purple `#6B4FB3` |
| Bio Products | Natural Green `#4F9A38` |
| Micronutrients | Red `#B93636` |
| Adjuvants | Grey `#68706C` |

The MERCBEX lime and orange accents remain controlled, so every SKU is still immediately recognisable as MERCBEX.

## Required Label Fields

Top:

1. MERCBEX logo
2. Category
3. Large product name

Middle:

1. Active ingredient
2. Concentration
3. Mode of action
4. Primary support claim

Bottom:

1. Icons for the three key benefits
2. Net content
3. Registration details
4. Manufacturer
5. Batch / Mfg / Exp / MRP placeholders
6. Subtle QR code, placed in the lower technical zone

## Scalability

The same proportions must work across:

- 250 ml
- 500 ml
- 1 L
- 5 L
- 20 L

For smaller packs, reduce supporting claims first. Never reduce the product name or MERCBEX logo below recognition size.

## Print Rules

- Vector artwork is the master.
- 300 dpi raster exports may be generated from the vector master.
- CMYK-safe flat colors are preferred.
- Avoid complex gradients for offset printing.
- Use silver sparingly as spot metallic ink or a flat silver tint.
- Molecular, crop contour, and leaf-vein graphics must remain subtle.
- Maintain strong contrast on the product name and active ingredient.
- QR codes with an embedded logo should not be reduced below 22-25 mm on printed front labels. Keep a clean white quiet zone and test-scan printed proofs before production.

## TSX/CSS Tokens

```css
:root {
  --mercbex-primary-green: #006b46;
  --mercbex-logo-green: #007a3d;
  --mercbex-lime: #76b82a;
  --mercbex-orange: #f6a400;
  --mercbex-silver: #bfc5c8;
  --mercbex-white: #ffffff;
  --mercbex-charcoal: #18211d;
  --mercbex-grey: #66716d;

  --category-panel: var(--mercbex-primary-green);
  --font-brand: "Montserrat", "Aptos", "Avenir Next", Arial, sans-serif;
}
```

## ACEMAN Example

- Product name: ACEMAN
- Category: Insecticide
- Main panel: Deep Emerald Green
- Active ingredient: ACETAMIPRID
- Concentration: 20.0% SP
- Mode of action: Systemic insecticide / translaminar action
- Benefits: High efficacy, broad spectrum, long lasting control
- Pack size: 1 L
