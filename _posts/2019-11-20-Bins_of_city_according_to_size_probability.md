---
title: 对城市进行分箱
categories: 金融分析和智能风控
tags: 金融分析和智能风控
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
visitor: true
---


通过极坐标图，将城市等类型变量（categorical、nominal）进行分箱。

<!--more-->

全国共有超三百个城市、地区、直辖区，在金融场景中，不同城市由于地理位置、经济水平、文化影响等因素，在违约概率、不同产品的营销成功率、和受众规模都有很大差别。对于受众规模小的城市们不加区分地进行训练，容易造成模型的过拟合。因此，在金融场景中，根据不同建模目的，通过极坐标图，将城市等类型变量进行分箱。

以风控场景为例，对同一产品而言，在不同城市对公的违约概率跨度可能从 0 % 到 70+% 之高，交易规模的跨度也可能从个位数到五位数。因此，根据最重要的两个维度画极坐标图，以交易规模为**半径坐标（Radial, r）**， 以违约概率（为了清晰呈现，可以乘以一定的系数因子）为 **角度坐标（Angular, θ）** 。

![城市分箱](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-11-20-Bins_of_city_according_to_size_probability/city_bins.png)

由极坐标图，可以大致将城市根据交易规模、概率划分为20个分区。

其他对类型变量进行分箱的常用手段有： IV值、等频等宽分箱、最优分箱、xgb分箱等。

# <font face="黑体" color=green size=5>代码示例</font>

输入.csv文件示例：

```ruby
| PROVINCE_CITY | SINGLE_COUNT | ALL_COUNT | RATIO |
| ------ | ------ | ------ | ------ |
| A市 | 4120 | 5391 | 0.764236691 |
| B市 | 2888 | 3969 | 0.727639204 |
```

```python
# -*- encoding in utf-8 -*-
"""
@Time : 2019/12/23 13:52
desc: polar plot for city bins
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math.pi
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

CITY_ratio = pd.read_csv('province_city.csv', header=0)
# polar plot:
ax1 = plt.subplot(111, projection='polar')
ss = 100 * CITY_ratio["SINGLE_COUNT"] / CITY_ratio["ALL_COUNT"]
theta_loc = 1.25 * CITY_ratio["BAD_COUNT"] * 2 * pi / CITY_ratio["ALL_COUNT"]
r_loc = np.log10(CITY_ratio["ALL_COUNT"])
ax1.scatter(theta_loc, r_loc, marker='.', s=ss, c=-10 * ss,)

## 标记具体城市名
# for i, txt in enumerate(CITY_ratio["PROVINCE_CITY"]):
#     ax1.annotate(txt, (theta_loc[i], r_loc[i]), fontsize=1, rotation=-20)

plt.show()
plt.savefig('test.png', format='png', dpi=600)
```

