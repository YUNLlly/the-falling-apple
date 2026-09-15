#!/bin/bash
# ============================================================
# 兴趣爱好照片一次性预处理
# 源：/Users/yunllly/Desktop/website-assets/hobby/*（约127MB）
# 产物：assets/img/hobby/{photo,write,stage}/（语义化短名，最长边1280px）
# 用法：bash scripts/process-hobby-photos.sh
# ============================================================
set -e

SRC_ROOT="/Users/yunllly/Desktop/website-assets/hobby"
DST_ROOT="/Users/yunllly/Desktop/the-falling-apple/assets/img/hobby"

MAX_EDGE=1280
QUALITY=78

process_one () {
  local in_file="$1" out_file="$2"
  sips -Z "$MAX_EDGE" -s format jpeg -s formatOptions "$QUALITY" "$in_file" --out "$out_file" >/dev/null
}

# --- 通用：按文件名内编号排序，输出 prefix-编号.jpg ---
process_numbered_dir () {
  local src_dir="$1" dst_dir="$2" prefix="$3"
  mkdir -p "$dst_dir"
  rm -f "$dst_dir"/*.jpg 2>/dev/null || true
  find "$src_dir" -maxdepth 1 -type f -name "*.jpg" -print0 \
    | while IFS= read -r -d '' f; do
        num=$(basename "$f" | sed -E 's/.*_([0-9]+)_[0-9]+\.jpg/\1/')
        printf '%06d %s %s\n' "$num" "$num" "$f"
      done | sort -n | while read -r _ num file; do
        out="$dst_dir/${prefix}-${num}.jpg"
        process_one "$file" "$out"
        echo "  ✔ ${prefix}-${num}.jpg"
      done
}

echo "▶ 摄影（爱好-我在摄影 → photo/）"
process_numbered_dir "$SRC_ROOT/爱好-我在摄影" "$DST_ROOT/photo" "photo"

echo "▶ 写字画画（写字画画 → write/）"
process_numbered_dir "$SRC_ROOT/写字画画" "$DST_ROOT/write" "write"

echo "▶ 舞台（爱好-播音主持唱歌跳舞舞台剧 → stage/，语义化命名）"
STAGE_SRC="$SRC_ROOT/爱好-播音主持唱歌跳舞舞台剧"
STAGE_DST="$DST_ROOT/stage"
mkdir -p "$STAGE_DST"
rm -f "$STAGE_DST"/*.jpg 2>/dev/null || true

declare -a STAGE_MAP=(
  "ktv唱歌.jpg:stage-ktv.jpg"
  "合唱舞台.jpg:stage-hechang.jpg"
  "唱歌舞台.jpg:stage-changge.jpg"
  "大学主持.jpg:stage-daxue-zhuchi.jpg"
  "主持.jpg:stage-zhuchi.jpg"
  "跳舞.jpg:stage-tiaowu.jpg"
  "跳舞2.jpg:stage-tiaowu2.jpg"
  "高中主持.jpg:stage-gaozhong-zhuchi.jpg"
  "高中播音员.jpg:stage-gaozhong-boyin.jpg"
  "微信图片_20260912175605_242_3.jpg:stage-242.jpg"
  "微信图片_20260912175605_243_3.jpg:stage-243.jpg"
)
for pair in "${STAGE_MAP[@]}"; do
  in_name="${pair%%:*}"
  out_name="${pair##*:}"
  if [ -f "$STAGE_SRC/$in_name" ]; then
    process_one "$STAGE_SRC/$in_name" "$STAGE_DST/$out_name"
    echo "  ✔ $out_name"
  else
    echo "  ✘ 未找到源文件：$in_name"
  fi
done

echo ""
echo "▶ 清理未使用的人像目录（portrait/）"
rm -rf "$DST_ROOT/portrait"

echo ""
echo "✅ 处理完成，产物体积："
du -sh "$DST_ROOT/photo" "$DST_ROOT/write" "$DST_ROOT/stage"
