from PIL import Image
import numpy as np

def make_transparent_paper(img_path, out_path, bg_color, threshold=22, softness=20):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    bg = np.array(bg_color, dtype=np.float32)
    
    # Color distance from bg
    dist = np.sqrt(np.sum((arr[:, :, :3] - bg) ** 2, axis=-1))
    
    # Calculate alpha: dist <= threshold -> alpha=0; dist >= threshold+softness -> alpha=255
    alpha = np.clip((dist - threshold) / softness * 255.0, 0, 255).astype(np.uint8)
    
    # Build final RGBA
    out_arr = np.array(img)
    out_arr[:, :, 3] = alpha
    out_img = Image.fromarray(out_arr)
    out_img.save(out_path)
    print(f"Generated {out_path}")

# Girls
make_transparent_paper(
    "/Users/yunllly/Desktop/website-assets/people/树下女孩.png",
    "/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-under-tree-alpha.png",
    [241, 233, 216], threshold=18, softness=22
)

make_transparent_paper(
    "/Users/yunllly/Desktop/website-assets/people/被砸女孩.png",
    "/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-hit-alpha.png",
    [239, 232, 214], threshold=18, softness=22
)

# Tree
make_transparent_paper(
    "/Users/yunllly/Desktop/website-assets/people/苹果树.png",
    "/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-full-alpha.png",
    [244, 229, 197], threshold=18, softness=22
)

# Slice tree alpha
tree_alpha = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-full-alpha.png")
w, h = tree_alpha.size

# Crown (top)
crown = tree_alpha.crop((0, 0, w, 880))
crown.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-crown-alpha.png")

# Trunk repeatable segment (from y=1050 to y=1350)
trunk_seg = tree_alpha.crop((440, 1050, 640, 1350))
trunk_seg.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-trunk-seg-alpha.png")

# Roots (from y=1250 to 1536)
roots = tree_alpha.crop((0, 1250, w, 1536))
roots.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-roots-alpha.png")
