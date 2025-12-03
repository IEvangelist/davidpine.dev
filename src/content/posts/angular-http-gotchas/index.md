---
title: Angular HTTP Tips For Success
published: '2018-06-25'
description: RxJS Map to the rescue!
author: David Pine
tags:
  - Angular
  - Http
  - RxJS
  - TypeScript
coverImage:
  src: ./map.jpg
  alt: Angular HTTP Tips For Success
---
## Intro

I love working with the __Angular__ `HttpClient`. It is easy to use and was designed to work with __RxJS__. It is vastly different from the __AngularJS__ implementation, if you're curious I wrote about these differences {{< url-link "here" "" >}}. However, there is one common issue that developers fall victim to. The issue really relates to __TypeScript__ generics. I have also written about generics in __TypeScript__ [here](https://www.dotnetcurry.com/typescript/1439/typescript-generics). But in this post, we will reveal how the issue can easily be avoided.

## The problem

The problem is that the `HttpClient` class exposes generic methods that allow consumers to make assumptions, these assumptions are dangerous.

> <cite>__ProTip__</cite>
> Never... make... assumptions!

<br/><br/>

The assumption is that you can pass an `interface` with non-primitive types or a `class` as a generic type parameter, and that it will work as expected. This is simply __not the case__. Consider the following:

```typescript
public getDetails(id: number): Promise<Details> {
    return this.http
               .get<Details>(`${this.baseUrl}/api/details/${id}`)
               .toPromise();
}
```

Most of the time we'd pass in an `interface` as the type parameter. Often this _seems_ to work as the `interface` is a simple property bag of primitive types. The issue is that if the `interface` defines non-primitive types like a `Date` or a `Function` -- these will not be available at runtime. Likewise, if you pass in a `class` with `get` or `set` properties -- these too __will not work__! The specific problem is that the underlying implementation from __Angular__ doesn't instantiate your object. Instead, it simply casts it as the given type. Ultimately, __Angular__ is performing a `[JSON.parse](https://github.com/angular/angular/blob/master/packages/common/http/src/xhr.ts#L186-L189)` on the body of the response.

Part of the issue is that __TypeScript__ is blissfully unaware that __Angular__ will not instantiate the object and treats the return as a `Promise<Details>`. As such flow analysis, statement completion, and all the other amazing features that the __TypeScript__ language services provide to your development environment work. But this is misleading because you'll encounter runtime errors -- this is the issue that __TypeScript__ aims to solve!

## Working Example

An `interface` with primitive types will work just fine. The `JSON.parse` will give you an object and because of __JavaScript__ coercion, it works. __TypeScript__ will treat it as this object and everything is perfect.

```typescript
export interface Details {
    score: number;
    description: string;
    approved: boolean;
}
```

## Non-Working Example

Imagine that we want to return another property from the server, so we add a `Date` property. Notice how our `interface` added this new property. Now we want to do some date logic and use some of the methods on the `Date` instance -- this __will not work__!

```typescript
export interface Details {
    date: Date;
    score: number;
    description: string;
    approved: boolean;
}
```

The `details.date` property will exist, sure... but it __will not__ be a `Date` instance -- instead it is simply a `string`. If you attempt to use any of the `string` methods, it will fail at runtime.



[View on CodePen](https://codepen.io/pen/pKZYbL)



Ah, we can fix this -- right?! We might think to ourselves, we'll use a `class` instead and then add a `getDate()` "get function" property that will pass the `.date` member to the `Date` constructor. Let's look at this.

```typescript
export class Details {
    date: Date;
    score: number;
    description: string;
    approved: boolean;

    get getDate(): Date {
        return new Date(this.date);
    }
}
```

Perhaps to your surprise, this __doesn't work__ either! The `Details` type parameter is not instantiated.



[View on CodePen](https://codepen.io/pen/QxBogQ)



If we add a `constructor` to our `class` and then pass in a `data: any` argument, we could easily perform an `Object.assign(this, data)`. This solves several issues

> The `Object.assign()` method is used to copy the values of all enumerable own properties from one or more source objects to a target object. It will return the target object.
> <cite>[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)</cite>

<br/><br/>



[View on CodePen](https://codepen.io/pen/mKjoKW)



## JavaScript to the rescue

What's to stop a consumer from trying to interact with the `details.date` property -- if you recall it is still typed as a `Date`. This is error-prone and will cause issues -- if not immediately, certainly later on. Ideally, all objects that are intended to map over from JSON should contain primitive types only.

If you're set on using a `class`, you should use the __RxJS__ `map` operator.

```typescript
public getDetails(id: number): Promise<Details> {
    return this.http
               .get<Details>(`${this.baseUrl}/api/details/${id}`)
               .map(response => new Details(response.json()))
               .toPromise();
}
```

But what if we wanted an array of details to come back -- that's easy too?! 

```typescript
public getDetails(): Promise<Details[]> {
    return this.http
               .get<Details>(`${this.baseUrl}/api/details`)
               .map(response => {
                   const array = JSON.parse(response.json()) as any[];
                   const details = array.map(data => new Details(data));
                   return details;
               })
               .toPromise();
}
```

### Types That Work Without Intervention

This table details all the primitive types that will map over without a `constructor` or any other intervention.

| Primitive Types | Description                              |
|----------------:|:-----------------------------------------|
| `string`        | Already a `string` anyways               |
| `number`        | Coercion from `string` to `number`       |
| `boolean`       | Coercion from `string` to `boolean`      |
| `array`         | As long as all types are primitives also |
| `tuple`         | Follows same rules as `array`            |

# Conclusion

While __TypeScript__ and __Angular__ play nicely together, at the end of the day we're all battling __JavaScript__. As long as you're aware of how your tool, framework, or technology works and why it works a certain way -- you're doing great! Take this bit of knowledge and share it with the world. If it helps you, hopefully, it will help someone else too!
