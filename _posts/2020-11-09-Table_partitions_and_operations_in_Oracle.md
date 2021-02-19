---
title: Oracle 大表分区，并通过 PL/SQL 语句循环执行操作。
categories: 编程随笔
tags: Oracle
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

​	当Oralcle表中有很多条记录，执行增、删、改、groupby、distinct 等操作都很慢，因为要遍历表，全部吃进内存，对临时表空间的要求也很高。通过对大表分区，循环并开并行 对分区表执行操作来提速（感觉是指数级的）。循环执行操作的步骤通过 PL/SQL语句实现。

<!--more-->

# <font face="黑体" color=green size=5>具体步骤</font>

1.  创建表 用于保存分区后的数据

     ```sql
   create table iqgnat_table_partitions (
   cusid  varchar2(16),  
   field_1 date, 
   field_2 char(200), 
   field_3 clob, 
   field_4 number(19,60), 
   field_5 varchar2(4000)
   ) partition by hash (cusid) partitions 512;
     ```

2.  创建日志表

     ```sql
   create table iqgnat_table_hashlog
   (
   tabname varchar2(70),
   step varchar2(20),
   log_time date,
   log_desc varchar2(200));
     ```

3.  将原表灌入分区表

     ```sql
   insert into iqgnat_table_partitions as select * from iqgnat_table;
   commit;
   SELECT * FROM iqgnat_table_partitions;
   SELECT COUNT(1) FROM iqgnat_table_partitions;
     ```

4.  根据具体需求 (以下代码以对记录去重为例)，通过定义匿名包对分区表进行循环操作

     ```sql
   declare
     v_sql  long;
     v_desc varchar2(100);
     v_cnt  number := 0;
   begin
     EXECUTE IMMEDIATE 'ALTER SESSION ENABLE PARALLEL DML';
     --1. 删除数据
     EXECUTE IMMEDIATE 'TRUNCATE TABLE iqgnat_table_partitions';
     INSERT INTO iqgnat_table_hashlog
     VALUES
       ('iqgnat_table_partitions',
        1,
        SYSDATE,
        '清空目标表 iqgnat_table_partitions');
     COMMIT;
     -- 2. 循环执行操作（将目标操作放进V_SQL），并对执行结果记录进日志表
     FOR I IN (SELECT PARTITION_NAME PART_NAME
                 FROM USER_TAB_PARTITIONS
                WHERE TABLE_NAME = 'iqgnat_table_partitions'
                ORDER BY PARTITION_NAME) LOOP
       V_SQL := 'INSERT /*PARALLEL(RRR,8)*/ INTO
                iqgnat_table_partitions
                rrr SELECT /*+PARALLEL(A,8)*/ * DISTINCT from iqgnat_table_partitions PARTITION('||I.PART_NAME||')  A';
     
       EXECUTE IMMEDIATE V_SQL;
       V_CNT := SQL%ROWCOUNT;
       INSERT INTO fxq_hashlog
       VALUES
         ('iqgnat_table_partitions',
          2,
          SYSDATE,
          'iqgnat_table_partitions 加工完成，PART_NAME =' ||
          I.PART_NAME || ',ROWCOUNT=' || V_CNT);
       COMMIT;
     END LOOP;
   
     INSERT INTO ctisduisi_hashlog
     VALUES
       ('iqgnat_table_partitions',
        2,
        SYSDATE,
        'iqgnat_table_partitions 全部分区加工完成。');
     COMMIT;
     --3. 收集统计信息 (需要判断是否有收集的权限)
     /*
     DBMS_STATS.GATHER_TABLE_STATS(OWNNAME          => 'AI',
                                   tabname          => 'iqgnat_table_partitions',
                                   estimate_percent => 5,
                                   degree           => 16,
                                   casacde          => true);
     INSERT INTO iqgnat_table_hashlog
     VALUES
       ('iqgnat_table_partitions', 99, SYSDATE, V_DESC);
     COMMIT;
     */
     RETURN;
   END;
   /
     ```

   

5.  在终端调起 PL/SQL 语句

     ```shell
   msg=`
   sqlplus -S <数据库用户名>/<数据库密码> <<EOF
   set echo on
   set heading off
   set linesize 80
   echo 开始执行PLSQL文件!
   echo "${time}"
   @./ctis_duisi.sql
   echo PLSQL文件执行完毕！
   echo "${time}"
   commit;
   quit;
   EOF`
     ```

   

   



