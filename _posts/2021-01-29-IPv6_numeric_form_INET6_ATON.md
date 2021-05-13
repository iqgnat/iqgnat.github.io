---
title: IPV6 转换为长整型遇到的问题：INET6_ATON 转为二进制数值型
categories: 开发随笔
tags: [sql]
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

现要将 IP 地址在数据库以数值型保存，用于在 IP地址映射表（例如， IPv4城市映射表 。 startnum：1677712， endnum： 1677812， city： 上海）找到具体城市。

IPv4 的地址是32位，用四个字节表示一个IP地址，每个字节按照十进制表示为0~255，经转换后的长整型是 字节1×256×256×256 + 字节2×256×256 +  字节3×256 + 字节4*1， 依然为32位， 在mysql 、 oracle 数据库都可以以整型存储（mysql: bigint / oracle: number）。

那么，以十六进制 128位地址 保存的 IPv6 如何在数据库保存成数值型呢？

<!--more-->

# <font face="黑体" color=green size=5>问题分析</font>

1. 数据库中的整型 位数是否能满足 IPv6 转为整型后的位？

   Oracle 的数值类型有number（38位）【integer（38位），float (38位)】 ， Mysql 中的 bigint是8字节（64位），浮点型double也是64位，decimal (M, D)  以字符串来保存数值，占位 (M + 2, D) ，M最大精度位数为65位。两种数据库十进制的数值表达都不能满足 占128位的 IPv6 地址。 

2. 满足转换后的ip地址可以与映射表中的城市ip范围进行比较即可，考虑二进制存储。

   以mysql为例，INET_ATON可以将 IPv4 地址转换成 int 类型保存， INET6_ATON 可以同时转换 ipv4 或 ipv6 为varbinary 类型， varbinary  是 numerical form 格式，可以对 ip 地址进行检索和比较。

   手册[https://dev.mysql.com/doc/refman/5.6/en/miscellaneous-functions.html]



# <font face="黑体" color=green size=5>代码更改</font>

原始 mysql 脚本：

```python
-- 将转换后的ip地址存储为字符串，以 ‘|’ 间隔，调用时转换为数值型。
delimiter / ;

create or replace function ipaddr_deal(ipaddr in varchar2) return varchar2(4000) as
begin
  if ipaddr like '%.%' then
    return CONCAT_WS('|',INET_ATON(ipaddr),NULL);
																							
  elsif ipaddr like '%:%' then
    return CONCAT_WS('|',NULL,INET6_ATON(ipaddr));

  else
    return null;
  end if;

exception
  when others then
    return null;

end ipaddr_deal;
/

create or replace function split_str(x varchar(510), delim varchar(12), pos int) returns varchar(4000) deterministic
begin 
return replace(substring(substring_index(x, delim, pos), length(substring_index(x, delim, pos -1)) +1 ), delim , '');
end
/

-- ipv4 长整型调用：
SET ipv4long = cast(split_str(ipaddr_deal(ipaddr), '|', 1)  as bigint);
-- ipv6 二进制数值型调用：
SET ipv6long = cast( split_str(ipaddr_deal(ipaddr), '|', 2 as varbinary);
```

修改后 mysql 脚本：

```python
-- 将转换后的ip地址都存储为varbinary
INET6_ATON(ipaddr)
```



 gbase 数据库暂无 INET6_ATON 的内建函数，也不支持128位的数值数据类型 。

