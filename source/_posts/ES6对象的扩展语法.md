---
title: ES6对象的扩展语法
date: 2017-10-25 15:19:00
tags:  [前端,ES6]
---



>对象的简洁表示

```javascript
let name = "qujun",age = 18
var a = {name,age}
//输出 {name:"qujun",age:18}
```

>属性的简洁表示

```javascript
let person = {
 name:"qujun",
 sayHi(){
 	console.log(`hello,${this.name}`)
 	}
}
// 属性的简写是针对function(){} 的简写 保留上下文(this)
// getter setter使用的就是属性的简洁表示法 但是不能转换成函数表达式或 字面量表示法
```

>属性表达式

```javascript
var pro = "name"
var obj = {
	[pro]:"qujun",
	['first'+'Name']:"qu",
	['sayName'](){
	  console.log(this.name)
	}
}
//output: {name:"qujun",firstName:"qu"}
//属性表达式和间接表达式混用会报错
```
```javascript
//如果属性表达式是非字符串，那么js把属性名进行toString 转换，当作对象的属性名或方法名
var keyA = true;
var keyB = [1,2,3];
var keyC = function(){}

var myObject = {
 [keyA]: 'valueA',
 [keyB]: 'valueB',
 [keyC]:'valueC'
};

myObjec
//output: {true: "valueA", 1,2,3: "valueB", function (){}: "valueC"}
```

<!-- more -->
>方法的name 属性

```javascript
var key1 = "sayName";
var obj = {
   [key1](){
     console.log("hello worold")
   }
}
obj[key1].name   // sayName

```
- getter setter 的情况

	如果对象用 `getter`／`setter` 来读取／设置 属性值，那么就需要在	`getOwnPropertyDescriptor` 方法中获取对应的name值.

```javascript
var obj = {
  get foo() {},
  set foo(x) {}
};
var desc = Object.getOwnPropertyDescriptor(obj,'foo')
desc.get.name //  output:"get foo"
desc.set.name //  output:"set foo"

```
- `bind`的情况	，匿名函数的情况

```javascript
(funtion(){}).name 
 //output: "anonymous"
 
 var func = function(){}
 func.bind().name 
 //output: "bound func"
```
>比较相等 `Object.is()`

```javascript
//相等性于 全等操作符基本一致 不同之处有两处
 +0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true

```

>对象的合并和复制 `Object.assign()`
 
- 用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。

```javascript
var obj = {};

Object.defineProperties(obj,{
    "name":{
        enumerable:false,
        value:"qujun"
        // configurable:true
    },
    "age":{
        enumerable:true,
        // configurable:true,
        value:18
    }
})
console.log(Object.assign({},obj));
//Object {age: 18}
//如果是同名属性，目标属性会覆盖原属性
//如果参数不是对象 会转换成对象，再返回
typeof Object.assign(2) // "object"
Object.assign(undefined) // 报错
Object.assign(null) // 报错

//当目标对象的值是非对象时。会转成包装对象
//当源对象的值除了字符串会拆出来拼成键值对，其他的都会忽略
var obj = "hello"
var bool = true

Object.assign({},obj, bool)
{0: "h", 1: "e", 2: "l", 3: "l", 4: "o"}
```
 - `Object.assign`可以用来处理数组，但是会把数组视为对象。类似于`{0:"a",1:"b",2:"c"}`

```js

Object.assign([1,2,3,4,5],[3,4,5])
//(5) [3, 4, 5, 4, 5]

```
- 同名属性只替换不添加

```js
var target = {a:{b:"c"}};
var source = {a:{b:{c:"d"}}};
Object.assign(target,source);
//a:b:{c: "d"}
```

- 取值函数直接求值

```js
const source = {
    get name(){
        return "qujun"
    }
}
Object.assign({},source);
// {name:qujun}
```

>常见的用途：

1. 为对象添加属性
2. 为对象添加方法
3. 克隆对象
4. 为属性指定默认值（属性必须是简单类型）

>属性的可枚举和可遍历

```js
//定义属性的配置参数
Object.defineProperties(obj,{
    "name":{
        value:"qujun",
        enumerable:false,
        configurable:true,
        writable:true
    }
})

obj
Object.getOwnPropertyDescriptor(obj,'name');
//Object {name: "qujun"}
//Object {value: "qujun", writable: true,enumerable: false, configurable: true}
//
```

> 设置／读取对象的原型属性

- 设置对象的原型属性

```javascript
var obj = {};

Object.setPrototypeOf(obj,{
    x:1,
    y:2
})
//output:{}__proto__: x: 1y: 2__proto__: Object
```
- 读取对象的原型属性

```javascript
Object.getPrototypeOf(obj)
//output:{x: 1, y: 2}
```
> super指向当前对象的原型对象

```javascript
const proto = {
  foo: 'hello'
};

const obj = {
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto);
obj.find() // "hello"
```
>Object.keys() 返回一个数组，包含对象中的所有可遍历的属性名

>Object.values() 返回一个数组，包含对象中的所有可遍历的属性值

>Object.values() 返回一个数组，包含对象中的所有可遍历的属性的键值对

```javascript
Object.entries(obj);

[["name", "qujun"],["age", 18]]
```
>对象的扩展运算符



