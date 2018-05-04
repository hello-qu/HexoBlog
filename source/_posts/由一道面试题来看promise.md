---
title: 由一道面试题来看promise
date: 2017-05-23 21:45:49
tags:
---

就在前一段时间，刚刚开年，不少童鞋在面试和在面试的路上，既然要面试，就不得不提到面试题，毕竟做题是最直观反映面试者的编程能力，也有不少人把面试题拍照过来让我帮忙😓，好吧 其实我也并没有帮多大的忙，倒是有几道题让我印象深刻，其中有一道原题是这样的。

> 实现一个`person`对象，有`eat`和`dinner`两种方法
> 请用实例[依次类推]

```javascript
 new person("Tom").sleep(10).eat("dinner");
 //输出
console.log("hello Tom")
//等待10s，
console.log("sleep 10s")，
console.log("eat dinner")
```

这道题想了一下，很容易想到它的考查点，构造函数，链式调用， 同步执行，
前两个很好解决，声明一个构造函数，eat 和 dinner 分别挂载在`prototyoe` 属性上,链式调用直接 `return this` 就好了。 至于同步执行。我一时半会，还没有头绪，一开始想用setTimeOut 函数，但是setTimeOut 是异步执行的 它会首先 输出 eat dinner ，等待10s 后 会输出 sleep 10s ，这样的话顺序就反了。不管怎么说，我们先写下来看看效果。

```javascript
var Person = function(name){
	this.name = name;
	console.log(this.name);
}

Person.prototype.sleep = function(time){
	setTimeout(function(){
		console.log(`sleep ${time}s`);
	},time*1000)
	return this;
}

Person.prototype.eat = function(food){
	console.log(`eat ${food}`);
	return this;
}
function (food){
	console.log(`eat ${food}`);
	return this;
}
```

我们看看输出的结果
￼￼![](http://7xo4z9.com1.z0.glb.clouddn.com/screenshot.png)
 很明显，顺序倒了。

所以说 直接用setTimeout的方法并不可行，那么还有没有其他的方法呢，这时`Promise` 登场了。

如果我们对`promise`不属性 可以看看[MDN_Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
> Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步代码执行结果的成功和失败分别绑定相应的处理方法（handlers ）。 *这让异步方法可以像同步方法那样返回值*，但是并非立即返回执行的结果，因为毕竟执行的是异步代码，因此，它会返回一个Promise对象，如前所说，它是一个代理的对象，代理了最终返回的值，可以在后期使用

> 用成功值value完成一个Promise对象。如果该value为可继续的（thenable，即带有then方法），返回的Promise对象会“跟随”这个value，采用这个value的最终状态；否则的话返回值会用这个value满足（fullfil）返回的Promise对象。

上面引述的话以我自己的理解：实例化一个 全局的 构造函数 `Promise`，实例化一个对象里面调用的方法传参是匿名函数，匿名函数里面是里面又有两个参数，参数`reject` 和`resolve`对应的两种状态，`resolve` 是函数调用成功的的状态，`reject`是失败是的状态，无论成功或失败都会返回一个promise对象。 返回的对象会有一个`then`方法，直到resolve（） ／reject（）执行成功后 之后才会去解析对应的`resolve`和`reject`的值。

```javascript
var promise = new Promise(function(resolve,reject){
   xhr.request(url,{
   body:option,
	 successFun: (res)=> {
		 resolve(res);
		},
	 FailFun: (err) => {
      reject(err);
      }
   })
})

promise.then(function(val){
 console.log(val);   // successFun 里面请求成功的值
},function(err){
  console.log(err). //FailFun 失败的返回值。
})
```


有了这个思路，我们就可以在上面的面试题中用到了，在下一个链式调用中用then方法来获取上个异步的resolve 的值来进行处理。


```javascript
var Person = function(name) {
	this.name = name;
	console.log(this.name);
}

Person.prototype.sleep = function(time) {
	this.promise =  new Promise(function(resolve, reject){
		setTimeout(function() {
			console.log(`sleep ${time}s`);
			resolve();
		}, time * 1000)
	})
	return this
}

Person.prototype.eat = function(food) {
	this.promise.then(function(val){
		console.log(`eat ${food}`);
	})	
	return this;
}
```


￼￼![](http://7xo4z9.com1.z0.glb.clouddn.com/90BABCEF-629B-417E-B101-35D33E8EE2C1.png)

这样的话，貌似可以来完成了。 我们在来看看 面试题，上面有个东东叫“以此类推”，也就是说后来有类似的调用也可以完成，那么到底行不行呢，比如我们睡觉后面再加上跑步40秒，洗澡5秒之类的，是不是也可以。

看了官方的文档，如果有多个resolve 需要执行的话 单纯用一个then 方法是不行的。那么`promise`有没有其他的解决方案呢。
答案是肯定的， 官方文档中有个all 方法。是这么解释的。

> Promise.all(iterable) 方法指当所有在可迭代参数中的 promises 已完成，或者第一个传递的 promise（指 reject）失败时，返回 promise。

就是说我可以设置多个promise 。在所有的promise 的reolve 方法都被被调用时，用all方法可以执行resove中的值，那么我们再改造一下。
```javascript
var Person = function(name) {
	this.name = name;
	this.async = []. //设置迭代promise
	console.log(this.name);
}

Person.prototype.sleep = function(time) {
	this.promise =  new Promise(function(resolve, reject){
		setTimeout(function() {
			console.log(`sleep ${time}s`);
			resolve();
		}, time * 1000)
	})
	return this
}

Person.prototype.eat = function(food) {
	this.promise.then(function(val){
		console.log(`eat ${food}`);
	})	
	return this;
}
```
