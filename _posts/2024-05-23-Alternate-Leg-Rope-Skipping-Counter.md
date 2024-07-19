---
title: 基于OpenCV+Mediapipe的跳绳计数
categories: 算法模型
tags: 
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

交换腿跳绳比并腿跳轻松不少，更能坚持。但我的GT2手表没有跳绳计数，也没有在git上找到交换腿跳绳计数项目。通过修改chenwr727的 Repo “跳绳计数”为“交换腿跳计数”，来记录交换腿跳绳的成绩。

<!--more-->

原始项目（并腿跳绳计数），基于 OpenCV 逐帧处理 和 Mediapipe 对人体进行识别：https://github.com/chenwr727/RopeSkippingCounter



交换腿跳的一个特征是“交换”， 在“左脚跟高于右脚跟”或“右脚跟高于左脚跟”之间来回切换。MediaPipe Pose 中的界标模型可预测33个姿势关键点的位置，因此 29号位（左脚跟）和 30号位（右脚跟）被选择作为关键判别点。

![Mediapipe – 全身包含身体、手部、面部所有关键点标注位置对应图-StubbornHuang Blog](https://www.stubbornhuang.com/wp-content/uploads/2022/01/wp_editor_md_aad58b9eb212861583a6f305bbe130d4.jpg)

判断是否完成一次交换腿: 

```python
# Calculate relevant landmarks for heels
left_heel = landmarks[29]  # left heel
right_heel = landmarks[30]  # right heel

# Calculate vertical positions
left_y = left_heel[1]
right_y = right_heel[1]

# Detect HEEL swap or cross
if left_y < right_y:
    leg_position = "left"

if right_y <= left_y:
    leg_position = "right"

# Track HEEL position changes
if prev_leg_position != leg_position:
    leg_swapped = True
else:
    leg_swapped = False

prev_leg_position = leg_position

# Count leg swaps
if leg_swapped:
    count += 1
```

效果：

![demo_01](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2024-06-23-Alternate-Leg-Rope-Skipping-Counter/demo_01.gif)

