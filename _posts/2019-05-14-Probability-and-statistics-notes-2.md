---
title: 概率统计笔记 2: SPSS, MATLAB, Excel的操作总结
tags: 理论基础、科研工具
author: Tang Qi
sidebar:
  nav: docs-cn
---

 这一篇记录的是概率统计理论的应用：**正态分布检验，相关性分析（Pearson，Spearman，Kendall),** **t检验 (配对t），two-way repeated ANOVA，以及用 SPSS statistics, MATLAB 和 Excel** 对上述统计性分析的实现。

<!--more-->

<table><tr><td bgcolor=#D3D3D3>
<p><b>相关性检验:</b><br><p style="text-indent:2em">
	<p style="text-indent:2em">a. Pearson【 前提：正态性；样本数量大（n>30 或者 n>50）】；<br>
	<p style="text-indent:2em">b. Spearman（非参数性检验）；<br>
    <p style="text-indent:2em">c. Kendall（非参数性检验） ;</p>
    <br><b>单因素的差异性检验：</b> <br>
	<p style="text-indent:2em">a. 独立 t 检验【 前提：正态性，方差其次性】; <br>
	<p style="text-indent:2em">b.  ANOVA【前提： 正态性，方差其次性】。<br>
	<p style="text-indent:2em">c. 配对t检验【前提：样本数量相同，且一一配对; 配对数据的差值满足正态分布】。 <br>
     如果数据满足一一配对，首选配对t检验。如果不配对，数量不同，选ANOVA。 独立 t 检验和one-way ANOVA检验的区别： 独立t检验纯粹看两组样本有没有区别， 而 ANOVA 还除了看是否有区别，还会看是组间因素造成的还是组内因素造成的。
</p><p><br><b>双因素差异性检验:</b> <br>
	<p style="text-indent:2em">a. two-way repeated ANOVA;<br>
	<p style="text-indent:2em">b. two-way ANOVA without replication.<br>
</p></p> 
    <b>注意： 差异性检验，涉及到方差的有偏估计 (的矫正), 需要在检验结果中，描述 degree of freedom。</b></td></tr></table>
用 Excel 的 Data Analysis （数据分析） 可以完成的操作在此：
如何在Excel中加入Data Analysis 插件？博主neweastsun给出了教程：[点我打开链接](https://blog.csdn.net/neweastsun/article/details/39317449)

关于假设检验，推荐[李柏坚](https://www.youtube.com/watch?v=RjIaSP2IAvE)教授的统计学系列网络课堂: [点我查看](https://www.youtube.com/watch?v=RjIaSP2IAvE)。

Excel 的 Data Analysis可以给出一些关于数据的描述性分析和检验，然后从它的说明网页也可以看到，Excel 对统计不是全能的，比如无法完成正态分布检验和非参数性相关性分析 （例如Spearman）。 为了便利性或全面性，还需要借助SPSS 和 MATLAB。



1. **相关性分析**

如上一篇所描述，检定分析需要按照假设检验的流程。
首先，确立虚无假设 (Null hypothesis)，H0: 两个样本之间，没有相关性。significance level (*alpha*)为 0.05 ( 95% 可能拒绝虚无假设), 0.01 (99% 可能拒绝虚无假设) ，甚至 0.001 ( 99.9 %的可能拒绝虚无假设 ) 。例如， *p*值, *p *= 0.032 < 0.05，则虚无假设被拒绝 （95%可能），则认为两个样本之间有显著相关性。

<table><tr><td bgcolor=#D3D3D3>当两个样本满足显著相关 (由p值决定) 了，进一步计算相关系数 r 的值。【通常来讲，没有outlier异常值且 r 值比较高(例如>0.5）时，p值往往也 < 0.05 , 满足显著性。】</td></tr></table>

用我自己的数据举例：通过神经反馈训练，训练受试者降低他/她的 IAB 值。一共10次训练，依次得到 IAB 值 如下:

​		1.093, 1.059, 1.050, 1.015, 1.012, 1.036, 1.024, 0.988, 0.988, 0.970 ;

现在想要判断，受试者的IAB是否根据训练下降。 也就是想要比较下面两组数据的相关性 （小样本，应该用Spearman correlation test）：

​		样本A (训练序号): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
​		样本B (IAB的值: 1.093, 1.059, 1.050, 1.015, 1.012, 1.036, 1.024, 0.988, 0.988, 0.970

**1.1 皮尔森相关性分析** **（Pearson Correlation Test）**

**皮尔森相关性**分析中的皮尔森相关系数，是两个变量之间的协方差和标准差的商 。就是在上一篇中提到的correlation 相关系数的计算公式, wikipedia：