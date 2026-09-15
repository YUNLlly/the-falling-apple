from PIL import Image
import numpy as np

im = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-full.png")
arr = np.array(im)
# Find dark trunk strokes
dark = (arr[:, :, 0] < 120) & (arr[:, :, 1] < 120) & (arr[:, :, 2] < 120)

for y in range(800, 1500, 100):
    dark_y = dark[y:y+50]
    idx = np.where(dark_y)
    if len(idx[1]) > 0:
        print(f"Dark pixels at y={y}: min_x={idx[1].min()}, max_x={idx[1].max()}, median_x={int(np.median(idx[1]))}, count={len(idx[1])}")
