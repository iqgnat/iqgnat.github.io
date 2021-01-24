---
title:  MuPAD 递归项
categories: 科研工具
tags: MATLAB
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---





**MuPAD的官方介绍 ：**
“ MATLAB is good for writing simple programs and working with numbers, but is cumbersome for doing symbolic calculations. **Mupad** is a GUI driven MATLAB package that helps you do algebra, calculus, as well as to graph and visualize functions. ”

<!--more-->

用MuPAD 来得到递归项 a(n) 项的符号表达式。 已知 a(1)是初始项， a(n+1)和a(n)、a(1) 的关系如下：
a(n+1)= -1/K*a(n)+a(1)

MATLAB程序:

```
% edit at Oct.03,2018;
% get expression of a(n+1)
clear;clc;close all
% get expression
[result,~] = evalin(symengine,'eq:= rec(a(n+1)= -1/K*a(n)+a(1), a(n),a(1)=b); solution := solve(eq);')
% calculate and get algebraic result, plot 
syms K a n;
n=30; % sample points
K=2;
a(1)=10;
for i=1:n+1
    a(i+1)=-1/K*a(i)+a(1);
end
figure
stem(a)
```

![Mupad](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-16-MuPad_MATLAB/01.jpg)



其中涉及的最常用MuPAD函数, 引用 [winner245](https://www.ilovematlab.cn/home.php?mod=space&uid=161646&s_tid=ReputationProfileLink) ：

:= （带冒号的等号）：给符号变量指定特定的数值（这是与matlab语言最大的区别），例如：将x赋值为2用x:=2 而非x=2
[symengine](http://www.mathworks.com/help/symbolic/symengine.html?searchHighlight=symengine)： 查看你的Matlab符号计算引擎，查看你的版本是否支持MuPAD
[mupad](http://www.mathworks.com/help/symbolic/mupad.html?searchHighlight=mupad): 开启一个MuPAD notebook界面，在该界面上可以用纯符号计算语言，语法跟Maple极其相似，例如，不需要事先定义任何符号（像syms这些就不需要了），该引擎直接将任何符号当作符号变量使用
[mupadwelcome](http://www.mathworks.com/help/symbolic/mupadwelcome.html): 开启MuPAD欢迎界面，可以选择打开一个notebook（MuPAD界面）、启动M file editor，或者打开最近的文件
[evalin](http://www.mathworks.com/help/symbolic/evalin.html?searchHighlight=evalin)：在不打开MuPAD notebook界面的情况下，在matlab command window或M file editor中直接调用MuPAD引擎，无需指定输入参数
[feval](http://www.mathworks.com/help/symbolic/feval.html?searchHighlight=feval)： 在不打开MuPAD notebook界面的情况下，在matlab command window或M file editor中直接调用MuPAD引擎，需要指定输入参数

**WolframAlpha的在线实现：**

MuPAD 已经足够方便了，不过用Wolfram Alpha完成这一切，一句足矣。

![WOLFRAM](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-16-MuPad_MATLAB/02.png)