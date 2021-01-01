---
title: Latex写期刊论文的快速入门笔记
tags: 科研工具
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
---

 “ LaTeX 优秀之处在于，它将内容与格式分开，使得作者不需要，或者只需要知道很少的排版细节就能排出漂亮的文章。”

<!--more-->

 Latex 之于 Word，类似于 Visio 之于 小画家 ，是一个化繁为简，针对性强的排版工具，适用于速成与严谨地撰稿。本科期间，就听说周围实验室规定用latex写报告了，我一度以为，它的学习成本较高。但其实，如果不求甚解+按图索骥，是可以很快上手的。

​        我没有比较不同文字处理系统（如 MiKTeX, TeX Live,  CTeX, cwTex) 或 不同整合开发环境 ( 如Texstudio**,** WinEdt, TeXstudio, TeXmaker) 之间的异同。我选择了 **Miktex** + **Texstudio** 的常用组合 （win10环境中）。 

​         本文只总结了从零到上手Latex写报告和期刊的大步骤。真正写的时候，涉及到的无数格式细节，需要google具体的package (添加到导言中) 和命令(添加在正文部分)。

# <font face="黑体" color=green size=5>**步骤**</font>

-  **Step 1:   latex的安装，先MiKTeX，后Texstudio ;**
-  **Step 2：能否成功安装宏包（packages）**;
-  **Step 3：设置Texstudio的编译器和默认文献工具** ;
-  **Step 4：按.tex template索骥**, **插入 公式, table, 和 figure** ;
-  **Step 5:   参考文献的添加**;
-  **Step 6 :  检查 .bib 中的参考文献是否重复添加** 
-  **Step 7:   生成pdf，并保存.tex版本**;
-  **Step 8:   用 latexdiff 比较 不同 .tex 版本之间的差异，并自动标注**
-  **Step 9:   latex的 .tex 格式如何转换成word格式** 
-  **Step 10:   截图的公式，转换成word格式** 

# <font face="黑体" color=green size=5>**Step 1:  Windows环境下的安装--latex的, 先MiKTeX** [**(官网)**](https://miktex.org/download) **，后Texstudio**[**(官网)**](https://www.texstudio.org/) </font>

Texstudio 是一个够方便的编辑器，装不同的宏包, 是通过 **mpm** (*MiKTeX* Package Manager) 在线安装 。 我们在安装完Miktex后，可以通过 **cmd** 在终端中输入 **mpm** 字符，来查看MiKtex Console是否存在并打开。

![subset permutation rule](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019_05_14_Probability_and_statistics_notes_1/PS1.jpg)