---
title: ASP.NET Core Response Optimization
published: '2016-12-12'
description: Static File Caching & Compression
author: David Pine
tags:
  - ASP.NET Core
  - Caching
  - Compression
  - GZip
coverImage:
  src: ./speedy.jpg
  alt: ASP.NET Core Response Optimization
---
## Intro

If you're a web developer, chances are you're familiar with optimization strategies such as static file caching and response compression. I recently implemented these two concepts in
tandem on an __ASP.NET Core__ application that I have been developing... I'm going to share what I have learned.

If you haven't had a chance to use [`ASP.NET Core`](https://www.asp.net/core) yet, you're missing out! As my friend [Scott Addie](https://scottaddie.com/) likes to say:

>__ASP.NET Core__ is a cafeteria plan in which developers choose application dependencies _à la carte_. This is in stark contrast to __ASP.NET__ proper, where developers
> are provided a set meal (a bloated dependency chain) containing undesired items. Don't like broccoli with your steak? Maybe it's time to consider __ASP.NET Core__.
> <cite>Scott Addie</cite>

In other words, all dependencies are pluggable middleware. This provides ultimate control as you have to explicitly _opt-in_ for the middleware you desire.

### Know thy Middleware

Not all middleware is equal. Different middleware serves different purposes (obviously). Try to think of each middleware as its own standalone feature-set. Not all middleware is
given a chance to execute on a given request. Certain middleware might send a web response and early exit. This can prevent other middleware in the pipeline from executing at all. In
fact, this is the case when using static file caching and response compression together.

>The _order_ in which middleware is added matters and dictates the order of execution during a request.

#### Installing Dependencies

I wrote a tiny application and put it up on GitHub, check it out [here](https://github.com/IEvangelist/IEvangelist.AspNetCore.Optimization) if you want to follow along. Now let's install the dependencies we'll need. For static file caching and response compression we need to add two `dependencies` to the project.

_Note:_ `Microsoft.AspNetCore.StaticFiles` will already have been installed if you started from a __Visual Studio__ template.

| Repository | Version | Nuget Package | Add / Use Extension Method(s) |
|:-:|:--|:--|:--|
| [](https://github.com/aspnet/StaticFiles)| `1.1.0` | [Static Files](https://www.nuget.org/packages/Microsoft.AspNetCore.StaticFiles/) | [UseStaticFiles](https://github.com/aspnet/StaticFiles/blob/dev/src/Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs#L56-L68) |
| [](https://github.com/aspnet/BasicMiddleware) | `1.0.0` | [Response Compression](https://www.nuget.org/packages/Microsoft.AspNetCore.ResponseCompression/) | [AddResponseCompression](https://github.com/aspnet/BasicMiddleware/blob/dev/src/Microsoft.AspNetCore.ResponseCompression/ResponseCompressionServicesExtensions.cs#L38-L53) [UseResponseCompression](https://github.com/aspnet/BasicMiddleware/blob/dev/src/Microsoft.AspNetCore.ResponseCompression/ResponseCompressionBuilderExtensions.cs#L20-L29) |

Follow these instructions, from within __Visual Studio__:

```yaml
Tools ➪
    NuGet Package Manager ➪
        Manage NuGet Packages for Solution... ➪ 
            Browse ➪
                Search ➪
                    [ Install ]
```

### Configuring Startup

There are two common nomenclatures that exist for wiring up middleware in your startup classes, the `.Add*` and `.Use*` extension methods. The `.Add*` calls are intended to add
services to the `IServiceCollection` instance, ensuring that they are ready for _usage_. The `.Use*` calls specify that you want to use the middleware and makes the assumption
that any services required by __DI__ will have already been _added_ with the corresponding `.Add*` call.

Now let's "add" response compression in the `.ConfigureServices` call of our `Startup.cs`.

```csharp
public void ConfigureServices(IServiceCollection services)
{    
    services.AddMvc();
    services.AddResponseCompression(
        options => 
            options.MimeTypes = ResponseCompressionMimeTypes.Defaults);
}
```

Several bits of the implementation details should jump out at you. First, we do not need to call an `.AddStaticFiles` extension method because there are no services required
for this middleware, as such it doesn't exist. Second, we are providing a lambda expression to satisfy the `Action<ResponseCompressionOptions>` parameter. We also assign the
`.MimeTypes` property from the `ResponseCompressionMimeTypes.Defaults` we are targeting for compression.

> If no compression providers are specified then `GZip` is used by default.
> <cite>[ASP.NET Core Team - GitHub](https://github.com/aspnet/BasicMiddleware/blob/dev/src/Microsoft.AspNetCore.ResponseCompression/ResponseCompressionProvider.cs#L22)</cite>

The `ResponseCompressionMimeTypes.cs` is defined as follows:

```csharp
using System.Collections.Generic;
using System.Linq;
using static Microsoft.AspNetCore.ResponseCompression.ResponseCompressionDefaults;

namespace IEvangelist.AspNetCore.Optimization
{
    public static class ResponseCompressionMimeTypes
    {
        public static IEnumerable<string> Defaults
            => MimeTypes.Concat(new[]
                                {
                                    "image/svg+xml",
                                    "application/font-woff2"
                                });
    }
}
```

There are several types defined by default in __ASP.NET Core__ class `ResponseCompressionDefaults.MimeTypes`, we are simply expanding that to include "SVG" images and the "Woff2" fonts.

### Order Exemplified

Consider the following:

```csharp
public void Configure(IApplicationBuilder app,
                      IHostingEnvironment env,
                      ILoggerFactory loggerFactory)
{
    app.UseStaticFiles()          // Adds the static middleware to the request pipeline
       .UseResponseCompression(); // Adds the response compression to the request pipeline
}
```  

The snippet above will absolutely work for serving static files, but it will not compress or cache anything. Note the differences below:

```csharp
public void Configure(IApplicationBuilder app,
                      IHostingEnvironment env,
                      ILoggerFactory loggerFactory)
{
    app.UseResponseCompression()  // Adds the response compression to the request pipeline
       .UseStaticFiles();         // Adds the static middleware to the request pipeline       
}
```

The _order_ in which the middleware was invoked in the pipeline changed, as such the order in which the middleware is executed on a request is also changed.
When static file middleware occurs before response compression, it returns the file as a response before compression has a chance to execute.

- Client requests `main.css`
- Static file middleware determines it can fully satisfy said request
- The `main.css` file is [sent](https://github.com/aspnet/StaticFiles/blob/dev/src/Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs#L109) and the [next](https://github.com/aspnet/StaticFiles/blob/dev/src/Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs#L126) middleware in the pipeline is never executed

Now that we have these two pieces of middleware wired into out pipeline in the correct order, what else is left. There is one important thing that we forgot to do.
While we do have static file middleware, we didn't know that "caching" is off by default. So we'll need to handle this with an instance of the the `StaticFileOptions`.

>Keep your 's open for extension method overloads. These are often clues that there are _options_ for providing customized configuration for the middleware you're wiring up.

```csharp
public void Configure(IApplicationBuilder app,
                      IHostingEnvironment env,
                      ILoggerFactory loggerFactory)
{
    app.UseResponseCompression()
       .UseStaticFiles(
           new StaticFileOptions
           {
               OnPrepareResponse =
                   _ => _.Context.Response.Headers[HeaderNames.CacheControl] = 
                        "public,max-age=604800" // A week in seconds
           })
       .UseMvc(routes => routes.MapRoute("default", "{controller=Home}/{action=Index}/{id?}"));
}
```

The instance of the `StaticFileOptions` object has a public property namely "OnPrepareResponse" of type `Action<StaticFileResponseContext>`. So we can again specify a lambda
expression. This expression can be used to delegate the preparation of the response. Notice we're simply setting the `Cache-Control` header to a "max-age" of a week. That was
pretty simple, hey?!

### Compression Awareness

It's all the little things! The response compression middleware boasts deterministic compression, i.e.; if the
[`KestrelHttpServer`](https://github.com/aspnet/KestrelHttpServer) is running behind the
[__IIS__](https://www.iis.net/) reverse proxy then the middleware may or may not compress the response. The middleware determines the following:

- If the request accepts compression
- If the requested resource matches the configured MIME types
- Whether or not the response needs to be compressed

### Results

Let's spend some time examining the results of our response optimization efforts.

#### Before

![Before](./before.png)

##### Total(s)

```yaml
13 Requests | 549 KB transferred | ... | ... 
```

__banner1.svg Response Headers__

```yaml
HTTP/1.1 200 OK
Content-Length: 9679
Content-Type: image/svg+xml
Accept-Ranges: bytes
ETag: "1d1ce31e3bd09cf"
```

#### After

![After](./after.png)

##### Total(s)

```yaml
13 Requests | 175 KB transferred | ... | ... 
```

The total payload for all 13 requests is a total of 3.137 times smaller (a meager 31.9% of the original size). The larger the application, the more dramatic and valuable
this becomes! Consider an __Angular2__ application (or other SPA framework based application), which has tons of __JavaScript__ files to download -- 5 MB turns into ~1.5 MB.

__banner1.svg Response Headers__

```yaml
HTTP/1.1 200 OK
Content-Type: image/svg+xml
Server: Kestrel
Cache-Control: public,max-age=604800
Transfer-Encoding: chunked
Content-Encoding: gzip
Accept-Ranges: bytes
ETag: "1d1ce31e3bd09cf"
```

#### Subsequent (Cached) Requests

![Cached](./cached.png)

### Let's Summarize

We learned some of the basics about __ASP.NET Core__ middleware. Together we implemented a response optimization strategy that included deterministic response compression, as well
as static file caching. We learned some of the common patterns and naming conventions for integrating with __ASP.NET Core__ middleware. Finally, we have a good understanding of
the __ASP.NET Core__ request pipeline middleware precedence.

### Source Code

-  [IEvangelist.AspNetCore.Optimization](https://github.com/IEvangelist/IEvangelist.AspNetCore.Optimization)
