---
title: Dive into Deep Learning VII：BatchNorm、ResNet
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

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第七部分：BatchNorm、ResNet

<!--more-->

## <font face="黑体" color=green size=5>BatchNorm</font>

![LeNet结构](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/01.PNG)

1. 先使用卷积层来学习图片空间信息，通过池化层来降低空间敏感度，然后使用全连接层来转换到类别空间。
2. 卷积神经网络思想的本质：把空间信息不断压缩变小，抽出来的压缩的信息放在不同的通道里面。最后通过MLP把所有的pattern取出来，通过多层感知机模型，训练到最后的输出。因此，mlp会有一点overfitting现象，但是LeNet没有。
3. 如果没有任何overfitting（train acc 和 test acc 几乎完全重合），模型本身应该有一些underfitting。

```python
import torch
from torch import nn
from d2l import torch as d2l

class Reshape(torch.nn.Module):
    def forward(self, x):
        return x.view(-1, 1, 28, 28)

net = torch.nn.Sequential(Reshape(), nn.Conv2d(1, 6, kernel_size=5,
                                               padding=2), nn.Sigmoid(),
                          nn.AvgPool2d(kernel_size=2, stride=2),
                          nn.Conv2d(6, 16, kernel_size=5), nn.Sigmoid(),
                          nn.AvgPool2d(kernel_size=2, stride=2), nn.Flatten(),
                          # 以下相当于有两个隐藏层的多层感知机
                          nn.Linear(16 * 5 * 5, 120), nn.Sigmoid(),
                          nn.Linear(120, 84), nn.Sigmoid(), nn.Linear(84, 10))
```



### 	<font face="黑体" color=blue size=5>Q&A </font>

1. 对于时序数据是可以用池化和卷积的。
2. 信息在通道中是怎么流通的：高宽减半的时候（减少像素，同样一个像素表示的信息增加了。到最后一层，一个像素可以表示一个类：比如猫、狗），通道数翻倍（可以匹配的特定的pattern变多了）。整体来说还是在进行信息压缩。
3. MLP和CNN 在实际深度学习的应用中，应该如何选择？
   当数据维度不大的时候，先考虑 MLP，MLP快，MLP CNN 都能用。因为当数据维度很高的时候，MLP基本都overfitting。
4. 输出通道的信息理解为 可以匹配的特定的模式。
5. 图像识别出来的特征（颜色，形状）可以打印出来吗，或者怎么去寻找网络到底学习了什么？
   cnn explainer 可以看到图片在不同层的可视化。（）
6. 在跑得动的情况下，中间计算层的输出通道尽量调大吗？
   过大会 overfitting
7. 目前的深度学习网络，是不是都需要较多的训练数据？
   真实的场景有先验，一般不会从random开始学习。
8. 训练后的权重能做可视化吗？
   有很多相关的工作了（但知道又怎么样，笑~ XD）

## <font face="黑体" color=green size=5>AlexNet</font>

1. 本身是一个更深更大的 LeNet, 主要改进：运用丢弃法（在隐藏全连接层后，做一些正则）、用 ReLU （梯度更大，零处的一阶导更好，支持更深的模型）代替 sigmoid 令梯度保持较大、用Maxpooling（输出比较大，使得梯度相对比较大）代替 averagepooling。

2. stride 选的大一些 较少计算量，更多的输出通道，新加三个卷积层。

3. 数据增强。

4. 低学习率，epoch数量少，不容易在早期看到overfitting。

   ```python
   import torch
   from torch import nn
   from d2l import torch as d2l
   
   net = nn.Sequential(
       # 这里，我们使用一个11*11的更大窗口来捕捉对象。
       # 同时，步幅为4，以减少输出的高度和宽度。
       # 另外，输出通道的数目远大于LeNet
       nn.Conv2d(1, 96, kernel_size=11, stride=4, padding=1), nn.ReLU(),
       nn.MaxPool2d(kernel_size=3, stride=2),
       # 减小卷积窗口，使用填充为2来使得输入与输出的高和宽一致，且增大输出通道数
       nn.Conv2d(96, 256, kernel_size=5, padding=2), nn.ReLU(),
       nn.MaxPool2d(kernel_size=3, stride=2),
       # 使用三个连续的卷积层和较小的卷积窗口。
       # 除了最后的卷积层，输出通道的数量进一步增加。
       # 在前两个卷积层之后，池化层不用于减少输入的高度和宽度
       nn.Conv2d(256, 384, kernel_size=3, padding=1), nn.ReLU(),
       nn.Conv2d(384, 384, kernel_size=3, padding=1), nn.ReLU(),
       nn.Conv2d(384, 256, kernel_size=3, padding=1), nn.ReLU(),
       nn.MaxPool2d(kernel_size=3, stride=2), nn.Flatten(),
       # 这里，全连接层的输出数量是LeNet中的好几倍。使用dropout层来减轻过度拟合
       nn.Linear(6400, 4096), nn.ReLU(), nn.Dropout(p=0.5),
       nn.Linear(4096, 4096), nn.ReLU(), nn.Dropout(p=0.5),
       # 最后是输出层。由于这里使用Fashion-MNIST，所以用类别数为10，而非论文中的1000
       nn.Linear(4096, 10))
   ```

   

   ### <font face="黑体" color=blue size=5>Q&A </font>

   1. 为什么AlexNet 最后要有两个相同的全连接层Dense(4096)？
      一个效果会差。因为前面卷积的特征抽得不够好，不够深，所以后面得靠两个大的 Dense来补。
   2. 网络要求输入的size是固定的，实际使用的时候 图片不一定是要求的size。
      一般的做法：短边抠出指定长度，或者分别抠出来同时预测再ensemble。原则是保证图片的高宽比，再抠出网络指定的尺寸。

   



## <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
    https://zh-v2.d2l.ai/chapter_convolutional-modern/batch-norm.html
    
2.  课程主页: 
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
    
4. 课件：
   https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html

5. Pytorch论坛:
   [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)

   
   

