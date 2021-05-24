---
title: 常用的EEG信号预处理
categories: 科研笔记
tags: [EEG&BCI]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

​    脑电信号 (EEG) 的采集常遵守10-20国际系统标准，比如：O1，Oz，O2，PO3，POz，PO4，P3，Pz，P4，C3，Cz，C4，F3，Fz，F4，Fpz等通道。比较常用的ground通道有ground 和reference参考电极有耳后乳突。在采集过程中，操作者依据实际需要对EEG信号以一定的采样率进行采样，然后通过放大器以进行放大。 采集时，要求电极的电路阻抗均保持在10kΩ，甚至 3 kΩ 以下。受试者最好身体处于静止状态，在实验中减少EOG（眼电） 、 EMG（肌电） 、ECG（心电） 等干扰。 

​    以下是比较常用的预处理方式: 

1. 使用带通滤波器或者陷波滤波器基于实验目的进行滤波， 以减少噪声，基线漂移和电源线干扰。在离线预处理分析中，对EEG 常用 0.5 Hz至75 Hz之间的带通滤波器，加以 50Hz的陷波滤波器对工频信号进行过滤。
2. 在时域处理上，绝对幅度超过75 µV 的采样点常被视为噪声（可能来源于 EMG、EOG）。
3. 放大器在采集过程中，可能出现采集到的EEG信号出现漂移，通过detrend进行矫正。

<!--more-->

## <font face="黑体" color=green size=5>1. EEG 波段</font>

EEG的实验中，通常会事先采集受试者的基线，也就是静息状态下的睁眼、闭眼 EEG。

常用的节律有：

alpha 波：8-12 Hz

delta 波：0.5-4 Hz

theta 波：8-12 Hz

beta 波：12-30 Hz, beta1 波：16-20 Hz,  beta2 波：20-28 Hz, 

sigma 波： 12-16 Hz



FFT的计算过程中， NFFT的选择可以是采样频率的倍数（比如：NFFT=Fs*10），或者根据时间长度选择2的倍数（比如：NFFT=2^nextpow2(L) ）。

```
 data(k,:) = detrend(data(k,:));
 L = length(data(k,:));
 NFFT = 2^nextpow2(L);
 fft_result_temp = fft(data(k,:),NFFT)/length(data(k,:));
 frequency(k,:) = Fs/2*linspace(0,1,NFFT/2+1);
 fft_result(k,:) = fft_result_temp(1:NFFT/2+1);
```



单独考虑不同节律时，常常讨论的是它的相对幅度，因此在节律绝对幅度的基础上，除以所有频段的平均幅度。
$$
{Relative Amplitude= }\frac{\int^{HTF/\Delta f}_{k=LTF/\Delta f}{X(k)}}{HTF-LTF}/\frac{\int^{75/\Delta f}_{k=0.5/\Delta f}{X(k)}}{75-0.5}
$$


```
alpha_otmp(i,1)=((sum(Yeopen{i,:}(fo_8:fo_12)))/4)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%alpha
delta_otmp(i,1)=((sum(Yeopen{i,:}(fo_05:fo_4)))/3.5)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%delta
theta_otmp(i,1)=((sum(Yeopen{i,:}(fo_4:fo_8)))/4)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%theta
beta_otmp(i,1)=((sum(Yeopen{i,:}(fo_12:fo_30)))/18)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%beta
ind_theta_otmp(i,1)=((sum(Yeopen{i,:}(fo_4:fc_initial_2)))/(peak_iaf-6))/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%ind_theta
ind_beta_otmp(i,1)=((sum(Yeopen{i,:}(fc_final:fo_30)))/(32-peak_iaf))/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%ind_beta
sigma_otmp(i,1)=((sum(Yeopen{i,:}(fo_12:fo_16)))/4)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%sigma
beta1_otmp(i,1)=((sum(Yeopen{i,:}(fo_16:fo_20)))/4)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%beta1
beta2_otmp(i,1)=((sum(Yeopen{i,:}(fo_20:fo_28)))/8)/((sum(Yeopen{i,:}(fo_05:fo_30)))/29.5);%beta2
```



## <font face="黑体" color=green size=5>2. 对EEG中眼电的处理</font>

绝对幅度超过75 µV 的采样点常被视为噪声，直接在时域截去会造成相位，latency的改变。眼电对EEG的干扰，可以考虑成分分析算法，通过ICA分离EOG, 其中 Second order blind identification (SOBI) 效果拔群。在 EEGLAB  toolbox 有更多类似方法可以选择。


## <font face="黑体" color=green size=5> 3. EEGLAB toolbox</font>

EEGLAB，囊括了常见的脑电信号处理，并可以可视化完成。比较深入的处理方法， 往往EEGLAB里面也会有plugin 。 但它的GUI界面有时存在一些bug，也不方便批量操作。 

EEGLAB toolbox 可能有函数（或者plugin）与 fieldtrip toolbox 有重复函数名， 有些甚至会和MATLAB的initialize项冲突。 使用大型toolbox时，往MATLAB addpath 而不 savepath。

EEGLAB toolbox 的 GUI 操作流程， up主 AlvinLu4016 的教学非常详细。以减少EEG中的EOG为例，我用了大约10个步骤：

步骤1： select data (sampling rate =256)；

步骤2： load event trigger ( 在channel 18记录着 trigger的上升下降沿 )；

步骤3:    set event value (这里我选的0和1）；

步骤4:    filter (0.5-30Hz, 避开工频，暂时只看低频信号）；

步骤5:    extract epochs (-0.5 – 60.5 秒), 因为我们的信号每个epoch是1分钟，一共3个一分钟；

步骤6:    plot spectrum (scroll), 看通道的时域图；

步骤7:   channel selection (2:17), 我们的channel 1 是时间轴；

步骤8： import channel location (导入 .loc 文档）；

步骤 9：run ICA (这里有4中提取方法， SOBI效果总是比较好），然后 select component, plot
preprocessing (normalize）；

步骤10：preprocessing (normalize）。



<img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-EEG_signal_preprocessing/EEGLAB_1.JPG" style="zoom:100%" />



<img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-EEG_signal_preprocessing/EEGLAB_2.JPG" style="zoom:50%" />



<img src="https://github.com/iqgnat/iqgnat.github.io/raw/master/assets/images/2019-07-07-EEG_signal_preprocessing/EEGLAB_3.JPG" style="zoom:50%" />



