---
title: 动态规划之打家劫舍
categories: 课堂笔记
tags: [算法导论,leetcode]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

"你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。"

<!--more-->

# <font face="黑体" color=green size=5>理解</font>

法一：迭代：

​	有重叠子问题：函数的输入值全部拦截下来，然后把它的输出值然也记录下来，然后下次有相同的输入的时候，不再去算这个函数，而是直接从她的那个结果表里把结果查询出来，加速子问题的方法。



法二：动态规划：

1. 解决多阶段决策过程最优化的一种数学方法。把多阶段问题变换为一系列相互联系的的单阶段问题，然后逐个加以解决；

2. 具有马尔可夫特征：无后效性；

   

动态规划区别相似算法：

1. 和分治法的本质区别： 分治法的单阶段是完全独立的， 利用递归对各个子问题独立求解，最后利用各子问题的解进行合并形成原问题的解。动态规划的通过计算出子问题的结果构造一个最优解，迭代法自底向上求解，将分解后的子问题理解为相互间有联系，有重叠的部分。
2. 和贪心法的区别：贪心着眼现实当下，只选择当前最有利的，不考虑这步选择对以后的选择造成的影响，不能看出全局最优，依赖于当前已经做出的所有选择，采用自顶向下(每一步根据策略得到当前一个最优解，保证每一步都是选择当前最优的) 的解决方法。动规谨记历史进程，通过较小规模的局部最优解一步步最终得出全局最优解。

n 家商铺，偷盗的时候对商铺的选择 或间隔一家，或间隔二家 (x 次)，每家商铺 p 藏有 q<sub>p</sub> 价值的现金。被偷商家的数量 (count) 范围是：
$$
\text { floor }\left(\frac{n}{2}\right)-x \ll \text { count } \ll \text { floor }\left(\frac{n}{2}\right)
$$

$$
其中，0 \ll x \ll f \operatorname{loor}\left(\frac{n-2}{3}\right)
$$

自顶向下考虑，就会变成贪心算法，陷入局部最优而不是全局最优。

**根据无后效性，后一步的选择只与前一步的状态有关，因此是自底向上、往前一刻状态找补的迭代求解。**

# <font face="黑体" color=green size=5>步骤</font>

1）刻画一个最优解的结构特征: 状态(抢劫总金额) dp[*n*]

2）递归定义最优解的值:    dp[*n-1*] = dp[*n*-2] + nums[n]，其中 nums[n] 为第n家商铺的存有金额 （

3）计算最优解的值，通常采用自底向上方法: dp[*n*+1] = *max*(*dp*[*n*-1], *dp[*n*−2]+*nums[n] ) 

4）利用计算出的信息构造一个最优解。

# <font face="黑体" color=green size=5>实现</font>

Krahets 的思路，可以减少考虑初始时刻的情况,  ~妙哇~：

+ 上一刻状态pre：dp[n-2]

+ 此刻状态cur： dp[n-1]

+ 下一刻状态 :   dp[n]

+ 下一家商铺金额 :   num

  举例9家店铺金额分别为 [100, 50, 1000, 10000, 50000, 400, 3000, 80000, 400000] 


| store | num    | pre (= dp[n-2] ) | cur (= dp[n-1]) | *max*(*dp*[*n*-1], *dp[*n*−2]+*nums[n] ) = new cur | new pre (= cur) |
| ----- | ------ | ---------------- | --------------- | -------------------------------------------------- | --------------- |
| 1     | 100    | 0                | 0               | 100                                                | 0               |
| 2     | 50     | 0                | 100             | 100                                                | 100             |
| 3     | 1000   | 100              | 100             | 1100                                               | 100             |
| 4     | 10000  | 100              | 1100            | 10100                                              | 1100            |
| 5     | 50000  | 1100             | 10100           | 51100                                              | 10100           |
| 6     | 400    | 10100            | 51100           | 51100                                              | 51100           |
| 7     | 3000   | 51100            | 51100           | 54100                                              | 51100           |
| 8     | 80000  | 51100            | 54100           | 134100                                             | 54100           |
| 9     | 400000 | 54100            | 134100          | 454100                                             | 134100          |

Python3：

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        cur, pre = 0, 0
        for num in nums:
            cur, pre = max(pre + num, cur), cur
        return cur
    
NUMS = [100,50,1000,10000,50000,400,3000,80000,400000]
cur_cash = Solution()
print(cur_cash.rob(NUMS))
```

Java
```java
import java.util.List;
import java.util.Arrays;
import static java.lang.Math.max;

public class Dp{
    public int rob(List<Integer> nums) {
        int pre = 0, cur = 0, tmp;
        for (int num: nums) {
            tmp = cur;
            cur = Math.max(pre + num, cur);
            pre = tmp;
        }
        return cur;
    }

    public static void main(String[] args) {
        List < Integer > NUMS = Arrays.asList(100, 50, 1000, 10000, 50000, 400, 3000, 80000, 400000);
        Dp cur_cash = new Dp();
        System.out.println(cur_cash.rob(NUMS));
    }
}
```

Swift

```swift
class Solution{
     func rob(nums:[Int]) -> Int {
        var pre = 0
        var cur = 0
   		for num in nums{
       		(cur, pre) = (max(pre + num, cur), cur)}
       	return cur
        }
}

let NUMS = [100,50,1000,10000,50000,400,3000,80000,400000]
var cur_cash = Solution()
print(cur_cash.rob(nums:NUMS))
```

# <font face="黑体" color=green size=5>相关题目</font>

如果考虑房间是首尾相连的情况 (如图)：
![打家劫舍-首尾相接](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2021-04-09-Dynamic_programming/dp.JPG)

首尾相接意味着 第一家和最后一家 不能同时被选，也即

> 1. 在不偷窃第一个房子的情况下（即 nums[1:]nums[1:]），最大金额是 p1;
> 2. 
>      在不偷窃最后一个房子的情况下（即 nums[:n-1]nums[:n−1]），最大金额是 p2.

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        def my_rob(nums):
            cur, pre = 0, 0
            for num in nums:
                cur, pre = max(pre + num, cur), cur
            return cur
        return max(my_rob(nums[:-1]),my_rob(nums[1:])) if len(nums) != 1 else nums[0]

# 作者：jyd
#链接：https://leetcode-cn.com/problems/house-robber-ii/solution/213-da-jia-jie-she-iidong-tai-gui-hua-jie-gou-hua-/
#来源：力扣（LeetCode）
    
NUMS = [100,50,1000,10000,50000,400,3000,80000,400000]
cur_cash = Solution()
print(cur_cash.rob(NUMS))
```

相关应用：

​	最长公共子序列、最长子串、最大字段、装配线，矩阵乘法、构造最优的二叉树。


# <font face="黑体" color=green size=5>参考资料</font>

1.  https://leetcode-cn.com/problems/house-robber/solution/da-jia-jie-she-dong-tai-gui-hua-jie-gou-hua-si-lu-/, 作者：jyd,来源：力扣（LeetCode）
2.  [labuladong的算法专栏](https://www.zhihu.com/column/labuladong)
3.  https://cloud.tencent.com/developer/article/1017975
4.  https://blog.csdn.net/u012961566/article/details/77077578