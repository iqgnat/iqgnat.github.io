---
title: Python进程判断和crontab阻塞调起
categories: [课堂笔记,科研工具]
tags: 课堂笔记
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

现象描述： 

按日出现 Croncheck_comrisk_pid.py 和 按小时出现Call_polling.py 的无数进程，拖垮服务器内存和swap空间，导致服务器宕机。

<!--more-->

# <font face="黑体" color=green size=5>现象分析 </font>

现象分析：

1. 出现无数 Croncheck_comrisk_pid.py 进程（crontab应该非阻塞调起）；
2. Croncheck_comrisk_pid.py的主线程 应该在 确认过call_polling 进程存在（或者调起后) 退出，进程保留。 
3. 出现无数 Call_polling.py 进程（检查 Croncheck_comrisk_pid.py 中判断Call_polling.py 进程是否存在的函数是否有效）；
4. Call_polling.py 进程一直存在（scheduler的设定，正确）；



# <font face="黑体" color=green size=5>解决方法</font>

1. 非阻塞调起 ： crontab 中加上 flock –x (解决多 个 Croncheck_comrisk_pid.py 问题)。
2. 经确认，主线程没有被子线程阻塞（没有join）。没有daemon，主线程意外结束，子线程依然保留。该脚本内容可以通过crontab非阻塞来实现，考虑删除该部分。
3. 在psutil判断进程名字不是关键字搜索，而是精准匹配，可以改为正则匹配。也可以直接起一个子进程通过pgrep 判断。

# <font face="黑体" color=green size=5>代码更改</font>

在Call_polling.py 需要修改对 comrisk_model.sh 进程是否存在的判断。 因为进程名包含路径名， comrisk_model.sh 不是完整的进程名，用 pgrep 命令代替 psutil包+正则 更简便，修改代码如下：

原始：

```python
def judgeprocess(processname):
    pl = psutil.pids()
    localtime = time.asctime(time.localtime(time.time()))
    for pid in pl:
        if psutil.Process(pid).name() == processname:
            logging.warning('当前时间：' + localtime + '--进程尚未结束，一小时后轮询。')
            pid_stat = True
            return pid_stat
        else:
            pid_stat = False
            return pid_stat
```

修改后：

```python
def judgeprocess_restart(processname):
    # pl = psutil.pids()
    localtime = time.asctime(time.localtime(time.time()))
    # for pid in pl:
    #     if psutil.Process(pid).name() == processname:
    #         pid_stat = True
    #         logging.info('当前时间：' + localtime + '轮询进程存在。')
    #         return pid_stat
    #     else:
    #         pid_stat = False
    #         logging.warning('当前时间：' + localtime + '轮询进程不在，重新调起...')
    #         os.system(python_path + ' ' + abs_path_more + processname + ' ' + abs_path)
    #         return pid_stat

    child = subprocess.Popen(['pgrep', '-f', processname], stdout=subprocess.PIPE, shell=False)
    response = child.communicate()[0]
    flag = [int(pid) for pid in response.split()]

    if any(flag):
        pid_stat = True
        logging.info('当前时间：' + localtime + '轮询进程存在。')
    else:
        pid_stat = False
        logging.warning('当前时间：' + localtime + '轮询进程不在，重新调起...')
        os.system(python_path + ' ' + abs_path_more + processname + ' ' + abs_path)
    return pid_stat

```

# <font face="黑体" color=green size=5>最终方案 </font>

1. 删除Croncheck_comrisk_pid.py 脚本
2. Crontab  非阻塞调起 Call_polling.py 脚本
3. Subprocess、communite、pgrep  来判断进程是否存在。