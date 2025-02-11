---
title: 大餐计数 Count Good Meals 小记
categories: 算法模型
tags: [leetcode,python]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

Leetcode 题：大餐计数 Count Good Meals. 

<!--more-->

## <font face="黑体" color=green size=5>题干</font>

A good meal is a meal that contains exactly two different food items with a sum of deliciousness equal to **a power of two**. You can pick any two different foods to make a good meal. Given an array of integers deliciousness where deliciousness[i] is the deliciousness of the  ith item of food, return the number of different good meals you can make from this list **modulo 10^9 + 7**.

Note that **items with different indices are considered different** even if they have the same deliciousness value.

Example :
Input: deliciousness = [1,1,1,3,3,3,7]
Output: 15
Explanation: The good meals are (1,1) with 3 ways, (1,3) with 9 ways, and (1,7) with 3 ways.

## <font face="黑体" color=green size=5>题意理解</font>

第一步：从list中任选两个数（即使值相同，也认作两种组合），要求满足加和为2的幂

+ 判断是否distinct不是根据值，而是根据index，考虑选择将 list中的元素映射为 dict；
+ 判读加和满足2的幂，参考二进制位的左移，每左移一位相当于除以2。在对十进制进行操作的过程中，左移  << 或 右移 >> 标记的使用，python将默认先将十进制数转换为二进制操作；
+ 通过counter 统计。

第二步:  输出组合数 除 10^9 + 7 的余

+ % 求余

第三步：通过排列组合减少重复计算。

## <font face="黑体" color=green size=5>代码</font>

第一次尝试（基线，超时：完成测试用例 55/70。）：

```python
#!/usr/bin/env python3
# leetcode 大餐计数

def isPower(num):  # 通过循环左移直到得到余数，通过余数为0或1判断是否为2的幂。
    """
    >>> isPower(4)
    True
    >>> isPower(6)
    False
    >>> isPower(8)
    True
    """
    if num < 1:
        return False
    i = 1
    while i <= num:
        if i == num:
            return True
        i <<= 1
    return False

class Solution:
    def countPairs(self, dishes):
        dishes_dict = dict(zip(range(len(dishes)), dishes))
        sum_no = 0
        for k, v in dishes_dict.items():
            k2_dict = {k2: v2 for k2, v2 in dishes_dict.items() if k2 >k}
            for k2, v2 in k2_dict.items():
                if isPower(v + v2):
                    sum_no = sum_no + 1
        return (int(sum_no % (1e9 + 7)))


if __name__ == "__main__":
    import doctest
    doctest.testmod()
    solution = Solution()
    result = solution.countPairs([1, 1, 1, 3, 3, 3, 7])
    print(result)
```

第二次尝试 （加对重复组合判断 -> 超时：完成测试用例 41/70。）：

```python
def isPower(num):  # 通过循环左移直到得到余数，通过余数为0或1判断是否为2的幂。
    if num < 1:
        return False
    i = 1
    while i <= num:
        if i == num:
            return True
        i <<= 1
    return False


def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result = result * i
    return result


def combination(n, m):
    return factorial(n) // (factorial(n - m) * factorial(m))


class Solution:
    def countPairs(self, dishes):
        dishes_dict = dict(zip(range(len(dishes)), dishes))
        sum_no = 0
        storeset_combination_list=[]
        for k, v in dishes_dict.items():
            k2_dict = {k2: v2 for k2, v2 in dishes_dict.items() if k2 >k}
            for k2, v2 in k2_dict.items():
                combination_set = {v, v2}
                if combination_set in storeset_combination_list:
                    continue
                elif isPower(v + v2):
                    storeset_combination_list.append(combination_set)
                    N1 = dishes.count(v)
                    N2 = dishes.count(v2)
                    if v == v2:
                        no = combination(N1,2)
                    else:
                        no = N1 * N2
                    sum_no = sum_no + no
                else:
                    pass
        return (int(sum_no % (1e9 + 7)))

```

第三次尝试（从2的幂着手 -> 超时：完成测试用例 44/70。需要对count性能优化，试过 collections.Counter通过迭代计数，在这里提速不大，但不妨了解机制：https://www.guru99.com/python-counter-collections-example.html ）：

```python
def isPower(num):
    if num <1:
        return False
    result = num & (num-1)
    if result == 0:
        return True
    else:
        return False
    

class Solution:
    def countPairs(self, dishes):
        dishes_dict = dict(zip(range(len(dishes)), dishes))
        sum_no = 0
        storeset_combination_list=[]
        for k, v in dishes_dict.items():
            k2_dict = {k2: v2 for k2, v2 in dishes_dict.items() if k2 >k}
            for k2, v2 in k2_dict.items():
                combination_set = {v, v2}
                if combination_set in storeset_combination_list:
                    continue
                elif isPower(v + v2):
                    storeset_combination_list.append(combination_set)
                    N1=dishes.count(v)
                    N2=dishes.count(v2)
                    if v == v2:
                        no = N1 * (N1 -1) /2
                    else:
                        no = N1 * N2
                    sum_no = sum_no + no
                else:
                    pass
        return (int(sum_no % (1e9 + 7)))
```

## <font face="黑体" color=green size=5>大神思路</font>

在力扣的评论中，网友们用了 追加统计 的思路来提高效率，顺便判断是否为2的幂，代码也简练不少。

>defaultdict() 返回一个类似字典的对象。defaultdict 是Python内建字典类（dict）的一个子类，它重写了方法 *missing*(key)，增加了一个可写的实例变量default_factory,实例变量default_factory被missing()方法使用，如果该变量存在，则用以初始化构造器，如果没有，则为None。其它的功能和dict一样。

```python
#!/usr/bin/env python3
from collections import defaultdict


class Solution:
    def countPairs(self, deliciousness) -> int:
        m = [pow(2, n) for n in range(22)] # 定义一个足够大的数字（中文版有22的限制条件)
        res = 0
        dic = defaultdict(int)
        for d in deliciousness:
            dic[d] += 1
            for _m in m:
                if _m < d:
                    continue
                elif _m == 2 * d:
                    res += (dic[_m - d] - 1)
                else:
                    res += dic[_m - d]
            res %= int(1e9 + 7)
        return res


if __name__ == "__main__":
    solution = Solution()
    result = solution.countPairs([1, 1, 1, 3, 3, 3, 7])
    print(result)
```

PS:  Chrome 如果启用有道词典取词划译，在每次按下ctrl键时，会跳出编辑环境。

## <font face="黑体" color=green size=5>参考资料</font>

1. https://leetcode-cn.com/problems/count-good-meals/comments/

2. 优化判断一个数是否是2的整数次幂，python实现：
   https://blog.csdn.net/ymmbjcz/article/details/78645896
   
3. 探究 python list count 慢的原因。 How is Python's List Implemented（动态数组） :  https://stackoverflow.com/questions/3917574/how-is-pythons-list-implemented

   