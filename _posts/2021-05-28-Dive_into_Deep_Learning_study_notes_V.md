---
title: Dive into Deep Learning V：卷积、池化
categories: ML和时序分析
tags: [Pytorch]
description: 
comments: true
author: Tang Qi
sidebar: 
  nav: docs-cn
aside:
  toc: true
layout: post
---

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第五部分：卷积和池化。

<!--more-->

## <font face="黑体" color=green size=5>卷积层</font>

对全连接层使用 平移不变性 和 局部性 得到卷积层（其实严格来说应该称为 交叉相关层，因为卷积在索引w时应该有负号）：

1. 平移不变性：不管出现在图像中的哪个位置，神经网络的底层应该对相同的图像区域做出类似的响应。这个原理即为“平移不变性”。

2. 局部性：神经网络的底层应该只探索输入图像中的局部区域，而不考虑图像远处区域的内容，这就是“局部性”原则。最终，这些局部特征可以融会贯通，在整个图像级别上做出预测。

   ![全连接层的平移不变性_局部性](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-05-28-Dive_into_Deep_Learning_study_notes_V/01.PNG)

3. 本质：
   将输入和核矩阵进行交叉相关，加上偏移后得到输出。核矩阵和偏移是可学习的参数，核矩阵的大小是超参数（控制局部性）。

   ### 	<font face="黑体" color=blue size=5>Q&A </font>

   1. 为什么考虑全连接层不应该看这么远，而是考虑卷积层的局部性？ 感受野不是越大越好吗？
      类似于问隐藏层为什么不是越大越好，而是倾向于窄而深的。 因为每次只看一点，如果隐层够深，也能学到感受野大的pattern。
   2. 二维卷积层， 同时用两个不同尺度的kernel进行计算， 然后再计算出一个更合适的Kernel，从而提高特征提取的性能。
      google net ，inception的设计思路。
   3. 图片是三原色，也就是一个三位张量怎么办：
      把隐藏表示想象为一系列具有二维张量的 *通道* （channel）。 这些通道有时也被称为 *特征映射* （feature maps），因为每一层都向后续层提供一组空间化的学习特征。 在靠近输入的底层，一些通道专门识别边，而其他通道专门识别纹理。可以理解成一个卷积核有**3层，分别对应RGB卷积然后相加**:
      torch.Size([4, 3, 4, 5])
      第一个维度： filter 数量， 
      第二个维度： input 层数 （RBG =3）
      第三、四个维度 kernel size。

## <font face="黑体" color=green size=5>卷积层里的填充和步幅</font>

1. 多次卷积后，输入维度越来越小。在周围做padding（额外的行、列），通常填充核的 (高 - 1) x (宽 - 1)，控制输出形状的减少量。

2. 步幅间接控制输出大小、模型深度，成倍减少输出形状。

3. 核大小是最关键的，填充通常是默认核的高-1、宽-1，步幅取决于想控制模型复杂度到什么程度。

4. 卷积层一般取奇数，方便对称（通常 3 x 3， 5 x 5）。

   ### <font face="黑体" color=blue size=5>Q&A </font>

1. 如何训练超参数？ NAS，设计比较好的网络算法。

2. autogluon 有自动调参深度神经网络的功能

3. 自动训练参数的话，是不是更容易过拟合？可能会，但是设置比较好的验证集，可以一定程度避免。

4. 多层的 3 x 3 卷积是不是和用不同大小的卷积核分别对原始图像做处理以后，再联合这些算出来的特征进行分类这种情况等价？
   可能是， 但是用 3 x 3 计算更快， 也是googlenet inception 的设计思路。

5. 底层用大kernel，上层用小kernel， alexnet 是这样做的，可能更适合多尺度的情况。 用同样宽度的核比较简单，效果也不一定会差。

   

## <font face="黑体" color=green size=5> 池化层 （pooling layer）</font>

1. 卷积层的积对位置敏感，因此提取特征还需要一定程度的平移不变性。

2. 和卷积类似，都具有填充和步幅，由滑动窗口计算输出，没有可学习的参数（没有kernel），只是在卷积结果基础上进行池化。

3. 每个通道做一次池化层，不像kernel会融合多通道。

4.  返回窗口中最大或平均值，缓解卷积层位置的敏感性

5. 同样有窗口大小、填充和步幅作为超参数。

   



## <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
    https://zh-v2.d2l.ai/chapter_convolutional-neural-networks/why-conv.html
    
2.  课程主页: 
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
    
4. 课件：
   https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html

5. Pytorch论坛:
   [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)

   

