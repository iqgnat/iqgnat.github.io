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

![判断MiKTex是否存在](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/01.jpg)



<font face="黑体" color=green size=5>**Step 2：能否成功安装宏包（packages）** </font>

安装宏包时，在开始菜单 (或者通过cmd打开终端) 输入 **mpm**并回车运行。 在打开的 MiKtex Console，点击“Switch to administrator mode” （若弹出"用户账户控制", 选择"允许")， 在左侧边栏选择“Package”, 输入包名 按加号。

![安装宏包](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/02.jpg)

一开始我在开始菜单搜索的是 “ Package Manager ”，打开以后得到一个和MiKtex Console 差不多的Package编辑界面。 但在这个界面中，完全无法添加宏包，会报错 " MiKTeX Problem Report：The operation could not be completed because a required file does not exist. "。 尝试添加镜像，手动增加宏包等，但都以报错“No data”告终。 或许这种添加方式，只适用于Texlive。 寻思了一天，直到和大师兄一对比，才发现虽然是安装package，但不是在" Package Manager", 而是在" MiKTeX Console" 。

![安装宏包2](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/03.jpg)



<font face="黑体" color=green size=5>**Step 3：设置Texstudio的编译器和默认文献工具** </font>

写IOP期刊论文时用的是IOP template，规定用的编译器是PdfLatex，文献工具是：BibTex。当写学校毕业论文的时候，因为对字体有些特别规定，所以用的XeLatex编译器。（不少高校的毕业论文，在github上已经有模板了）。具体用哪个编译器，还取决于文章需求。用下来觉得PdfLatex编译的速度比较快。

![编译器选择](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/04.jpg)



<font face="黑体" color=green size=5>**Step 4：按.tex template，插入公式, table, 和 figure** </font>

找到期刊提供的 Latex template，用texstudio打开".tex", 文本中的数学符号 （$...$）、公式、表格 、图片（等， 根据template中的描述（或google），把自己的文章内容替换进去。

贴心的IOP 帮我们提前定义好了如下命令，这样分别引用section，figure，table 等，就能自动加上对应的前缀：

```
\newcommand{\eref}[1]{(\ref{#1})} \newcommand{\sref}[1]{section~\ref{#1}} \newcommand{\fref}[1]{figure~\ref{#1}} \newcommand{\tref}[1]{table~\ref{#1}} \newcommand{\Eref}[1]{Equation (\ref{#1})} \newcommand{\Sref}[1]{Section~\ref{#1}} \newcommand{\Fref}[1]{Figure~\ref{#1}} \newcommand{\Tref}[1]{Table~\ref{#1}}
```

如果刊物没有提供latex的模板，可以考虑用 [IOPLatexGuidelines (官网下载) ](https://publishingsupport.iopscience.iop.org/questions/latex-template/)的模板牛刀小试，因为该模板对格式的要求和示例非常详尽，可以按图索骥。遇到没有示例的功能，也可以google到对应的宏包，通过step2下载宏包并使用。
然而，IOP提供的 iopart (\documentclass[12pt]{iopart}) 与常用的用于公式的宏包 [`**amsmath**`](https://www.ctan.org/pkg/amsmath) 不兼容。在 github已经有了解决方法：

Put the following two lines before just before `\usepackage{amsmath}` 
（ [祝曹祥](https://zhucaoxiang.github.io/latex/2017/08/16/Use-amsmath-together-with-iopart-in-LateX.html) ）

```
\expandafter\let\csname equation*\endcsname\relax
\expandafter\let\csname endequation*\endcsname\relax 
```



以下是table， figure ，equation 格式举例:

```
\begin{table} 
 \caption{BCI performances of Group A and Group B}
 \lineup
% \footnotesize\rm
\begin{indented}
\item[]\begin{tabular}{@{}llllllll}
 \br
        & Test   & SNR             & Accuracy ($\%$) \\ \mr
Group A & test1  & $1.898\pm0.682$ & $78.80 \pm 18.87$  \cr
        & test2  & $2.058\pm0.720$ & $84.15 \pm 15.00$  \cr
Group B & test1  & $1.795\pm0.405$ & $74.00 \pm 10.30$  \cr
        & tesr2  & $1.530\pm0.391$ & $72.40 \pm 15.80$  \cr
 \br
 \end{tabular}
\end{indented}
 \label{GroupPerfor}
\end{table}
\begin{figure}
 \centering
 \includegraphics[scale=0.78]{figs/SNRaccuracyGroupAB} 
 \caption{Comparisons...}
 \label{SNRaccuracyGroupAB}
\end{figure}
\begin{equation}
SNR=\frac{n \times X(K)}{\sum_{k=1}^{n/2}[X(K+k)+X(K-k)]}
\end{equation}
```

\* \label{} 要紧挨着 \end{} 之前申明，过早申明就会报错, 而且报错的位置，总是有点迷。



**TIPS：
1） 编辑表格生成.tex 表格代码：**
[**https://www.tablesgenerator.com/**](https://www.tablesgenerator.com/) 
**online, 比较适用写于写毕业论文用，需要安装的package在复制以后会以%提示，没有提示则不需要另外添加包；注意，从excel复制表格进tablegenerator之前，表格不要留空或者使用合并单元格（可以用_代替），否则复制后，格式会错乱。
2) 将截图公式转换成.tex code** **公式代码** : 
**Mathpix snipping tool**，快捷键: **CTRL** + **ALT** + M



**可以根据截图生成公式代码： Mathpix snipping tool （很好用）**， 
快捷键: **CTRL** + **ALT** + **M** , 生成的代码，可能还有未安装的包。
如果报错，具体看到缺失哪一个 "control sequence"，上网找到对应的package，用\usepackage{}添加即可。 
心得：snipping tool 没有 tablegenerator这么贴心， tablegenerator会在复制后把缺失的package在备注里面显示。



<font face="黑体" color=green size=5>**Step 5: 参考文献的添加** </font>

核心：用 BibTeX 工具，生成参考文献。

这里涉及额外的两个文件：.bst （生成的references的格式） 和 .bib。需要注意的是，期刊提供的 .bst依然需要进行格式检查，因为有的期刊提供的 .bst 可能甚至格式不能满足它自己的要求。但一般情况下，默认.bst已经正确规定好了生成的reference的形态格式。 对于 .bib，只需要机械地复制scholar提供的标签和内容，然后在.tex正文中用 \cite{} 引用@article{} 括号中的标签内容即可。

小细节： 连续添加多个参考，如 xxx. [8-11]的形式，而不是 xxx.[8,9,10,11]。还需另外添加 \usepackage{cite} （在导言中）， 在正文部分，将文献标签以逗号隔开即可。

![生成references的格式](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/05.jpg)

![google scholar中添加references的位置](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/06.jpg)

![google scholar中添加references的位置2](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/07.jpg)

在短时间内在Chrome中多次打开 scholar Bibtex URL 后，通知 403 error，清理cache，Temp，重装Chrome都无效。似乎除了改IP地址，别无他法。 此时IE浏览器充分发挥了备胎作用，但是还是用着不爽，因为需要不停地人机验证。在48小时后，Chrome Bibtex URL 的限制被解，可以正常访问了。

![google scholar 403 error](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/08.png)

<font face="黑体" color=green size=5>**Step 6: 检查 .bib 中的参考文献是否重复添加** </font>

因为涉及的参考文献众多（ 而且google给的bibtex标签不是关键词抓取 ，为了自己更好理解，有时复制bibtex时候会改 @article 后面的标签），这样如果我们重复复制了bibtex并在正文引用，在Bibliography处就会生成两个相同的reference. 因此我们需要 一个自动查验 bibtex中的文章是否重复。已经有stackovernet的网友[Martin](https://tex.stackexchange.com/users/32082/martin)解决了，原创回答请点击[这里](https://tex.stackovernet.com/cn/q/93352)。

该方法是通过perl在powershell，遍历.bib 文档。以下是该方法的复述总结： 
首先将这个 .zip 的文档 ([点我下载](http://tangqinotes.me/wp-content/uploads/2019/06/finddupls.zip)) 解压，将解压后的 .pl 文档放在.bib所在文件夹。 然后shift+右击，打开powershell， 运行语句: perl finddupls.pl

会看到结果如下：

![google scholar 403 error](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/10.png)

如果在bibtex中没有文献重复，就不会出现任何。如果有重复，就会列出title。

关于在毕业论文中，添加部分中文文献, 在导言加：

```
\usepackage{xeCJK}
\setCJKmainfont{SimSun}
```

来源： https://tex.stackexchange.com/questions/100092/how-to-include-a-chinese-paper-in-reference-via-bibtex



<font face="黑体" color=green size=5>**Step 7: 生成pdf，并保存.tex版本** </font>

编译，生成并保存pdf文件，保存 .tex 文件（建议根据日期或版本命名）。

![google scholar 403 error](https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-05-13-Notes_in_Latex_for_Paper_writing/11.jpg)



<font face="黑体" color=green size=5>**Step 8: 用 latexdiff 比较 不同 .tex 版本之间的差异，并自动标注**</font>

安装 latexdiff 的宏包。 保证两个版本的 .tex 与其引用文件在同一文件夹下。 在空白处按住shift+右击鼠标，在弹出的快捷菜单选择 “在此处打开powershell窗口”。 在powershell 窗口中输入: latexdiff 旧的版本.tex 新的版本.tex> diff.tex 。



注意：偶尔会出现生成的diff.tex，没有 .aux 文件对应，此时将 diff.tex的文件内容复制到新建的.tex中并运行，生成pdf即可。



<font face="黑体" color=green size=5>**Step 9: latex的 .tex 格式如何转换成word格式**</font>

在写journal的同时，有可能同时在写毕业thesis。而学校提供的模板可能只有MSword，这是就有了将.tex文件转换成.doc/.docx格式的需求。

简单的方法是生成pdf之后，有很多在线转换。但是它们的效果首先不好，其次是上传到互联网转换有风险。用[GrindEQ](https://www.grindeq.com/)把.tex文件转换成word，出来的成品马马虎虎可以用，是MS word的官方插件。下载好以后，备份.tex文件，然后用word打开，文件格式选.tex。
转换出来的bibliography 和公式都没问题。只是文中 \Fref, \Tref, \cite 的引用效果都不复存在, 需要再编辑。



<font face="黑体" color=green size=5>**Step 10: 将截图的公式，转换成word格式**</font>

在写毕业论文的时候，经常会引用到公式，往往我们有的都不是 word格式的。**Mathpix snipping tool** 可以将截图里的公式输出 .tex code, 把code 复制到 .tex。用.tex格式当成一个中转。 然后通过安装[GrindEQ](https://www.grindeq.com/) 插件，就在 word 打开 .tex的文档，并且，打开以后，tex的公式都是已word公式显示。

更新，GrindEQ这个软件不注册只能试用。试用期结束以后，价格是100欧元。然后chrome的扩展可以继续解决 latex to word转换公式。

下载以下插件 （作者 Daniel D. Zhang）：
https://chrome.google.com/webstore/detail/latex2word-equation/oicdodhdflfciojjhbhnhpeenbpfipfg?hl=en

将.tex公式（比如从 **Mathpix snipping tool** copy得到）复制到以下网址文本框:
http://bandicoot.maths.adelaide.edu.au/MathJax/test/sample-dynamic-2.html
右击 LaTeX2Word-Equation，自动复制，然后在word打开（在powerpoint打开不行），然后才可以复制到office的其他产品。