---
title: 数据结构-I
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

## <font face="黑体" color=green size=5>思维导图</font>


概览（点击下载）：

[![data_structure.png](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-05-06-Data_structure_notes/data_structure.png)](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-05-06-Data_structure_notes/data_structure.png)

## <font face="黑体" color=green size=5>Python实现二叉树层次遍历</font>

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



## <font face="黑体" color=green size=5>排序算法的python实现</font>

```python
# 不稳定的排序方法： 选择、希尔、快速、堆
# 冒泡排序：每次两两比较
def bubbleSort(nums):
    for i in range(len(nums) - 1):  # 遍历 len(nums)-1 次
        for j in range(len(nums) - i - 1):  # 已排好序的部分不用再次遍历
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j + 1], nums[j]  # Python 交换两个数不用中间变量
    return nums


# 选择排序：每次遍历选择最小的数交换
def selectionSort(nums):
    for i in range(len(nums) - 1):  # 遍历 len(nums)-1 次
        minIndex = i
        for j in range(i + 1, len(nums)):
            if nums[j] < nums[minIndex]:  # 更新最小值索引
                minIndex = j
        nums[i], nums[minIndex] = nums[minIndex], nums[i]  # 把最小数交换到前面
    return nums


# 插入排序：整理牌，把比当前大的值向后移动
def insertionSort(nums):
    for i in range(len(nums) - 1):  # 遍历 len(nums)-1 次
        curNum, preIndex = nums[i + 1], i  # curNum 保存当前待插入的数
        while preIndex >= 0 and curNum < nums[preIndex]:  # 将比 curNum 大的元素向后移动
            nums[preIndex + 1] = nums[preIndex]
            preIndex -= 1
        nums[preIndex + 1] = curNum  # 待插入的数的正确位置
    return nums


# 希尔排序：自己设定几个增量(动态间隔， robert 提出)，和插入排序的区别：优先比较距离较远的元素
def shellSort(nums):
    lens = len(nums)
    gap = 1
    while gap < lens // 3:  #地板除
        gap = gap * 3 + 1  # 动态定义间隔序列
    while gap > 0:
        for i in range(gap, lens):
            curNum, preIndex = nums[i], i - gap  # curNum 保存当前待插入的数
            while preIndex >= 0 and curNum < nums[preIndex]:
                nums[preIndex + gap] = nums[preIndex]  # 将比 curNum 大的元素向后移动
                preIndex -= gap
            nums[preIndex + gap] = curNum  # 待插入的数的正确位置
        gap //= 3  # 下一个动态间隔
    return nums


# 归并排序（分治法）
def mergeSort(nums):
    # 归并过程
    def merge(left, right):
        result = []  # 保存归并后的结果
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result = result + left[i:] + right[j:]  # 剩余的元素直接添加到末尾
        return result

    # 递归过程
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = mergeSort(nums[:mid])
    right = mergeSort(nums[mid:])
    return merge(left, right)


# 快速排序（在冒泡排序基础上进行分治）：选定pivot中心轴（可以每次都选取最左边的数字）。
def quickSort(nums):  # 这种写法的平均空间复杂度为 O(nlogn)
    if len(nums) <= 1:
        return nums
    pivot = nums[0]  # 基准值
    left = [nums[i] for i in range(1, len(nums)) if nums[i] < pivot]
    right = [nums[i] for i in range(1, len(nums)) if nums[i] >= pivot]
    return quickSort(left) + [pivot] + quickSort(right)


'''
@param nums: 待排序数组
@param left: 数组上界
@param right: 数组下界
'''


def quickSort2(nums, left, right):  # 这种写法的平均空间复杂度为 O(logn)
    # 分区操作
    def partition(nums, left, right):
        pivot = nums[left]  # 基准值
        while left < right:
            while left < right and nums[right] >= pivot:
                right -= 1
            nums[left] = nums[right]  # 比基准小的交换到前面
            while left < right and nums[left] <= pivot:
                left += 1
            nums[right] = nums[left]  # 比基准大交换到后面
        nums[left] = pivot  # 基准值的正确位置，也可以为 nums[right] = pivot
        return left  # 返回基准值的索引，也可以为 return right

    # 递归操作
    if left < right:
        pivotIndex = partition(nums, left, right)
        quickSort2(nums, left, pivotIndex - 1)  # 左序列
        quickSort2(nums, pivotIndex + 1, right)  # 右序列
    return nums


# 堆排序
# 大根堆（从小打大排列）
def heapSort(nums):
    # 调整堆
    def adjustHeap(nums, i, size):
        # 非叶子结点的左右两个孩子
        lchild = 2 * i + 1
        rchild = 2 * i + 2
        # 在当前结点、左孩子、右孩子中找到最大元素的索引
        largest = i
        if lchild < size and nums[lchild] > nums[largest]:
            largest = lchild
        if rchild < size and nums[rchild] > nums[largest]:
            largest = rchild
        # 如果最大元素的索引不是当前结点，把大的结点交换到上面，继续调整堆
        if largest != i:
            nums[largest], nums[i] = nums[i], nums[largest]
            # 第 2 个参数传入 largest 的索引是交换前大数字对应的索引
            # 交换后该索引对应的是小数字，应该把该小数字向下调整
            adjustHeap(nums, largest, size)

    # 建立堆
    def builtHeap(nums, size):
        for i in range(len(nums) // 2)[::-1]:  # 从倒数第一个非叶子结点开始建立大根堆
            adjustHeap(nums, i, size)  # 对所有非叶子结点进行堆的调整
        # print(nums)  # 第一次建立好的大根堆

    # 堆排序
    size = len(nums)
    builtHeap(nums, size)
    for i in range(len(nums))[::-1]:
        # 每次根结点都是最大的数，最大数放到后面
        nums[0], nums[i] = nums[i], nums[0]
        # 交换完后还需要继续调整堆，只需调整根节点，此时数组的 size 不包括已经排序好的数
        adjustHeap(nums, 0, i)
    return nums  # 由于每次大的都会放到后面，因此最后的 nums 是从小到大排列


# 计数排序
def countingSort(nums):
    bucket = [0] * (max(nums) + 1)  # 桶的个数
    for num in nums:  # 将元素值作为键值存储在桶中，记录其出现的次数
        bucket[num] += 1
    i = 0  # nums 的索引
    for j in range(len(bucket)):
        while bucket[j] > 0:
            nums[i] = j
            bucket[j] -= 1
            i += 1
    return nums


# 桶排序
def bucketSort(nums, defaultBucketSize=5):
    maxVal, minVal = max(nums), min(nums)
    bucketSize = defaultBucketSize  # 如果没有指定桶的大小，则默认为5
    bucketCount = (maxVal - minVal) // bucketSize + 1  # 数据分为 bucketCount 组
    buckets = []  # 二维桶
    for i in range(bucketCount):
        buckets.append([])
    # 利用函数映射将各个数据放入对应的桶中
    for num in nums:
        buckets[(num - minVal) // bucketSize].append(num)
    nums.clear()  # 清空 nums
    # 对每一个二维桶中的元素进行排序
    for bucket in buckets:
        insertionSort(bucket)  # 假设使用插入排序
        nums.extend(bucket)  # 将排序好的桶依次放入到 nums 中
    return nums

```



## <font face="黑体" color=green size=5>工作中的应用场景</font>

1. oracle存储 : b+树、b-树

2. oracle哈希分区：hashmap（拉链表）


## <font face="黑体" color=green size=5>参考资料</font>

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
24.   排序的python 实现： https://www.jianshu.com/p/bbbab7fa77a2

  

