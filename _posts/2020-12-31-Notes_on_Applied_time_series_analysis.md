---
title: 《应用时间序列分析》学习笔记
categories: ML和时序分析
tags: 时序分析
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

量化工作常预测时间序列 t+1，t+n。《应用时间序列分析》和脑电/脑机接口信号分析的《Analyzing Neural Time Series Data》，《Analyzing Neural Time Series Data》有些相似之处.

<!--more-->

# <font face="黑体" color=green size=5>思维导图</font>

![时间序列分析](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2020-12-31-Notes_on_Applied_time_series_analysis/应用时间序列分析.svg)

ARMA、ARIMA及季节模型一般都假设干扰项的方差为常数，波动是随机的，不存在趋势，是平稳序列。然而很多情况下时间序列的波动有集聚性等特征，使得方差并不为常数。因此，如何刻画方差是十分有必要研究的。 本文介绍的ARCH（自回归条件异方差模型）、GARCH模型可以刻画出随时间变化的条件异方差。

虽然ARCH模型简单，但为了充分刻画收益率的波动率过程，往往需要很多参数，例如上面用到ARCH(4)模型，有时会有更高的ARCH(m)模型。因此，Bollerslev(1986)年提出了一个推广形式，称为广义的ARCH模型（GARCH）

# <font face="黑体" color=green size=5>参考材料</font>

  1. 《Analyzing Neural Time Series Data》 http://mikexcohen.com/book/Cohen_AnalyzingNeuralTimeSeriesData_TOC.pdf

  2. 《应用时间序列分析》

  3. 《应用时间序列分析》北大课件 https://www.math.pku.edu.cn/teachers/lidf/course/atsa/atsanotes/html/_atsanotes/index.html#%E8%AF%BE%E7%A8%8B%E5%86%85%E5%AE%B9

  4. 《应用时间序列分析》北大课件pdf 版本 https://www.math.pku.edu.cn/teachers/lidf/course/fts/ftsnotes/html/_ftsnotes/ftsnotes.pdf

  5. 时间序列分析课堂笔记: https://www.zhihu.com/column/c_1289633805980962816

  6. GARCH: https://zhuanlan.zhihu.com/p/22497655

  7. ARCH/GARCH : https://zhuanlan.zhihu.com/p/21962996

     

     

