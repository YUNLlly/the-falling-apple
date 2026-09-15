from PIL import Image
import numpy as np

for name, path in [
    ("girl_default", "/Users/yunllly/Desktop/website-assets/people/树下女孩.png"),
    ("girl_hit", "/Users/yunllly/Desktop/website-assets/people/被砸女孩.png"),
]:
    im = Image.open(path)
    arr = np.array(im)
    dark = (arr[:, :, 0] < 120) & (arr[:, :, 1] < 120) & (arr[:, :, 2] < 120)
    idx = np.where(dark)
    print(f"=== {name} ===")
    print(f"Size: {im.size}, dark pixels bbox: y=[{idx[0].min()}, {idx[0].max()}], x=[{idx[1].min()}, {idx[1].max()}]")
