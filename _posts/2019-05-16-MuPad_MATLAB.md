---
title: MuPAD 递归项
tags: 理论基础
author: Tang Qi
sidebar:
  nav: docs-cn
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