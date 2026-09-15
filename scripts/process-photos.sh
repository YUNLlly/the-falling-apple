#!/bin/bash
# The Falling Apple · 照片入库脚本
# 从 website-assets 选取上站照片，统一压缩至最长边 1600px / JPEG 质量 72
SRC_ROOT="/Users/yunllly/Desktop/website-assets"
DST_ROOT="/Users/yunllly/Desktop/the-falling-apple/assets/img"

process () {
  local src="$1" dst="$2"
  if [ ! -f "$src" ]; then echo "MISS: $src"; return; fi
  sips -Z 1600 -s format jpeg -s formatOptions 72 "$src" --out "$dst" >/dev/null 2>&1 \
    && echo "OK: $dst" || echo "FAIL: $src"
}

# 关于我
process "$SRC_ROOT/people/微信图片_20260912164153_187_3.jpg" "$DST_ROOT/about/li-yiyang.jpg"

# 爱好 · 我在摄影
for n in 191 195 197 199; do
  process "$SRC_ROOT/hobby/爱好-我在摄影/微信图片_20260912173426_${n}_3.jpg" "$DST_ROOT/hobby/photo/${n}.jpg"
done

# 爱好 · 我拍的人像
process "$SRC_ROOT/hobby/我拍的人像/微信图片_20260912175232_236_3.jpg" "$DST_ROOT/hobby/portrait/236.jpg"
process "$SRC_ROOT/hobby/我拍的人像/微信图片_20260912175605_245_3.jpg" "$DST_ROOT/hobby/portrait/245.jpg"
process "$SRC_ROOT/hobby/我拍的人像/微信图片_20260912180723_254_3.jpg" "$DST_ROOT/hobby/portrait/254.jpg"
process "$SRC_ROOT/hobby/我拍的人像/微信图片_20260912180723_257_3.jpg" "$DST_ROOT/hobby/portrait/257.jpg"

# 爱好 · 写字画画
process "$SRC_ROOT/hobby/写字画画/微信图片_20260912174617_219_3.jpg" "$DST_ROOT/hobby/write/219.jpg"
process "$SRC_ROOT/hobby/写字画画/微信图片_20260912174621_223_3.jpg" "$DST_ROOT/hobby/write/223.jpg"
process "$SRC_ROOT/hobby/写字画画/微信图片_20260912174624_225_3.jpg" "$DST_ROOT/hobby/write/225.jpg"
process "$SRC_ROOT/hobby/写字画画/微信图片_20260912174658_229_3.jpg" "$DST_ROOT/hobby/write/229.jpg"
process "$SRC_ROOT/hobby/写字画画/微信图片_20260912174701_232_3.jpg" "$DST_ROOT/hobby/write/232.jpg"

# 爱好 · 舞台
process "$SRC_ROOT/hobby/爱好-播音主持唱歌跳舞舞台剧/大学主持.jpg" "$DST_ROOT/hobby/stage/daxue-zhuchi.jpg"
process "$SRC_ROOT/hobby/爱好-播音主持唱歌跳舞舞台剧/主持.jpg" "$DST_ROOT/hobby/stage/zhuchi.jpg"
process "$SRC_ROOT/hobby/爱好-播音主持唱歌跳舞舞台剧/高中播音员.jpg" "$DST_ROOT/hobby/stage/gaozhong-boyin.jpg"
process "$SRC_ROOT/hobby/爱好-播音主持唱歌跳舞舞台剧/唱歌舞台.jpg" "$DST_ROOT/hobby/stage/changge.jpg"
process "$SRC_ROOT/hobby/爱好-播音主持唱歌跳舞舞台剧/跳舞.jpg" "$DST_ROOT/hobby/stage/tiaowu.jpg"

# 旅行 · 青海
process "$SRC_ROOT/travel/青海/茶卡盐湖.jpg" "$DST_ROOT/travel/qinghai/chaka.jpg"
process "$SRC_ROOT/travel/青海/青海湖1.jpg" "$DST_ROOT/travel/qinghai/qinghaihu.jpg"
process "$SRC_ROOT/travel/青海/祁连山.jpg" "$DST_ROOT/travel/qinghai/qilian.jpg"
process "$SRC_ROOT/travel/青海/岗什卡雪峰1.jpg" "$DST_ROOT/travel/qinghai/gangshika.jpg"
process "$SRC_ROOT/travel/青海/西宁1.jpg" "$DST_ROOT/travel/qinghai/xining.jpg"

# 旅行 · 重庆
process "$SRC_ROOT/travel/重庆/重庆洪崖洞.jpg" "$DST_ROOT/travel/chongqing/hongyadong.jpg"
process "$SRC_ROOT/travel/重庆/重庆磁器口.jpg" "$DST_ROOT/travel/chongqing/ciqikou.jpg"
process "$SRC_ROOT/travel/重庆/重庆人民大礼堂.jpg" "$DST_ROOT/travel/chongqing/litang.jpg"
process "$SRC_ROOT/travel/重庆/重庆1.jpg" "$DST_ROOT/travel/chongqing/cq1.jpg"
process "$SRC_ROOT/travel/重庆/重庆北仓.jpg" "$DST_ROOT/travel/chongqing/beicang.jpg"

# 旅行 · 成都周边
process "$SRC_ROOT/travel/成都周边/都江堰1.jpg" "$DST_ROOT/travel/chengdu/dujiangyan.jpg"
process "$SRC_ROOT/travel/成都周边/老君山.jpg" "$DST_ROOT/travel/chengdu/laojunshan.jpg"
process "$SRC_ROOT/travel/成都周边/太平老街.jpg" "$DST_ROOT/travel/chengdu/taiping.jpg"
process "$SRC_ROOT/travel/成都周边/都江堰2.jpg" "$DST_ROOT/travel/chengdu/dujiangyan2.jpg"

# 旅行 · 西昌
for n in 1 2 3 4; do
  process "$SRC_ROOT/travel/西昌/西昌${n}.jpg" "$DST_ROOT/travel/xichang/xichang${n}.jpg"
done

echo "--- done ---"
