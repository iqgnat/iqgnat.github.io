---
title: 概率统计笔记2:实操
tags: 理论基础
author: Tang Qi
sidebar:
  nav: docs-cn
---

 这一篇记录的是概率统计理论的应用：**正态分布检验，相关性分析（Pearson，Spearman，Kendall),**    **T检验 (配对 *t*），two-way repeated ANOVA，以及用 SPSS statistics, MATLAB 和 Excel** 对上述统计性分析的实现。

<!--more-->

===================================================================

**1. 相关性检验:**

1. Pearson【 前提：正态性；样本数量大（n>30 或者 n>50）】；

 2. Spearman（非参数性检验）；
 3. Kendall（非参数性检验） ;

**2. 单因素的差异性检验：** 

 	1. 独立 t 检验【 前提：正态性，方差其次性】; 
 	2. ANOVA【前提： 正态性，方差其次性】。
 	3. 配对t检验【前提：样本数量相同，且一一配对; 配对数据的差值满足正态分布】。 如果数据满足一一配对，首选配对t检验。如果不配对，数量不同，选ANOVA。 独立 t 检验和one-way ANOVA检验的区别： 独立t检验纯粹看两组样本有没有区别， 而 ANOVA 还除了看是否有区别，还会看是组间因素造成的还是组内因素造成的。

**3. 双因素差异性检验:** 

 	1. two-way repeated ANOVA;
 	2. two-way ANOVA without replication.

 ***注意： 差异性检验，涉及到方差的有偏估计 (的矫正), 需要在检验结果中，描述 degree of freedom。**

===================================================================

用 Excel 的 Data Analysis （数据分析） 可以完成的操作在此：
如何在Excel中加入Data Analysis 插件？博主neweastsun给出了教程：[链接](https://blog.csdn.net/neweastsun/article/details/39317449)

关于假设检验，推荐[李柏坚](https://www.youtube.com/watch?v=RjIaSP2IAvE)教授的统计学系列网络课堂: [链接](https://blog.csdn.net/neweastsun/article/details/39317449)。

Excel 的 Data Analysis可以给出一些关于数据的描述性分析和检验，然后从它的说明网页也可以看到，Excel 对统计不是全能的，比如无法完成正态分布检验和非参数性相关性分析 （例如Spearman）。 为了便利性或全面性，还需要借助SPSS 和 MATLAB。



1. **相关性分析**

如上一篇所描述，检定分析需要按照假设检验的流程。
首先，确立**虚无假设 (Null hypothesis)**，H0: 两个样本之间，没有相关性。significance level (*alpha*)为 0.05 ( 95% 可能拒绝虚无假设), 0.01 (99% 可能拒绝虚无假设) ，甚至 0.001 ( 99.9 %的可能拒绝虚无假设 ) 。例如， *p*值, *p *= 0.032 < 0.05，则虚无假设被拒绝 （95%可能），则认为两个样本之间有显著相关性。

<table><tr><td bgcolor=#D3D3D3>当两个样本满足显著相关 (由p值决定) 了，进一步计算相关系数 r 的值。【通常来讲，没有outlier异常值且 r 值比较高(例如>0.5）时，p值往往也 < 0.05 , 满足显著性。】</td></tr></table>

用我自己的数据举例：通过神经反馈训练，训练受试者降低他/她的 IAB 值。一共10次训练，依次得到 IAB 值 如下:

​		1.093, 1.059, 1.050, 1.015, 1.012, 1.036, 1.024, 0.988, 0.988, 0.970 ;

现在想要判断，受试者的IAB是否根据训练下降。 也就是想要比较下面两组数据的相关性 （小样本，应该用Spearman correlation test）：

​		样本A (训练序号): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
​		样本B (IAB的值: 1.093, 1.059, 1.050, 1.015, 1.012, 1.036, 1.024, 0.988, 0.988, 0.970

​	**1.1 皮尔森相关性分析** **（Pearson Correlation Test）**

**皮尔森相关性**分析中的皮尔森相关系数，是两个变量之间的协方差和标准差的商 。就是在上一篇中提到的correlation 相关系数的计算公式, wikipedia：

![皮尔森相关性公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/01.jpg)

由公式可知，Pearson coefficient (r）衡量的是两个样本间的线性关系。r值的取值在 [-1,1]，正负号代表正负相关。r 值的绝对值越接近1，相关性越强。

然而，Pearson相关性检验属于参数性检验，在使用它之前，要确认满足以下两个条件：[1. 大样本；2.两个样本都服从正态分布]。并在实际操作中发现，outlier的影响较大。所以当满足条件1而不满足条件2时，有以下两个解决办法：a. 去掉 outlier 的那组数据, 如果满足正态分布了，继续用Pearson correlation test；b. 使用非参数相关性检验：Spearman correlation test。



**1.2 Spearman 相关性分析（Spearman Correlation Test/ Spearman’s rank correlation）**

如名字所述（Spearman’s rank correlation）， Spearman coefficient 是衡量两个样本间秩的相关性。比起皮尔森相关性检验，Spearman的”宽容度”更高，它衡量的是 两个样本间的单调关系 (线性或非线性) 。承接上段，当两个样本数据不满足 [1. 大样本， 2. 样本服从正态分布] 的条件时，就用非参数性检验：Spearman correlation test, 公式如下（wikipedia）：

![斯皮尔曼相关性公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/02.PNG)

![斯皮尔曼相关性实例](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/03.webp)

此外，还有 Kendall correlation test, 也是检验秩相关。

**对相关性分析的实现:** 

**Excel syntax:**  皮尔森：PEARSON(array1, array2)返回值是 r 值。 

Spearman：因为涉及秩，秩序差值的平方，等计算，用excel[<教程在此](https://www.youtube.com/watch?v=JwwlzKLBvZQ)>有些麻 烦。而且返回值没有p值，比较方便我觉得还是用 SPSS 或者 MATLAB 。

**MATLAB syntax:**  
[rho,pval] = corr(**___**,'Name' ,'Value' ), Name可以选择 ‘Type’ （类型：Pearson，Spearman， Kendall），‘Alpha’ （显著值, significance level)，单双尾等。

**SPSS 操作：** 

1. 检验正态性：分析(A)->描述统计(E)->探索(E), 选择因变量，点击“统计(S)”->勾选“离群值(O)”->“继续”;  点击“图”->勾选“含检验的正态图”->点击“继续”。输出选择“两者”，点击“确定”。

![SPSS检验正态](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/04.webp)

在结果中，如果样本是大样本，则当 柯尔莫戈洛夫-斯米诺夫的显著性值>0.05时, 认为样本服从正态分布。 如果样本是小样本， 则当 夏皮洛-威尔克的显著性值 > 0.05时，认为样本服从正态分布。

![正态检验结果](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/05.PNG)

小样本则用夏皮洛-威尔克，显著性值 > 0.05 ，满足正态分布。但Pearson correlation test 要求大样本，所以之后对相关性的检验用 Spearman correlation。 在SPSS中，可以Pearson 和 Spearman (和 Kendall) 同时勾选：

2. 检验相关性: 分析(A)->相关(C)->双变量(B)->勾选想要的相关性检验，单双尾检验->确定

![SPSS相关性检验](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/06.webp)

![正态检验结果实例](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/07.PNG)

**2. t检验 (配对t）**

 t检验可分为单总体检验和双总体检验，以及配对样本检验。上一篇中总结了t检验是用于在小样本中，检定 样本均值 是否能估计 整体均值 (单总体检验) 和  检验两个[样本平均数](https://baike.baidu.com/item/样本平均数)与其各自所代表的总体的差异是否显著 （双总体检验）。在日常科研中，我常用到"配对t"，用于判断两个样本（或许大样本，或许小样本）之间，是否存在显著差异的，比如在第一个训练实验中的IAB值和第十个训练中的IAB值，是否有显著不同。其他例子有，吃降压药前后，同一组受试者前后的血压，是否存在显著变化。
在做配对t检验之前，两个样本的差值，需要满足正态分布，如果不满足，应该去掉包含outlier的一组值。

在SPSS中操作如下:

 \1. 检验正态性：分析(A)->描述统计(E)->探索(E), 选择因变量，点击“统计(S)”->勾选“离群值(O)”->“继续”;  点击“图”->勾选“含检验的正态图”->点击“继续”。输出选择“两者”，点击“确定”。 
\2.  配对t检验：分析(A)-> 比较平均值(M）-> 成对样本t检验(P)，选中配对变量->确定 (在选项中可以选择置信区间 1-alpha).

在excel操作如下：

 TTEST(array1,array2,tails,type) 
或者在菜单栏的 Data中，安装并使用插件 data analysis，获得详细的结果。

![EXCEL进行t检验](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/08.PNG)



在MATLAB中，操作如下：

 [h,p,ci,stats] = ttest (x,y,Name,Value) 
% 'right'    Test the alternative hypothesis that the population mean of x is greater than the population mean of y.
 % 'left'    Test the alternative hypothesis that the population mean of x is less than the population mean of y.

**3. 双因子, 重复，方差变异分析 （two-way repeated ANOVA）**

ANOVA前，数据需要满足正态分布，进行正态分布检定；

在双因子方差分析中， **two-way repeated**  ANOVA除了考量双因子彼此的效应之外，也可能存在因子之间的联合效应，也就是因子间的交互作用。

计算ANOVA, 用SPSS和EXCEL都很方便。我用的是EXCEL，菜单栏 Data->data analysis (插件)->two-way repeated ANOVA.

**注意: 用EXCEL 的data-> data analysis 插件算two-way repeat ANOVA时，需要把两个变量的名称也选择进去 （one-way ANOVA不需要）**:

![EXCEL进行ANOVA](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/09.png)

![EXCEL进行ANOVA_2_OUTRANGE的选择](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_2/10.png)