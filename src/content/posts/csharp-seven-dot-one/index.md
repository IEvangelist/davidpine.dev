---
title: Perusing C# 7.1
published: '2017-07-29'
description: The language features you've been waiting for
author: David Pine
tags:
  - .NET
  - C#
  - Visual Studio
coverImage:
  src: ./peruse.jpg
  alt: Perusing C# 7.1
---
Earlier this year in March -- Visual Studio 2017 was released. With this the world was given C# 7, checkout my post on [Exploring C# 7](). In this post we will peruse C# 7.1, the first incremental release while C# 8 is being fleshed out.

# Async Main <a target="_blank" href="https://github.com/dotnet/csharplang/issues/97"></a>

Since the release of C# 5, developers have either embraced the `async` and `await` keywords or fumbled along the way feebly attempting to comprehend them. Fear not, you're not alone. Many others have been just as confused, but that's not to say that the language didn't make major strides towards simplifying your development efforts. In fact, I love asynchronous programming and C# makes me very happy with its implementation!

Many developer advocates set forth on a journey of biblical proportions -- progressing through mountains of nay-sayers, focusing on craftsmanship and technical evangelism. Among these advocates **Stephen Toub** and **Stephen Cleary** rose toward the top. Blogging and helping us along the way. With their help emerged rules and guidelines, a comprehensive set of best practices for using these language features. One [best practice](https://msdn.microsoft.com/en-us/magazine/jj991977.aspx) is as follows:

> Instead of `Task.Result` or `.Task.Wait()`, use `await`

Prior to C# 7.1 developers who wrote console applications were forced to deviate from this guideline. We were forced to use `.Result` or `.Wait()`. Consider the following:

```csharp
public static void Main()
{
    var httpClient = new HttpClient();
    var result = httpClient.GetAsync("some/url").Result;

    // Another common alternative was using the get awaiter / result.
    result = httpClient.GetAsync("some/url").GetWaiter().GetResult();

    // Consume the result...
}
```

With C# 7.1, we can leverage [Async Main](https://github.com/dotnet/csharplang/blob/master/proposals/async-main.md).

```csharp
public static async Task Main()
{
    var httpClient = new HttpClient();
    var result = await httpClient.GetAsync("some/url");

    // Consume the result...
}
```

This feature extends the previous four possible entry points to their `Task` and `Task<int>` based equivalents. Now the following entry points are valid:

```csharp
static Task Main() { }                      // static void Main() { }
static Task<int> Main() { }                 // static int Main() { }
static Task Main(string[] args) { }         // static void Main(string[] args) { }
static Task<int> Main(string[] args) { }    // static int Main(string[] args) { }
```

With this task-based approach the new entry points simply provide that "feels good" approach to development.

# `default` Expression <a target="_blank" href="https://github.com/dotnet/csharplang/issues/102"></a>

The `default` keyword has been around forever. It was used to tell the compiler give me the "default" value for the given type.

```csharp
var number = default(int);      // 0
var date = default(DateTime);   // DateTime.MinValue
var obj = default(object);      // null
```

This was also used for generics, for example when the type of `T` is used we could return `default(T)`.

```csharp
public static T TryPeekOrDefault<T>(this ConcurrentQueue<T> queue)
{
    if (queue?.TryPeek(out var result) ?? false)
    {
        return result;
    }

    return default(T);
}
```

Likewise, the `default` keyword was used in the `switch` statement as well -- and signified the `default` case label. If all other cases were not executed, the `default` case would be.

```csharp
switch (dayOfWeek) 
{
    case DayOfWeek.Monday:
        return "Ugh... off to work again";
    case DayOfWeek.Friday:
        return "Excitement sets in...";
    
    default:
        return string.Empty;
}
```

Now, with C# 7.1 the compiler will use type inference to simplify the `default` expression (sometimes referred to as `default` literals). So we could declare an `int` and assign it to `default` without passing the type `int`:

```csharp
int number = default;   // 0
Guid guid = default;    // 00000000-0000-0000-0000-000000000000
```

Not only can the type be inferred from the declaration but also the literal expression:

```csharp
var number = isLucky ? 7 : default; // when 'isLucky' is false number is 0
```

The great news is that this feature is for the entire type-system, not just `int's` . You can now use the `default` keyword in all sorts of places. You can use it to check against a value, or to pass it as an argument.

```csharp
public int Sum(params int[] numbers)
{
    if (numbers is default || numbers.Length == default)
    {
        return default; // Returns 0
    }
}

// Pass in default. This is null for int[].
var sum = Sum(default);
if (sum == default)
{
    // Take an action when sum is 0.
}
```

# Tuple Projection Initializers <a target="_blank" href="https://github.com/dotnet/csharplang/issues/415"></a>

I detailed the introduction of `tuples` in my [Exploring C# 7]() post. Tuples are an amazing addition to the C# language and are extremely powerful. With its initial implementation however, there was something that was lacking. Tuple literals lacked the ability to infer names, now with C# 7.1 -- this is no longer a limitation.

With `tuple` projection initializers our C# `tuple` literals are simplified and effectively DRY, as the redundancies of duplicating the field names are inferred.

```csharp
var firstName = "David";
var lastName = "Pine";
var dateOfBirth = new DateTime(1984, 7, 7);

// C# 7.0, required "explicit names"
var person = (firstName: firstName, lastName: lastName, dateOfBirth: dateOfBirth);
var fn = person.firstName;      // "David"
var ln = person.lastName;       // "Pine"
var dob = person.dateOfBirth;   // 7/7/1984

// C# 7.1, allows "inferred names"
person = (firstName, lastName, dateOfBirth);
fn = person.firstName;          // "David"
ln = person.lastName;           // "Pine"
dob = person.dateOfBirth;       // 7/7/1984
```

# Pattern-matching with Generics <a target="_blank" href="https://github.com/dotnet/csharplang/issues/154"> </a>

With C# 7.0, pattern-matching was introduced -- I love talking about it and showing off what it can do! In my opinion it solves a lot of issues with type assertions and makes complex decision trees more legible and comprehensive. However, when it was introduced it didn't correctly support generics. With C# 7.1, that has changed.

Consider the following:

```csharp
public class Animal { }

public class Dog : Animal
{
    public Breed Breed { get; }
}

public void Interact<TAnimal>(TAnimal animal)
    where TAnimal : Animal
{
    if (animal is Dog dog)
    {
        // Play fetch with dog
    }

    switch (animal)
    {
        case Dog d when (d.Breed == Breed.LabradorRetriever):
            // Feed dog, the let 'em outside
            break;
    }
}
```

This was not actually possible, in fact it wouldn't even compile. Ignoring the scoping issue, as the `dog` variable is declared twice within the same scope -- we'd end up with the following compilation error:

> An expression of type TAnimal cannot be handled by a pattern of Dog.

You could use the `as` operator:

```csharp
var dog = animal as Dog;
if (dog != null) 
{
    // Play with man's best friend...
}
```

But that isn't really pattern-matching. The limitation that exists is due to explicit type conversions and open types; however, the design specification is changing as follows in the bold area:

> Certain combinations of static type of the left-hand-side and the given type are considered incompatible and result in compile-time error. A value of static type `E` is said to be pattern compatible with the type `T` if there exists an identity conversion, an implicit reference conversion, a boxing conversion, an explicit reference conversion, or an unboxing conversion from `E` to `T`, <strong>or if either `E` or `T` is an open type.</strong> It is a compile-time error if an expression of type `E` is not pattern compatible with the type in a type pattern that it is matched with.

## References

- <a target="_blank" href="https://github.com/dotnet/roslyn">Roslyn, The .NET Compiler Platform</a>
- <a target="_blank" href="https://github.com/dotnet/csharplang">C# Language Design</a>
