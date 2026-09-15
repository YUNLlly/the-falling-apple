from PIL import Image
import numpy as np

tree = Image.open("/Users/yunllly/Desktop/website-assets/people/苹果树.png")
w, h = tree.size
print(f"Original tree size: {w}x{h}")

# The user noted:
# 1. 树冠为什么被切成两部分？
# In our previous index.html, we had both .tree-spine-crown and .hero-crown-spot which caused a double render/split!
# 2. 整棵树可以往左侧挪一点，露出树的2/3。
# 3. 树干不要自己生成，是用苹果树.png的真实树干无限向下延伸拉长！
# 4. 最后一页是树干的根部与草坪，女孩坐在树下（无白框），点击切换为被砸女孩。

# Let's inspect the trunk in 苹果树.png between y=850 and y=1400
# Let's find the trunk region
arr = np.array(tree.convert("RGBA"))
bg = np.array([244, 229, 197])

# Let's create an alpha version of 苹果树.png with soft edge matte
dist = np.sqrt(np.sum((arr[:, :, :3].astype(float) - bg) ** 2, axis=-1))
alpha = np.clip((dist - 15) / 20.0 * 255.0, 0, 255).astype(np.uint8)
arr[:, :, 3] = alpha
tree_rgba = Image.fromarray(arr)

# Save the full transparent tree
tree_rgba.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-clean-full.png")

# Now let's extract:
# 1. Top Crown + Upper Trunk (from y=0 to y=1050)
crown_full = tree_rgba.crop((0, 0, w, 1050))
crown_full.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-top-crown.png")

# 2. Pure Trunk Slice (from y=1000 to y=1300) that can be seamlessly stretched or repeated vertically
trunk_slice = tree_rgba.crop((0, 1020, w, 1260))
trunk_slice.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-trunk-slice.png")

# 3. Roots & Base (from y=1200 to y=1536)
roots_base = tree_rgba.crop((0, 1200, w, 1536))
roots_base.save("/Users/yunllly/Desktop/the-falling-apple/assets/img/tree/tree-bottom-roots.png")

print("Created tree-clean-full.png, tree-top-crown.png, tree-trunk-slice.png, tree-bottom-roots.png")
