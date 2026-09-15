from PIL import Image
import numpy as np

tree = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-clean-full.png")
w, h = tree.size

# 1. Crown + Upper Trunk: y=0 to y=1200
# This includes the entire crown + the upper trunk section down to y=1200
crown = tree.crop((0, 0, w, 1200))
crown.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-top-crown.png")

# 2. Pure seamless trunk slice: y=1180 to y=1360
# Let's create a seamless vertically tileable trunk slice:
# Height = 180px.
# We blend the top 30px with the bottom 30px so that when tiled, the top matches the bottom perfectly!
slice_img = tree.crop((0, 1180, w, 1360))
arr = np.array(slice_img, dtype=np.float32)

# Seamless vertical blending
blend_h = 24
for i in range(blend_h):
    factor = i / float(blend_h)
    # Linearly interpolate top and bottom
    arr[i] = arr[i] * factor + arr[-blend_h + i] * (1.0 - factor)

seamless_trunk = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
seamless_trunk.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-trunk-seamless.png")

# 3. Roots + Bottom Ground: y=1340 to y=1536
roots = tree.crop((0, 1340, w, 1536))
roots.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-bottom-roots.png")

print("Created seamless tree layers: crown (0..1200), seamless trunk (1180..1360), roots (1340..1536)")
