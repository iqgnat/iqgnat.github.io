---
title: Dive into Deep Learning IV：数值稳定性、模型初始化和激活函数
categories: 算法模型
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

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第四部分：数值稳定性、模型初始化和激活函数。

<!--more-->

## <font face="黑体" color=green size=5>数值稳定性</font>

1. 梯度爆炸造成的问题：

   + 值超出值域（计算机浮点数）；
   + 对学习率敏感。

2. 梯度消失造成的问题：

   + 梯度值编程0；
   + 训练没有进展；
   + 对底层尤为严重：梯度反传是从顶开始的，仅仅顶部层训练得较好，底部层跑不动；

3. 令梯度值在合理范围：

   + 让乘法变加法： ResNet， LSTM；
   + 归一化：梯度归一化，梯度裁剪；
   + 合理的权重初始和激活函数（tanh、relu、 调整后的 sigmoid： 在零点处 alpha ≈ 1）。

4. 梯度归一化：将每层得输出和梯度都看作随机变量，让它们的均值和方差都保持一致。
   Xavier 初始： 根据输入输出来适配权重的形状。 

5. sigmoid 可能引起梯度消失，这时可以通过 ReLU 替换 sigmoid 来解决。但是梯度消失不一定是由 sigmoid 引起。

   

## <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
    https://zh-v2.d2l.ai/chapter_multilayer-perceptrons/mlp-concise.html
    
2.  课程主页:
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
    
4. 课件：
   https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html

5. Pytorch论坛:
   [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)

   