---
title: Dive into Deep Learning VI：LeNet、AlexNet、VGG、NiN、GoogleNet
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

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第六部分：LeNet、AlexNet、VGG、NiN、GoogleNet。

<!--more-->

Fully Connected (FC) Layer = 一层layer

MLP = 多层 FC layer 构成的 NN

DNN = MLP 和 CNN 的集合相并，通常包括多个卷积 layer 和 FC layer

## <font face="黑体" color=green size=5>LeNet</font>

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

   

## <font face="黑体" color=green size=5> 使用块的网络 VGG</font>

1. 思想：再AlexNet做更深更大的深度学习，更规范的结构。
2. 选项：
   + 更多的全连接层（参数太多，太贵）
   + 更多的卷积层 （不好实现）
   + 将卷积层组合成块 （VGG块的思想， AlexNet思路的扩展）
3. VGG块：
   + 3 * 3 卷积层（padding = 1），在同样的计算量下，3 * 3 的效果会好于 5 * 5，模型深但窄效果更好。因此都是 n 层， m 通道。
   + 2 * 2 最大池化层（stride = 2）
4. VGG架构：
   + 多个VGG块后接全连接层
   + 不同次数的重复块得到不同的架构 VGG-16,VGG-19
   + 使用可重复使用的卷积块来构建深度卷积神经网络, 每个VGG块的 input layer 可以设计不同，但 output layer 设计相同。
   + 不同的卷积块个数和超参数可以得到不同复杂度的变种。

![VGG架构和AlexNet结构对比](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/02.PNG)

```python
import torch
from torch import nn
from d2l import torch as d2l

def vgg_block(num_convs, in_channels, out_channels):
    layers = []
    for _ in range(num_convs):
        layers.append(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1))
        layers.append(nn.ReLU())
        in_channels = out_channels
    layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
    return nn.Sequential(*layers)


def vgg(conv_arch):
    conv_blks = []
    in_channels = 1
    # 卷积层部分
    for (num_convs, out_channels) in conv_arch:
        conv_blks.append(vgg_block(num_convs, in_channels, out_channels))
        in_channels = out_channels

    return nn.Sequential(*conv_blks, nn.Flatten(),
                         # 全连接层部分
                         nn.Linear(out_channels * 7 * 7, 4096), nn.ReLU(),
                         nn.Dropout(0.5), nn.Linear(4096, 4096), nn.ReLU(),
                         nn.Dropout(0.5), nn.Linear(4096, 10))

conv_arch = ((1, 64), (1, 128), (2, 256), (2, 512), (2, 512))
net = vgg(conv_arch)

X = torch.randn(size=(1, 1, 224, 224))
for blk in net:
    X = blk(X)
    print(blk.__class__.__name__, 'output shape:\t', X.shape)
    
```



## <font face="黑体" color=green size=5> 网络中的网络 （NiN）</font>

1. 卷积层参数的个数：输入的通道数 x 输出的通道数 x 卷积窗口的高和宽 。 
   全连接层的参数： 输入的通道数 x 输入的高和宽（所有像素） x 输出的高和宽（所有像素）。 7层VGG参数可达1亿，不断访问内存耗尽内存资源，过拟合等问题。
2. NiN的思想，像 MLP-Mix 一样，完全不要全连接层。NiN块：新兴的神经网络基本都拥有自己的局部网络块。
3. NiN块：一个卷积层后跟两个全连接层 。
   + 步幅1，无填充，输出形状跟卷积层输出一样
   + 起到全连接层作用, 对每个像素增加非线性
4. NiN架构：
   + 无全连接层，架构简单，参数少，模型复杂度降低，提升泛化性，但收敛变慢。
   + 1 x 1 卷积实际上是对每个像素点，在不同channel上进行线性组合，且保留了图片的原有平面结构，调控depth。并往往在此基础上加入非线性激励。（通过卷积核，控制通道和模型复杂度）
   + 交替使用NiN块和步幅为2的最大池化层
     + 逐步减小高宽和增大通道数
   + 最后使用全局平均池化层得到输出
     + 其输入通道数是类别数（对每个通道拿出一个值，用作类别的预测，再加一个softmax求出概率）
     + 不容易过拟合，更少的参数个数。
       

![NiN架构和VGG架构对比](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/03.PNG)

```python
import torch
from torch import nn
from d2l import torch as d2l

def nin_block(in_channels, out_channels, kernel_size, strides, padding):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size, strides, padding),
        nn.ReLU(), nn.Conv2d(out_channels, out_channels, kernel_size=1),
        nn.ReLU(), nn.Conv2d(out_channels, out_channels, kernel_size=1),
        nn.ReLU())

net = nn.Sequential(
    nin_block(1, 96, kernel_size=11, strides=4, padding=0),
    nn.MaxPool2d(3, stride=2),
    nin_block(96, 256, kernel_size=5, strides=1, padding=2),
    nn.MaxPool2d(3, stride=2),
    nin_block(256, 384, kernel_size=3, strides=1, padding=1),
    nn.MaxPool2d(3, stride=2), nn.Dropout(0.5),
    # 标签类别数是10
    nin_block(384, 10, kernel_size=3, strides=1, padding=1),
    nn.AdaptiveAvgPool2d((1, 1)), # 全局的平均池化层
    # 将四维的输出转成二维的输出，其形状为(批量大小, 10)
    nn.Flatten())

X = torch.rand(size=(1, 1, 224, 224))
for layer in net:
    X = layer(X)
    print(layer.__class__.__name__, 'output shape:\t', X.shape)
```



### <font face="黑体" color=blue size=5>Q&A </font>

 1. 数据集大的话，NiN的计算速度会优于AlexNet。

 2.  nvidia-smi查看显存情况。

​    

## <font face="黑体" color=green size=5> 含并行连接的的网络 （GoogLeNet）</font>

1. 第一个可以做到超过100层的卷积神经网络

2. 四个路径从不同层面抽取信息，然后再输出通道维合并。

3. 核心定义：使用不同窗口大小的卷积层（都不改变输入的高宽），这样 1、3、5 卷积，maxpooling 都考虑到了，然后在输出通道维合并，输出通道变得很深。

4. inception不仅增加了大量多样性，而且计算量变少了。GoogLeNet里面用了9个Inception块。

5. 具体（对比AlexNet）：

   + 段1&2，更小的宽口，更多的通道。更小的卷积核，使得高宽保留更多，能支持后面更深的卷积层。
   + 段3：通道分配不同，输出通道增加。
   + 段4 & 5： 头尾更多通道数

   

![GoogLeNet_Inception_block](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/04.PNG)

![GoogLeNet_Inception_block2](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/05.PNG)

![GoogLeNet_架构](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-06-04-Dive_into_Deep_Learning_study_notes_VI/06.PNG)



```python
import torch
from torch import nn
from torch.nn import functional as F
from d2l import torch as d2l

class Inception(nn.Module):
    # `c1`--`c4` 是每条路径的输出通道数
    def __init__(self, in_channels, c1, c2, c3, c4, **kwargs):
        super(Inception, self).__init__(**kwargs)
        # 线路1，单1 x 1卷积层
        self.p1_1 = nn.Conv2d(in_channels, c1, kernel_size=1)
        # 线路2，1 x 1卷积层后接3 x 3卷积层
        self.p2_1 = nn.Conv2d(in_channels, c2[0], kernel_size=1)
        self.p2_2 = nn.Conv2d(c2[0], c2[1], kernel_size=3, padding=1)
        # 线路3，1 x 1卷积层后接5 x 5卷积层
        self.p3_1 = nn.Conv2d(in_channels, c3[0], kernel_size=1)
        self.p3_2 = nn.Conv2d(c3[0], c3[1], kernel_size=5, padding=2)
        # 线路4，3 x 3最大池化层后接1 x 1卷积层
        self.p4_1 = nn.MaxPool2d(kernel_size=3, stride=1, padding=1)
        self.p4_2 = nn.Conv2d(in_channels, c4, kernel_size=1)

    def forward(self, x):
        p1 = F.relu(self.p1_1(x))
        p2 = F.relu(self.p2_2(F.relu(self.p2_1(x))))
        p3 = F.relu(self.p3_2(F.relu(self.p3_1(x))))
        p4 = F.relu(self.p4_2(self.p4_1(x)))
        # 在通道维度上连结输出
        return torch.cat((p1, p2, p3, p4), dim=1)
    
# 第一个模块使用 64 个通道、 \(7\times 7\) 卷积层。
b1 = nn.Sequential(nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3),
                   nn.ReLU(), nn.MaxPool2d(kernel_size=3, stride=2,
                                           padding=1))

# 第二个模块使用两个卷积层：第一个卷积层是 64个通道、 \(1\times 1\) 卷积层；第二个卷积层使用将通道数量增加三倍的 \(3\times 3\) 卷积层。 这对应于 Inception 块中的第二条路径。
b2 = nn.Sequential(nn.Conv2d(64, 64, kernel_size=1), nn.ReLU(),
                   nn.Conv2d(64, 192, kernel_size=3, padding=1),
                   nn.MaxPool2d(kernel_size=3, stride=2, padding=1))

#第三个模块串联两个完整的Inception块。 第一个 Inception 块的输出通道数为 \(64+128+32+32=256\)，四个路径之间的输出通道数量比为 \(64:128:32:32=2:4:1:1\)。 第二个和第三个路径首先将输入通道的数量分别减少到 \(96/192=1/2\) 和 \(16/192=1/12\)，然后连接第二个卷积层。第二个 Inception 块的输出通道数增加到 \(128+192+96+64=480\)，四个路径之间的输出通道数量比为 \(128:192:96:64 = 4:6:3:2\)。 第二条和第三条路径首先将输入通道的数量分别减少到 \(128/256=1/2\) 和 \(32/256=1/8\)。
b3 = nn.Sequential(Inception(192, 64, (96, 128), (16, 32), 32),
                   Inception(256, 128, (128, 192), (32, 96), 64),
                   nn.MaxPool2d(kernel_size=3, stride=2, padding=1))

#第四模块更加复杂， 它串联了5个Inception块，其输出通道数分别是 \(192+208+48+64=512\) 、 \(160+224+64+64=512\) 、 \(128+256+64+64=512\) 、 \(112+288+64+64=528\) 和 \(256+320+128+128=832\) 。 这些路径的通道数分配和第三模块中的类似，首先是含 \(3×3\) 卷积层的第二条路径输出最多通道，其次是仅含 \(1×1\) 卷积层的第一条路径，之后是含 \(5×5\) 卷积层的第三条路径和含 \(3×3\) 最大池化层的第四条路径。 其中第二、第三条路径都会先按比例减小通道数。 这些比例在各个 Inception 块中都略有不同。
b4 = nn.Sequential(Inception(480, 192, (96, 208), (16, 48), 64),
                   Inception(512, 160, (112, 224), (24, 64), 64),
                   Inception(512, 128, (128, 256), (24, 64), 64),
                   Inception(512, 112, (144, 288), (32, 64), 64),
                   Inception(528, 256, (160, 320), (32, 128), 128),
                   nn.MaxPool2d(kernel_size=3, stride=2, padding=1))

# 第五模块包含输出通道数为 \(256+320+128+128=832\) 和 \(384+384+128+128=1024\) 的两个Inception块。 其中每条路径通道数的分配思路和第三、第四模块中的一致，只是在具体数值上有所不同。 需要注意的是，第五模块的后面紧跟输出层，该模块同 NiN 一样使用全局平均池化层，将每个通道的高和宽变成1。 最后我们将输出变成二维数组，再接上一个输出个数为标签类别数的全连接层。
b5 = nn.Sequential(Inception(832, 256, (160, 320), (32, 128), 128),
                   Inception(832, 384, (192, 384), (48, 128), 128),
                   nn.AdaptiveAvgPool2d((1, 1)), nn.Flatten())

net = nn.Sequential(b1, b2, b3, b4, b5, nn.Linear(1024, 10))
```



### 	<font face="黑体" color=blue size=5>Q&A </font>

1. 通道数的不同不是步幅造成的，是1 x 1 的卷积的输出的通道数造成的。

2. 中间2个线路会对输入先做1x1卷积来减少输入通道数，以降低模型复杂度。第四条线路则使用3x3最大池化层，后接1x1卷积层来改变通道数。4条线路都使用了合适的填充来使输入与输出的高和宽一致。最后将每条线路的输出在通道维上连结，并输入接下来的层中去。
   Inception块中可以自定义的超参数是每个层的输出通道数，我们以此来控制模型复杂度。

   

## <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
    https://zh-v2.d2l.ai/chapter_convolutional-neural-networks/lenet.html
    
2.  课程主页: 
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
    
4. 课件：
   https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html

5. Pytorch论坛:
   [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)

6. Dense全连接层和 1 x 1 卷积当作全连接层的不同：
   https://zhuanlan.zhihu.com/p/33841176

7. 全连接层、多层感知机、DNN的关系：
   https://www.zhihu.com/question/349854200

8. 卷积核核通道数： https://blog.csdn.net/weixin_39523835/article/details/111555627

   

