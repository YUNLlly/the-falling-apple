from PIL import Image
import numpy as np
import os

os.makedirs("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree", exist_ok=True)
os.makedirs("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl", exist_ok=True)

# 1. Process Apple image for cursor
apple_img = Image.open("/Users/yunllly/Desktop/苹果.jpg").convert("RGBA")
arr = np.array(apple_img)
# Background is warm off-white, let's remove background for cursor
bg = np.array([251, 244, 223])
diff = np.sqrt(np.sum((arr[:, :, :3].astype(float) - bg) ** 2, axis=-1))
# Find alpha: if close to bg, alpha is 0
alpha = np.clip((diff - 15) / 25.0 * 255, 0, 255).astype(np.uint8)

# Mask out corners
arr[:, :, 3] = alpha
apple_rgba = Image.fromarray(arr)
# Crop to bounding box
bbox = apple_rgba.getbbox()
if bbox:
    apple_cropped = apple_rgba.crop(bbox)
else:
    apple_cropped = apple_rgba

apple_cropped.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/apple-full.png")

# Cursor size (64x64 and 48x48)
apple_cursor = apple_cropped.resize((48, 48), Image.Resampling.LANCZOS)
apple_cursor.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/apple-cursor.png")
print("Saved apple-cursor.png (48x48) and apple-full.png")

# 2. Process Girls
girl_default = Image.open("/Users/yunllly/Desktop/website-assets/people/树下女孩.png")
girl_default.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-under-tree.png")

girl_hit = Image.open("/Users/yunllly/Desktop/website-assets/people/被砸女孩.png")
girl_hit.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-hit.png")
print("Saved girl-under-tree.png and girl-hit.png")

# 3. Process Tree
tree_img = Image.open("/Users/yunllly/Desktop/website-assets/people/苹果树.png")
tree_img.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-full.png")
w, h = tree_img.size

# Slice tree into crown, trunk, roots
# Crown: y: 0 -> 880
crown = tree_img.crop((0, 0, w, 880))
crown.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-crown.png")

# Trunk: y: 800 -> 1300
trunk = tree_img.crop((0, 800, w, 1300))
trunk.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-trunk.png")

# Roots & ground: y: 1200 -> 1536
roots = tree_img.crop((0, 1200, w, 1536))
roots.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-roots.png")

print(f"Tree cropped: crown (1024x880), trunk (1024x500), roots (1024x336)")
