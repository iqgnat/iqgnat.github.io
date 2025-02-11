---
title: Machine Learning 经验与笔记
categories: 算法模型
tags: [算法]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

这篇笔记结合过去的工作经验对AI模型的知识体系做总结。

<!--more-->

## 1. 有监督学习: 输入与输出之间的映射关系

### 线性回归

1. **线性回归**（Linear Regression）：预测连续变量的值，通过最小化误差平方和来拟合直线。

2. **逻辑回归**（Logistic Regression）/ 多分类（Multiclass Classification）：分类问题，通过估计事件发生的概率来进行分类。

   ![01](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/01.png)



   ### 神经网络

   1. **神经网络**（Neural Networks）：通过网络结构进行分类和回归，利用反向传播算法和梯度下降优化权重。它能够处理复杂的非线性关系，但训练过程通常较慢且需要大量数据。

      ![02](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/02.png)

      ![05](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/05.png)

      

   ###  树集成

   1. 决策树（Decision Trees）：单棵树，通过分裂节点来构建，通过(最大化)信息增益(ID3)或信息增益比(C4.5)或(最小化)基尼系数(CART)作为损失函数来选择最佳的分裂点，特别适合处理非线性数据和复杂决策过程，但对于复杂数据和过拟合敏感。为什么不是用 损失函数的减少量作为直接的优化目标？

         1. 易于理解和解释；
         2. 通过一些标准（如信息增益、基尼系数等）来选择最优的特征和分裂点，而不是直接使用最大损失函数的减少量，旨在最大化节点的纯度或减少不纯度，以便在整体上提高预测的准确性；
         3. 不涉及负梯度计算，减少计算量。

   2. 随机森林（Random Forest）：用了随机特征选择和Bagging(Bootstrap Aggregating)的思想，多棵决策树的集成，每棵树独立训练，通过投票或平均结果来决定最终输出。通常使用基尼系数作为衡量分裂质量的指标。易于理解和解释，但对于复杂数据和过拟合敏感。

   3. 传统GBDT算法：每个特征选择和树的分裂依据是损失函数的负梯度（损失函数的减少量），适用于需要连续优化和更高预测精度的场景。每棵树都在前一棵树的残差上串行进行训练，也就是当前模型的残差或者梯度。

      ![14](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/14.png)

   4. **XGBoost**：XGBoost引入了直方图优化和近似算法，通过预先对特征进行分桶并计算直方图统计量来加速节点分裂的计算过程。对比决策树和gbdt，还有以下不同之处：

         1. 正则化：XGBoost引入了正则化项来控制模型的复杂度，防止过拟合，这使得XGBoost在训练过程中更加稳健和高效

         2. 使用一阶和二阶导数来选择最优的分裂点(子节点的纯度提升)，增强了模型的准确性和效率。

               1. 引入了海森矩阵的二阶泰勒展开可以更准确地逼近损失函数，特别是在损失函数曲率较大的地方，提供了比一阶泰勒展开更精确的近似。
               2. 能够更快速地找到损失函数的最优解。通过同时利用一阶和二阶导数，算法可以更智能地调整每一步的学习率和树的结构
               3. 虽然二阶泰勒展开增加了一些计算复杂性，但相比直接优化原始损失函数，它的计算效率仍然是可接受的，并且在实际应用中带来了显著的优化效果。

            ![13](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/13.png)

      3. 采用了一种更高效的分裂节点策略。基于梯度的直方图算法，其中每个特征都被分成固定数量的bins，对于每个特征，在构建树的过程中，它会计算每个bin的梯度统计量（如梯度的和与平方和)，而不是对每个可能的分裂点都进行计算。这种方法能够有效地处理数据，并允许并行构建每棵树的不同节点，同时保持了模型的预测性能。
      4. 支持并行处理。
         1. 并行处理不同的特征：将数据存储为列块，不同的特征列可以并行加载和处理。每个特征列的分裂节点选择过程也可以并行进行，这样在构建每棵树时可以同时处理多个节点.
         2. 并行生成多棵决策树。在单棵树的生成过程中，并行化处理不同的训练实例以及特征分裂点的选择，以加速模型的训练过程。每棵树的训练目标是最小化前一棵树预测值与真实值之间的残差，但每棵树的训练不依赖于前一棵树的残差，而是通过连续地优化每棵树的结构和参数，逐步改善模型的整体性能，使得每棵树的构建不需要等待前一棵树完全构建完成，从而实现了高效的并行训练。
            ![12](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/12.png)
      5. 具有对缺失值的处理功能：XGBoost会将missing该特征值的样本分别分配到左叶子结点和右叶子结点的两种情形， 计算增益(Gain)后，选择增益大的方向进行分裂。 如果在预测中出现缺失，那么会自动将缺失值的划分方向放到右子树。

      

   5. **LightGBM**：与XGBoost类似，但利用直方图做梯度的全局加权，优化梯度提升过程。加速了训练过程，特别适合大规模数据集。



树算法关键点总结：

![03](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/03.png)

   

   在最新的课程中，不再有以下算法的内容了。在以往工作中，除了支持向量机偶尔用到（核函数的计算、核矩阵的存储非常消耗资源），它们的表现也更偏向理论。

   7. K-近邻算法（K-Nearest Neighbors, KNN）：通过计算新数据点与训练集中每个数据点的距离来进行分类。分类时，它会计算预测点与所有训练样本之间的距离。常用的距离度量方法包括欧式距离、曼哈顿距离、闵可夫斯基距离等，用于衡量样本间的相似性。

   8.  朴素贝叶斯（Naive Bayes）：基于贝叶斯定理和特征之间的独立假设，用于分类问题

   9. 支持向量机（Support Vector Machine, SVM）：用于二分类和回归分析的机器学习模型，其原理基于找到一个能够最大化两类数据之间间隔（margin）的超平面来进行分类，使用凸优化，包括梯度下降等方法来优化支持向量的选择。

      

   

## 2. 无监督学习：发现数据中的模式和结构

### 异常检测

当数据集数量很小时， 尤其是异常标签的数量，这可能是最好的选择，也更适合于发现新的不同于过去以往的异常点。适合用在反作弊、反洗钱、反欺诈等前所未有的、推陈出新的黑灰产手段进行预防。如果标签多些（尤其是正样本) ，可以使用交叉验证的手段，对模型进行F1评估。 相比之下，如果有更多的正面和负面样本，那么监督学习可能更适用。

+ 基于模型

  ​	**孤立森林** 

  ​	通过随机选择特征和随机划分来构建多棵决策树。异常点通常距离其他点较远，因此在随机分割过程中，它们会更早地被分离出来，路径较短。通过计算数据点到达叶子节点的平均路径长度来识别异常点，路径长度越短的点被认为越可能是异常点。

  ![06](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/06.png)

+ 基于统计
  1. **参数估计**: 基于假设数据服从某种已知分布（如正态分布），通过估计分布的参数（如均值和方差）来推断数据的概率密度
  2.  直方图、核密度估计等

+ 基于距离

  1. LOF：计算局部密度差异，局部密度较低的点被视为异常点
  2. K-means： 通过聚类分析，距离聚类中心较远的点被视为异常点

+ 基于密度

  ​	DBSCAN (density-based clustering non-parametric algorithm): 基于密度的聚类算法，可以自动识别出异常点

+ 基于神经网络

  1. 自编码器（Autoencoder）: 利用重建误差来判断数据点是否为异常点
  2. 变分自编码器（Variational Autoencoder, VAE）: 通过学习数据的潜在分布来检测异常点

+ 基于时间序列

  

### 聚类	

+ **K-Means**
  ![04](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/04.png)

+ Hierarchical Clustering： 层次聚类适用于不同规模和结构的数据集，能够生成层级结构的聚类结果，提供了对数据集内部结构的多层次理解和描述。自底向上（凝聚性），从每个数据点作为一个单独的类开始，逐步合并最接近的类，直到所有数据点都在一个类中。合并过程通过计算类之间的距离或相似度来完成。

+ DBSCAN: 是一种基于密度的聚类算法。它不需要预先指定聚类的数量，而是根据数据的密度分布自动识别聚类，适用于不规则形状和不同密度分布的数据集。

  + 核心点的定义：对于每个数据点 p，计算其ε-邻域内的点的数量。如果这个数量大于等于预设的minPts，则 p 是一个核心点

  + 边界点的定义：对于每个不是核心点的点，如果它位于某个核心点的ε-邻域内，则它是一个边界点

  + 噪声点：既不是核心点也不是边界点的点

    

### 降维

+ PCA： 过线性变换将高维数据投影到低维空间，同时保留尽可能多的数据变异信息。认为特征是由 k 个正交的特征（也可看作是隐含因子）生成的。更适合用来降维。

![07](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/07.png)

+ ICA: 认为样本数据由独立非高斯分布的隐含因子产生，隐含因子个数等于特征数。更适合用来还原信号（因为信号比较有规律，经常不是高斯分布的）。

  

### 关联规则挖掘

​	Apriori: 基于频繁项集的发现。其工作流程包括两个主要步骤：扫描数据集来确定频繁项集的支持度；然后，利用频繁项集生成候选项集，进而找出频繁的关联规则。关键原理是利用先验知识，即如果一个项集是频繁的，则它的所有子集也必定是频繁的。常用于： 推荐系统、 购物篮组合推断偏好、异常行为模式检测。目前还没在工作中实际用到。





## 3. 图论算法

### **社区发现** 

​	通过最大化模块度（Modularity）来进行社区划分。通过不断优化模块度，使社区划分逐步趋于最优。算法复杂度较低，适合大规模网络的社区发现。关联关系可以是转账交易、设备号这种强关联，也可以是ip、ssid、bssid 这种较弱的关联，或是对行为进行图模型构建，比如广告点击、设备激活。常用cylouvain库实现。

![09](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/09.png)

![10](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/10.png)



### **关联子图**

关联子图常用于分析用户和广告之间的关系，比如点击行为、激活行为，也可以是用户的属性特征，比如IP、安装列表等。对于团伙的挖掘，常可以去到二度ip-user、三度的did-user的关联关系。可以是别复杂的作弊行为，比如多个用户之间互相点击对方推荐的广告，群体性刷点击行为。常用 NetworkX库实现。



### **标签传播算法（Label Propagation Algorithm）** 

​	通过构建图结构，将少量标注数据的标签传播给未标注数据，利用图的连通性来提高标注数据的覆盖范围。每个节点初始时被赋予一个唯一的标签。通过迭代，每个节点将其标签更新为邻居节点中出现最频繁的标签。这个过程重复进行，直到达到收敛条件（通常是达到最大迭代次数或标签变化不再变化为止）。

![11](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/11.png)

**PageRank**

在洗钱团伙挖掘中，效果显著。PageRank算法通过分析网页之间的链接数量和质量来判断网页的可信度。作弊网站往往通过创建大量垃圾链接来提升自己的排名，而PageRank可以通过识别这些异常的链接模式来降低这些网站的权重。而这个特性也适用于AML。

![15](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/15.png)



##     4. 半监督学习

**PU learning**：在反洗钱工作中尝试过，效果输于孤立森林。

​	只有正样本和未标记数据，没有明确的负样本。其核心思想是从未标记数据中识别潜在的负样本，最终实现二分类任务。目的是从未标记数据中识别出负样本。通过初始分类器对未标记数据进行分类，从而训练出更准确的模型来区分正样本和未标记样本。可用于正样本很少的、或新手段的反洗钱、反作弊业务。（PU learning 主要处理包含正样本和未标记样本的数据集，旨在从未标记样本中识别出正样本。DBSCAN 则用于将未标记的数据进行聚类，识别密度较高的区域，并将密度较低的点视为噪声）

​	使用贝叶斯方法或假设生成模型来估计正样本概率。根据估计的概率，从未标记样本中生成假负样本。使用正样本和生成的假负样本训练分类器。使用正样本和生成的假负样本训练分类器。迭代更新生成的假负样本，直到分类器性能收敛。

![08](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-07-12-Machine-Learning-Specialization-Review/08.png)



自训练（Self-training）

​	通常有一部分正负样本的标记数据和大量未标记数据。目的是提高模型的准确性和泛化能力。通过使用初始模型对未标记数据进行预测，并将高置信度的预测结果作为新的训练数据进行训练。

