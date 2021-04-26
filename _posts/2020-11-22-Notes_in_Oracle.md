---
title: Oracle 工作笔记 
categories: 开发随笔
tags: [oracle,sql]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

1. TNS 协议适配器错误
2. 数据库名，实例名，服务名，用户名（schema）的区别
3. 表空间、临时表空间不足
4.  数据装载
5. 数据量大的情况
6. DDL 语句在存储过程执行
7. 表关联出现重复数据
8. 显式授权
9. 开窗函数 over (partition by)
10. ...

<!--more-->

# <font face="黑体" color=green size=5>1.  TNS 协议适配器错误</font>

1. 检查监听程序是否正常启动 （lsnrctl status），host 是否在添加到监听列表中；
2. 实例服务是否正常运行（select status from v$instance;），服务器有没有挂（ping -t -域名，startup pfile 、spfile ）;
3. 检查注册表（windows：regedit）、 bash_profile (linux: ORACLE_SID) 的实例名是否指向目标数据库实例（ORACLE_SID 必须与instance_name的值一致）。

# <font face="黑体" color=green size=5>2. 数据库名，实例名，服务名，用户名（schema）的区别。</font>

实例 = 进程 + 进程所使用的内存( 系统全局区SGA)

数据库 = 重做文件 + 控制文件 + 数据文件 + 临时文件

服务 = 实例 + 数据库

用户（schema）= 一个用户下，数据库对象的集合。



单机 Oracle 情况下，数据库名可以和实例名一样。在 RAC 中， 一个数据库有多个实例名（多个实例同时打开一个数据库文件的系统）。服务名 就是对外公布的名称，为网络监听服务，所以一个数据库可以有多个服务名。sid用于实例区分各个数据库，service name用于外部链接。



举例【https://www.zhetao.com/content240】：

```
打个比方，你的名字叫小明，但是你有很多外号。你父母叫你小明，但是朋友都叫你的外号。

这里你的父母就是oracle实例，小明就是sid，service name就是你的外号。
```

=======================================================================================

Oracle连接串：

​	用户名/密码@主机名:端口号/实例号

​	用户名/密码@主机名:端口号:服务名

Python接口：

```
连接：
cx_Oracle.Connection(用户名/密码@主机名:端口号/实例号)
cx_Oracle.Connection(用户名/密码@主机名:端口号:实例号)

插数：
INSERT INTO <schema>.<table> (字段1，字段2) VALUES (:1,:2)
```



# <font face="黑体" color=green size=5>3. 表空间、临时表空间不足。</font>

```sql
 --查看（临时）表空间大小
 select tablespace_name , bytes/1024/1024/1024 as "space(M)" from dba_temp_files where tablespace_name ='TEMP';
 
 --查看（临时）表空间使用情况
 select D.tablespace_name,
 space "sum_space(G)",
 blocks "sum_blocks",
 used_space "USED_SPACE(G)",
 ROUND(NVL(USED_space,0)/space *100,2) "used_rate(%)",
 space - used_space "FREE_SPACE(G)"
 from (select tablespace_name,
 round(sum(bytes)/(1024*1024*1024),2) space,
 sum(blocks) blocks
 from dba_temp_files
 group by tablespace_name) D,
 (select tablespace,
    round(sum(blocks *8192)/(1024*1024*1024),2) used_space
 from v$sort_usage 
 group by tablespace) F
 where D.tablespace_name = F.tablespace(+)
 and d.tablespace_name in ('TEMP','TEMP1')
 
 -- 查看用户下各对象所占空间
select owner,
       t.segment_name,  
       t.segment_type,
       sum(t.bytes / 1024 / 1024 / 1024) mmm
  from dba_segments t
 where 
    t.owner = '用户名'
 group by owner, t.segment_name, t.segment_type
 order by mmm desc;
```

1. 考虑释放高水位线：move、shrink space、truncate 表重建代替delete等。

2. 新增数据文件到表空间。

3. 考虑压缩表（但降低UPDATE和DELETE语句的性能），ctas操作代替insert等优化。

4. 分析具体语句影响的块数量。

   

# <font face="黑体" color=green size=5>4. 数据装载</font>

1. 数据泵整个数据库的导入导出（oracle导出 oracle导入）；

2. 通过 sqlloader 命令，配合 .ctl 文件导入，大表开并行、direct。

3. 通过 txt 或 csv 文本导入；



# <font face="黑体" color=green size=5>5. 数据量大的情况</font>

1. 查询：避免全表扫描（避免  or and，in not in， like，!=, 字段表达式）
2. 压缩 （牺牲UPDATE、DELETE语句的性能 ）
3. 索引（降低访问数据的I/O）。
4. 分区，shell 循环执行 DML、 DDL操作 （对比在对近60亿条记录进行update的速度，由十几小时提升到半小时）。
5. hint 开并行。
6. 查看执行计划，sql性能分析，统计数据收集。
7. 更合适的系统设计。

分区类型：

范围分区 – 每个分区定义了上限值

哈希分区– 数据按分区健的哈希值分布

列表分区 – 每个分区存储预先定义的健值

二级分区

分区过多： DML, DDL或者其他数据字典的操作会对性能导致显著的负面影响

【参考：https://www.oracle.com/oce/dc/assets/CONTB48FAA109DD74654AC2F94E4D62BEA35/native/oracle-database-19c-webinar-l24.pdf?elqTrackId=98f78db5b0ca44cca0270a4248c9d356&elqaid=89270&elqat=2】



```sql
-- 查看执行计划
select operation, options, cost,cardinality,bytes,cpu_cost,io_cost,hash_value,sql_id,plan_hash_value,
timestamp,object_name,
ID,parent_id,depth,position,access_predicates,time,qblock_name
from v$sql_plan where sql_ID='ID号';
     
select * from table(dbms_xplan.display_awr('ID号'))
```

```sql
 -- 统计信息收集：表（举例）
 execute dbms_stats.gather_table_stats (ownname => '用户名',tabname=>'表名',estimate_percent=>5,degree=>16,cascade=true );
 对大表设置较低的采样比例estimate_percent。
```



# <font face="黑体" color=green size=5>6. DDL 语句在存储过程执行。</font>

ddl语句需要加execute immediate 执行（有授权）并进行显式提交，不支持分号多句，支持动态语句。

# <font face="黑体" color=green size=5>7. 表关联出现重复数据。</font>

两表之间关联， 比如 select xxx from A inner join B on 关键字1=关键字2。 如果B表中关键字2存在重复，则 关联出的表的关键字1对应的记录也会成倍出现。 

# <font face="黑体" color=green size=5>8. 显式授权</font>

在 sql 可以完成的操作，在存储过程中报没有权限，需要显式授权。



# <font face="黑体" color=green size=5>9.  开窗函数 over (partition by)</font>

与group by 的区别： over(partition by)返回结果包含重复（原表中存在重复的话） ，和不参与group by 的其他字段。

排序、聚合、行指定 都可以跟在 over 后面。

【https://blog.csdn.net/naomi_qing/article/details/70271883】

# <font face="黑体" color=green size=5>10. 常用sql语句</font>

```sql
---- 管理员：
--赋角色权限
 grant select on DBA_SEGMENTS to 用户名;
 grant dba to 用户名 with admin option;
 
--收回角色权限
  revoke connect,resource from 用户名;
  
-- 非管理员进行开发期间常用的角色权限（可能报错系统节点启动失败）
-- 1.创建开发角色 （赋连结、创建、debug 等权限）
-- 2.赋开发角色到用户。

---- 开发过程：
-- 查看存储过程锁
	select c.sql_text,a.spid from gv$process a , gv$session b, gv$sql C
where b.paddr=a.addr and b.sql_address=c.address and lower (c.sql_TEXT) like '%存储过程名%'


-- 查看正在进行的sql进程
set linesize 400;
set pagesize 400;
set long 4000;
col sql_fulltext format a100;
col machine format a25;
col username format a15;
select a.username , a.machine, b.sql_id, b.sql_fulltext,a.status from v$session a, v$sqlarea b where a.sql_address =b.address
and a.sql_hash_value = b.hash_value and username='用户名';

select * from v$sql s, v$session t, v$process v where s.sql_id = t.sql_id and t.paddr=v.addr;

-- 查看已kill进程
select a.spid, b.sid,b.serial#,b.username from v$process a, v$session b where a.addr=b.paddr and b.status ='KILLED';
（如果资源未释放，kill不掉，可能需要从操作系统对kill进程）

```

其他（进行中）：

1. oracle 、grid、cluster 安装步骤.

   2.物化视图