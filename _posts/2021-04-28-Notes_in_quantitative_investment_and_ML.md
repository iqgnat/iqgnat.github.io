---
 title: 量化投资与机器学习小记
categories: ML和时序分析
tags: [quant,ML]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

关于低延迟交易的理解和小记。

<!--more-->

1. 交易系统的几个要素：程序化、数理统计和交易策略模型、回测效果。常用的评价指标有：收益风险三大指标（Sharpe指数、Treynor指数和Jensen指数）、最大回撤率、calmar比率等。

1. 高频交易的要素是：常常用复杂的因子、数据、推导逻辑，但是执行效率高、简单的算法, 比如经典时序算法（根据平稳性、波动率等情况， 用 ARMA, ARIMA, ARCH, GARCH 等拟合）。高频交易也适合用深度学习的算法，有两个原因： 数据足够多， 短时间内存在一定的 pattern。
2. 将价格作为 LSTM 的输入进行预测为什么没有用： 1.  预测出的价格大概率等于前一天的值，比如输入变量是1号-10号、2号-11号、3号-13号的价格，损失函数（比如均方差）会很小。应当考虑用收益率（今/昨 - 1），波动率不行，没有方向。
3. 截面模型（cross-sector）常用在中长期交易，更多考虑宏观经济指标，基本面。将这些因素变换成因子输入模型。预测不同产品的波动率情况，相应地进行做多、做空、平仓、开仓来获利。
4. 交易框架、平台：  派网，外汇【MT4、MT5、cTrade】，vnpy
5. 目前A股量化不挣钱的原因（高α）：头部集中。
6. 和脑机接口的关联性：时域、频域分析的通用（moving average, ARMA等， fft, 小波, AFD, cca）。提取因子的方法：fatigue中用到的 AFD 算法、小波。格兰杰因果， leading lagging, 看产品之间的关系。

## <font face="黑体" color=green size=5>相关资料</font>

2.  收益vs风险指标:
    [https://wenku.baidu.com/view/b8c0168fa21614791611289e.html](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  基于VNPY的网页交易系统:
    https://github.com/vnpy/vnpy

