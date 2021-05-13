---
title: Dive into Deep Learning II：线性回归和基础优化算法，Softmax回归和损失函数 
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

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第二部分：线性回归和基础优化算法，Softmax回归和损失函数。

<!--more-->

# <font face="黑体" color=green size=5>线性回归</font>

1. 线性模型可以看作是一个单层的神经网络（是哦！），有显式解（analytical solution)，（在实际应用中，很难有解析解） 。  
2. 视频中对 **w*** 的求解结果应该为： inverse((tranpose(X)*X) ✖ tranpose(X)  ✖ y

# <font face="黑体" color=green size=5>基础优化算法</font>

4. 梯度下降和小批量随机梯度下降等相关下降算法，不需要知道显式解，通过不断沿着反梯度方向更新参数，是深度学习的默认求解算法。

5. torch.no_grad() 是一个上下文管理器，用来禁止梯度的计算，通常用来网络推断中，它可以减少计算内存的使用量。
   线性回归实现的 torch 代码样例：

   ```python
   %matplotlib inline
   import random
   from mxnet import autograd, np, npx
   from d2l import mxnet as d2l
   npx.set_np()
   # 函数：样例数据生成
   def synthetic_data(w, b, num_examples): #@save
       """⽣成 y = Xw + b + 噪声。"""
       X = np.random.normal(0, 1, (num_examples, len(w)))
       y = np.dot(X, w) + b y += np.random.normal(0, 0.01, y.shape)
       return X, y.reshape((-1, 1))
   # 函数：小批量随机梯度下降之小批量选取
   def data_iter(batch_size, features, labels):
       num_examples = len(features)
       indices = list(range(num_examples))
       # 这些样本是随机读取的，没有特定的顺序
       random.shuffle(indices)
       for i in range(0, num_examples, batch_size):
           batch_indices = np.array(indices[i:min(i + batch_size, num_examples)])
           yield features[batch_indices], labels[batch_indices]
   # 函数：定义模型
   def linreg(X, w, b): #@save
       """线性回归模型。"""
       return np.dot(X, w) + b
   #函数：定义损失函数
   def squared_loss(y_hat, y): #@save
       """均⽅损失。"""
       return (y_hat - y.reshape(y_hat.shape))**2 / 2
   #函数：定义优化算法
   def sgd(params, lr, batch_size): #@save
       """⼩批量随机梯度下降。"""
       for param in params:
           param[:] = param - lr * param.grad / batch_size
   #定义样例
   true_w = np.array([2, -3.4])
   true_b = 4.2
   features, labels = synthetic_data(true_w, true_b, 1000)
   batch_size = 10
   #初始化模型参数
   w = np.random.normal(0, 0.01, (2, 1))
   b = np.zeros(1) w.attach_grad()
   b.attach_grad()
   #开始模型训练
   lr = 0.03
   num_epochs = 3
   net = linreg
   loss = squared_loss
   for epoch in range(num_epochs):
       for X, y in data_iter(batch_size, features, labels):
           with autograd.record():
           	l = loss(net(X, w, b), y) # `X`和`y`的⼩批量损失
           # 计算l关于[`w`, `b`]的 梯度
           l.backward()
           sgd([w, b], lr, batch_size) # 使⽤参数的梯度更新参数
       train_l = loss(net(features, w, b), labels)
       print(f'epoch {epoch + 1}, loss {float(train_l.mean()):f}')
   ```

   读取数据、使用框架预定好的层、损失函数、优化算法 部分可以调用框架中现有的API：

   ```python
   import numpy as np
   import torch
   from torch.utils import data
   from d2l import torch as d2l
   from torch import nn
   
   def load_array(data_arrays, batch_size, is_train=True):  #@save
       """构造一个PyTorch数据迭代器。"""
       dataset = data.TensorDataset(*data_arrays)
       return data.DataLoader(dataset, batch_size, shuffle=is_train)
   
   true_w = torch.tensor([2, -3.4])
   true_b = 4.2
   features, labels = d2l.synthetic_data(true_w, true_b, 1000)
   batch_size = 10
   data_iter = load_array((features, labels), batch_size)
   net = nn.Sequential(nn.Linear(2, 1))
   #初始化模型参数
   net[0].weight.data.normal_(0, 0.01)
   net[0].bias.data.fill_(0)
   #定义损失函数
   loss = nn.MSELoss()
   #模型训练
   num_epochs = 3
   for epoch in range(num_epochs):
       for X, y in data_iter:
           l = loss(net(X), y)
           trainer.zero_grad()
           l.backward()
           trainer.step()
       l = loss(net(features), labels)
       print(f'epoch {epoch + 1}, loss {l:f}')
       
   w = net[0].weight.data
   print('w的估计误差：', true_w - w.reshape(true_w.shape))
   b = net[0].bias.data
   print('b的估计误差：', true_b - b)
   ```

   # <font face="黑体" color=blue size=5>Q&A </font>

   1. 为什么用平方损失而不是绝对差值： 主要考虑到平方损失处处可导。
   2. batchsize是否会最终影响模型结果： 理论上来说，随机梯度下降带来了噪音，每一次采样的样本越小，带来的噪音越多，因为和真实的方向差很远。但噪音对神经网络来说不一定是坏事，因为深度神经网络太复杂。 
   3. 为什么机器学习优化算法都采取梯度下降（一阶导算法），而不采用牛顿法（二阶导算法），收敛速度更快： 首先，二阶导很难算，不一定能求出（一阶导是个向量，二阶导是个梯度）且代价高（ 即使有算法可以近似）；其次，收敛不一定快，结果不一定好；再者，收敛速度不是最主要的考虑，机器学习的算法更多考虑是最优解（收敛到哪个地方），真实的损失函数是个复杂的平面，更依赖损失函数和优化算法的定义。收敛速度快不一定模型的泛化性更好。
   4. 使用生成器生成数据的优势：yield不需要把每一个batch生成好，调一次才run一遍。

# <font face="黑体" color=green size=5>Softmax回归</font>

1. softmax回归是一个多类分类模型。与线性回归⼀样，softmax回归也是⼀个单层神经⽹络。由于计算每个输出*o*1、*o*2和*o*3取决于所有输⼊*x*1、*x*2、*x*3和*x*4，所以softmax回归的输出层也是全连接层。

2. 使用softmax操作子得到每个类的预测置信度，使用交叉熵来衡量预测和标号的区别。

3. 匹配比例：概率 y 和 y hat 的区别作为损失， y hat = softmax(O)。损失函数：使用交叉熵衡量不同概率的区别，将它作为损失函数。

4. 损失函数： L2、 L1、Huber's Robust Loss：当预测值和真实值差别较大则使用绝对值误差，当预测值和真实值比较近的时候用均方误差、交叉熵损失。

5. Softmax 实现的 torch 代码样例：

   ```python
   import torch
   from IPython import display
   from d2l import torch as d2l
   #定义softmax
   def softmax(X):
       X_exp = torch.exp(X)
       partition = X_exp.sum(1, keepdim=True)
       return X_exp / partition  # 这里应用了广播机制
   #定义模型
   def net(X):
       return softmax(torch.matmul(X.reshape((-1, W.shape[0])), W) + b)
   #定义损失函数
   def cross_entropy(y_hat, y):
       return -torch.log(y_hat[range(len(y_hat)), y])
   #定义分类准确率
   def evaluate_accuracy(net, data_iter):  #@save
       """计算在指定数据集上模型的精度。"""
       if isinstance(net, torch.nn.Module):
           net.eval()  # 将模型设置为评估模式
       metric = Accumulator(2)  # 正确预测数、预测总数
       for X, y in data_iter:
           metric.add(accuracy(net(X), y), y.numel())
       return metric[0] / metric[1]      
   
   def train_epoch_ch3(net, train_iter, loss, updater):  #@save
       """训练模型一个迭代周期（定义见第3章）。"""
       # 将模型设置为训练模式
       if isinstance(net, torch.nn.Module):
           net.train()
       # 训练损失总和、训练准确度总和、样本数
       metric = Accumulator(3)
       for X, y in train_iter:
           # 计算梯度并更新参数
           y_hat = net(X)
           l = loss(y_hat, y)
           if isinstance(updater, torch.optim.Optimizer): #如果updater是pytorch的optimizator
               # 使用PyTorch内置的优化器和损失函数
               updater.zero_grad()
               l.backward()
               updater.step()
               metric.add(
                   float(l) * len(y), accuracy(y_hat, y),
                   y.size().numel())
           else:
               # 使用PyTorch内置的优化器和损失函数
               l.sum().backward()
               updater(X.shape[0])
               metric.add(float(l.sum()), accuracy(y_hat, y), y.numel())
       # 返回训练损失和训练准确率
       return metric[0] / metric[2], metric[1] / metric[2]
   
   def train_ch3(net, train_iter, test_iter, loss, num_epochs, updater):  #@save
       """训练模型（定义见第3章）。"""
       animator = Animator(xlabel='epoch', xlim=[1, num_epochs], ylim=[0.3, 0.9],
                           legend=['train loss', 'train acc', 'test acc'])
       for epoch in range(num_epochs):
           train_metrics = train_epoch_ch3(net, train_iter, loss, updater)
           test_acc = evaluate_accuracy(net, test_iter)
           animator.add(epoch + 1, train_metrics + (test_acc,))
       train_loss, train_acc = train_metrics
       assert train_loss < 0.5, train_loss
       assert train_acc <= 1 and train_acc > 0.7, train_acc
       assert test_acc <= 1 and test_acc > 0.7, test_acc
   #以随机梯度下降作为updater
   def updater(batch_size):
       return d2l.sgd([W, b], lr, batch_size)
   
   #初始化模型参数
   batch_size = 256
   train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
   lr = 0.1
   num_epochs = 10
   train_ch3(net, train_iter, test_iter, cross_entropy, num_epochs, updater)
   ```

   # <font face="黑体" color=blue size=5>Q&A </font>

   1. softlabel : softmax很难去拟合0，1。 因此，将正确的设定为 0.9，错误的设定为 0.1。
   2. softmax和logistic回归分析的区别： 一个是多分类，一个是二分类。 logistic 是 softmax的 特例。
   3. 为什么用交叉熵，不用相对熵、互信息等其他基于信息量的度量： 交叉熵比较好算。
   4. 最小化损失函数就是最大化似然函数（找到最可能的分布）。

# <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
    
2.  课程主页:
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
    
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
    
4. 课件：
   https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html

5. Pytorch论坛:
   [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)

6. %matplotlib inline: 
   https://stackoverflow.com/questions/43027980/purpose-of-matplotlib-inline

7. torch.no_grad:
   https://pytorch.org/docs/stable/generated/torch.no_grad.html

8. 交叉熵和相对熵：
   https://blog.csdn.net/tsyccnh/article/details/79163834

   