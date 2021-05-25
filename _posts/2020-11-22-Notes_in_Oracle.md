---
title: Oracle 常见问题小记
categories: 开发随笔
tags: [database]
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

## <font face="黑体" color=green size=5>1.  TNS 协议适配器错误</font>

1. 检查监听程序是否正常启动 （lsnrctl status），host 是否在添加到监听列表中；
2. 实例服务是否正常运行（select status from v$instance;），服务器有没有挂（ping -t -域名，startup pfile 、spfile ）;
3. 检查注册表（windows：regedit）、 bash_profile (linux: ORACLE_SID) 的实例名是否指向目标数据库实例（ORACLE_SID 必须与instance_name的值一致）。

## <font face="黑体" color=green size=5>2. 数据库名，实例名，服务名，用户名（schema）的区别。</font>

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



## <font face="黑体" color=green size=5>3. 表空间、临时表空间不足。</font>

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

   

## <font face="黑体" color=green size=5>4. 数据装载</font>

1. 数据泵整个数据库的导入导出（oracle导出 oracle导入）；

2. 通过 sqlloader 命令，配合 .ctl 文件导入，大表开并行、direct。

3. 通过 txt 或 csv 文本导入；



## <font face="黑体" color=green size=5>5. 数据量大的情况</font>

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



## <font face="黑体" color=green size=5>6. DDL 语句在存储过程执行。</font>

ddl语句需要加execute immediate 执行（有授权）并进行显式提交，不支持分号多句，支持动态语句。



## <font face="黑体" color=green size=5>7. 表关联出现重复数据。</font>

两表之间关联， 比如 select xxx from A inner join B on 关键字1=关键字2。 如果B表中关键字2存在重复，则 关联出的表的关键字1对应的记录也会成倍出现。 



## <font face="黑体" color=green size=5>8. 显式授权</font>

在 sql 可以完成的操作，在存储过程中报没有权限，需要显式授权。


## <font face="黑体" color=green size=5>9.  开窗函数 over (partition by)</font>

与group by 的区别： over(partition by)返回结果包含重复（原表中存在重复的话） ，和不参与group by 的其他字段。

排序、聚合、行指定 都可以跟在 over 后面。

【https://blog.csdn.net/naomi_qing/article/details/70271883】


## <font face="黑体" color=green size=5>10. 常用sql语句</font>

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

   ```sql
   --1、创建数据库用户，组
   groupadd -g 54321 oinstall
   groupadd -g 54322 dba
   groupadd -g 54323 oper
   groupadd -g 54324 asmdba
   groupadd -g 54325 asmoper
   groupadd -g 54326 asmadmin
   useradd -u 54322 -g oinstall -G asmdba,asmoper,asmadmin grid 
   useradd -u 54321 -g oinstall -G dba,oper,asmdba,asmoper,asmadmin oracle
   
   --2、创建grid与oracle软件安装目录
   mkdir -p  /u01/12.2.0/grid
   mkdir -p /u01/app/grid
   mkdir -p /u01/app/oracle
   chown -R grid:oinstall /u01
   chown oracle:oinstall /u01/app/oracle
   chmod -R 775 /u01/
   
   3、安装依赖包
   yum install -y bc binutils compat-libcap1 compat-libstdc++-33 e2fsprogs e2fsprogs-libs glibc glibc-devel ksh libaio libaio-devel libX11 libXau libXi libXtst libgcc libstdc++ libstdc++-devel libxcb make net-tools nfs-utils smartmontools  sysstat gcc-c++
   
   4、在/etc/hosts文件中设置ip与主机名解析
   
   5、设置grid环境变量，在grid的home目录的.bash_profile文件中添加
   export ORACLE_BASE=/u01/app/grid
   export ORACLE_HOME=/u01/12.2.0/grid
   export ORACLE_SID=+ASM1
   export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
   export NLS_DATE_FORMAT="yyyy-mm-dd hh24:mi:ss"
   export PATH=.:${PATH}:$HOME/bin:$ORACLE_HOME/bin
   export PATH=${PATH}:/usr/bin:/bin:/usr/bin/X11:/usr/local/bin
   export PATH=${PATH}:$ORACLE_BASE/common/oracle/bin
   export ORACLE_PATH=${PATH}:$ORACLE_BASE/common/oracle/sql:.:$ORACLE_HOME/rdbms/admin
   export ORACLE_TERM=xterm
   export TNS_ADMIN=$ORACLE_HOME/network/admin
   export ORA_NLS10=$ORACLE_HOME/nls/data
   export LD_LIBRARY_PATH=$ORACLE_HOME/lib
   export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:$ORACLE_HOME/oracm/lib
   export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/lib:/usr/lib:/usr/local/lib
   export CLASSPATH=$ORACLE_HOME/JRE
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/jlib
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/rdbms/jlib
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/network/jlib
   stty erase ^H
   
   6、设置oracle环境变量，在oracle的home目录的.bash_profile文件中添加
   export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
   export NLS_DATE_FORMAT="yyyy-mm-dd hh24:mi:ss"
   export ORACLE_BASE=/u01/app/oracle
   export GI_HOME=/u01/12.2.0/grid
   export ORACLE_HOME=/u01/app/oracle/product/11.2.0/dbhome_1
   export ORACLE_SID=jkpzdb1
   export PATH=.:${PATH}:$HOME/bin:$ORACLE_HOME/bin:$ORACLE_HOME/OPatch
   export PATH=${PATH}:/usr/bin:/bin:/usr/bin/X11:/usr/local/bin
   export PATH=${PATH}:$ORACLE_BASE/common/oracle/bin
   export LD_LIBRARY_PATH=$ORACLE_HOME/lib
   export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:$ORACLE_HOME/oracm/lib
   export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/lib:/usr/lib:/usr/local/lib
   export CLASSPATH=$ORACLE_HOME/JRE
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/jlib
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/rdbms/jlib
   export CLASSPATH=${CLASSPATH}:$ORACLE_HOME/network/jlib
   export PATH=${PATH}:$GI_HOME/bin
   stty erase ^H  
   
   7、设置内核参数
   
   8、存储绑定
   
   批量绑定脚本
   
   执行命令使绑定生效
   udevadm control --reload-rules
   udevadm trigger --type=devices --action=change
   
   配置ssh互信认证，也可以在安装图形界面配置
   
   oracle优化参数，oracle用户执行sqlplus / as sysdba后执行下面语句，关闭所有节点数据库，重启数据库
   alter system set "_use_adaptive_log_file_sync"=false;
   alter system set "max_dump_file_size"='200m';
   alter system set "_gc_policy_time"=0 scope=spfile;
   alter system set "_gc_undo_affinity"=false scope=spfile;
   alter system set "_optimizer_extended_cursor_sharing"=none;
   alter system set "_optimizer_extended_cursor_sharing_rel"=none;
   alter system set processes=3000 scope=spfile;
   ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;
   alter system set "audit_trail"=none scope=spfile;
   alter system set "deferred_segment_creation"=false;
   ALTER SYSTEM SET EVENT = '28401 TRACE NAME CONTEXT FOREVER, LEVEL 1' SCOPE=SPFILE;
   exec dbms_stats.set_param('method_opt','for all columns size 1');
   exec DBMS_WORKLOAD_REPOSITORY.MODIFY_SNAPSHOT_SETTINGS(retention =>20*24*60);
   
   grid优化参数，grid用户执行sqlplus / as sysasm后执行下面语句
   alter system set memory_max_target=2G scope=spfile;
   alter system set memory_target=2G scope=spfile;
   ```

   

   ## <font face="黑体" color=green size=5>11. 物化视图</font>

>https://blog.csdn.net/joshua_peng1985/article/details/6213593
>
>在 SQL 中，视图是基于 SQL 语句的结果集的可视化的表。视图包含行和列，就像一个真实的表。视图中的字段就是来自一个或多个数据库中的真实的表中的字段。我们可以向视图添加 SQL 函数、WHERE 以及 JOIN 语句，我们也可以提交数据，就像这些来自于某个单一的表。
>
>数据库的设计和结构不会受到视图中的函数、where 或 join 语句的影响。
>
>视图总是显示最近的数据。每当用户查询视图时，数据库引擎通过使用 SQL 语句来重建数据。

```sql
-- 普通视图的创建：
CREATE VIEW view_name AS
SELECT column_name(s)
FROM table_name
WHERE condition


-- 物化视图的创建： 
CREATE MATERIALIZED VIEW [ schema_name. ] materialized_view_name
    WITH (  
      <distribution_option>
    )
    AS <select_statement>
[;]

   -- 其中：
<distribution_option> ::=
    {  DISTRIBUTION = HASH ( distribution_column_name )  | DISTRIBUTION = ROUND_ROBIN   }

<select_statement> ::= SELECT select_criteria
    
-- 样例：
CREATE MATERIALIZED VIEW mv_test2  
WITH (distribution = hash(i_category_id), FOR_APPEND)  
AS
SELECT MAX(i.i_rec_start_date) as max_i_rec_start_date, MIN(i.i_rec_end_date) as min_i_rec_end_date, i.i_item_sk, i.i_item_id, i.i_category_id
FROM syntheticworkload.item i  
GROUP BY i.i_item_sk, i.i_item_id, i.i_category_id
```


普通视图和物化视图根本就不是一个东西，说区别都是硬拼到一起的，普通视图是不存储任何数据的，在查询中是转换为对应的定义SQL去查询，而物化视图是将数据转换为一个表，实际存储着数据，这样查询数据，就不用关联一大堆表，如果表很大的话，会在临时表空间内做大量的操作。

> 普通视图的三个特征：
> 1、是简化设计，清晰编码的东西，他并不是提高性能的，他的存在只会降低性能（如一个视图7个表关联，另一个视图8个表，程序员不知道，觉得很方便，把两个视图关联再做一个视图，那就惨了），他的存在未了在设计上的方便性
> 2、其次，是安全，在授权给其他用户或者查看角度，多个表关联只允许查看，不允许修改，单表也可以同WITH READ ONLY来控制，当然有些项目基于视图做面向对象的开发，即在视图上去做INSTAND OF触发器，就我个人而言是不站同的，虽然开发上方便，但是未必是好事。
> 3、从不同的角度看不同的维度，视图可以划分维度和权限，并使多个维度的综合，也就是你要什么就可以从不同的角度看，而表是一个实体的而已，一般维度较少（如：人员表和身份表关联，从人员表可以查看人员的维度统计，从身份看，可以看不同种类的身份有那些人或者多少人），其次另一个如系统视图USER_TABLE、TAB、USER_OBJECTS这些视图，不同的用户下看到的肯定是不一样的，看的是自己的东西。
>
> 物化视图:
>
> 用于OLAP系统中，当然部分OLTP系统的小部分功能未了提高性能会借鉴一点点，因为表关联的开销很大，所以在开发中很多人就像把这个代价交给定期转存来完成，ORACLE当然也提供了这个功能，就是将视图（或者一个大SQL）的信息转换为物理数据存储，然后提供不同的策略：定时刷还是及时刷、增量刷还是全局刷等等可以根据实际情况进行选择，总之你差的是表，不是视图。



> 物化视图的类型：ON DEMAND、ON COMMIT
>    ON DEMAND: 仅在该物化视图“需要”被刷新了，才进行刷新(REFRESH)，即更新物化视图，以保证和基表数据的一致性；
>    ON COMMIT: 一旦基表有了COMMIT，即事务提交，则立刻刷新，立刻更新物化视图，使得数据和基表一致。
>
> 物化视图的特点：
>    (1) 物化视图在某种意义上说就是一个物理表(而且不仅仅是一个物理表)，这通过其可以被user_tables查询出来，而得到佐证；
>    (2) 物化视图也是一种段(segment)，所以其有自己的物理存储属性；
>    (3) 物化视图会占用数据库磁盘空间，这点从user_segment的查询结果，可以得到佐证；
>    创建语句：create materialized view mv_name as select * from table_name
>    默认情况下，如果没指定刷新方法和刷新模式，则Oracle默认为FORCE和DEMAND。
>
>  ON COMMIT物化视图的创建，和上面创建ON DEMAND的物化视图区别不大。因为ON DEMAND是默认的，所以ON COMMIT物化视图，需要再增加个参数即可。
>
>    需要注意的是，无法在定义时仅指定ON COMMIT，还得附带个参数才行。
>    创建ON COMMIT物化视图：create materialized view mv_name refresh force on commit as select * from table_name
>    备注：实际创建过程中，基表需要有主键约束，否则会报错（ORA-12014）
>
>   刷新的方法有四种：FAST、COMPLETE、FORCE和NEVER。FAST刷新采用增量刷新，只刷新自上次刷新以后进行的修改。COMPLETE刷新对整个物化视图进行完全的刷新。如果选择FORCE方式，则Oracle在刷新时会去判断是否可以进行快速刷新，如果可以则采用FAST方式，否则采用COMPLETE的方式。NEVER指物化视图不进行任何刷新。
>    对于已经创建好的物化视图，可以修改其刷新方式，比如把物化视图mv_name的刷新方式修改为每天晚上10点刷新一次：
>
> ```sql
> alter materialized view mv_name refresh force on demand start with sysdate next to_date(concat(to_char(sysdate+1,'dd-mm-yyyy'),' 22:00:00'),'dd-mm-yyyy hh24:mi:ss')
> ```
>
> 
>
> 5、物化视图具有表一样的特征，所以可以像对表一样，我们可以为它创建索引，创建方法和对表一样。
>
> 

