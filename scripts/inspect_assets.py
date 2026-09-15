from PIL import Image
import numpy as np

for name, path in [
    ("tree", "/Users/yunllly/Desktop/website-assets/people/苹果树.png"),
    ("girl_default", "/Users/yunllly/Desktop/website-assets/people/树下女孩.png"),
    ("girl_hit", "/Users/yunllly/Desktop/website-assets/people/被砸女孩.png"),
    ("apple", "/Users/yunllly/Desktop/苹果.jpg")
]:
    im = Image.open(path)
    print(f"=== {name} ({path}) ===")
    print(f"Size: {im.size}, Mode: {im.mode}")
    arr = np.array(im)
    print(f"Top-left: {arr[0,0]}, Top-right: {arr[0,-1]}, Bottom-left: {arr[-1,0]}, Bottom-right: {arr[-1,-1]}")
    # Mean background color (sampling edges)
    edge_pixels = np.concatenate([arr[0, :], arr[-1, :], arr[:, 0], arr[:, -1]])
    mean_bg = np.median(edge_pixels, axis=0).astype(int)
    print(f"Estimated BG color: RGB {mean_bg.tolist()} -> #{mean_bg[0]:02x}{mean_bg[1]:02x}{mean_bg[2]:02x}")
