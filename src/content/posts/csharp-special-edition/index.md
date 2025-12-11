---
title: C# Special Edition
published: '2017-12-17'
description: Ranting about my favorite language
author: David Pine
tags:
  - .NET
  - C#
  - Visual Studio
coverImage:
  src: ./keyboard.jpg
  alt: C# Special Edition
---
Welcome to the 17th day of the [C# Advent Calendar](https://crosscuttingconcerns.com/The-First-C-Advent-Calendar). I'd like to take a moment to thank my fellow bloggers who are sharing their passion of C# with everyone following the C# Advent Calendar. Please, share this and their posts - help us all make C# even more widely adopted than it is today.

# In the Beginning

I'm honored to blog about my favorite programming language, C#. There is an often forgotten truth about the history of C#, one truth that I like talking about. While C# is a really "cool" language with awesome features it was actually named "Cool" in the beginning!

> In January 1999, _Anders Hejlsberg_ formed a team to build a new language at the time called Cool, which stood for "C-like Object Oriented Language". Microsoft had considered keeping the name "Cool" as the final name of the language, but chose not to do so for trademark reasons.
<cite>[Wiki - C#](<https://en.wikipedia.org/wiki/C_Sharp_(programming_language>))</cite>

Likewise, the name C# somewhat implies an increment of C++. Imagine, the `++` being stacked on-top of each other -- you'd have something resembling the `#` symbol, clever no?! Unfortunately, my career didn't start with such a cool language. I learned _Java_ in college and started my career with _Visual Basic_. I am now grateful to develop in C# professionally and for fun!

### It is going to be around for a while

From all the languages in the `.NET` stack, C# is the most prolific.

This is where __Visual Basic__ lovers

```vb
Throw New System.Exception("Tomatoes!")
```

and __F#__ enthusiasts

```fs
raise (new Exception("their fists in anger!"))
```

The language continues to evolve and innovate. According to the annual __ Stack Overflow__ developer survey, [C# is the 4th most popular programming language in the world](https://insights.stackoverflow.com/survey/2017#technology-programming-languages). And since we're talking about __ Stack Overflow__, it is noteworthy to mention that [Jon Skeet](https://stackoverflow.com/users/22656/jon-skeet) is nearing 1 million reputation points -- and he's projecting this will occur mid January. Roughly 55% of all his contributions are for C#, yet he is a Java developer. This never ceases to amaze me!

# Getting Started

I believe that Microsoft has done an amazing job at not only updating their documentation sites, but unifying them and enhancing the user experience tenfold. The sites seem to flow more naturally while delivering relevant content, and as a developer that is what I want from a resource.

> The [JavaScript.com](www.javascript.com) website has one of the best getting started experiences on the web today.
<cite>Maria Naggaga -- Keynote "It Starts With A Search", MKE DOT NET 2017</cite>

It is more natural for JavaScript to have an online tutorial than C#, but Microsoft made this happen regardless. They have an awesome series of [quick starts](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/index) that serve as tutorials. They introduced an in-browser REPL (Read-Eval-Print Loop) for C#, and it is amazing. Here is a listing of a few of them:

- [Hello C#](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/hello-world)
- [Numbers in C#](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/numbers-in-csharp)
- [Branches and loops](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/branches-and-loops)
- [Collections in C#](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/list-collection)
- [Introduction to classes](https://docs.microsoft.com/en-us/dotnet/csharp/quick-starts/introduction-to-classes)

 Once you're developing you can always rely on the [C# Guide](https://docs.microsoft.com/en-us/dotnet/csharp/) as well. Finally, the documentation site boasts [Samples and Tutorials](https://docs.microsoft.com/en-us/dotnet/samples-and-tutorials/) for a more in depth look.

# Speaking Fluently

C# is a beautiful language with an elegant syntax which is simple, powerful and expressive. Backed by an superb developer experience from Visual Studio, you can quickly immerse yourself into any project. What would a C# post be without some code? Not much of a post at all. Since this is a special edition, let's have a look at something I found interesting and insightful from C# 7. I wrote a post about [exploring C# 7](blog/exploring-csharp-seven) if you'd like a refresher.

C# 7.0 featured `out` variables, which enable inline declaration.

```csharp
public static class StringExtensions
{
    // The declaration is inlined with the out keyword
    // We can use 'var', as the type int is known
    // The 'result' variable is scope "leaks" to scope of the method body
    public static int ToInt32(string input)
        => int.TryParse(input, out var result)) ? result : result;
}
```

We can now write super expressive, inlined `.TryParse` logic. I wanted to call attention to an issue that I ran into where I made an assumption. The lesson of the story is to never make an assumption, right?! [Here is the issue as it exists on __ GitHub__ today.](https://github.com/dotnet/csharplang/issues/916)

Consider the following:

```csharp
public static class ConcurrentExtensions
{
    public static T TryPeekOrDefault<T>(this ConcurrentQueue<T> queue)
        => (queue?.TryPeek(out T result) ?? false) ? result : default;
}
```

This results in the following compiler error:

> Error CS0165 Use of unassigned local variable 'result' IEvangelist.Csharp.Seven

As you can see this does not currently work in C#, but I assumed it would. Let's break it down and figure out why. First, let's remove the single line expression and make it non-ternary.

```csharp
public static class ConcurrentExtensions
{
    public static T TryPeekOrDefault<T>(this ConcurrentQueue<T> queue)
    {
        if (queue?.TryPeek(out T result) ?? false)
        {
            return result;
        }

        return default;
    }
}
```

The first expression within the `if` block tests if the `queue` parameter in context is `null`. If it is `null`, it will coalesce to `false`. If it is not `null`, then if will evaluate the returning result from the `.TryPeek` invocation. When the if block is evaluated to be either `true` or `false` - after evaluation we know that the `result` variable has been definitely assigned. Here is the spec on __[definite assignment](https://github.com/dotnet/csharplang/blob/master/spec/variables.md#definite-assignment)__.

> At a given location in the executable code of a function member, a variable is said to be definitely assigned if the compiler can prove, by a particular static flow analysis ([Precise rules for determining definite assignment](https://github.com/dotnet/csharplang/blob/master/spec/variables.md#precise-rules-for-determining-definite-assignment)), that the variable has been automatically initialized or has been the target of at least one assignment.
<cite>[C# Language -  GitHub](https://github.com/dotnet/csharplang/blob/master/spec/variables.md#definite-assignment)</cite>

Now consider the following:

```csharp
public static class ConcurrentExtensions
{
    public static T TryPeekOrDefault<T>(this ConcurrentQueue<T> queue)
    {
        if (queue == null)
        {
            return default;
        }

        // The 'result' variable leaks to this outer scope.
        // But with the previous eager evaluation and corresponding early exit
        // the 'result' is never accessed.
        // As such, it is not "definitely assigned".
        if (queue.TryPeek(out T result))
        {
            return result;
        }

        return default;
    }
}
```

This is equivalent to the non-inlined usage of `out` variable declaration:

```csharp
public static class ConcurrentExtensions
{
    public static T TryPeekOrDefault<T>(this ConcurrentQueue<T> queue)
    {
        // The `result` variable may never be accessed.
        if (queue != null)
        {
            T result;
            if (queue.TryPeek(out result))
            {
                return result;
            }
        }

        return default;
    }
}
```

These are more verbose equivalents in terms of functionality, some with eager evaluation paired with an early exit. Both of these versions compile and would work as you'd expect them to. There is talk about getting better support for flow analysis, beyond definite assignment -- I for one would love that. TypeScript has been doing a great job at this, thanks to Anders and company!

The issue still has a sense of illusion. Yes, as [Neal Gafter](https://twitter.com/gafter) stated I would like definite assignment (which is part of flow analysis) to infer that the variable is only referenced where it was definitely assigned in this case. I'm happy that it's been labeled as a _Feature Request_ and _Discussion_.

Does that seem reasonable? If not, why? If so, please [visit the issue](https://github.com/dotnet/csharplang/issues/916) and ! I'm thrilled that C# is open source and the community is able to contribute in ways such as this. I hope that after reading this you might be inspired to get involved.

> Why procrastinate today, when you can procrastinate tomorrow?
<cite>[David Neal](https://twitter.com/reverentgeek)</cite>

### Counting my blessings

I consider myself to be very fortunate. I work with the owner of [Edwina](https://travelswithedwina.com/), who has been patiently teaching and coaching me through the better part of three years of my career. She used to teach algorithms and C# at the Milwaukee School of Engineering (MSOE). I have learned so much from her about C#, language semantics, algebraic reduction, etc...and I'm grateful for that. She has certainly made me a more pragmatic developer. I encourage everyone to find someone who can inspire, motivate or mentor them.

# Final Thoughts

Go learn C#! If you already know it, mentor someone who wants to learn it. Happy Holidays and please support my fellow bloggers as they share their passion for C# with you.
