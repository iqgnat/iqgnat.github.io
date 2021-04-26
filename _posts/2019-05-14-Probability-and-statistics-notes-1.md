---
title: 概率统计笔记：章节概括
categories: [科研笔记]
tags: 概率统计
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

课程相关: 
ECEN 2007_Probability and Statistics  
课本：Applied Statistics and Probability for Engineers,  6th Ed;
章节：Chapter 1 到 Chapter 10;

<!--more-->

在学期结束之际，记录一下课程的主要知识点和例题。**[下一篇](http://tangqinotes.me/psii-spss-matlab-excel/)**记录常用到的统计应用，包括：正态分布检验，配对t检验，相关性分析（Pearson & Spearman), ANOVA，主要用 SPSS statistics, Excel 和 MATLAB 实现。

# <font face="黑体" color=green size=5>常用检验</font>

**1. 相关性检验:**

1. Pearson【 前提：正态性；样本数量大 (n>30 或者 n>50)】；

 2. Spearman（非参数性检验）；
 3. Kendall（非参数性检验） ;

**2. 单因素的差异性检验：** 

1. 独立 t 检验【 前提：正态性，方差其次性】; 
2. ANOVA【前提： 正态性，方差其次性】;
3. 配对t检验【前提：样本数量相同，且一一配对; 配对数据的差值满足正态分布】。 如果数据满足一一配对，首选配对t检验。如果不配对，数量不同，选ANOVA。 独立 t 检验和one-way ANOVA检验的区别： 独立t检验纯粹看两组样本有没有区别， 而 ANOVA 还除了看是否有区别，还会看是组间因素造成的还是组内因素造成的。

**3. 双因素差异性检验:** 

 	1. two-way repeated ANOVA;
 	  	2. two-way ANOVA without replication.

 ***注意： 差异性检验，涉及到方差的有偏估计 (的矫正), 需要在检验结果中，描述 degree of freedom。**

# <font face="黑体" color=green size=5>章节目录</font>

- **Chapter 1: 整本书的内容概括, 概率模型的介绍** 
- **Chapter 2: 集合，贝叶斯定理， Subset Permutation Rule** 
- **Chapter 3:  离散概率分布** 
- **Chapter 4:  连续概率分布**
- **Chapter 5:  联合概率分布**
- **Chapter 6:  数据的描述性分析** 
- **Chapter 7:  通过样本对整体进行点估计** 
- **Chapter 8: 通过样本对整体的均值，方差进行区间估计** 
- **Chapter 9: 对单整体进行假设检验**
- **Chapter 10: 对双整体关系进行假设检验** 

# <font face="黑体" color=green size=5>Chapter 1: 概率模型的介绍</font>

- A mechanistic model is built from our underlying knowledge of the basic physical mechanism that relates several variables. 

- An empirical model is built from our engineering and scientific knowledge of the phenomenon but is not directly developed from our theoretical or first-principles understanding of the underlying mechanism.


# <font face="黑体" color=green size=5>Chapter 2: 集合，贝叶斯定理， Subset Permutation Rule</font>

1. 关于集合的概念 (Distributive law [交的补等于补的并，并的补等于补的交 ] , Associative law, Permutation Rule [高中时的A，有序排序】, Combination Rule [高中时的C，无序排序】);
2. Subset Permutation Rule (图a例题）; 
3. 事件独立性的判断, 以下三点任一成立:

- P(A | B) = P(A) P(B | A) = P(B) P(A U B) = P(A)·P(B)

4. 条件概率 与贝叶斯定理:

- P(B | A) = P(A U B) / P(A) for P(A) > 0; P(A | B)= P(B | A) * P(A)/P(B); 

- If E1, E2, …, EK are k mutually exclusive and exhaustive events and B is any   event: 
- P (E1|B) =P (B|𝐸1)*P(𝐸1) / {P (B|𝐸1)*P(𝐸1)+P(B|𝐸2)*P(𝐸2)+⋯+P(B|𝐸𝑘)*P(𝐸𝑘)} for P(B) > 0


5. 古典概率(Equally likely outcomes; Sample space limited)和几何概率(Equally likely outcomes; Sample space unlimited)的理解, 图b例题。

![subset permutation rule](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS1.jpg)

![古典概率和几何概率](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS21.webp)



# <font face="黑体" color=green size=5>Chapter 3:  离散概率分布</font> 

1. Probability Distributions, Probability Mass Functions (PDF) 
2. Cumulative Distribution Functions (CDF,将会在正态分布，t分布的表格中用到,例题在图a)  
3. Mean and Variance of a Discrete Random Variable (图b)     
4. Discrete Uniform Distribution (图c)   
5. Binomial Distribution (二项分布,例题：邮局窗口问题)  
6. Geometric(几何分布，伯努利试验第n次尝试才第一次成功) and Negative Binomial Distributions(负二项分布,  伯努利试验第k次尝试才第r次成功 )  
7. Hypergeometric Distribution(超几何分布,有N个样本，其中K个是不及格的。超几何分布描述了在该N个样本中抽出n个，其中k个是不及格的概率; 大润发抽乒乓球问题)  
8. Poisson Distribution(无限 sample space， 一小时内断网次数的例子）

![CDF属性](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS3.webp)

![方差标准差公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS4_1-1.webp)

![离散连续自然数均值方差公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS4.webp)

![二项分布性质](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS5-1.webp)

![其他离散分布性质](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS6.webp)

![离散分布性质的比较](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS7-1024x775.webp)

# <font face="黑体" color=green size=5>Chapter 4:  连续概率分布</font> 

1. 连续概率分布均值和方差的性质 （与离散性质的比较）; 

2. Continuous Uniform Distribution; 

3. 中心极限定理，3 sigma, 正态分布的归一化； 

4. 正态分布去逼近二项分布和泊松分布（成立的条件,正态计算量小）,图a、b; 

5. Exponential Distribution, 图c  

6. Erlang and Gamma Distributions, 图d  

7. Weibull Distribution, 图e   

8. Lognormal Distribution，图f  连续分布一般题目中会暗示会给定分布类型，因为不像离散分布(第三章)一样可以通过条件判断。所以做题时，可以按图索骥，根据公式（套路）来.

   ![正态拟合二项](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS8-1024x740.webp)

![正态拟合泊松](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS20-752x1024.webp)

![指数分布](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS9-1.webp)

![指数分布的一般形式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS10.webp)



![Weibull分布](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS11.webp)

![Weibull分布](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS11.webp)

![Lognormal分布](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS12.webp)

# <font face="黑体" color=green size=5>Chapter 5:  联合概率分布</font> 

1. Two or More Random Variables (Joint/Marginal/Conditional Probability, Independence, more Than Two Random Variables) 
2. Covariance and Correlation (图a), 判断变量之间的线性关系。 
3. Common Joint Distributions(Multinomial Probability/ Bivariate Normal) 
4. Linear Functions of Random Variables 
5. General Functions of Random Variables 
6. Moment Generating Functions (图b，目的：降低计算量) 功课中涉及到其他知识点：分部积分，洛必达法则，指数函数积分等

![协方差与相关性的计算公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS13.webp)

![Moment-Generating Function](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS14-1024x467.webp)

# <font face="黑体" color=green size=5>Chapter 6:  数据的描述性分析(MATLAB, SPSS,Python,R 等皆可)</font> 

MATLAB有关描述分析的 [小程序](http://tangqinotes.me/wp-content/uploads/2019/05/DescriptiveAnalysis_code.zip)。SPSS的相关操作，在SPSS章节记录。

![chap6作业题](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS17.webp)

# <font face="黑体" color=green size=5>Chapter 7: 通过样本对整体进行点估计</font> 

1. 样本的均值对整体的均值属于无偏估计，而样本的方差对整体方差的估计是有偏估计。矫正项是 1/(n-1）。推导公式见 图a.
2. 两个样本均值差的分布估计, 图b. 
3. mean squared error: MSE(theta head)=E(theta head -theta)^2.
4. 动量估计 (基于大数法则)， 贝叶斯估计 (Prior probability ->amend with samples->posterior probability) 和最大似然估计：The maximum likelihood estimator (MLE) of θ is the value of θ that maximizes the likelihood function L(θ), 可以用于训练模型系数 (weight), 流程：  

- 1. Establish   Combination of probabilities of n random variates from a random sample. 
- 2. Take the natural logarithm   a. Many products, sometimes exponents in L(θ). To find the global maximum value, differentiation is frequently applied. Use logarithm rule to simplify the calculation.   b. Natural logarithm is a strict increase function, will not hinder to find the maximum value of continuous L(θ). 
- 3. First derivative of L(θ)  Make the first derivative of L(θ),in other words L’(θ), equal to zero to find all possible θ at local maximum or local minimum. 
- 4. Take the second derivative of L(θ)   To judge whether the θ we find in step 3 is the position of maximum likelihood.  

![样本对整体的均值,方差估计](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS18-1-729x1024.webp)

![两个样本均值差的分布估计](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS19.webpp)

![最大似然估计，估计几何分布和泊松分布的概率、期望](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS21.webp)

# <font face="黑体" color=green size=5>Chapter 8: 通过样本对整体的均值，方差进行 区间估计</font> 

主要分为3个大类：通过样本信息对整体的均值估计，方差估计和分布近似。

1. 整体分布是正态分布，方差已知。对整体的均值做区间估计, sample size n的计算。单边，双边的区间估计。
2. 大样本(一般情况下>50）时整体均值的区间估计（Z 分布，variance known，因为是大样本，n/n-1 接近1，样本方差对整体方差的估计近似于无偏 , 标准差收敛)。小样本(一般情况下<50)时整体均值的区间估计（t分布，注意查表时需要对应自由度，*df* = n - 1，类似于Chap 7的矫正项）
3. 通过样本对整体做卡方检验，估计整体的方差。
4. 比较prediction level 和 normal distribution confidence interval的区别（宽度）。

![区间分布公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS22-771x1024.webp)

![区间分布公式2](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS23-928x1024.webp)

# <font face="黑体" color=green size=5>Chapter 9: 对单整体进行假设检定</font> 

承接 Chap 8 的知识点， 对整体均值、方差和比例，做假设检验。通过样本所获统计量，判断整体是否符合假设，并对假设作出决策。涉及到的概念有:

- **Type I Error (alpha, significance level)**: Rejecting the null hypothesis H­0 when it is true is defined as a type I error.（错杀好人型） 
- **Type II Error (beta)**:  Failing to reject the null hypothesis when it is false is defined as a type II error.（认贼作父型） 
- **Power (sensitivity):** ( *power = 1 - beta*) The power of a statistical test is the probability of rejecting the null hypothesis H­0 when the alternative hypothesis is true. 
- **P-Value:** The P-value is the smallest level of significance that would lead to rejection of the null hypothesis H­0 with the given data. （最终用查表或计算出来的 *p* 值和 significance level (*alpha*) 作比较）

![单整体假设检定公式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS24-3.webp)

![单整体假设检定公式2](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS25.webp)

****

# <font face="黑体" color=green size=5>Chapter 10: 对双整体关系进行假设检定</font>

根据条件，根据假设检验的步骤: 

1. 确定虚无假设（Null hypothesis）和备选假设（Alternative Hypothesis） 
2. 确定统计量 （单尾，双尾？significance level？） 
3. 归一化，查表(或计算)，比较计算出来的 *p*值和预先定好的 significance level (*alpha*）的值，查看 *p* 值是否落在拒绝域。 
4. 验证检验并得出结论。



 **[李伯坚](https://www.youtube.com/playlist?list=PL1AElnNtwabmdR5CZab98Yxr-MsQ8ON2N)**教授的课程