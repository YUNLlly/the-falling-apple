from PIL import Image
import numpy as np

tree = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-clean-full.png")
w, h = tree.size
print(f"Tree size: {w}x{h}")

# Let's inspect horizontal rows of the tree from y=800 to y=1500 to find where the trunk is pure bark without stray apples
arr = np.array(tree)
# Check where red apple pixels are: (R > 140, G < 80, B < 80)
red_apple_mask = (arr[:, :, 0] > 140) & (arr[:, :, 1] < 90) & (arr[:, :, 2] < 90) & (arr[:, :, 3] > 50)

for y in range(800, 1500, 40):
    apple_pixels = red_apple_mask[y:y+40].sum()
    trunk_pixels = (arr[y:y+40, :, 3] > 50).sum()
    print(f"y={y:4d}..{y+40:4d}: trunk_pixels={trunk_pixels:5d}, apple_pixels={apple_pixels:3d}")
