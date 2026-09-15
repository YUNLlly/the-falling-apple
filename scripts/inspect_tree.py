from PIL import Image
import numpy as np

im = Image.open("/Users/yunllly/Desktop/website-assets/people/苹果树.png")
arr = np.array(im)
h, w, _ = arr.shape

# Check vertical slices
bg = np.array([244, 229, 197], dtype=np.float32)
diff = np.abs(arr.astype(np.float32) - bg).sum(axis=-1)
# Find content threshold
content_mask = diff > 25

row_content = content_mask.mean(axis=1)
for i in range(0, h, 100):
    density = content_mask[i:i+100].mean()
    # Also find left and right bounds in this slice
    indices = np.where(content_mask[i:i+100])
    if len(indices[1]) > 0:
        min_x, max_x = indices[1].min(), indices[1].max()
        print(f"y={i:4d}..{i+100:4d}: density={density:.3f}, x_range=[{min_x:3d}, {max_x:3d}]")
    else:
        print(f"y={i:4d}..{i+100:4d}: empty")
