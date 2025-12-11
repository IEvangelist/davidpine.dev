---
title: Demystifying .NET Standard
published: '2017-08-16'
description: Clearing up the confusion
author: David Pine
tags:
  - .NET
  - .NET Core
  - .NET Standard
coverImage:
  src: ./confused.jpg
  alt: Demystifying .NET Standard
---
## Intro

Monday, August 14<sup>th</sup> was an amazing day to be a `.NET` developer! As the world celebrates another triumphant series of announcements from Microsoft, there is still confusion amongst the masses.

> What is this `.NET Standard` thing?
> What does it mean to target `.NET Standard` versus `.NET Core`, or even the `.NET Framework`?
> As a developer, what `.NET` should I target and why?
> Are Portable Class Libraries (PCLs) dead?
> <cite>Developer Community</cite>

All of these questions have already been answered, you just have to know where to look. In this post I will provide some invaluable resources and educate those of you who are still confused.

## Announcements

Here are all the recent announcements, feel free to spend some time checking them out -- be sure to come back.

- [The ASP.NET team is proud to announce general availability of ASP.NET Core 2.0.](https://blogs.msdn.microsoft.com/webdev/2017/08/14/announcing-asp-net-core-2-0/)
- [.NET Core 2.0 is available today August 14, as a final release](https://blogs.msdn.microsoft.com/dotnet/2017/08/14/announcing-net-core-2-0/)
- [The .NET Standard 2.0 specification is now complete](https://blogs.msdn.microsoft.com/dotnet/2017/08/14/announcing-net-standard-2-0/)
- [Visual Studio 17 version 15.3](https://blogs.msdn.microsoft.com/visualstudio/2017/08/14/visual-studio-2017-version-15-3-released/)

Let's start by answering all these common questions.

## `[.NET Standard](https://docs.microsoft.com/en-us/dotnet/standard/net-standard/) `

If the name [_Immo Landwerth_](https://github.com/terrajobst) doesn't ring a bell, perhaps [@terrajobst](https://twitter.com/terrajobst) will? Regardless of whether you've heard of him before -- you'd be wise to remember him now. He is a program manager for Microsoft and has a huge part in the `.NET` ecosystem as a whole. Immo has a `.NET Standard` video series on YouTube and if you do not have time to read this post, by all means [watch his videos](https://www.youtube.com/playlist?list=PLRAdsfhKI4OWx321A_pr-7HhRNk7wOLLY).

> `.NET Standard` is a specification. It represents a set of APIs that all `.NET` platforms have to implement.
> <cite>[Immo Landwerth](https://youtu.be/YI4MurjfMn8?list=PLRAdsfhKI4OWx321A_pr-7HhRNk7wOLLY&t=191)</cite>

Often, the `.NET Standard` is mistaken for a runtime. Consider the name `.NET Standard` at face value, it has the word "standard" in it...because it is not a framework or a core runtime.

> `.NET Standard` isn't a runtime, it's a version interface - a list of methods you can use under many different "`.NETs`".
> <cite>[Scott Hanselman](https://www.hanselman.com/blog/ExploringRefitAnAutomaticTypesafeRESTLibraryForNETStandard.aspx)</cite>

As true with all standards (or specifications), implementations can either be compliant or non-compliant. At this point in time there are four `.NET` implementations that are `.NET Standard 2` compliant. They are as follows, `.NET Core`, `.NET Framework`, `Mono` and `Xamarin`. Below is a more comprehensive listing of all the `.NET` platforms and their corresponding standard that they implement.

### The  [.NET Standard Version Table ](https://dotnet.microsoft.com/platform/dotnet-standard#versions)

| .NET Standard                |  [1.0] | [1.1] |   [1.2] |  [1.3] |   [1.4] |   [1.5]  | [1.6]   |    [2.0] |
|:-----------------------------|:-------|:------|:--------|:-------|:--------|:---------|:--------|:---------|
|`.NET Core`                   |   1.0  |  1.0  |    1.0  |   1.0  |    1.0  |    1.0   |  1.0    |     2.0  |
|`.NET Framework`              |   4.5  |  4.5  |  4.5.1  |   4.6  |  4.6.1  |  4.6.1   |  4.6.1  |   4.6.1  |
|`Mono`                        |   4.6  |  4.6  |    4.6  |   4.6  |    4.6  |    4.6   |  4.6    |     5.4  |
|`Xamarin.iOS`                 |  10.0  | 10.0  |   10.0  |  10.0  |   10.0  |   10.0   |  10.0   |   10.14  |
|`Xamarin.Mac`                 |   3.0  |  3.0  |    3.0  |   3.0  |    3.0  |    3.0   |  3.0    |     3.8  |
|`Xamarin.Android`             |   7.0  |  7.0  |    7.0  |   7.0  |    7.0  |    7.0   |  7.0    |     7.5  |
|`Universal Windows Platform`  |  10.0  | 10.0  |   10.0  |  10.0  |   10.0  |  vNext   |  vNext  |   vNext  |
|`Windows`                     |   8.0  |  8.0  |    8.1  |        |         |          |         |          |
|`Windows Phone`               |   8.1  |  8.1  |    8.1  |        |         |          |         |          |
|`Windows Phone Silverlight`   |   8.0  |       |         |        |         |          |         |          |

[1.0]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.0.md
[1.1]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.1.md
[1.2]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.2.md
[1.3]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.3.md
[1.4]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.4.md
[1.5]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.5.md
[1.6]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard1.6.md
[2.0]: https://github.com/dotnet/standard/blob/master/docs/versions/netstandard2.0.md

For example, we can see the `.NET Framework 4.5` is an implementation of `.NET Standard 1.1`. This means that if you're to author a `.NET Standard` class library and you target `1.1` of the standard, it can run on `.NET Core 1.0`, `.NET Framework 4.5`, `Mono 4.6`, etc... you get the point now I'm sure.

#### The Trade-off

There is a bit of a trade-off though that you should consider. With every version of the `.NET Standard` there is an inverse relationship to the number of implementations. The higher the version of the `.NET Standard`, the more APIs you have access to. However, there are fewer implementations that exist for higher versions of the `.NET Standard`.

It is typically advised that you target the lowest version of the standard that you can get away with. This allows your code to run in more places, as there are more implementations of lower versioned standards. Portable Class Libraries (or PCLs) have been replaced by the `.NET Standard`. If you're like me, you probably want the latest and greatest -- the fullest set of APIs...and that is ok. As long as you control the environment in which it's consumed, great!

### `.NET` API Explorer

Microsoft has been hard at work, and their documentation teams have been putting together some incredibly useful ways to consume documentation. As a developer, I typically rely on **StackOverflow** as a source of truth -- however, I have been finding myself spending more time on the official documentation sites. A big 👍 to the team for making the `.NET` docs so much better than before. They even have a `.NET` API Explorer. This is immensely powerful -- in a matter of seconds I can quickly explore APIs and determine if something is lacking.

<a href="https://docs.microsoft.com/en-us/dotnet/api/?view=netstandard-2.0" target="_blank">
    ![.NET Standard API Explorer](./dot-net-standard-api-explorer.png)
</a>

## `[.NET Core](https://docs.microsoft.com/en-us/dotnet/core/) `

> `.NET Core` is a general purpose development platform maintained by Microsoft and the `.NET` community on GitHub. It is cross-platform, supporting Windows, macOS and Linux, and can be used in device, cloud, and embedded/IoT scenarios.

The obvious advantages are that `.NET Core` is cross-platform and open source. Unlike `.NET Framework` that is neither of those two things.

## `[.NET Framework](https://docs.microsoft.com/en-us/dotnet/framework/) `

If you have been a `.NET` developer for more than a few years, then you should already be familiar with the `.NET Framework`. This is what you have been developing on and targeting forever. However, with the introduction of `.NET Standard` and `.NET Core`, that is likely to change. You no longer have to limit your OS or platform to Windows.

## `.NET Foundation`

With all the `.NET` terms flying around the web, it felt appropriate to throw another one at you.

> The `.NET Foundation` is an independent organization to foster open development and collaboration around the `.NET` ecosystem. It serves as a forum for community and commercial developers alike to broaden and strengthen the future of the `.NET` ecosystem by promoting openness and community participation to encourage innovation.
<cite>www.dotnetfoundation.org</cite>

Be sure to visit their [site and get involved](https://dotnetfoundation.org)!

## Conclusion

The `.NET` ecosystem is rapidly evolving! With open source and cross-platform being two key priorities, you're in good hands. When developing for `.NET` be familiar with what version of the `.NET Standard` suits your needs -- and target accordingly.

### Resources

- [.NET Standard - Microsoft Docs](https://docs.microsoft.com/dotnet/standard/net-standard)
- [.NET Core - Microsoft Docs](https://docs.microsoft.com/dotnet/core)
- [.NET Framework - Microsoft Docs](https://docs.microsoft.com/dotnet/framework)
