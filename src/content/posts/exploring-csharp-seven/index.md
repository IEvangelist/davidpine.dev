---
title: Exploring C# 7
published: '2017-03-26'
description: 'Expressiveness Redefined & #notasugly'
author: David Pine
tags:
  - .NET
  - C#
  - Visual Studio
coverImage:
  src: ./exploration.png
  alt: Exploring C# 7
---
# Intro

Since we have all been actively celebrating the 20<sup>th</sup> anniversary of **Visual Studio**, it felt appropriate to post about **C# 7**!
In this post we will explore the features that make **C# 7** so promising. I've put together a demonstration **C# 7** project, that is available
[here](https://github.com/IEvangelist/IEvangelist.CSharp).

This post contains examples and details on five of the nine new **C# 7** features.

- Pattern matching
- `out` variables
- Tuples
- Local functions
- `throw` expressions

These are the remaining features, that I **do not** cover in this post.

- `ref` locals and returns
- More expression-bodied members
- Generalized `async` return types
- Numeric literal syntax improvements

## Pattern Matching

With **C# 7** we welcomed the concept of "patterns". This concept allows for the extraction of information when a variable is tested for a certain "shape" and matches a
specified pattern. We're able to leverage the "shape" from which we matched on as a declared variable in scope, consuming it as we deem necessary. This is referred to as
"dynamic" (or "method") dispatch.

> <p> In computer science, dynamic dispatch is the process of selecting which implementation of a polymorphic operation (method or function) to call at run time.
> It is commonly employed in, and considered a prime characteristic of, object-oriented programming (OOP) languages and systems.
> <cite>[Wiki - Dynamic Dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch)</cite>

Dynamic dispatch is nothing new to **C#**, and has been around forever. **C# 7** exposes this functionality via constant and type patterns.

### Constant Patterns

Constant pattern `null`, similar to `(obj == null)`.

> <p> The "is expression" has been expanded

```csharp
public void IsExpression(object obj)
{
    if (obj is null) // Constant pattern "obj is null"
    {
        return;
    }
}
```

### Type Patterns

Look closely at this syntax. This is where we start mixing metaphors. Prior to **C# 7** we could use the "is" expression to do simple type assertions
`obj is [type]`. Additionally, we all know how to declare a variable `int i`. This new syntax merges these concepts together and is more compound and
expressive.

```csharp
public void IsExpression(object obj)
{
    // (obj is int i)
    // "obj is int"     // type assertion "typically evaluates type compatibility at run time"
    //        "int i"   // declaration

    if (obj is int i) // Type pattern "obj is int i"
    {
        // We can then use the "i" (integer) variable 
    }

    // Note, the variable "i" is also available in this scope.
    // This is in fact by design, more on that out the "out variable" section 
}
```

> <p> The "switch statement" has been generalized

The `when` keyword has also been extended, now it not only applies to the `catch` statement but also the `case` labels within a `switch` statement.
Consider the following classes:

```csharp
class Shape
{
    protected internal double Height { get; }

    protected internal double Length { get; }

    protected Shape(double height, double length)
    {
        Height = height;
        Length = length;
    }
}

class Circle : Shape
{
    internal double Radius => Height / 2;

    internal double Diameter => Radius * 2;

    internal double Circumference => 2 * Math.PI * Radius;

    internal Circle(double height, double length) 
        : base(height, length) { }
}

class Rectangle : Shape
{
    internal bool IsSquare => Height == Length;

    internal Rectangle(double height, double length) 
        : base(height, length) { }
}
```

Now imagine that we have a collection of these `Shape` objects, and we want to print out their various details - we could use "pattern matching" as such:

```csharp
static void OutputShapes(IEnumerable<Shape> shapes)
{
    foreach (var shape in shapes)
    {
        // Previously, this was not permitted. Case labels had to be concrete
        // such as enums, numerics, bools, strings, etc.
        switch (shape)
        {
            case Circle c:
                WriteLine($"circle with circumference {c.Circumference}");
                break;
            case Rectangle s when (s.IsSquare):
                WriteLine($"{s.Length} x {s.Height} square");
                break;
            case Rectangle r:
                WriteLine($"{r.Length} x {r.Height} rectangle");
                break;
            default:
                WriteLine("This is not a shape that we're familiar with...");
                break;
            case null:
                throw new ArgumentNullException(nameof(shape));
        }
    }
}
```

As you can see, we are able to more easily reason about the specific `shape` in context. For example, with each iteration of our collection we `switch`
on the `shape`. If the `shape` is an instance of the `Circle` subclass, we'll execute the `case` label "Circle" and we get the instance declared as
its type in the variable `c`. Likewise, if the `shape` is a `Rectangle` and that rectangle `s` just so happens to also be a square `when (s.IsSquare)`
evaluates to `true` - we will then execute the square `case` label. If the `shape` is an instance of a `Rectangle` but not a square, we execute the
"Rectangle" `case` label. Notice we still have `default` fall-thru. Finally, we can also have a "null" `case` label.  

## `out` variables

`.NET` developers are more than familiar with the `Try*` pattern, but as a refresher this is what it looks like. Imagine we are trying to parse
a `System.String` input value as a `System.Int32`. Imagine that the consumer doesn't really care if it is parsed, they're fine with a `default(int)`
if it fails.

```csharp
public int ToInt32(string input)
{
    int result;
    if (int.TryParse(input, out result))
    {
        return result;
    }

    return default(int);
}
```

Let's quickly recap this. First, we declare a variable namely `result`. We then invoke the `int.TryParse` which returns a `bool` whether or not the
parse was successful. If `true` then the declare `result` variable is not equal to the parsed `int` value. If the `input` was `"12"`, then `result` would be `12`. If the `input`
was `"Pickles"`, then the return from the invocation to the `ToInt32` would be `0` as `int.TryParse` would return `false`.

Now with **C# 7** we can declare our `out` variable inline as follows:

```csharp
public int ToInt32(string input)
{
    // Note: the declaration is inline with the out keyword
    if (int.TryParse(input, out int result))
    {
        return result;
    }

    return default(int);
}
```

The scope of the `result` variable is identical to the previous example, as it actually "leaks" out to the `if` statement. We can re-write this even
more expressively:

```csharp
public int ToInt32(string input) => int.TryParse(input, out var result) ? result : result;
```

A few things you might notice. First, this is now a single line as we can express this with the lambda operator. We leverage the ternary operator as
well. Additionally, we can use the `var` keyword for our declaration. And since the `result` variable is in scope we can use it as both return cases.
If unable to be parsed, it is in fact a `default(int)` anyways.

## Tuples

Most developers are familiar with `System.Tuple<T[,T1...]>`. This `class` has served us well all the while it has been around.
One of the advantages is that it exposes `readonly` fields - from the values that it is instantiated with. This
was also great for equality comparisons and even using the tuple as a dictionary key.

In **C# 7** we have a new syntax for expressing tuples. Enter the `ValueTuple`, and as the name implies - this is a `struct` instead of a `class`. There
are obvious performance gains from using a light-weight value-type over the allocation of a `class`.

```csharp
void LegacyTuple()
{
    var letters = new Tuple<char, char>('a', 'b');
    
    // Values were accessible via these Item* fields.
    var a = letters.Item1;
    var b = letters.Item2;
}
```

This wasn't overly exciting from an API perspective, as the field names do not really imply anything about their intention.

```csharp
void ValueTuple()
{
    var letters = ('a', 'b');
    var a = letters.Item1;
    var b = letters.Item2;

    // Note: ToTuple extension method
    var systemTuple = letters.ToTuple();
    var c = systemTuple.Item1;
    var d = systemTuple.Item2;
}
```

You might notice that the syntactic sugar is pouring over this new feature. This is referred to as a "tuple literal". We dropped the entire `new` keyword
usage, as well as specifying the types. They are all inferred and in fact known, IntelliSense proves this immediately. But we still have the issue of
these tuples not being very API friendly. Let's explore how we can give them custom names.

```csharp
void MoreValueTuples()
{
    var lessonDetails = 
        (Subject: "C# Language Semantics", Category: Categories.Programming, Level: 300);

    // Note: IntelliSense now hides Item1, Item2 and Item3
    // Instead we are provided with the following:

    var subject = lessonDetails.Subject;    // string
    var category = lessonDetails.Category;  // Categories [enum]
    var level = lessonDetails.Level;        // int
}
```

### Deconstruction

Now that we see how we can instantiate a `ValueTuple`, let's take a look at how we can declare one for usage.

```csharp
void DeconstructionExamples()
{
    var lessonDetails = 
        (Subject: "C# Language Semantics", Category: Categories.Programming, Level: 300);
    
    // We can deconstruct in three various ways
    // First, the fully qualified type
    (string subject, Categories category, int level) = lessonDetails;
    
    // Next using the var keyword per named declaration
    (var subject, var category, var level) = lessonDetails;

    // Finally, omitting any type declaration and using var wholeheartedly
    var (subject, category, level) = lessonDetails;
}
```

There are often questions about how deconstruction is implemented, and whether or not it is ordinal based. For the `ValueTuple` it is in fact
ordinal based. However, note that deconstruction is not actually limited to tuples. With **C# 7** any `object` that defines a `public void Deconstruct`
method can be deconstructed. Consider the following:

```csharp
class Person
{
    private readonly (string First, string Middle, string Last) _name;

    private readonly DateTime DateOfBirth _dateOfBirth;

    public Person((string f, string m, string l) name, DateTime dob)
    {
        _name = name;
        _dateOfBirth = dob;
    }

    public void Deconstruct(out double age, 
                            out string firstName,
                            out string middleName, 
                            out string lastName)
    {
        age = (DateTime.Now - _dateOfBirth).TotalYears;
        firstName = _name.First;
        middleName = _name.Middle;
        lastName = _name.Last;
    }
}
```

Now that the `Person` is defined with this `Deconstruct` method, we can deconstruct it following the same ordinal based semantics.

```csharp
void DeconstructNonTuple()
{
    var person = new Person(("David", "Michael", "Pine"), new DateTime(1984, 7, 7));

    (int age, string first, string middle, string last) = person;

    // Note: to partially deconstruct you can ignore a specific ordinal by using the _
    // This does not actually naming the ordinal variable, but truly ignoring it.

    var (_, _, _, _) = person;          // Ignore all, not very useful
    var (_, firstName, _, _) = person;  // Cherry-pick first name
}
```

#### Comparing Anonymous `object` vs. `ValueTuple`

At first glance tuples look almost like anonymous objects. They are in fact very different. An anonymous object is actually a reference type whereas
a `ValueTuple` is a `struct` - value type. Also, you can only return an anonymous object from a method as an `object` which isn't very API friendly.
Within a fluent `LINQ` chained method anonymous objects are great and will still be normal for projection.

## Local Functions

At first glance, local functions seem a bit odd. I've heard people say, "this method is starting to look like a class". At first,
I was one of these people too. Once you get used to the idea and see the benefits it really does make sense. Here is a quick
comparison of the two, note the benefits of local functions as they compare to lambdas.

<style>
    .red { color: red; }
    .green { color: green; }
</style>

|   | Lambda(s) | Local Function(s) | Details |
|--:|:--|:--|:--|
|Generics| ❌ | ✅ |Local functions allow for the use of generics|
|Iterators| ❌ | ✅ |The `yield` keyword is valid within local functions|
|Recursion| ❌ | ✅ |Local functions support recursion|
|Allocatey| ✅ | ❌ |Delegates require an `object` allocation|
|Potential Variable Lifting| ✅ | ❌ |Implicitly captured closure is non-existent|

It is vital to understand that local functions are <strong>not</strong> a replacement for `Action<T[,T1...]>` or `Func<T[,T1...]>`. These delegate declarations are still
needed as parameters to enable lambda expression arguments. If you see the **#notasugly** hashtag, this was coined by Mads Torgersen.

### More efficient

When using local functions, there is no `object` created - unlike delegates that require an object for it to be used. Likewise, local functions
help to alleviate another issue with lambdas in that they do not need to implicitly capture a variable longer than it is potentially needed.
In **C#** lambdas capture values by reference, meaning that garbage collection may not be able to correctly clean up code that is "allocatey".

#### Declaration

With local functions, the declaration of the local function can actually occur after the `return` statement - as long as it is within the method body
in which it is consumed. If you're familiar with some of the implementations of the `LINQ` extension methods on `IEnumerable<T>`, you would know a lot
of the methods are defined with argument validation followed by the instantiation of "Iterator" classes, where these classes do the actual work.

Because of deferred execution, iterators do not actually execute validation logic until they are iterated - for example invoking `.ToList()`, `.ToArray()`,
or simply using them in a `foreach` statement. Ideally, we would like our iterators to "fail-fast" in the event of being given invalid arguments. Let's
imagine that the `.Select` extension method was implemented as follows:

```csharp
public static IEnumerable<TResult> Select<T, TResult>(this IEnumerable<T> source, 
                                                           Func<T, TResult> selector)
{
    if (source == null) throw new ArgumentNullException(nameof(source));
    if (selector == null) throw new ArgumentNullException(nameof(selector));

    foreach (var item in source)
    {
        yield return selector(item);
    }
}
```

Since this method is written as an iterator, the validation is skipped until it's iterated. With **C# 7** we can use local function to get both
"fail-fast" validation and the iterator together.

```csharp
public static IEnumerable<TResult> Select<T, TResult>(this IEnumerable<T> source, 
                                                           Func<T, TResult> selector)
{
    if (source == null) throw new ArgumentNullException(nameof(source));
    if (selector == null) throw new ArgumentNullException(nameof(selector));

    return iterator();

    IEnumerable<TResult> iterator()
    {
        foreach (var item in source)
        {
            yield return selector(item);
        }
    }
}
```

# `throw` expressions

Leveraging some pre-existing **C#** functionality - `null` coalescing, we can now `throw` when a value is evaluated as `null`. A common validation
mechanism is to `throw` if an argument is `null`. Consider the following:

```csharp
class LegacyService : IService
{
    private readonly IContextProvider _provider;

    public LegacyService(IContextProvider provider)
    {
        if (provider == null)
        {
            throw new ArgumentNullException(nameof(provider));
        }

        _provider = provider;
    }
}
```

With **C# 7** we can simplify this with the `throw` expression.

```csharp
class ModernService : IService
{
    private readonly IContextProvider _provider;

    public ModernService(IContextProvider provider)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
    }
}
```

If the given `provider` argument is `null` we'll coalesce over to the `throw` expression.

# From C# 6 to C# 7, then and now

I have a presentation that I have been fortunate enough to give at some regional conferences. One of these occasions was recorded, and I felt it
made sense to share it here - Enjoy!!

<div class="iframe_container">
    <iframe src="https://www.youtube.com/embed/kFpXRooGo0c" frameborder="0" allowfullscreen></iframe>
</div>

**Further Reading**

- [What's new in C# 7](https://docs.microsoft.com/en-us/dotnet/articles/csharp/csharp-7)
