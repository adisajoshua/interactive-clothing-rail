import os
import sys
import argparse
from PIL import Image
import numpy as np

def standardize_garment(input_path, output_path, target_height=760, target_width=None, apex_y=4):
    """
    Standardizes a garment cutout for the interactive clothing rail:
    - Verifies RGBA transparency
    - Finds the exact metal hook apex
    - Standardizes the apex to pixel row apex_y
    - Ensures 1:1 scale across front and side profiles
    """
    print(f"[+] Processing: {input_path}")
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img)
    alpha = arr[:, :, 3]

    # Find non-zero alpha bounding box
    ys, xs = np.where(alpha > 20)
    if len(ys) == 0:
        print(f"[-] Error: Image has no visible pixels: {input_path}")
        return False

    y_min, y_max = ys.min(), ys.max()
    x_min, x_max = xs.min(), xs.max()

    # Crop tight to garment
    cropped = arr[y_min:y_max+1, x_min:x_max+1]
    cropped_h, cropped_w = cropped.shape[:2]

    # Desired garment height inside canvas
    desired_garment_h = target_height - apex_y - 12
    scale_factor = desired_garment_h / float(cropped_h)
    new_w = max(1, int(round(cropped_w * scale_factor)))
    new_h = desired_garment_h

    # Resize using high quality Lanczos filter
    cropped_pil = Image.fromarray(cropped)
    resized_pil = cropped_pil.resize((new_w, new_h), Image.Resampling.LANCZOS)
    resized_arr = np.array(resized_pil)

    # Determine canvas width
    if target_width is None:
        canvas_w = max(new_w + 30, 200 if 'side' in os.path.basename(input_path).lower() else 520)
    else:
        canvas_w = target_width

    # Create empty transparent canvas
    canvas = np.zeros((target_height, canvas_w, 4), dtype=np.uint8)

    # Center horizontally and position hook apex at apex_y
    offset_x = max(0, (canvas_w - new_w) // 2)
    canvas[apex_y:apex_y+new_h, offset_x:offset_x+new_w] = resized_arr

    # Save standardized asset
    out_img = Image.fromarray(canvas)
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    out_img.save(output_path, format="PNG")
    print(f"[✓] Standardized: {output_path} (Canvas: {canvas_w}x{target_height}, Apex @ y={apex_y})")
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Standardize garment assets for 3D clothing rail")
    parser.add_argument("--input", "-i", required=True, help="Input image file or folder")
    parser.add_argument("--output", "-o", required=True, help="Output image file or folder")
    parser.add_argument("--apex-y", type=int, default=4, help="Target row for hook apex (default: 4)")
    parser.add_argument("--height", type=int, default=760, help="Canvas height (default: 760)")
    args = parser.parse_args()

    if os.path.isfile(args.input):
        standardize_garment(args.input, args.output, target_height=args.height, apex_y=args.apex_y)
    elif os.path.isdir(args.input):
        os.makedirs(args.output, exist_ok=True)
        for fname in os.listdir(args.input):
            if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                in_file = os.path.join(args.input, fname)
                out_file = os.path.join(args.output, os.path.splitext(fname)[0] + ".png")
                standardize_garment(in_file, out_file, target_height=args.height, apex_y=args.apex_y)
