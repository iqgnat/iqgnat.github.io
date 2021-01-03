---
title: 非侵入性脑机接口（BCI）现状概述
tags: 脑机接口
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
---

【翻译自 TangQi 的硕士毕业论文：**A Further Study of the Alpha-Down Neurofeedback Training**

**for SSVEP-based BCIs**】

​	非侵入性脑机接口（BCI）的应用目前主要基于运动图像（MI)，事件相关电位（ERP）和稳态视觉诱发电位（SSVEP）这三种范式。 这些BCI范式中，SSVEP具有很高的信息传输率（ITR），并且几乎不需要预先对受试者进行训练。目前BCI拼写器的最优成绩是 Nakanishi 保持的，他们取得了平均 ITR = 325.33 ± 38.17位/分钟的成绩。 BCI的最大挑战是“BCI不兼容”现象，这是指由于表现不佳而无法使用BCI的受试者。 BCI不兼容程度随范式和在不同研究中定义的临界值而变化。最近，在Lee的论文中指出，在相同的受试者和实验环境中，在SSVEP和ERP中表现为BCI不兼容的比率分别为10.2％和11.1％（临界阈值为90％），而对于MI则为53.7％（临界阈值为70％）。

<!--more-->

# <font face="黑体" color=green size=5>1. 脑电记录和硬件</font>

​	脑电图（EEG）是一种非侵入性技术，用于检测和记录皮层活动带来的在头皮上的电压和。与插入电极或植入大脑部分进行行为观察的侵入性方法不同，EEG可以在没有道德争议的情况下应用于人类。与医学摄影技术不同（比如fMRI），EEG记录具有较高的时间分辨率，因此主要用于检测仅持续几毫秒的事件相关电位。

​	常用的描述EEG信号的特征有电位幅度、头皮面积、频谱、和等待时间等。实际上，EEG电极帽所记录的是头皮上的活性电极与参考电极（reference electrode）之间的幅度电位差。 EEG电极帽上的有源电极通常遵循10-20国际制，如图所示。

<img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-Literature_review_on_EEG_BCI/01_1020_system.png" style="zoom:30%" />

​	为了获得这些参数的准确值，业内常使用最不活跃的电极作为参考来测量最理想的原始数据。因此，如何在头皮记录测量中设置参考电极对EEG的记录有重大影响。诸多学者已经研究了所选参比电极及其对结果的影响。此外，Yao提出了参考电极标准化的技术，以将头皮EEG记录的参考标准化到足够远的点。最近，Tian和Yao研究了混合神经电势是否随实验条件而变化，比较不同实验条件之间的真实幅度差异。目前，尚未找到统一的标准供不同应用中参考电极的选择。Liang提出：

​	（1）如果原始脑电图振幅具有与其各自参考值相同的变化趋势，则振幅差将被减弱； 

​	（2）如果参考值与原始EEG幅度具有相反的趋势，则它们各自的幅度差将增加； 

​	（3）当两个条件的原始EEG振幅相同时，它们之间的振幅差异将完全取决于它们各自的参考值。

​	非侵入性脑电图采集准备阶段的关键步骤是将电极固定在头皮和导电凝胶上。在涂抹凝胶之前，先使用磨砂膏对头皮区域以及地面和参考通道进行轻度磨损，以减少角质，从而降低电极与头皮之间的阻抗。 目前，多通道脑电图设备主要用于医学和科研领域。同时，在脑电图研究或应用场景领域中，多通道脑电图设备通常使用湿电极，但是实验前的准备可能较繁琐。这些步骤将使脑电图的研究或应用变得既费时又费力。近年来发明的干式脑电电极，并将无线脑电系统投入应用。与湿式电极EEG装置相比，干式电极装置使用起来更加方便，省去了洗头或涂敷导电胶等的需要。然而，也有一些研究显示传统的湿式EEG电极的信号质量优于干式电极装置记录的信号质量，因为干电极对EEG信号的收集更容易受到干扰，皮肤电容是干电极EEG设备不稳定性的主要因素之一。常见的EEG放大器设备生产企业和主要产品的参数如下：

| 企业名     | NeuroScan  | EGI         | Brain Products | Symtop     |
| ---------- | ---------- | ----------- | -------------- | ---------- |
| 设备名     | SynAmps 2  | NetAmps 300 | DC             | UEA        |
| 共模抑制比 | 110 dB     | 120 dB      | 120 dB         | 98 dB      |
| 带宽       | DC-3500 Hz | DC-4000 Hz  | DC-4000 Hz     | 0.5-120 Hz |
| 采样率     | 20000 Hz   | 20000 Hz    | 1000 Hz        | 1000 Hz    |
| A/D digits | 24         | 24          | 16             | 16         |

​	前三个设备具有很高的精度，可以支持认知中的脑电图研究科学，最后一个设备目前更多用于临床诊断。


# <font face="黑体" color=green size=5>2. 脑电的不同频段</font>

​	在频域分析中，节律活动是对EEG信号的常见描述之一。头皮中占主导地位的大脑信号频段落在1–20 Hz的范围内。脑电节律包括但不限于 Delta，Alpha，Theta，Beta和 Gamma 频段。

​	Alpha是由Hans Berger定义的从 8 Hz 到12 Hz 的主要EEG频段。主要在脑后部区域观察到，并且在优势侧具有更大的幅度，因此，它也被称为“后基本节律” 。当受试者处于清醒闭眼的静止状态下，α波功率将增强。相反，当受试者睁开眼睛或进行精神活动时，α波会减弱，这种电生理现象称为抑制或失步。如果受试者再次闭眼，α波将再次出现并再次增强。 α波的峰值（PAF，peak alpha frequency）大约在7-13 Hz的传统alpha频率范围内，并且存在个体差异。个人PAF（以下简称IAPF, individual alpha peak frequency）与注意力和认知表现有关, 被证明与反应时间呈负相关关系，而与反应时间呈正相关带有工作记忆。此外，古特曼总结指出，阿尔茨海默氏病、抑郁症、注意力集中的受试者的 IAPF 幅度明显降低缺陷多动障碍，脑缺血和颈动脉阻塞。IAB和IAPF的如图所示 ，此处的 IAPF约为12Hz。IAB幅度定义为：
$$
{Relative IAB amplitude= }\frac{\int^{HTF/\Delta f}_{k=LTF/\Delta f}{X(k)}}{HTF-LTF}/\frac{\int^{30/\Delta f}_{k=0.5/\Delta f}{X(k)}}{30-0.5}
$$
*其中LTF表示从 IAPF - 4 Hz到 IAPF的低过渡频率 , HTF的表示从 IAPF Hz到 IAPF + 2 Hz的高过渡频率。

<p align="center"><img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-Literature_review_on_EEG_BCI/02_The-illustration-of-individual-alpha-frequency-band.png" style="zoom:50%"/></p>

​	

​	除了Alpha频段外，其他频段的活动也被证明与不同的行为或状态有关，并且因受试者的年龄，疾病等方面的不同而不同。Delta频段是与慢波睡眠（SMS）相关的高振幅但慢速的波段。Theta频段与潜意识有关，在深度睡眠和深度冥想中增强。Beta频段可细分为 低程Beta（12.5-16 Hz），中程Beta（16.5-20 Hz）和高程Beta（20.5-28 Hz）。低程Beta出现在放松和注意力集中的过程中; 中程Beta出现在思考或脑部信号处理过程中，高程Beta在受试者感到紧张和兴奋时出现。一些神经科学家认为，Gamma波可以帮助解决、整合问题，是意识的关键。



# <font face="黑体" color=green size=5>3. 脑机接口现状和优化方向</font>

​	BCI是一个提供人脑与计算机之间直接连接的系统或电子设备。 BCI系统主要是基于三个BCI开发的
范例：运动想象 (MI)，事件相关电位 (ERP) 和 稳态视觉诱发电位(SSVEP) 。当受试者在脑中想象或打算做单边运动时，大脑发出MI信号，例如打算举起左手或右手，而手实际上并没有移动。心梗期间，感觉区域的能量脑对侧的阻抗会降低，μ（8-12 Hz）节律和 β节律（13-30 Hz）相互削弱，同侧运动感觉区的功率会增加（与事件相关的去同步，ERD）和脑神经元的突触后电位（与事件相关的同步，ERS）增强。ERP是一种基于EEG的脑机接口系统中非常受到关注的范式。经典ERP的主要包括P1，N1，P2，N2，和P3这几个峰谷，如图所示。前三者被称为外生成分，后两者称为内源性成分，与认知过程密切相关。根据刺激方式的不同，可以单独划分为-- 视觉，听觉和体感等不同范式。SSVEP 是在当视网膜接受从3.5 Hz - 75Hz的视觉刺激时，大脑在视觉刺激的相同频率或谐波频率下产生电活动。通过对人脑的经闪光信号刺激产生的EEG信号, 经放大器放大和模拟/数字转换后提取电势最高的频率，与闪光灯刺激器的闪烁频率比较，进而应用在脑机接口。

<img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-Literature_review_on_EEG_BCI/03_ERPsample.png" style="zoom:50%" />

<p align="center"><img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-Literature_review_on_EEG_BCI/04_ITRofBCIs.png" style="zoom:50%"/></p>



​	BCI 的最大问题是“ BCI不兼容”现象，特指无法使用BCI的受试者在BCI 实验中的低绩表现。Lee报告了SSVEP中的低绩概率是10.2％，而 MI 和 ERP 分别为53.7％和11.1％。许多研究中对提高BCI性能进行了研究。多数的优化方法可以大致分为：硬件和实验条件设定；系统设计和流程；信号处理和分类算法。

​	据研究，刺激的类型、颜色、时机和与P300 BCI中的“ BCI不兼容”有关。在基于 SSVEP 的 BCI 中，刺激闪光点的排列对 BCI的效率有很大影响。多范式混合和多脑激活模式混合也时常被研究用以改善BCI分类准确，避免某些类型的“不兼容”。听觉稳态反应（ASSR）和P300 BCI的混合表现优于单一使用的ASSR或P300 BCI系统。Chabuda发现在参加 7 digit-SSVEP-speller的实验中，“ BCI不兼容”的受试者在分布时间模式的相关性和SNR分布方面可以与普通受试者区分开来（通过AUC差异证明）。新提出的基于SSVEP特征的算法也可以增强BCI系统的稳定性（在线），实现了更好的分类性能（离线）。

​	最近的研究中讨论了通过外在因素提高受试者BCI性能的方法，可以分为以下几类：

1. 硬件及其用于EEG记录的实验硬件；

2. BCI系统设计和优化 ；
3. 信号处理和分类算法。
   

​    除了外源性方法外，据信 NF 与BCI具有相似的神经生理过程，因此它被用作一种闭环内源性方法，用以自主调节、训练内在的大脑活动或诱发的EEG模式。一方面，NF 可以作为当前任务的持续反馈： Bakardjiana设计了一种基于NF的优化方案，该方案将SSVEP响应反映在受控对象的图像高度上，并且该方案实现了基于稳健的SSVEP的BCI提高分类精度，并缩短了延迟时间。另一方面，已证明特定的NF训练可改善后续认知或行为任务的表现 ：Mottaz研究发现，通过NF调节 α波的谱功能连通性（FC）可以改善卒中后的运动功能 。 Zich报告称，使用特定EEG通道，NF 使受试者的系统性感觉运动节律（SMR）下降，因此可以增强基于MI的BCI分类准确性。这些研究表明，优化BCI表现不仅取决于外在因素，还取决于它们所依赖的大脑反应。

<p align="center"><img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-Literature_review_on_EEG_BCI/05_NeurofeedbackSample.png" style="zoom:70%"/></p>



