---
title: EEG信号提取和时频分析
categories: 科研笔记
tags: [EEG&BCI]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

​    脑电信号 (EEG) 常用的时频分析算法。

<!--more-->

# <font face="黑体" color=green size=5>1. 小波（时频分析）和傅里叶变换原理 （MI： beta 节律，降噪）</font>

将无限长的三角函数基换成了有限长的会衰减的小波基。根据层数和细节分量，先是划分为多个子频带

利用**尺度函数**表示原始信号，随着尺度级的下降，尺度越来越大，这时引入**小波函数**来对尺度函数表示部分和原始信号之间的差异进行表示，最终尺度函数+小波函数可以精确地表示原信号。可以简单理解为加窗fft，“对**非平稳**过程，傅里叶变换有局限性”傅里叶变换处理非平稳信号有天生缺陷。它只能获取**一段信号总体上包含哪些频率的成分**，但是**对各成分出现的时刻并无所知**。因此时域相差很大的两个信号，可能频谱图一样。为什么不采用可变窗的STFT呢，我认为是因为这样做冗余会太严重，**STFT做不到正交化**，这也是它的一大缺陷。**STFT是给信号加窗，分段做FFT**；而小波直接把傅里叶变换的基给换了——将**无限长的三角函数基**换成了**有限长的会衰减的小波基**。这样**不仅能够获取频率**，还可以**定位到时间**了~

https://wenku.baidu.com/view/3a7f774f0c22590103029d09.html

从公式可以看出，不同于傅里叶变换，变量只有频率ω，小波变换有两个变量：尺度a（scale）和平移量 τ（translation）。**尺度**a控制小波函数的**伸缩**，**平移量** τ控制小波函数的**平移**。**尺度**就对应于**频率**（反比），**平移量** τ就对应于**时间**。

B. 作为时频分析方法，和希尔伯特-黄变换（HHT）比：
相比于HHT等时频分析方法，小波依然没脱离海森堡测不准原理的束缚，某种尺度下，不能在时间和频率上同时具有很高的精度；以及小波是非适应性的，基函数选定了就不改了。

# <font face="黑体" color=green size=5>2. CCA原理 （SSVEP）</font>

典型相关性分析（Canonical Correlation Analysis， CCA）是一种多变量统计方法，用来分析两组多维变量 间的潜在线性相关性。假设有两组变量 X 和 Y ， x = wX T X 和 y = wY T Y 分别是 X 和 Y 的一组特殊的 线性组合。CCA 通过解决以下最大值问题找出 wX 和 wY 使得 X 和Y 间的相关系数最大：

![image-20210428105616261](C:\Users\db129\AppData\Roaming\Typora\typora-user-images\image-20210428105616261.png)

**对CCA算法流程做一个归纳，以SVD方法为例：**

**输入：**各为m个的样本X和Y，X和Y的维度都大于1

**输出**：X,Y的相关系数ρ,X和Y的线性系数向量a和b

**流程**

**1）**计算X的方差SXX, Y的方差SYY，X和Y的协方差SXY

**2)** 计算矩阵

![0?wx_fmt=png](https://ss.csdn.net/p?http://mmbiz.qpic.cn/mmbiz_png/KdayOo3PqHAyclEvicZISrGRAzlzsKQkmIwia6Gun6qtl4tVr5LCSF74UOcXyETefEibtoIRnZvLq2axiaKScziaDlQ/0?wx_fmt=png)

**3）**对矩阵M进行奇异值分解，得到最大的奇异值ρ，和最大奇异值对应的左右奇异向量

**4)**  计算X和Y的线性系数向量a和b,

![0?wx_fmt=png](https://ss.csdn.net/p?http://mmbiz.qpic.cn/mmbiz_png/KdayOo3PqHAyclEvicZISrGRAzlzsKQkmzicfVbFnN9IvXt4Tic9DOTJPfrntnHZf3OkwWzn5tajyyToqTgeP1L4Q/0?wx_fmt=png)



PSDA 功率谱密度分析：PSD的意义就在于将不同频率分辨率下的数据归一化，排除了分辨率的影响，得到的PSD曲线趋势是一致的，如下图：
https://www.zhihu.com/question/29520851



# <font face="黑体" color=green size=5>3. AFD原理 （ECG降噪）</font>

自适应傅里叶分解 (AFD) 是传统傅里叶分解的扩展，解决小波频率精度损失的方案。 通过匹配追踪生成自适应基，AFD 实现了分解过程中的快速能量收敛。 循环自适应傅里叶分解方法基于网格搜索技术。它的近似精度受网格间距的限制。本文提出了两种改进的循环自适应傅里叶分解方法。提出的算法利用梯度下降优化来调整网格网格上的最佳极元组，从而达到更高的精度。比起网格搜索，我们使用了 Kalman filter (UKF) method（卡尔曼滤波（Kalman filter）是一种高效率的递归滤波器（自回归滤波器），它能够从一系列的不完全及包含雜訊的测量中，估计动态系统的状态）, the Nelder-Mead (NM) algorithm（ Nelder-Mead 算法是一种求多元函数局部最小值的算法， 其优点是不需要函数可导并能较快收敛到局部最小值．我们可以在每个循环的第一步之后计算 ![[公式]](https://www.zhihu.com/equation?tex=%5Cboldsymbol%7B%5Cmathbf%7Bx%7D%7D+_1) 和 ![[公式]](https://www.zhihu.com/equation?tex=%5Cboldsymbol%7B%5Cmathbf%7Bx%7D%7D+_%7BN%2B1%7D) 的距离来估算自变量的误差， 如果该误差小于某个值， 即可结束循环并使用 ![[公式]](https://www.zhihu.com/equation?tex=%5Cboldsymbol%7B%5Cmathbf%7Bx%7D%7D+_1) 作为最终结果）, the genetic algorithm (GA), and the particle swarm optimization (PSO) algorithm

遗传算法作为一种非确定性的拟自然算法，为复杂系统的优化提供了一种新思路，对于诸多NP-Hard问题，遗传算法都有不错的表现。相对于传统算法而言，遗传算法有以下突出优点：

1. 可适用于灰箱甚至黑箱问题；

2. 搜索从群体出发，具有潜在的并行性；

3. 搜索使用评价函数（适应度函数）启发，过程简单；

4. 收敛性较强。

5. 具有可扩展性，容易与其他算法（粒子群、模拟退火等）结合。

**遗传算法的不足:**

1. 算法参数的选择严重影响解的品质,而目前这些参数的选择大部分是依靠经验；

2. 遗传算法的本质是随机性搜索，不能保证所得解为全局最优解；
3. 遗传算法常见的编码方法有二进制编码、Gray编码等。二进制编码比较常见，但是二进制编码容易产生汉明距离注1（Hamming Distance），可能会产生汉明悬崖注2(Hamming Cliff），Gray可以克服汉明悬崖的问题，但是往往由于实际问题的复杂度过大导致Gray编码难以精确地描述问题。
4. 在处理具有多个最优解的多峰问题时容易陷入局部最小值而停止搜索，造成早熟问题，无法达到全局最优。

注1：将一个字符串变换成另外一个字符串所需要替换的字符个数

注2：相邻整数的二进制编码之间存在汉明距离，交叉和遗传难以跨越

粒子群优化算法：
信息共享。是一种基于Swarm Intelligence的优化方法。它没有遗传算法的“交叉”(Crossover) 和“变异”(Mutation) 操作，它通过追随当前搜索到的最优值来寻找全局最优。粒子群算法与其他现代优化方法相比的一个明显特色就是所**需要调整的参数很少、简单易行**，收敛速度快，已成为现代优化方法领域研究的热点。

![image-20210428112013984](C:\Users\db129\AppData\Roaming\Typora\typora-user-images\image-20210428112013984.png)

# <font face="黑体" color=green size=5>4. 格兰杰因果关系检验</font>

“依赖于使用过去某些时点上所有信息的最佳最小二乘预测的方差”。

在[时间序列](https://baike.baidu.com/item/时间序列)情形下，两个经济变量X、Y之间的[格兰杰](https://baike.baidu.com/item/格兰杰)因果关系定义为：若在包含了变量X、Y的过去信息的条件下，对变量Y的预测效果要优于只单独由Y的过去信息对Y进行的预测效果，即变量X有助于解释变量Y的将来变化，则认为变量X是引致变量Y的格兰杰原因。

进行格兰杰因果关系检验的一个前提条件是时间序列必须具有平稳性，否则可能会出现虚假回归问题。因此在进行格兰杰因果关系检验之前首先应对各指标时间序列的平稳性进行[单位根检验](https://baike.baidu.com/item/单位根检验)(unit root test)。常用增广的迪基—富勒检验(ADF检验)来分别对各指标序列的平稳性进行单位根检验。

1）将当前的y对所有的滞后项y以及别的什么变量（如果有的话）做回归，即y对y的滞后项yt-1，yt-2，…，yt-q及其他变量的回归，但在这一回归中没有把滞后项x包括进来，这是一个受约束的回归。然后从此回归得到受约束的[残差平方和](https://baike.baidu.com/item/残差平方和)RSSR。

（2）做一个含有滞后项x的回归，即在前面的回归式中加进滞后项x，这是一个无约束的回归，由此回归得到无约束的残差平方和RSSUR。

（3）零假设是H0：α1=α2=…=αq=0，即滞后项x不属于此回归。

（4）为了检验此假设，用F检验，即：

它遵循自由度为q和(n-k)的F分布。在这里，n是[样本容量](https://baike.baidu.com/item/样本容量)，q等于滞后项y的个数，即有约束[回归方程](https://baike.baidu.com/item/回归方程)中待估参数的个数，k是无约束回归中待估参数的个数。

（5）如果在选定的[显著性水平](https://baike.baidu.com/item/显著性水平)α上计算的F值超过临界值Fα，则拒绝零假设，这样滞后x项就属于此回归，表明x是y的原因。

（6）同样，为了检验y是否是x的原因，可将变量y与x相互替换，重复步骤（1）～（5）。

# <font face="黑体" color=green size=5>5. 共空间模式（MI）</font>

原理：共空间模式（CSP）是一种对两分类任务下的空域滤波特征提取算法，能够从多通道的脑机接口数据里面提取出每一类的空间分布成分。用到了主成分分析。**公共空间模式算法的基本原理是利用矩阵的对角化，找到一组最优空间[滤波器](https://www.baidu.com/s?wd=滤波器&tn=24004469_oem_dg&rsv_dl=gh_pl_sl_csd)进行投影，使得两类信号的方差值差异最大化，从而得到具有较高区分度的特征向量。**

https://blog.csdn.net/MissXy_/article/details/81264953



# <font face="黑体" color=green size=5>6. AR </font>

AR/ARMA 模型：功率谱估计, 功率谱表示了信号功率随着频率的变化关系.