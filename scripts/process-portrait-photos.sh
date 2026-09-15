#!/bin/bash
# ============================================================
# 人像影集照片一次性预处理
# 源：/Users/yunllly/Desktop/website-assets/hobby/我拍的人像/
# 产物：assets/img/hobby/portrait/（语义化组名短名，最长边1280px）
# 命名规则：组名短名-序号.jpg
# 用法：bash scripts/process-portrait-photos.sh
# ============================================================
set -e

SRC="/Users/yunllly/Desktop/website-assets/hobby/我拍的人像"
DST="/Users/yunllly/Desktop/the-falling-apple/assets/img/hobby/portrait"

MAX_EDGE=1280
QUALITY=78

mkdir -p "$DST"

# 组名映射：原文件名前缀 -> 语义化短名
declare -a MAP=(
  "人像1-乌鲁木齐植物园:wulumqi"
  "人像2-成都陆家桥:lujiaqiao"
  "人像3-四川大学江安校区:jiangan"
  "人像4-四川大学江安校区不高山:bugaoshan"
  "人像5-天台:rooftop"
  "人像6-四川大学望江校区:wangjiang"
  "人像7-玉林路:yulinlu"
  "双人-兰桂坊:langui"
  "双人-望江楼公园:wangjianglou"
  "情侣1-成都植物园:zhiwuyuan"
  "情侣2-中河湿地公园:zhonghe"
  "汉服-三元油菜花田:hanfu"
)

for pair in "${MAP[@]}"; do
  prefix="${pair%%:*}"
  short="${pair##*:}"
  i=0
  for f in "$SRC/${prefix}"*.jpg; do
    [ -e "$f" ] || continue
    i=$((i+1))
    out="$DST/${short}-${i}.jpg"
    sips -Z "$MAX_EDGE" -s format jpeg -s formatOptions "$QUALITY" "$f" --out "$out" >/dev/null
    echo "  ✔ ${short}-${i}.jpg"
  done
done

echo ""
echo "▶ 产物清单："
ls -lh "$DST" | awk '{print $9, $5}'
du -sh "$DST"
