---
title: 动手学深度学习-学习笔记 I：P1-P14
categories: ML和时序分析
tags: [pytorch,ML,python]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

动手学深度学习 Pytorch 版直播课堂的 学习笔记，第一部分：环境安装和数据操作。

<!--more-->

# <font face="黑体" color=green size=5>环境安装</font>

我的虚拟机器是 centos7.7 版本, 用以下语句安装环境 :

```shell
yum check-update -y #列出所有可更新的软件清单并更新
sudo yum groupinstall "Development Tools" #开发者环境
wget https://www.python.org/ftp/python/3.8.1/Python-3.8.1.tgz #python3.8
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh #miniconda
bash 
pip install jupyter d2l #jupyter记事本和课程依赖的library
pip install torch torchvision -f https://download.pytorch.org/whl/torch_stable.html -i https://pypi.doubanio.com/simple #torch 和 torchvision, 今天豆瓣镜像最快。
sudo yum install zip unzip
wget https://zh-v2.d2l.ai/d2l-zh.zip#报错无法解析，修改DNS也不行。因此在本地机下载了教材拉到虚拟机。
ssh -L8888:localhost:8888 用户名@本地IP地址 #将远端jupyter notebook 8888 端口映射到本地8888端口
pip install rise #RISE allows you to instantly turn your Jupyter Notebooks into a slideshow. 
```

由于我的显卡在Windows机器上，Windows10 安装环境：

```shell
virtualenv   -p   D:/tools/Anaconda3/python.exe  D:/STUDY/deep_learning/env/DLENV #新建虚拟环境
virtualenv --system-site-packages  DLENV  #继承全局
cd  Scripts/
activate.bat 
pip install d2l 
pip install torch torchvision -f https://download.pytorch.org/whl/torch_stable.html -i https://pypi.doubanio.com/simple
```

# <font face="黑体" color=green size=5>数据操作</font>

1. 内存改写逻辑 (减轻内存负担，避免过度赋值)：

   ```python
   before = id(Y) #内存地址的十进制表达
   Y = Y+X 
   id(Y) == before # 输出False, 说明为新结果分配了内存。
   
   before = id(Y)
   Y[:]= X + Y
   id(Y) == before # 输出True，说明是执行的原地操作
   
   before = id(Y)
   Y += X
   id(Y) == before # 输出True，说明是执行的原地操作
   ```

2.  tensor、numpy、python数据类型之间的转换

   ```python
   a = torch.tensor([3.5])
   a #张量
   a.item() #get a Python number from a tensor containing a single value
   float(a) #python的浮点数
   int(a)
   ```

3. 常规的数据预处理： pd.get_dummies, fillna, tensor([array,number].values) 等

4. 注意python拷贝与视图之间的区别

   ```python
   # 1. 完全不拷贝
   a = np.arange(12)
   b = a            # 不会创建新的对象
   b is a           # a和b是同一个ndarray对象的两个名字，True
   b.shape = 3,4    # 也会改变a的形状
   a.shape #(3, 4)
   # 2. 不同的数组对象可以共享相同的数据。view方法会创建一个共享原数组数据的新的数组对象。如果数组A是数组B的视图(view)，则称B为A的base(除非B也是视图)。视图数组中的数据实际上保存在base数组中。
   c = a.view()
   c is a # False
   c.base is a                        # c is a view of the data owned by a， True
   a.flags.owndata                    # True
   c.flags.owndata                    # False
   # 3. 视图的形状改变，原地址的数据形状不会变。改变视图中元素，原地址的数据也会随之改变。
   c.shape = 2,6                      # a的形状并不随之改变
   a.shape
   (3, 4)
   c[0,4] = 1234                      # a的数据也会变
   a
   array([[   0,    1,    2,    3],
   [1234,    5,    6,    7],
   [   8,    9,   10,   11]])
   ```
   5. tensor 和 array 的区别： array 是一个计算机概念，tensor是数学上的概念。 torch 和 tensorflow 用的是数学上的概念，但在计算机使用上，两者其实没有什么区别。
   6. 是否可以用 jax 替代 numpy： 可以，jax 是 google 做的另一个框架，和numpy 很像，但还不够成熟，和tensorflow的团队是隔壁团队。

# <font face="黑体" color=green size=5>线性代数</font>

1. 矩阵的内积与外积（矩阵乘法）：矩阵的内积指的是矩阵点乘，即矩阵的对应元素相乘； 矩阵的外积指的是矩阵的叉乘，即矩阵相乘，比如C=A*B，则A的列数要与B的行数一致，例如A为[m,n]， B 为[n,k]， 则C为[m,k]。

2. Frobenius 范数：可以理解为将矩阵拉成一维向量，具体就是矩阵的每个元素的平方和的开方。

3. 正交矩阵： 正交矩阵（Orthogonal Matrix）是指其转置等于其逆的矩阵。几何意义是行向量和列向量皆为正交的单位向量。
   ![知乎_渔非鱼_正交矩阵](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-04-22-Dive_into_Deep_Learning_study_notes_I/orthogo_matrix.PNG)

   # <font face="黑体" color=blue size=5> Q&A </font>

4.  One-hot 转换后，矩阵很稀疏的影响：
   如果label本身是有關係的話 (如大, 中, 小這種有程度只分的), onehot就會消去了這種關係; 
**如果以dense matrix來保存的話會耗內存, 以sparse matrix方式儲存則減少很多, 而由於sparse matrix計算時可以skip 0的計算, 轉換後對計算速度應該沒有太大影響。“**
   
   + *In practice, we actually usually run out of space before we run out of time. If we have 16 GB of memory, the biggest matrix we can store (each number requires 8 bytes) is 8n^2 = 16 * 10 ^9 = 4000 * 4000. 
   + The saving grace is that most really large matrices are sparse = mostly zeros (or have some other special structure with similar consequences). Yon only have to store the nonzero entries, and you can multiply matrix * vector quickly (you can skip zeros). In Julia, there are many functions to work with sparse matrices by only storing the nonzero elements. 
   + The simplest one is the sparse function. Given a matrix A, the sparse(A) function creates a special data structure that only stores the nonzero entries, and you can multiply matrix * vector quickly (you can skip the zeros)。**
   
5. copy 和 clone 的区别： copy 分深度和浅度，clone 一定会复制内存。

# <font face="黑体" color=green size=5>矩阵计算 </font>

1. 求导：  (fg)' = f'g + fg'、链式法则、不可微函数的导数：雅可比符号分情况讨论。

2. 将导数拓展到向量： **x**，**y** 都是向量的话，将 **y** 对 **x** 求导，导数是一个矩阵。  

3.  对x的norm求导，是 2*X的转置。

4. 分子（或分母）的布局矩阵。

   # <font face="黑体" color=blue size=5>Q&A </font>

5. 导数的作用是进行梯度下降，容易陷入局部最优解。如果损失函数不是一个凸函数，理论上是很难拿到全局最优解的。

# <font face="黑体" color=green size=5>自动求导 </font>

1. 链式法则对线性回归损失函数求导，正向累积（由底到顶）和反向累积（又称反向传递，由顶到底）。
   正向累积和反向累积的对比（假设神经网络有 n 层）：
   a. 计算复杂度：类似， 都是 O(n) 。
   b. 内存复杂度： 反向传播 O(n),  因为需要存储正向的所有结果。 正向累积的好处是它的内存复杂度是O(1)，因为它不需要保存任何的结果，但是在神经网络里面计算一个变量的梯度仍然要都扫一遍。

2. 计算图： a. 将代码（比如损失函数表达式）分解成操作子  b. 将计算表示成一个无环图。 
   显式构造： Tensorflow / Theano / MXNet
   隐式构造： PyTorch / MXNet 

3. 样例：

   ```python
   import torch 
   x = torch.arange(4.0,requires_grad_=True) # requires_grad_ :  需要有一个地方保存梯度
   y = 2 * torch.dot(x,x)
   y.backward() # 调用反向传播函数来自定计算y关于x每个分量的梯度。
   # 在默认情况下，PyTorch 会累积梯度，我们需要清除之前的值
   x.grad.zeros_()
   y = x.sum()
   y.backward() # 对 sum 求导 梯度都是1
   # 对非标量调用backward需要传入一个gradient参数，该参数指微分函数
   x.grad.zeros_()
   y = x * x
   # 等价于 y.backward(torch.ones(len(x)))
   y.sum().backward() # 在机器学习中，一般很少对一个向量的函数求导。
   ```

4. 将某些计算移动到记录的计算图之外：

   ```python
   x.grad.zero_()
   y = x * x
   u = y.detach() # detach: 返回一个新的tensor，从当前计算图中分离下来的，但是仍指向原变量的存放位置,不同之处只是requires_grad为false，得到的这个tensor永远不需要计算其梯度，不具有grad。即使之后重新将它的requires_grad置为true,它也不会具有梯度grad。用于固定网络参数。
   z = u * x # z 是新tensor，是 u 和关于 x 的函数。
   z.sum().backward()
   x.grad == u # True
   ```

   # <font face="黑体" color=blue size=5>Q&A </font>

   1. 为什么Pytorch会默认累积梯度：
      对一个比较大的批量，如果计算时候内存不足时，就把一个大批量切成几块，将梯度累加起来。也可以用在将multi-modality中，单个计算然后累加。多个损失函数分别反向的时候也需要累加梯度。
   2.  循环神经网络损失函数的求导可以是一个有向的环状图结构，但一般也展开为树状结构表达。
   3. Pytorch 和 Mxnet 框架实现矢量（高阶求导），比如XGBoost损失函数中的二阶优化算法，但通常比较慢。

# <font face="黑体" color=green size=5>参考资料</font>

1.  教材/课程预告官方:
    [https://zh-v2.d2l.ai/](https://www.google.com/url?q=https://zh-v2.d2l.ai/&sa=D&source=calendar&usd=2&usg=AOvVaw3Kh-CordDCnX3_aymBzG3g)
2.  课程主页:
    [https://courses.d2l.ai/zh-v2/](https://www.google.com/url?q=https://courses.d2l.ai/zh-v2/&sa=D&source=calendar&usd=2&usg=AOvVaw2fjME29Jd9xf4KAHyFt9uL)
3.  课程论坛讨论:
    [https://discuss.d2l.ai/c/16](https://www.google.com/url?q=https://discuss.d2l.ai/c/16&sa=D&source=calendar&usd=2&usg=AOvVaw1lejTFWPDzn3seqYkDYi9e)
4.  Pytorch论坛:
    [https://discuss.pytorch.org](https://www.google.com/url?q=https://discuss.pytorch.org&sa=D&source=calendar&usd=2&usg=AOvVaw0eS7VBGxeTdoKNb6xLWz5G)
5.  Python 拷贝和视图之间的区别： 
    https://blog.csdn.net/qq_29007291/article/details/80542336
6.  正交矩阵：
    https://zhuanlan.zhihu.com/p/34897603
7.  pytorch的两个函数 .detach() .detach_() 的作用和区别：
    https://blog.csdn.net/qq_27825451/article/details/95498211

