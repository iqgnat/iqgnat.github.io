---
title: Dive into Deep Learning III：多层感知机、模型选择、过拟合和欠拟合、权重衰退、dropout
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

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第三部分：多层感知机、模型选择、过拟合和欠拟合、权重衰退、丢弃法。

<!--more-->

## <font face="黑体" color=green size=5>多层感知机</font>

1. 感知机是线性的二分类模型，只能产生线性分割面，不能拟合XOR函数。
2. 多层感知机：组合学习多个分类器，增加 隐藏层 和 非线性激活函数。只要有一个隐藏层，实际上就可以拟合任何函数。
3. 神经网络增加隐藏层的层数而不是神经元的个数的原因：特别容易过拟合，因此深度的好训练一些，

实现代码样例：

```python
import torch
from torch import nn
from d2l import torch as d2l

batch_size = 256
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)

#初始化模型参数
num_inputs, num_outputs, num_hiddens = 784, 10, 256

W1 = nn.Parameter(
    torch.randn(num_inputs, num_hiddens, requires_grad=True) * 0.01)
b1 = nn.Parameter(torch.zeros(num_hiddens, requires_grad=True))
W2 = nn.Parameter(
    torch.randn(num_hiddens, num_outputs, requires_grad=True) * 0.01)
b2 = nn.Parameter(torch.zeros(num_outputs, requires_grad=True))

params = [W1, b1, W2, b2]

#激活函数
def relu(X):
    a = torch.zeros_like(X)
    return torch.max(X, a)

#每一层的模型
def net(X):
    X = X.reshape((-1, num_inputs))
    H = relu(X @ W1 + b1)  # 这里“@”代表矩阵乘法
    return (H @ W2 + b2)

#损失函数
loss = nn.CrossEntropyLoss()

#下降函数、学习率和训练
num_epochs, lr = 10, 0.1
updater = torch.optim.SGD(params, lr=lr)
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, updater)

#模型评估
d2l.predict_ch3(net, test_iter)
```



API简洁实现：

```python
import torch
from torch import nn
from d2l import torch as d2l

net = nn.Sequential(nn.Flatten(), nn.Linear(784, 256), nn.ReLU(),
                    nn.Linear(256, 10))

def init_weights(m):
    if type(m) == nn.Linear:
        nn.init.normal_(m.weight, std=0.01)

net.apply(init_weights);

batch_size, lr, num_epochs = 256, 0.1, 10
loss = nn.CrossEntropyLoss()
trainer = torch.optim.SGD(net.parameters(), lr=lr)

train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, trainer)
```



## <font face="黑体" color=green size=5>过拟合和欠拟合</font>

在深度学习里面，过拟合不是一件坏事，至少说明模型容量是够大的，然后通过估计模型容量，数据复杂度，降低过拟合，提高泛化性。希望自动机器学习能自动解决这样的问题。

```python
import math
from mxnet import gluon, np, npx
from mxnet.gluon import nn
from d2l import mxnet as d2l

npx.set_np()
max_degree = 20  # 多项式的最大阶数
n_train, n_test = 100, 100  # 训练和测试数据集大小
true_w = np.zeros(max_degree)  # 分配大量的空间
true_w[0:4] = np.array([5, 1.2, -3.4, 5.6])

features = np.random.normal(size=(n_train + n_test, 1))
np.random.shuffle(features)
poly_features = np.power(features, np.arange(max_degree).reshape(1, -1))
for i in range(max_degree):
    poly_features[:, i] /= math.gamma(i + 1)  # `gamma(n)` = (n-1)!
# `labels`的维度: (`n_train` + `n_test`,)
labels = np.dot(poly_features, true_w)
labels += np.random.normal(scale=0.1, size=labels.shape)

# NumPy ndarray转换为tensor
true_w, features, poly_features, labels = [
    torch.tensor(x, dtype=torch.float32)
    for x in [true_w, features, poly_features, labels]]

features[:2], poly_features[:2, :], labels[:2]

def evaluate_loss(net, data_iter, loss):  #@save
    """评估给定数据集上模型的损失。"""
    metric = d2l.Accumulator(2)  # 损失的总和, 样本数量
    for X, y in data_iter:
        out = net(X)
        y = y.reshape(out.shape)
        l = loss(out, y)
        metric.add(l.sum(), l.numel())
    return metric[0] / metric[1]

def train(train_features, test_features, train_labels, test_labels,
          num_epochs=400):
    loss = nn.MSELoss()
    input_shape = train_features.shape[-1]
    # 不设置偏置，因为我们已经在多项式特征中实现了它
    net = nn.Sequential(nn.Linear(input_shape, 1, bias=False))
    batch_size = min(10, train_labels.shape[0])
    train_iter = d2l.load_array((train_features, train_labels.reshape(-1, 1)),
                                batch_size)
    test_iter = d2l.load_array((test_features, test_labels.reshape(-1, 1)),
                               batch_size, is_train=False)
    trainer = torch.optim.SGD(net.parameters(), lr=0.01)
    animator = d2l.Animator(xlabel='epoch', ylabel='loss', yscale='log',
                            xlim=[1, num_epochs], ylim=[1e-3, 1e2],
                            legend=['train', 'test'])
    for epoch in range(num_epochs):
        d2l.train_epoch_ch3(net, train_iter, loss, trainer)
        if epoch == 0 or (epoch + 1) % 20 == 0:
            animator.add(epoch + 1, (evaluate_loss(
                net, train_iter, loss), evaluate_loss(net, test_iter, loss)))
    print('weight:', net[0].weight.data.numpy())
    
```

### 	<font face="黑体" color=blue size=5>Q&A </font>

1. SVM 和 神经网络 相比，缺点在哪里？ 
   神经网络虽然不直观，但是可编程性很好，可控制性好，可以通过卷积得到一个比较好的特征的提取。
2. 泛化误差是指 在 testing dataset 还是 validation dataset ？ 
   testing dataset。
3. 训练集、验证集、测试集 分布的原则？按照时间划分，还是抽样？
   如果预测本身是时序的，应该按照时间轴划分。如果非时序且按时间轴可能随时间发生变化，数据集够大，可能抽样比较好（随机、分层等）。
4. 如果时序上的数据集有自相关性怎么办？
   继续按照时间切片。

5. 异常值处理时候的标准化应该是训练集和验证集、测试集一起，还是在训练集上做好应用在验证集、测试集上？
   根据实际的应用，取不到就用后者比较保险。

6. 有效设计超参数，贝叶斯、网格、随机、遗传算法？
   a. 专家经验; b. 自己调； c. 随机。 贝叶斯可以做，但是可能先要训练百次、千次。 

7. 好坏样本比例非常不平衡，怎么办？
   可以在验证集上 1：1的比例分布、加权重等。

8. k折交叉验证的三种用法：
   a.  k折了，选最好的一折，再用在全部训练集上训练一次
   b.  k折了，选最好的一折的模型，直接用在预测集（浪费了一些训练数据）。
   c.  k折了，k个模型全部拿下来，分别运用在测试集，结果取均值。相当于做了一个voting，模型更稳定。

9. svm 打败多层感知机的原因：
   精度上差不多，但是svm有数据支持，并且不怎么需要调参。

10. 深度学习打败svm的原因：
    深度学习精度比svm高。一个流行、发展的原因。

11. 既然多层感知机中的非线性就可以拟合任意函数，为什么还需要神经网络？
    理论上可以，但实际上很难训练出来，因此需要设计模型来帮助训练。比如 CNN、RNN 通过限制一些空间信息、时序信息，来描述数据特性，使得训练更容易进行。

12. 集成的原理，为什么通过的模型结构训练数据，只是随机初始化不同，集成一般都会好？
    是一个模型优化的问题。模型 = 统计模型+数值优化。不同的随机初始，模型下降等路线可能不同，所以集成后，降低模型的偏移或方差，大数定理。

    

## <font face="黑体" color=green size=5>权重衰退（weight decay）</font>

1. 最常见的处理过拟合的方法，控制模型的容量（模型拟合函数的能力，模型复杂度），优化的是最小化的损失函数，在最小化的时候加入一个限制。
2. 通常不限制偏移b （限不限制都差不多）， 小的 Θ 意味着更强的正则项。
3. 限制分为硬性限制 Θ 和 柔性限制 (λ/2)*||w||^2 （L2范数），lambda一般不会选很大，常用的是 0.01，0.001，0.0001。
4. 可以直接加在损失函数里面，也可以加在 trainer（比如 SGD ）里面。
5. 加入正则相当于把 w 往小的拉。如果最优解的W就是比较大的数，那权重衰减是不是会有反作用？
   数据是有噪音的，这里通过拉格朗日乘子，相当于加了一个低通滤波器，过滤噪音。



## <font face="黑体" color=green size=5>Dropout</font>

1. 丢弃法：在层之间加入噪音，提高对扰动的鲁棒性，其实是正则（仅在训练中使用），影响的是模型参数的更新。丢弃的概率是控制模型复杂度的超参数。

2. 常用在多层感知机的隐藏层上，很少用在CNN 这类模型上。

3. 在用 BN  (batch normalization) 的时候,还有必要使用dropout吗?
   BN 是在卷积层用, dropout是在全连接层用, 两者之间关系不大.

4. 除子 (1-p)的存在是希望不改变期望: 训练的时候随机dropout了,但是因为除了比如0.5,相当于其他的神经元乘以了2, 所以输入和输出,方差是不会发生变化的.

5. dropout随机选几个自网络,做平均的做法, 类似于投票的思想, 但实际上更类似于一个正则项.

6. 在同样的learning rate 下, dropout 的介入会不会造成参数收敛更慢, 需要比没有dropout的情况下适当调大learning rate 吗?
   dropout 因为保持了期望不变, 所以一般不需要调大learning rate.

   

代码实现：

```python
import torch
from torch import nn
from d2l import torch as d2l

def dropout_layer(X, dropout):
    assert 0 <= dropout <= 1
    # 在本情况中，所有元素都被丢弃。
    if dropout == 1:
        return torch.zeros_like(X)
    # 在本情况中，所有元素都被保留。
    if dropout == 0:
        return X
    mask = (torch.Tensor(X.shape).uniform_(0, 1) > dropout).float()
    return mask * X / (1.0 - dropout)

num_inputs, num_outputs, num_hiddens1, num_hiddens2 = 784, 10, 256, 256

dropout1, dropout2 = 0.2, 0.5

class Net(nn.Module):
    def __init__(self, num_inputs, num_outputs, num_hiddens1, num_hiddens2,
                 is_training=True):
        super(Net, self).__init__()
        self.num_inputs = num_inputs
        self.training = is_training
        self.lin1 = nn.Linear(num_inputs, num_hiddens1)
        self.lin2 = nn.Linear(num_hiddens1, num_hiddens2)
        self.lin3 = nn.Linear(num_hiddens2, num_outputs)
        self.relu = nn.ReLU()

    def forward(self, X):
        H1 = self.relu(self.lin1(X.reshape((-1, self.num_inputs))))
        # 只有在训练模型时才使用dropout
        if self.training == True:
            # 在第一个全连接层之后添加一个dropout层
            H1 = dropout_layer(H1, dropout1)
        H2 = self.relu(self.lin2(H1))
        if self.training == True:
            # 在第二个全连接层之后添加一个dropout层
            H2 = dropout_layer(H2, dropout2)
        out = self.lin3(H2)
        return out

net = Net(num_inputs, num_outputs, num_hiddens1, num_hiddens2)

num_epochs, lr, batch_size = 10, 0.5, 256
loss = nn.CrossEntropyLoss()
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
trainer = torch.optim.SGD(net.parameters(), lr=lr)
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, trainer)
```



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

   