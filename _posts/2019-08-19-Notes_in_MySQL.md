---
title: MySQL 小记
categories: 开发随笔
tags: [mysql,sql,database]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
---

MySQL的学习、工作小记。

<!--more-->

## <font face="黑体" color=green size=5>1.  和 Oracle 关于 null 的区别</font>

Oracle： null 等同于空字符

1. 插入空字符串默认替换成 null

2. 查询 null 和被替换的空字符时使用 is null / is not null
3. NVL / NVL2 函数进行判断。

Mysql： null 不等同于空字符

1. 插入null显示为null, 插入空字符串显示空。

2. null 查询用 is null/is not null, 空字符查询用 = ''/<>'' 
3. IFNULL / IF 函数进行判断。
   

## <font face="黑体" color=green size=5>2. Python 接口: mysql 、 pymysql </font>

```python
import mysql.connector       
myconnect=mysql.connector.connect(host='localhost', database='mysql',user='iqgnat',password='iqgnat')
mycursor=myconnect.cursor(buffered=True)
mycursor.execute(“show databases”)
for x in mycursor: Print(x)
mycursor.close()
myconnect.close()
```

```python
import pymysql
connection = pymysql.connect(host='localhost', port=3306, user='iqgnat', 		    password='iqgnat', db='mysql', charset=charset)
cur = connection.cursor()

sql_insert = ["INSERT INTO " + result_table_01 + " (var1,var2,var3,var4,var5,var6)" + " VALUES (%s,%s,%s,%s,%s,%s)"]
sql_insert = ''.join(sql_insert)
data_insert = [tuple(xi) for xi in var_fillna.values]

try:
	cur.executemany(sql_insert, data_insert)
	connection.commit() # 如果gbase借用mysql的接口，即使gbase是自动提交机制，由于借用，需要手动提交。
except:
    connection.rollback()
connection.close()
```



## <font face="黑体" color=green size=5>3. Excel 接口 ： ODBC （C/C++）</font>

1. 安装 Visual Studio Tools for Office Runtime， 下载 MySQL for Excel : https://www.microsoft.com/en-us/download/details.aspx?id=48217 ,  https://dev.mysql.com/downloads/

2. 如果遇到报错：

   > ‘Authentication method 'caching_sha2_password' not supported by any of the available plugin’

   则：
   a. 安装：https://dev.mysql.com/downloads/installer/;
   b. "Reconfigure" MySQL server, 
   c. 在 Authentication Method tab, 选择 Use Legacy Authentication Method“.

3. 在 Excel 的工具栏中，点击 “数据” ->  “MySQL for Excel” (如果没有，则新增组件)。自此，可通过 excel 导数进 MySQL 或者 MySQL 导出数据到 Excel。
   

## <font face="黑体" color=green size=5>4. 数据装载</font>

1. 数据泵 LOAD DATA  文本的导入导出：

   ```mysql
   LOAD DATA LOCAL INFILE 'dump.txt' INTO TABLE mytbl (b, c, a);
     -> FIELDS TERMINATED BY ':'
     -> LINES TERMINATED BY '\r\n';
   ```

2. 通过 source 、 mysql 命令, 导入备份数据库:

   ```mysql
   source /home/abc/abc.sql  ;
   mysql -u用户名    -p密码    <  abc.sql 
   ```

3. LOAD DATA INFILE 命令行接口:

   ```shell
   mysqlimport -u root -p --local --columns=b,c,a --fields-terminated-by=":" \
      --lines-terminated-by="\r\n"  mytbl dump.txt
   password *****
   ```

   

## <font face="黑体" color=green size=5>5. 外键定义的可选项（通用）</font>

```mysql
ALTER TABLE Payment ADD CONSTRAINT `payment_fk`   
FOREIGN KEY(emp_id) REFERENCES Employee (emp_id) ON UPDATE CASCADE;  
```

update 是主键表中被参考字段的值更新，delete是指在主键表中删除一条记录可对应如下四个选项：
	no action ， set null ， set default ，cascade

+ no action 表示 不做任何操作；
+ set null 表示在外键表中将相应字段设置为null；
+ set default 表示设置为默认值；
+ cascade 表示级联操作，就是说，如果为on update cascade，主键表中被参考字段更新，外键表中对应行相应更新；如果为on delete cascade，主键表中的记录被删除，外键表中对应行相应删除。
  

## <font face="黑体" color=green size=5>6. exists 和 in 区别</font> 

+ sql语句方面：exists 需要明确的 ID 关联：

  > EXISTS子查询可以看成是一个独立的查询系统，只为了获取真假逻辑值，EXISTS子查询与外查询查询的表是两个完全独立的毫无关系的表（当第二个表中的name中有包含a的姓名存在，那么就执行在第一个表中查询所有用户的操作）；
  >
  > 第二种情况（使用关联）：当我们在子查询中添加了id关联之后，EXISTS子查询与外查询查询的表就统一了，是二者组合组建的虚表，是同一个表（这样当子查询查询到虚表中当前行的uu.name中包含a时，则将虚表当前行中对应的u.id与u.name查询到了）
  >
  > IN表示范围，指某一字段在某一范围之内，这个范围一般使用子查询来获取，由此可知IN子查询返回的结果应该就是这个范围集。

```mysql
SELECT
	pa.pname 
FROM
	Parts pa
	INNER JOIN Shipments ship ON pa.pid = ship.pid
	INNER JOIN Suppliers sup ON ship.sid = sup.sid
	LEFT JOIN Projects proj ON ship.jid = proj.jid 
WHERE
	exists ( SELECT * FROM Parts pa2 WHERE pa2.COLOR = 'WHITE' and pname= pa.pname )
	
SELECT
	pa.pname 
FROM
	Parts pa
	INNER JOIN Shipments ship ON pa.pid = ship.pid
	INNER JOIN Suppliers sup ON ship.sid = sup.sid
	LEFT JOIN Projects proj ON ship.jid = proj.jid 
WHERE
	pa.pname  in ( SELECT * FROM Parts pa2 WHERE pa2.COLOR = 'WHITE')
	
```

+ 效率方面

IN 在查询的时候，首先查询子查询的表，然后将内表和外表做一个笛卡尔积，然后按照条件进行筛选。所以相对内表比较小的时候，in的速度较快。

EXISTS： 先执行主查询，根据表的每一条记录，执行子查询，依次去判断where后面的条件是否成立。

IN 是把外表和内表作 hash 连接，而 EXISTS 是对外表作 loop 循环，每次 loop 循环再对内表进行查询. IN适合于外表大而内表小的情况；EXISTS适合于外表小而内表大的情况。



## <font face="黑体" color=green size=5>7. 表关联出现重复数据。</font>

+ 两表之间关联， 比如 select xxx from A inner join B on 关键字1=关键字2。 如果B表中关键字2存在重复，则 关联出的表的关键字1对应的记录也会成倍出现。 

+ 自动消除因表关联出现的重复命令：

```mysql
union all
intersect all
except all
```

+ unique() 、distinct () 函数。
  

## <font face="黑体" color=green size=5>8. join ： natural join 、inner join、 join using 区别 </font>

> natural join是对两张表中字段名和数据类型都相同的字段进行等值连接，并返回符合条件的结果 。
> natural join是自然连接,自动对两个表按照同名的列进行内连接
> 使用自然连接要注意，两个表同名的列不能超过1个。

​	inner join 表名 on 表1.列1 = 表2.列2
​    inner join 表名 using 指定的共同列名

```mysql
select name, title from  (student natural join takes)  join course using (course_id);
```


 FULL OUTER JOIN 关键字结合了 LEFT JOIN 和 RIGHT JOIN 的结果。


## <font face="黑体" color=green size=5>9.  触发器 </font>

```mysql
CREATE TRIGGER trigger_name trigger_time trigger_event
ON table_name
FOR EACH ROW
BEGIN
 ...
END;
```

> + 将触发器名称放在`CREATE TRIGGER`语句之后。触发器名称应遵循命名约定`[trigger time]_[table name]_[trigger event]`，例如before_employees_update。触发激活时间可以在之前或之后。必须指定定义触发器的激活时间。如果要在更改之前处理操作，则使用`BEFORE`关键字，如果在更改后需要处理操作，则使用`AFTER`关键字。
>
> + 触发事件可以是`INSERT`，`UPDATE`或`DELETE`。此事件导致触发器被调用。 触发器只能由一个事件调用。要定义由多个事件调用的触发器，必须定义多个触发器，每个事件一个触发器。
>
> + 触发器必须与特定表关联。没有表触发器将不存在，所以必须在`ON`关键字之后指定表名。
>
> + 在触发器的主体中，使用`OLD`关键字来访问受触发器影响的行的`employeeNumber`和`lastname`列。
>
>   在为[INSERT](http://www.yiibai.com/mysql/insert-statement.html)定义的触发器中，可以仅使用`NEW`关键字。不能使用`OLD`关键字。但是，在为`DELETE`定义的触发器中，没有新行，因此您只能使用`OLD`关键字。在[UPDATE](http://www.yiibai.com/mysql/update-data.html)触发器中，`OLD`是指更新前的行，而`NEW`是更新后的行。

触发行为：

```mysql
after update on, 
after delete on,
before insert on, 
before update on, 
before delete on, 
after insert on
```

触发器以前用的场景比较多，现在数据库提供的一些更好的解决方案和封装来代替触发器，比如物化视图来做统计、其他内建支持，创建方法。

```mysql
DROP TRIGGER IF EXISTS advisory_insert;
delimiter | 
CREATE TRIGGER advisory_insert BEFORE insert ON advisory
    FOR EACH ROW 
    BEGIN
        IF not
            (
                exists(select * from undergraduate where student_id = NEW.student_id)
                or exists(select * from graduate where student_id = NEW.student_id)
            ) THEN
        SET NEW.student_id = NULL;
        END IF;
    END;
|
delimiter ;
```



不适合适用触发器的场景（可以在执行此类操作之前禁用触发器执行）：

+ 从备份副本加载数据
+ 在远程站点上复制更新
+ 错误导致触发交易的关键事务失败 
+ 级联执行




## <font face="黑体" color=green size=5>10. 递归查询 （with recursive） </font>

WITH 语句添加一个子查询（临时）, 还可以使用深度优先搜索和广度优先搜索.

递归查询：

```mysql
WITH recursive rec_prereq ( course_id, prereq_id ) AS (
	SELECT
		course_id,
		prereq_id 
	FROM
		prereq UNION
	SELECT
		rec_prereq.course_id,
		prereq.prereq_id,
		
	FROM
		rec_rereq,
		prereq 
	WHERE
		rec_prereq.prereq_id = prereq.course_id 
	) SELECT 
FROM
	rec_prereq;
```



https://www.cnblogs.com/zejin2008/p/5227698.html

https://blog.csdn.net/see_it/article/details/79578779

https://blog.csdn.net/lszzzz/article/details/50544287

https://zhuanlan.zhihu.com/p/37342986

https://stackoverflow.com/questions/24929/difference-between-exists-and-in-in-sql

https://cloud.tencent.com/developer/article/1144244

https://blog.csdn.net/u011630575/article/details/80300418

https://www.yiibai.com/mysql/create-the-first-trigger-in-mysql.html



