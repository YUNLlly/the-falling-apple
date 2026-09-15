from PIL import Image
import numpy as np

g1 = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-under-tree-alpha.png")
g2 = Image.open("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-hit-alpha.png")

print("Girl 1 bbox:", g1.getbbox())
print("Girl 2 bbox:", g2.getbbox())

# Let's crop tight bboxes or normalize size so switching src does not jump/shift!
bbox1 = g1.getbbox()
bbox2 = g2.getbbox()

# Combined bbox
comb_bbox = (
    min(bbox1[0], bbox2[0]),
    min(bbox1[1], bbox2[1]),
    max(bbox1[2], bbox2[2]),
    max(bbox1[3], bbox2[3])
)
print("Combined bbox:", comb_bbox)

# Crop both with the exact same bounding box + 20px padding so they are perfectly aligned!
pad = 20
crop_box = (
    max(0, comb_bbox[0] - pad),
    max(0, comb_bbox[1] - pad),
    min(g1.width, comb_bbox[2] + pad),
    min(g1.height, comb_bbox[3] + pad)
)

g1_aligned = g1.crop(crop_box)
g2_aligned = g2.crop(crop_box)

g1_aligned.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-sitting-aligned.png")
g2_aligned.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/girl/girl-hit-aligned.png")

print(f"Saved aligned girl images ({g1_aligned.size})")
