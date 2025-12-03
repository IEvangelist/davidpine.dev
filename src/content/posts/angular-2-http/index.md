---
title: Angular2 Http with RxJS Observables
published: '2016-08-31'
description: Subscribing has never been so easy
author: David Pine
tags:
  - Angular
  - Http
  - RxJS
  - TypeScript
coverImage:
  src: ./observables.png
  alt: Angular2 Http with RxJS Observables
---
If you have been following the development efforts of the **Angular2** project, you have witnessed certain highs and lows - but it has been a fun ride. The latest version is only a **Release Candidate** and the team
is getting closer to the final release. I'm really looking forward to that! I wanted to take a moment to highlight (IMO) one of the key services of **Angular2**, the `http` service.

In **AngularJs 1** the `ng.IHttpService` (aka, [`$http`](https://docs.angularjs.org/api/ng/service/$http)) was based on
[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and deferrals.
In **Angular2** we now rely on **RxJS** and the observable pattern. In my opinion this is a huge win!
If you're unfamiliar with _Reactive Extensions_ in general, I suggest starting [here](https://msdn.microsoft.com/en-us/data/gg577609.aspx).
**RxJS** is the `JavaScript` implementation of _Reactive Extensions_.
Let's take a moment to compare and contrast the two, and immerse ourselves in the wonderful world of **RxJS**.
Let me be clear upfront that I'm developing with `TypeScript`.

## Legacy Pattern

As a developer you would have to use both the `ng.IHttpService` and the `ng.IQService` in combination to collaborate the deferral of the
HTTP request and the promise that represented it. Consider the following:

```javascript
module ExampleModule {
    export class ExampleService implements IExampleService {
        static $inject = ["$http", "$q"];

        private $http: ng.IHttpService;
        private $q: ng.IQService;

        constructor($http: ng.IHttpService, 
                    $q: ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }
        
        public getFooBars(): ng.IPromise<FooBar[]> {
          var deferred = this.$q.defer<FooBar[]>();
          this.$http
              .get("api/foobar")
              .success((data) => {
                  deferred.resolve(data);
              })
              .error((error) => {
                  console.log("An error occurred when requesting api/foobar.", error);
                  deferred.reject(error);
              });

          return deferred.promise;
        }
    }
}
```

In this example, we can easily see the interaction betwixt the `ng.IHttpService ($http)` and `ng.IQService ($q)` services. The `$q` variable exposes a `.defer<T>` function that returns a deferred object.

### [Deferred API](https://docs.angularjs.org/api/ng/service/$q#the-deferred-api)

| Function | Parameters | Description |
|---------:|:------------|:-----------|
| `resolve`| `(value: T)`  | Resolved yielding the materialized value of type `T` |
| `reject` | `(reason: string)` | Rejected with the given reason |

The deferred object instance is passed into the fluent API's of the `$http's` `.success` and `.error` functions accordingly. This pattern works great, but is very limiting and repetitive.
You end up writing a lot of boilerplate code and that isn't very [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). Let's look at how this is approached with **Angular2's** `http` service using the observable pattern from **RxJS**!

## New Pattern

To be fair, let's implement the same functionality and public surface-area such that our example services are equivalent.

```javascript
import {Observable} from "RxJS/Rx";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

@Injectable() export class ExampleService {
    constructor(private http: Http) { }

    getFooBars(onNext: (fooBars: FooBar[]) => void) {
        this.http
            .get("api/foobar")
            .map(response => response.json() as FooBar[])
            .subscribe(onNext,
                       error => 
                       console.log("An error occurred when requesting api/foobar.", error));
    }
}
```

_I am hoping that you noticed how much cleaner this code is, as well as how much more readable!_

Now, I know what you're thinking...these cannot possibly be the same examples, but they are in fact doing the same thing. _Dependency Injection (DI)_ in **Angular2** is a lot less error prone (no more magic strings) and way easier than
it was in **AngularJs 1**.
Simply do what you'd expect from any other common constructor-based DI framework, ensure that your desired `Http` type is registered as a provider to the system. This happens by way of the `HTTP_PROVIDERS` defined in our `boot.js` file.
More on that in another post. With modern `TypeScript` we can define properties and fields, and their corresponding access modifiers right from within our constructors.

#### Syntax Tip

This exemplifies the comparisons in syntax between a simple constructor and the more verbose constructor.

```javascript
// Simple .ctor()
constructor(private http: Http) { }

// Is equivalent to...
private http: Http;
constructor(http: Http) {
   this.http = http;
}
```

Likewise, the following is true regarding public access modifiers.

```javascript
// Simple .ctor()
constructor(http: Http) { }

// Is equivalent to...
http: Http; // When the access modifier is omitted it's defaulted to public
constructor(http: Http) {
   this.http = http;
}
```

## Comparing the APIs

Instead of the `.success` invocation with a corresponding `deferred.resolve` call, we now utilize the **RxJS** `.map` and `.subscribe` operators. Let's look at these below:

| Operator | Description |
|---------:|:------------|
| [`map`](https://reactivex.io/documentation/operators/map.html) | Transform the items emitted by an `Observable` by applying a function to each item |
| [`subscribe`](https://reactivex.io/documentation/operators/subscribe.html) | The `Subscribe` operator is the glue that connects an observer to an `Observable` |

Mapping is easy and we can leverage some of the `TypeScript` language features to cast the **JSON** blobs returned from our services as strongly typed objects. The `map` operator is actually
synonymous with the `select` operator, so if you're more familiar with that terminology you can use it interchangeably.

### Advantages

Now that we have an understanding of how **RxJS** compares to the legacy pattern, we can take advantage of all the various benefits. Imagine with me that we have a need to implement retry logic,
this would have been challenging with the legacy pattern but with the new pattern it's as simple as saying `.retry`. Consider the following:

```javascript
// If this call fails, we'll try it again with the same payload two times
getFooBars(onNext: (fooBars: FooBar[]) => void) {
    this.http
        .get("api/foobar")
        .map(response => <FooBar[]>response.json())
        .retry(2)
        .subscribe(onNext,
                   error => 
                   console.log("An error occurred when requesting api/foobar.", error));
}
```

Now imagine a scenario where a user is typing and you want to provide an autocomplete, you could use `.debounce` to pause for a brief moment prior to sending the request. Likewise,
we could apply a `.filter` that only takes action when a certain number of characters have been entered. Finally, we might utilize `.distinctUntilChanged` to only execute the request once
the values are actually different than they once were.

You could take advantage of `.buffer`, `.throttle`, `.interval`, `.window`, `.range`, etc... The list goes on and on,
and [this is the source for most of what you can take advantage](https://github.com/Reactive-Extensions/RxJS/tree/master/src/core/linq/observable).

### Let's Summarize

**Angular2** has a new implementation of their `http` service that relies on **RxJS**. The _API_ uses `observables` and the `observer` pattern to allow for a fluent experience that is rich and robust.
Getting started is straight-forward and simple. Before too long you'll be taking advantage of the feature-full set of **Reactive Extensions** and thinking in terms of data streams.
This mindset will make your life easier - trust me!  

**Further Reading**

- [Angular2 for TypeScript, Http](https://angular.io/docs/ts/latest/api/http/index/Http-class.html)
- [Why RxJS?](https://github.com/Reactive-Extensions/RxJS#why-RxJS)
