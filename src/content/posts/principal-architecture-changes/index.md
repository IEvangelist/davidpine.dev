---
title: What happened to my Thread.CurrentPrincipal
published: '2017-01-27'
description: This is not the IPrincipal you are looking for...
author: David Pine
tags:
  - .NET Core
  - ASP.NET Core
  - Identity
coverImage:
  src: ./not-what-you-are-looking-for.png
  alt: What happened to my Thread.CurrentPrincipal
---
# Overview

Like the title claims, if you're using `ASP.NET Core` and expecting the `Thread.CurrentPrincipal` or `ClaimsPrincipal.Current` to be populated you'd be wrong. This is not the
`IPrincipal` you're looking for. In this post we'll discuss what happened and what you need to do now. Additionally we'll cover all the peripheral benefits as a result of this change.

## History

If you have ever done any **.NET Framework** development, you've probably seen the `Thread` class. You're probably familiar with the `[Thread.CurrentPrincipal](https://msdn.microsoft.com/en-us/library/system.threading.thread.currentprincipal)` member. This member of the `Thread` class is defined as follows:

```csharp
public static IPrincipal CurrentPrincipal
{
    [System.Security.SecuritySafeCritical]  // auto-generated
    get
    {
        lock (CurrentThread)
        {
            var principal = (IPrincipal)CallContext.Principal;
            if (principal == null)
            {
                principal = GetDomain().GetThreadPrincipal();
                CallContext.Principal = principal;
            }
            return principal;
        }
    }

    [System.Security.SecuritySafeCritical]  // auto-generated
    [SecurityPermission(SecurityAction.Demand, Flags = SecurityPermissionFlag.ControlPrincipal)]
    set
    {
        CallContext.Principal = value;
    }
}
```

> Gets or sets the thread's current principal (for role-based security).

Does anyone see the issue with this? Can you say, "publicly static mutable state, oh my"?! You should be alarmed. This property was never a good idea and today it simply doesn't belong. **ASP.NET Core** is not responsible for assigning this. You might not agree with that decision, but it is final.

Before diving into this, pop over to  [Microsoft.AspNetCore.Security -- Issue 332](https://github.com/aspnet/Security/issues/322) for more of the back story.

## Thread.CurrentPrincipal Today in ASP.NET Core

As part of the `ASP.NET Core` framework, the following middleware packages are provided:

-  `[Microsoft.AspNetCore.Identity](https://github.com/aspnet/Identity)`
-  `[Microsoft.AspNetCore.Security](https://github.com/aspnet/Security)`

If you opt-in to using this middleware and you provide a login page (or expose an external provider) you'd end up creating an instance of a `ClaimsPrincipal` that represents an authenticated user. Subsequent requests to the web server would be handed the cookie that holds the user's claims. However the `Thread.CurrentPrincipal` would **not** actually reflect the `ClaimsPrincipal` object that was created as the result of the login. In fact, it would simply be an instance of the `GenericPrincipal` implementation. Likewise, walking up to the `ClaimsPrincipal.Current` property and asking it for the current claims principal in context wouldn't give you what you might expect either. Additionally, the `ClaimsPrincipal.Current` internally relies on the `Thread.CurrentPrincipal` for its value.

```csharp
public static ClaimsPrincipal Current
{
    get
    {
        return ClaimsPrincipal.s_principalSelector() ??
               ClaimsPrincipal.SelectClaimsPrincipal();
    }
}

private static ClaimsPrincipal SelectClaimsPrincipal()
{
    return Thread.CurrentPrincipal as ClaimsPrincipal ??
           new ClaimsPrincipal(Thread.CurrentPrincipal);
}
```

You might be asking yourself, "how do I access this value then?". If you're in the context of a controller then you already have access to it via the `.User` property. Otherwise, the answer is "dependency injection". Wherever you're in need of the identity for accessing claims, use constructor (`.ctor`) injection and give yourself the `IPrincipal` you need. If you're in the context of an action you might be tempted to use the `[FromServices]` attribute to inject the `IPrincipal` instance, but remember that this actually comes from the current user - which is already accessible via the controller's `.User` property.

## Dependency Injection

**ASP.NET Core** made dependency injection (DI) a first class citizen, and it is so easy to use. The `Startup.cs` by convention has a `ConfigureServices` method where you'll
register the dependencies. In the case of `ASP.NET Core` you'll need to do the following:

```csharp
// This method gets called by the runtime. Use this method to add services to the container.
public void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
    services.AddTransient<IPrincipal>(
        provider => provider.GetService<IHttpContextAccessor>().HttpContext.User);

    // ...
}
```

You might have noticed that we explicitly register the `IHttpContextAccessor` and corresponding implementation. This is necessary as that service is not registered for us. With that in place we can now specify that any class asking for an `IPrincipal` will be given the `IHttpContextAccessor.HttpContext.User` as the implementation. This is exactly what we needed. The exact same pattern is true for class libraries that want to leverage identity-based claim values from the `ClaimsPrincipal` implementation of the `IPrincipal`.

### Example

```csharp
using System.Security.Claims;
using System.Security.Principal;

public class SampleService : ISampleService
{
    private readonly ClaimsPrincipal _principal;

    public SampleService(IPrincipal principal) =>
        _principal = principal as ClaimsPrincipal;

    public Task ConsumeAsync()
    {
        var dobClaim = _principal?.FindFirst(ClaimTypes.DateOfBirth);
        // Take some action ...
    }
}
```

From the example above we can see how simple it is to use dependency injection. Simply define the `IPrincipal` as a `.ctor` parameter, store it in a field and consume it as needed.

### But Why?

There are a lot of people who feel as though DI is overrated and that it is much easier to ask the `Thread.CurrentPrincipal` for its value. While that is easy, it is also risky...think about it. Since it is mutable anyone (even 3rd party libraries) can set it. Additionally, you avoid concerns about trying to synchronize static state between the `Thread` and `ClaimsPrincipal` classes. Scott Hanselman blogged about a [similar issue](https://www.hanselman.com/blog/SystemThreadingThreadCurrentPrincipalVsSystemWebHttpContextCurrentUserOrWhyFormsAuthenticationCanBeSubtle.aspx) nearly thirteen years ago!

One of the first benefits that comes to mind from this is the fact that with DI the code is unit-testable. It is extremely easy to mock out an `IPrincipal` to use for unit
testing. Additionally, this alleviates all of the concerns about synchronization and reliability. The `IPrincipal` you're given is the principal you'd expect and it is fully
populated accordingly.
