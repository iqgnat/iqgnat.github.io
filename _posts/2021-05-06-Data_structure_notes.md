---
title: 数据结构 学习笔记
categories: 开发随笔
tags: [数据结构,java,c,python]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

“ 数据结构是计算机存储、组织数据的方式。数据结构是指相互之间存在一种或多种特定关系的数据元素的集合。通常情况下，精心选择的数据结构可以带来更高的运行或者存储效率。数据结构往往同高效的检索算法和索引技术有关。“   结合教材，通过 java 和 c 来理解数据结构，并尝试自己用 python 实现其中逻辑。

<!--more-->

> ”Java 替你做了太多事情，那么多动不动还支持范型的容器类，加上垃圾收集，会让你觉得编程很容易。但你有没有想过，那些容器类是怎么来的，以及它存在的意义是什么？最粗浅的，比如 ArrayList 这个类，你想过它的存在是多么大的福利吗——一个可以随机访问、自动增加容量的数组，这种东西 C 是没有的，要自己实现。但是，具体怎么实现呢？如果你对这种问题感兴趣，那数据结构是一定要看的。甚至，面向对象编程范式本身，就是个数据结构问题：怎么才能把数据和操作数据的方法封装到一起，来造出 class / prototype 这种东西？“ 

# <font face="黑体" color=green size=5>思维导图</font>

[数据结构思维导图下载](https://github.com/iqgnat/iqgnat.github.io/blob/master/assets/images/2021-05-06-Data_structure_notes/data_structure.png)
概览：

![data_structure](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-05-06-Data_structure_notes/data_structure.svg)

# <font face="黑体" color=green size=5>Python实现二叉树层次遍历</font>

```python
#please complete the function to fill all nextCousin fields in tree starting from root
'''
			0->None
           / \
          1 ->2->None
         / \   \
        b ->4-> 5->None
         \       \
          a   ->  7->None
'''

class Node(object):
  def __init__(self, left=None, right=None):
    #given/constants/you don't change
    self.leftChild  = left
    self.rightChild = right
    #new field for you to fill in
    self.nextCousin = None

    
def fillChildLevelNextCousin(firstNodeParentLevel)
  #input: first node of parent level
  #return: first node of child level
  #action: assume parent level is already connected, connect the child level
  store_list = []
  while firstNodeParentLevel != None:
    # store_list.append(firstNodeParentLevel)
    if firstNodeParentLevel.leftChild != None:
      store_list.append(firstNodeParentLevel.leftChild)
    if firstNodeParentLevel.rightChild != None:
      store_list.append(firstNodeParentLevel.rightChild)
    firstNodeParentLevel = firstNodeParentLevel.nextCousin
  
  if store_list is not None :
    for idx, item in enumerate(store_list):
      if idx < len(store_list):
          item.nextCousin = store_list[idx + 1]
  	return  store_list[0]
  else:
    return  None
  
def fillNextCousinFieldsInTree(root):
  while root:
	fillChildLevelNextCousin(root)
```



# <font face="黑体" color=green size=5>工作中的应用场景</font>

1. 数据库 : b+树、b-树

2. 数据库：hashmap（拉链表）

3. 数据库：groupby

   

# <font face="黑体" color=green size=5>参考资料</font>

1.   《数据结构（java）版》，吕云翔著
2.   《数据结构（c）版》，舒后著
3.   《算法（第4版）》, Robert-Sedgewick
4.   https://baike.baidu.com/item/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/1450
5.   关于java实现数据结构的对理解上的弊端：涛吴 https://www.zhihu.com/question/20012022
6.   java中的数据结构：https://www.zhihu.com/question/432497073
7.   串和线性表区别：https://zhidao.baidu.com/question/1674244328861196227.html
8.   KMP 算法讲解：https://www.youtube.com/watch?v=dgPabAsTFa8
9.   数据结构和算法入门 (图灵星球) : https://www.youtube.com/watch?v=hkwi2rQlPak&list=PLV5qT67glKSGFkKRDyuMfwcL-hwXOc4q_
10.   哈夫曼树和哈夫曼编码：https://www.youtube.com/watch?v=YgQtRCwGM7w
11.   堆是一类特殊的树：https://www.zhihu.com/question/36134980
12.   最小生成树 Kruskal 算法： https://www.youtube.com/watch?v=myGFf5rJmXI
13.   单源最短路径 BF 算法 https://www.bilibili.com/video/av48431327/
14.   希尔排序：https://www.youtube.com/watch?v=PnxGnuItVuE
15.   快速排序：https://www.bilibili.com/video/BV1at411T75o/?spm_id_from=333.788.recommend_more_video.-1
16.   堆排序：https://www.bilibili.com/video/av47196993/
17.   归并排序：https://www.bilibili.com/video/av9982752/
18.   排序算法的稳定性：https://zhuanlan.zhihu.com/p/116046849
19.   分块查找：https://www.bilibili.com/video/BV1Kz4y1R7S6?from=search&seid=7021483156397440648
20.   二叉排序树：https://open.163.com/newview/movie/free?pid=PFAHE8UDG&mid=EFAHF3OER
21.   平衡二叉树：https://www.bilibili.com/video/av88899370/
22.   B- 树、B+ 树，已经它们为何常用在数据库中：https://www.bilibili.com/video/av795374861/， https://www.bilibili.com/video/av74822487/，https://cloud.tencent.com/developer/article/1543335
23.   哈希表：https://blog.csdn.net/u011080472/article/details/51177412、https://www.youtube.com/watch?v=YRc8q9ZhnYE

  

