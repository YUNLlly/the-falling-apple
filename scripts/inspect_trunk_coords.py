from PIL import Image
import numpy as np

im = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-full.png")
arr = np.array(im)
bg = np.array([244, 229, 197], dtype=np.float32)
diff = np.abs(arr.astype(np.float32) - bg).sum(axis=-1)
mask = diff > 30

for y in range(800, 1500, 100):
    row_mask = mask[y:y+50]
    indices = np.where(row_mask)
    if len(indices[1]) > 0:
        x_min, x_max = indices[1].min(), indices[1].max()
        x_center = int(np.median(indices[1]))
        print(f"y={y:4d}..{y+50:4d}: trunk x span=[{x_min:4d}, {x_max:4d}], center={x_center:4d}, width={x_max-x_min:4d}")
