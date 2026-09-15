from PIL import Image
import numpy as np

for name, path in [
    ("girl_default", "/Users/yunllly/Desktop/website-assets/people/树下女孩.png"),
    ("girl_hit", "/Users/yunllly/Desktop/website-assets/people/被砸女孩.png"),
    ("apple", "/Users/yunllly/Desktop/苹果.jpg")
]:
    im = Image.open(path)
    print(f"=== {name} ===")
    print(f"Size: {im.size}")
