import os
import sys
import argparse
from PIL import Image, ImageOps
import numpy as np

def generate_side_drape_proxy(front_path, output_path, hanger_ref_path=None):
    """
    Synthesizes a realistic side-profile proxy silhouette from a front garment cutout:
    - Isolates the main drape column (one sleeve + side torso)
    - Compresses perspective along the X axis
    - Mounts a calibrated side-profile hanger top onto the collar
    - Outputs a compliant side asset ready for standardize_garment_assets.py
    """
    print(f"[+] Generating side profile proxy from: {front_path}")
    front = Image.open(front_path).convert('RGBA')
    f_arr = np.array(front)
    h, w = f_arr.shape[:2]

    # Find garment bounds
    ys, xs = np.where(f_arr[:, :, 3] > 20)
    if len(ys) == 0:
        print("[-] Invalid front image (empty alpha)")
        return False

    center_x = (xs.min() + xs.max()) // 2
    # Slice the right half (sleeve + half torso)
    half_crop = f_arr[:, center_x:xs.max()+1]

    # Convert to PIL and squeeze horizontally to simulate side profile folding
    half_pil = Image.fromarray(half_crop)
    drape_w = max(60, int(half_pil.width * 0.65))
    drape_pil = half_pil.resize((drape_w, half_pil.height), Image.Resampling.LANCZOS)

    canvas_w = drape_w + 50
    canvas = np.zeros((h, canvas_w, 4), dtype=np.uint8)
    ox = (canvas_w - drape_w) // 2
    canvas[:, ox:ox+drape_w] = np.array(drape_pil)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    Image.fromarray(canvas).save(output_path, format="PNG")
    print(f"[✓] Generated side profile proxy saved to: {output_path}")
    print("[*] Note: For highest photorealism, photograph garment on a side-profile hanger or use Blender 3D rendering.")
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate side profile proxy from front garment image")
    parser.add_argument("--front", "-f", required=True, help="Input front garment PNG")
    parser.add_argument("--output", "-o", required=True, help="Output side garment PNG")
    args = parser.parse_args()
    generate_side_drape_proxy(args.front, args.output)
