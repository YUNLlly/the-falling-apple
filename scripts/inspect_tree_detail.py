from PIL import Image
import numpy as np

tree = Image.open("/Users/yunllly/Desktop/website-assets/people/苹果树.png")
print("Tree size:", tree.size)

# Let's inspect different vertical sections of 苹果树.png
# Save sections to examine where the trunk starts and ends
# y=0 to y=950 is crown and main fork
# y=900 to y=1350 is the main trunk column
# y=1300 to y=1536 is roots and ground

# Let's check where the trunk is in y=950..1350
arr = np.array(tree)
print("Tree shape:", arr.shape)
