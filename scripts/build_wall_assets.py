#!/usr/bin/env python3
"""照片墙素材压缩:photos/ → wall/(最长边 640px,JPEG q70)。剔除技术图解。"""
import os
from PIL import Image

SRC = "assets/img/photos"
DST = "assets/img/wall"
EXCLUDE = {"2026_deep_coring_technology_diagram.jpg"}  # 技术图解,用户确认剔除

os.makedirs(DST, exist_ok=True)
total = 0
count = 0
for f in sorted(os.listdir(SRC)):
    if f in EXCLUDE or not f.lower().endswith((".jpg", ".png")):
        continue
    im = Image.open(os.path.join(SRC, f))
    im.thumbnail((640, 640))  # 默认 LANCZOS
    out = os.path.join(DST, f.rsplit(".", 1)[0] + ".jpg")
    im.convert("RGB").save(out, "JPEG", quality=70, optimize=True)
    kb = os.path.getsize(out) // 1024
    total += kb
    count += 1
    print(f"{f:45s} {im.size[0]}x{im.size[1]}  {kb}KB")
print(f"\n共 {count} 张,总计 {total}KB ({total/1024:.1f}MB)")
