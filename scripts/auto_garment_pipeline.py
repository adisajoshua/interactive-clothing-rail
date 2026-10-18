import os
import sys
import argparse
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

try:
    import rembg
    HAS_REMBG = True
except ImportError:
    HAS_REMBG = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")
HANGER_FRONT_PATH = os.path.join(ASSETS_DIR, "hanger_front.png")
HANGER_SIDE_PATH = os.path.join(ASSETS_DIR, "hanger_side.png")

def remove_background(pil_img):
    """If image already has transparency, use it directly. Otherwise use rembg or color threshold."""
    img = pil_img.convert('RGBA')
    arr = np.array(img)
    # Check if already has transparent background
    if (arr[:, :, 3] < 50).sum() > (arr.shape[0] * arr.shape[1] * 0.05):
        print("[+] Image already has transparent background, skipping rembg.")
        return img
    if HAS_REMBG:
        print("[+] Running AI background removal (rembg)...")
        try:
            return rembg.remove(pil_img)
        except Exception as e:
            print(f"[!] rembg failed ({e}), using white threshold fallback...")
    
    mask = (arr[:, :, 0] > 235) & (arr[:, :, 1] > 235) & (arr[:, :, 2] > 235)
    arr[mask, 3] = 0
    return Image.fromarray(arr)

def has_hanger(arr):
    """Checks if top 15% contains a thin metal hook or hanger neck."""
    h, w = arr.shape[:2]
    top_slice = arr[:int(h * 0.15), :, 3]
    ys, xs = np.where(top_slice > 50)
    if len(xs) == 0:
        return False
    span_w = xs.max() - xs.min()
    return span_w < (w * 0.4)

def process_single_garment(input_path, output_dir, name=None, target_height=760, apex_y=4):
    """
    Takes any raw/normal garment photo and generates:
    1. <name>-front.png (Standardized front view on hanger)
    2. <name>-side.png  (Standardized 3D side profile drape view on hanger)
    """
    if name is None:
        name = os.path.splitext(os.path.basename(input_path))[0]

    os.makedirs(output_dir, exist_ok=True)
    raw_img = Image.open(input_path)

    # 1. Background Removal / Verification
    clean_img = remove_background(raw_img).convert('RGBA')
    arr = np.array(clean_img)

    # Crop tight to garment
    ys, xs = np.where(arr[:, :, 3] > 25)
    if len(ys) == 0:
        print(f"[-] No garment detected in {input_path}")
        return False

    garment_crop = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
    gh, gw = garment_crop.shape[:2]

    # 2. Check & Mount Front Hanger if missing
    front_pil = Image.fromarray(garment_crop)
    if not has_hanger(garment_crop) and os.path.exists(HANGER_FRONT_PATH):
        print("[+] Garment lacks hanger: Automatically mounting 3D studio front hanger...")
        hanger_f = Image.open(HANGER_FRONT_PATH).convert('RGBA')
        hw = int(gw * 0.72)
        hh = int(hanger_f.height * (hw / float(hanger_f.width)))
        hanger_f_resized = hanger_f.resize((hw, hh), Image.Resampling.LANCZOS)
        
        neck_overlap = int(hh * 0.35)
        comb_h = hh - neck_overlap + gh
        comb_w = max(gw, hw + 40)
        canvas_f = Image.new('RGBA', (comb_w, comb_h), (0, 0, 0, 0))
        
        hx = (comb_w - hw) // 2
        canvas_f.paste(hanger_f_resized, (hx, 0), hanger_f_resized)
        
        gx = (comb_w - gw) // 2
        canvas_f.paste(front_pil, (gx, hh - neck_overlap), front_pil)
        front_pil = canvas_f

    # Standardize Front View to target_height (760) and apex_y (4)
    front_arr = np.array(front_pil)
    f_ys, f_xs = np.where(front_arr[:, :, 3] > 25)
    f_crop = front_arr[f_ys.min():f_ys.max()+1, f_xs.min():f_xs.max()+1]
    
    desired_h = target_height - apex_y - 10
    scale_f = desired_h / float(f_crop.shape[0])
    target_w = max(1, int(round(f_crop.shape[1] * scale_f)))
    
    f_scaled = Image.fromarray(f_crop).resize((target_w, desired_h), Image.Resampling.LANCZOS)
    canvas_front = Image.new('RGBA', (max(520, target_w + 40), target_height), (0, 0, 0, 0))
    canvas_front.paste(f_scaled, ((canvas_front.width - target_w) // 2, apex_y), f_scaled)
    
    front_out = os.path.join(output_dir, f"{name}-front.png")
    canvas_front.save(front_out, format="PNG")
    print(f"[✓] High-res Front View saved: {front_out}")

    # 3. Generate Realistic 3D Side Profile Drape View
    print("[+] Synthesizing realistic 3D side profile drape view...")
    center_split = int(f_crop.shape[1] * 0.52)
    side_slice = f_crop[:, center_split:]
    
    slice_pil = Image.fromarray(side_slice)
    drape_w = max(55, int(slice_pil.width * 0.62))
    drape_pil = slice_pil.resize((drape_w, desired_h - 110), Image.Resampling.LANCZOS)
    
    canvas_side = Image.new('RGBA', (210, target_height), (0, 0, 0, 0))
    if os.path.exists(HANGER_SIDE_PATH):
        hanger_s = Image.open(HANGER_SIDE_PATH).convert('RGBA')
        shw = int(drape_w * 0.95)
        shh = int(hanger_s.height * (shw / float(hanger_s.width)))
        hanger_s_resized = hanger_s.resize((shw, shh), Image.Resampling.LANCZOS)
        
        hx = (canvas_side.width - shw) // 2
        canvas_side.paste(hanger_s_resized, (hx, apex_y), hanger_s_resized)
        
        dx = (canvas_side.width - drape_w) // 2
        canvas_side.paste(drape_pil, (dx, apex_y + shh - 22), drape_pil)
    else:
        dx = (canvas_side.width - drape_w) // 2
        canvas_side.paste(drape_pil, (dx, apex_y), drape_pil)

    side_out = os.path.join(output_dir, f"{name}-side.png")
    canvas_side.save(side_out, format="PNG")
    print(f"[✓] High-res Side Profile Drape saved: {side_out}")

    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="End-to-End Automatic Garment Processing Pipeline")
    parser.add_argument("--input", "-i", required=True, help="Input raw photo or folder")
    parser.add_argument("--output", "-o", required=True, help="Output destination folder")
    parser.add_argument("--name", "-n", default=None, help="Product slug name")
    args = parser.parse_args()

    if os.path.isfile(args.input):
        process_single_garment(args.input, args.output, name=args.name)
    elif os.path.isdir(args.input):
        for fname in os.listdir(args.input):
            if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                fpath = os.path.join(args.input, fname)
                process_single_garment(fpath, args.output)
