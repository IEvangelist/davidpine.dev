---
title: The power of the global.json
published: '2016-07-19'
description: Leveraging .NET Core Tooling Features
author: David Pine
tags:
  - .NET Core
  - ASP.NET Core
  - Tooling
coverImage:
  src: ./global-json.png
  alt: The power of the global.json
---
# Introduction

As I'm sure you're all aware by now, [Monday June 27<sup>th</sup>](https://blogs.msdn.microsoft.com/dotnet/2016/06/27/announcing-net-core-1-0/) was a
special day for those of you who were anticipating the release of  `.NET Core` and `ASP.NET Core`. While the "core" frameworks and runtimes are RTM, the
tooling is actually still in preview. In fact, we're currently on _Tools Preview 2_. I wanted to focus this post entirely on one specific enhancement
to **Visual Studio** solutions, enter the `global.json`.

---

Let me paint a picture for you...you're developing an application. This application doesn't have all the source code in the world, so you take on some dependencies.
Since we're not living in caves, we have packages -- this is common nomenclature for and the norm for any modern software development project.
One of the aforementioned dependencies is a package that you just so happen to also work on and develop for. Imagine that you find a bug or want to make
an improvement to said package, what does that work-flow look like?

For me, this typically involved the following steps:

 1. Open dependency project in a new instance of **Visual Studio**
 2. Make code change
 3. Code review
 4. Commit code
 5. Build server builds code
 6. Build goes "green" (tests passed)
 7. Build server publishes package
 8. Wander the halls playing Pokémon Go
 9. Return to original project, update package reference
10. Continue with life

What if I told you, that headache is all but gone and you will never have to go through those agonizing steps again! Say it ain't so
(queue [Weezer](https://youtu.be/ENXvZ9YRjbo)).

## Global.json

The `global.json` file sits out at the solution directory-level and literally has one of the simplest `JSON` schemas you will ever see. The default templates
generate the following (for the [full schema](https://json.schemastore.org/global)):

```javascript
{
  "projects": [ "src", "test" ],
  "sdk": {
    "version": "1.0.0-preview2-003121"
  }
}
```

I always immediately delete the `sdk` property. If omitted the tooling simply assumes the latest **SDK** installed. Now, for all the fun! The `projects`
property is an array of strings. It's defined as the following:

> A list of project folders relative to this file.

These folders are search locations for resolving dependencies, where projects take precedence over packages.

### Projects over Packages

Assume you're developing in a project, namely `IEvangelist.NetCore.App` and it takes a dependency on `IEvangelist.NetCore.ClassLib` and `IEvangelist.NetCore.Services`. These
dependencies are packages (outside the solution) and you can use the `global.json/projects` array to your advantage. Using our imaginations, let us find a need
to source-step into `IEvangelist.NetCore.ClassLib`. Let us also imagine that this project is in a neighboring folder outside our solution, perhaps the same repo,
we can now use a relative path like so:

 ```javascript
{
  "projects": [ 
    "src", 
    "../../IEvangelist.NetCore.ClassLib/src", // <-- Relative path to packaged source
    "../../IEvangelist.NetCore.Services/src"    
  ]
}
```

#### Before

![Before global.json changes](./before.jpg)

#### After

After saving these changes to the `global.json` you'll notice **Visual Studio** pull this project into solution, but outside of the `src` folder. Now when
you debug you can actually step into the source and treat it like any other source code you have. Project dependencies are resolved by way of their `project.json` being discovered.

![After global.json changes](./after.jpg)

### Open Source for Everyone

One of the biggest advantages in my opinion is the ability to pull down source from `github` that I rely on and source-step into it. For example, I have been developing with `ASP.NET
Core` since **RC1**, nearly eight months!! With the power of the `global.json` I can pull down source that I'm relying on in a package and fulfill my understanding of it
as it executes. Simply amazing!

## Further reading

For more details, these are some additional links and points of reference.

* [**Global.json Reference**](https://docs.microsoft.com/en-us/dotnet/articles/core/tools/global-json)
* [**Explanation of projects section in Global.json**](https://stackoverflow.com/a/34794054/2410379)
