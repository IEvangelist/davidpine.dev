---
title: TypeScript - JavaScript Reimagined
published: '2017-05-02'
description: '"Making JavaScript tolerable"'
author: David Pine
tags:
  - JavaScript
  - TypeScript
coverImage:
  src: ./type-writer.jpg
  alt: TypeScript - JavaScript Reimagined
---
# First things First

JavaScript is the world's third most common programming language today. JavaScript was created by [Brendan Eich](https://twitter.com/BrendanEich) in about ten days. It might seem odd that the
previous two sentences not only exist, but go together...yet it is true! JavaScript runs seemingly everywhere and applications written in this
language are only getting larger.

> JavaScript was perhaps intended for 100, maybe up to 1,000 lines of code and now with regularity people are building 100,000 line apps, if not 1,000,000 line apps.
> <cite>[Anders Hejlsberg](https://twitter.com/ahejlsberg)</cite>

## "The Good Parts"

[Douglas Crockford](https://www.crockford.com/) authored a book "JavaScript: The Good Parts", sadly it was a rather short book. If you're a JavaScript developer, knowing "the good parts"
is great - but knowing the limitations and shortcomings of a language is even more powerful. Sometimes it feels like JavaScript is a hammer and not every
problem we're trying to solve is a nail. NodeJs is a great example of this in my opinion -- because I'm a `.NET` developer, but I digress... If you want a good laugh watch
Gary Bernhardt's [WAT video](https://www.destroyallsoftware.com/talks/wat), go ahead -- I'll wait! In all seriousness, JavaScript
is a great programming language for countless reasons, but it is easy to poke fun at.

### Mental Model

I met a fellow technical public speaker who is a well respected JavaScript developer. He was arguing his hatred for TypeScript. There are several key takeaways
from the debate that I think will stick with me for a while.

#### Learn it

> You should learn the JavaScript programming language

I already know JavaScript (but I really don't know JavaScript) -- I would never consider myself an expert or a guru! However, I write TypeScript nearly
every single day that I develop. Some of the aforementioned names are among the very few who might be considered as such. I recall that when this part
of the conversation was encountered, we came up with an analogy.

> Not all JavaScript developers are Tour de France champions (or contenders)

This was the reoccurring analogy and I agreed with it wholeheartedly. That is why I think that TypeScript is like "training wheels" for JavaScript developers.
That is not at all a bad thing! Just look at what you can do with "training wheels".

{{< img-fit
    "7u" "training-wheels.gif" "With style"
    "5u" "training-wheels-2.gif" "Or Bust"
    "0u$" "" ""
    "date" >}}

Seriously though, with that fact that __we are not compilers__ and we cannot predict certain behaviors that occur in the "wild west" of JavaScript -- __we should
rely on tooling to help__. It is simply a pragmatic approach to developing with a true sense of reliability and consistency. Training wheels provide you with the
confidence and security. Once your TypeScript is compiled to JavaScript, the training wheels are removed and your code is ready to brave the new world!

# TypeScript

I could never compete with the TypeScript site. They have a beautifully composed tutorial, handbook and rich set of documentation. If that is what
you're looking for - by all means [go check it out](https://www.typescriptlang.org/docs/tutorial.html). If you'd like to hear more
on my thoughts - keep reading.

All valid JavaScript is also valid TypeScript, as TypeScript is a superset of JavaScript. TypeScript allows you as a developer to program in the
latest version of the ECMAScript standard, while still being about to target all the way back to ES3. Upon compilation, your code is pure JavaScript
and all the type notations are removed. The static type system is only applicable when working with TypeScript related files.

## Extensions Explained

I initially had some confusion about the various file extensions. It was obvious what `.ts` and `.js` files were, but what were these `.map` and `.d.ts` files?
Ironically, `.map` files have been around since CoffeeScript and are nothing new. They map JavaScript files to their corresponding abstractions, in the case of
TypeScript - they map `.ts` to `.js` files. The `.d.ts` files are known as type definitions. They define the public surface area or API if you will, of a given
library. More detail [here ](https://stackoverflow.com/a/37063570/2410379).

## Enough Sales Pitch - Show me some code

The [TypeScript playground](https://www.typescriptlang.org/play/index.html) is an amazing place, since it has a side-by-side of the input TypeScript and the resulting JavaScript.
This is an excellent place to learn how TypeScript works and what it is capable of. I always find it interesting seeing how certain
things are implemented. Take for example an `enum`. In most languages it's easy to take this for granted, the same is true with
TypeScript - but seeing how the resulting JavaScript is really something special.

```typescript
export enum DayOfWeek {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
}
```

This seems like a very clean declaration of an `enum`, right?! We know that `DayOfWeek.Monday` would have a value of `1`, and
`DayOfWeek.Friday` would then be `5` for example. But let's have a look at the JavaScript output.

```javascript
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
    DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
    DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
    DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
    DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
    DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
    DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
})(DayOfWeek || (DayOfWeek = {}));
```

If you look at this look enough, you'll see that it's a rather simple solution. It is essentially a reverse map, where properties
are assigned to from their indexes. On the `DayOfWeek` instance, we declare and assign property `Sunday` equal to `0`. Likewise,
we declare and assign property `0` equal to the value `Sunday`, etc...

### Type Aliases, Generics and  Mapped Types

I recently learned about the `keyof` operator in TypeScript, and wow is it powerful! Let's consider the following mutable object.

```typescript
export class MutableDataBag<T> {
    public data: T;
    public name: string;

    constructor(private id: number) { }
}
```

This is a rather simple object. It defines several members that are `public` and assignable, namely the `data` and `name` members.
Imagine that we decide that we actually expose this structure from an API - but we want it to be immutable, i.e.; `readonly`. Enter
"mapped types".

```typescript
export type Readonly<T> = {
    readonly [P in keyof T]: T[P];
}
```

The type alias of `Readonly` takes on an generic of type `T`, furthermore it defines that all the members of type `T` are accessible
as `readonly` members. This leverages the `keyof` operator in which `P` is accessible so long as it is a member of `T` (key of `T`).
So, now we can return a `Readonly<MutableDataBag<T>>` from our API and rest assured knowing that TypeScript prevents it's members from
being written to.

# Conclusion

This is literally just the tip of the iceberg (or even less). TypeScript has truly made JavaScript tolerable.
TypeScript answers so many questions and addresses so many concerns that it's hard to justify not using...if you're not using
TypeScript, there are other options out there. Pick your poison!!

### Resources

- [IEvangelist - TypeScript](https://github.com/IEvangelist/IEvangelist.TypeScript)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/tutorial.html)
