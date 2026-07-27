#!/usr/bin/env python3
"""
create_bottle_mockup.py — MERCBEX Product Label Bottle Mockup Generator

Takes a saved SVG label file and composites it onto a single bottle photograph,
producing a realistic "label-wrapped-around-bottle" mockup.

Usage:
    python3 create_bottle_mockup.py <svg_label_file> [--output <filename>]

Requirements:
    pip3 install cairosvg Pillow numpy opencv-python-headless
"""

import os, sys, json, argparse, math
from pathlib import Path

import numpy as np

# Check for optional dependencies
try:
    import cairosvg
except ImportError:
    cairosvg = None
    print("WARNING: cairosvg not installed — SVG rasterization will be basic")

try:
    from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
except ImportError:
    sys.exit("Pillow required — install: pip3 install Pillow")

try:
    import cv2
except ImportError:
    cv2 = None

# ─── Paths ──────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent / "catalogue"
MOCKUP_DIR = BASE_DIR / "assets" / "mockups"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "catalogue" / "assets" / "mockups"

DEFAULT_BOTTLE = str(MOCKUP_DIR / "aceman-single-bottle.png")
REGIONS_FILE = str(MOCKUP_DIR / "bottle_regions.json")


def load_bottle_regions():
    """
    Returns a dict with precise pixel coordinates for the label area
    on the front bottle. These values were determined by measuring
    the bottle image (1315×1197).

    Coordinate system assumes a standard single-bottle photo with:
      - The bottle centered in frame
      - A matte plastic bottle on dark/off-white background
    """
    return {
        "bottle_dimensions": [1315, 1197],
        "label_rect": {
            # The rectangular area on the bottle where the printed label sits
            # Values are [x1, y1, x2, y2] in image pixel coordinates
            # This maps to the central label panel on a single bottle
            "x1": 190,
            "y1": 270,
            "x2": 1130,
            "y2": 940
        },
        "label_aspect": {
            # The source SVG label is 4in × 6in → 2:3 aspect ratio
            # We want it to fill the label area proportionally
            "target_width_pct": 0.70,   # Label width as fraction of label_rect width
            "target_height_pct": 0.85,   # Label height as fraction of label_rect height
            "center_x_offset": 0.0,      # Fine-tune horizontal centering (fraction of rect width)
            "center_y_offset": 0.0       # Fine-tune vertical centering (fraction of rect height)
        },
        "curvature": {
            # Cylindrical warp to simulate bottle curve
            "strength": 0.04,            # 0=flat, higher=more curve
            "vertical_perspective": 0.0  # slight vertical perspective (0=off)
        },
        "mask_margin": {
            # Margin around the label for blend/smoothing (in pixels at full resolution)
            "inner": 10,
            "outer": 4
        },
        "lighting": {
            # Overlay highlights derived from the bottle surface
            "highlight_opacity": 0.12,
            "shadow_opacity": 0.08,
            "specular_width_pct": 0.30   # Width of vertical specular highlight
        }
    }


def svg_to_pil(svg_path, dpi=300):
    """
    Render an SVG file to a PIL Image at the given DPI.
    Uses cairosvg if available, otherwise falls back to a simple approach.

    The SVG viewBox (1200×1800) is rendered at the target DPI.
    """
    svg_path = Path(svg_path)
    if not svg_path.exists():
        sys.exit(f"ERROR: SVG file not found: {svg_path}")

    with open(svg_path, 'r') as f:
        svg_data = f.read()

    if cairosvg is not None:
        # cairosvg produces high-quality output
        png_data = cairosvg.svg2png(
            bytestring=svg_data.encode('utf-8'),
            output_width=None,  # use native dimensions
            output_height=None,
            dpi=dpi
        )
        from io import BytesIO
        return Image.open(BytesIO(png_data)).convert("RGBA")
    else:
        # Basic fallback — just return the SVG as text (will be handled differently)
        # This is not ideal but provides a path forward without cairosvg
        print("WARNING: cairosvg not available. Consider installing for better results.")
        print("Attempting basic SVG rasterization...")
        sys.exit("cairosvg required for SVG rendering: pip3 install cairosvg")


def apply_cylindrical_warp(label_img, strength=0.04):
    """
    Apply a cylindrical distortion to the label so it appears wrapped
    around the bottle. This simulates the visual effect of a flat label
    adhering to a curved surface.

    The warp compresses the left and right edges slightly while keeping
    the center relatively unchanged, mimicking the visual foreshortening
    seen on cylindrical objects.

    Args:
        label_img: PIL Image (RGBA) of the label
        strength: Distortion amount (0=flat, ~0.06=moderate curve)

    Returns:
        Warped PIL Image
    """
    if cv2 is None:
        print("WARNING: OpenCV not available — skipping cylindrical warp")
        return label_img

    arr = np.array(label_img)
    h, w = arr.shape[:2]

    # Build the distortion map
    map_x = np.zeros((h, w), dtype=np.float32)
    map_y = np.zeros((h, w), dtype=np.float32)

    center_x = w / 2.0
    for y in range(h):
        for x in range(w):
            # Normalize x coordinate: -1 to 1
            nx = (x - center_x) / center_x
            # Apply a quadratic compression: edges compress more
            # This simulates the cylindrical projection
            compression = strength * nx * nx
            map_x[y, x] = x * (1 - compression)
            map_y[y, x] = y

    warped = cv2.remap(arr, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    return Image.fromarray(warped)


def composite_label_on_bottle(bottle_img, label_svg_path, regions, output_path, debug=False):
    """
    Main compositing function: takes the bottle photograph and label SVG,
    distorts and positions the label, and composites it onto the bottle.

    Args:
        bottle_img: PIL Image of the bottle photograph
        label_svg_path: Path to the SVG label file
        regions: Dict with label placement coordinates
        output_path: Where to save the final image
        debug: If True, also save a debug overlay image

    Returns:
        Tuple of (final_image, debug_image)
    """
    # 1. Parse the label region coordinates
    label_rect = regions["label_rect"]
    rect_w = label_rect["x2"] - label_rect["x1"]
    rect_h = label_rect["y2"] - label_rect["y1"]

    # 2. Determine label dimensions within the region
    target_w = int(rect_w * regions["label_aspect"]["target_width_pct"])
    target_h = int(rect_h * regions["label_aspect"]["target_height_pct"])

    # 3. Render and resize the SVG label
    print(f"[1/5] Rendering SVG label...")
    label_pil = svg_to_pil(label_svg_path, dpi=300)

    # Maintain aspect ratio
    label_aspect = label_pil.width / label_pil.height
    if target_w / target_h > label_aspect:
        target_w = int(target_h * label_aspect)
    else:
        target_h = int(target_w / label_aspect)

    label_resized = label_pil.resize((target_w, target_h), Image.LANCZOS)
    print(f"     Label size: {target_w}×{target_h}")

    # 4. Apply cylindrical warp
    print(f"[2/5] Applying cylindrical warp...")
    warp_strength = regions["curvature"]["strength"]
    label_warped = apply_cylindrical_warp(label_resized, warp_strength)

    # 5. Create a composite canvas
    print(f"[3/5] Compositing onto bottle...")
    bottle = bottle_img.copy().convert("RGBA")

    # Calculate position — center the label in the target region
    cx = label_rect["x1"] + rect_w // 2 + int(rect_w * regions["label_aspect"]["center_x_offset"])
    cy = label_rect["y1"] + rect_h // 2 + int(rect_h * regions["label_aspect"]["center_y_offset"])

    paste_x = cx - target_w // 2
    paste_y = cy - target_h // 2

    # Create a mask for the label to blend edges
    mask = Image.new("L", (target_w, target_h), 255)

    # Feather the edges slightly for a seamless blend
    margin_inner = regions["mask_margin"]["inner"]
    margin_outer = regions["mask_margin"]["outer"]

    # Apply edge feathering using a blur
    mask = mask.filter(ImageFilter.GaussianBlur(radius=margin_inner))

    # 6. Paste the label onto the bottle
    bottle.paste(label_warped, (paste_x, paste_y), mask)

    # 7. Add subtle lighting effects (simple highlight overlay)
    print(f"[4/5] Adding lighting effects...")

    # Create a subtle specular highlight overlay
    highlight = Image.new("RGBA", bottle.size, (0, 0, 0, 0))
    hl_data = np.zeros((bottle.height, bottle.width, 4), dtype=np.uint8)

    # Vertical specular strip (mimics bottle reflection)
    spec_width = int(target_w * regions["lighting"]["specular_width_pct"])
    spec_x = paste_x + target_w // 2 - spec_width // 2
    alpha_hl = int(255 * regions["lighting"]["highlight_opacity"])
    alpha_sh = int(255 * regions["lighting"]["shadow_opacity"])

    # Highlight strip
    for x in range(max(0, spec_x), min(bottle.width, spec_x + spec_width)):
        fade = 1.0 - abs(x - (spec_x + spec_width//2)) / (spec_width//2 + 1)
        if fade > 0:
            for y in range(paste_y, paste_y + target_h):
                if 0 <= y < bottle.height:
                    hl_data[y, x] = [255, 255, 255, int(alpha_hl * fade)]

    # Subtle shadow at left and right edges of label
    shadow_width = int(target_w * 0.10)
    # Left shadow
    for x in range(max(0, paste_x), min(bottle.width, paste_x + shadow_width)):
        fade = 1.0 - (x - paste_x) / shadow_width
        for y in range(paste_y, paste_y + target_h):
            if 0 <= y < bottle.height:
                hl_data[y, x] = [0, 0, 0, int(alpha_sh * fade)]
    # Right shadow
    right_edge = paste_x + target_w
    for x in range(max(0, right_edge - shadow_width), min(bottle.width, right_edge)):
        fade = 1.0 - (right_edge - x) / shadow_width
        for y in range(paste_y, paste_y + target_h):
            if 0 <= y < bottle.height:
                hl_data[y, x] = [0, 0, 0, int(alpha_sh * fade)]

    highlight = Image.fromarray(hl_data, "RGBA")
    bottle = Image.alpha_composite(bottle, highlight)

    # 8. Save
    print(f"[5/5] Saving to {output_path}...")
    final = bottle.convert("RGB")
    final.save(str(output_path), "PNG", optimize=True)
    print("     Done!")

    # Create debug image
    debug_img = None
    if debug:
        debug_img = bottle_img.copy().convert("RGBA")
        debug_draw = ImageDraw.Draw(debug_img)
        # Draw label region box
        r = regions["label_rect"]
        debug_draw.rectangle([(r["x1"], r["y1"]), (r["x2"], r["y2"])], outline=(255, 0, 0), width=3)
        # Draw the label placement
        debug_draw.rectangle([(paste_x, paste_y), (paste_x + target_w, paste_y + target_h)], outline=(0, 255, 0), width=2)
        debug_img = debug_img.convert("RGB")
        debug_path = str(output_path).replace(".png", "_debug.png")
        debug_img.save(debug_path, "PNG")
        print(f"     Debug overlay saved to: {debug_path}")

    return bottle, debug_img


def main():
    parser = argparse.ArgumentParser(description="MERCBEX Bottle Mockup Generator")
    parser.add_argument("svg_label", help="Path to the SVG label file")
    parser.add_argument("--output", "-o", default=None, help="Output PNG filename")
    parser.add_argument("--bottle", "-b", default=DEFAULT_BOTTLE, help="Bottle photograph path")
    parser.add_argument("--debug", "-d", action="store_true", help="Save debug overlay image")
    parser.add_argument("--regions", "-r", default=REGIONS_FILE, help="Bottle regions JSON config")
    parser.add_argument("--warp", "-w", type=float, default=None, help="Cylindrical warp strength override")

    args = parser.parse_args()

    # Validate inputs
    svg_path = Path(args.svg_label)
    if not svg_path.exists():
        sys.exit(f"ERROR: SVG file not found: {svg_path}")

    bottle_path = Path(args.bottle)
    if not bottle_path.exists():
        sys.exit(f"ERROR: Bottle image not found: {bottle_path}")

    # Load regions (use defaults if file doesn't exist)
    regions_path = Path(args.regions)
    if regions_path.exists():
        with open(regions_path) as f:
            regions = json.load(f)
        print(f"Loaded regions from {regions_path}")
    else:
        regions = load_bottle_regions()
        # Save defaults for user customization
        with open(regions_path, 'w') as f:
            json.dump(regions, f, indent=2)
        print(f"Created default regions config at {regions_path}")

    # Override warp strength if provided
    if args.warp is not None:
        regions["curvature"]["strength"] = args.warp

    # Determine output path
    if args.output:
        output_path = Path(args.output)
    else:
        stem = svg_path.stem.replace("-label", "").replace("_label", "")
        output_path = OUTPUT_DIR / f"{stem}_production_mockup.png"

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load bottle image
    print(f"Loading bottle image: {bottle_path}")
    bottle_img = Image.open(str(bottle_path)).convert("RGB")
    print(f"Bottle size: {bottle_img.size}")

    # Composite
    composite_label_on_bottle(bottle_img, str(svg_path), regions, str(output_path), debug=args.debug)

    print(f"\n✓ Mockup saved to: {output_path}")


if __name__ == "__main__":
    main()
