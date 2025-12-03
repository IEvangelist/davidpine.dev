---
title: Overriding ASP.NET Core Framework-Provided Services
published: '2017-02-14'
description: >-
  You take the red pill—you stay in Wonderland, and I show you how deep the
  rabbit hole goes
author: David Pine
tags:
  - .NET Core
  - ASP.NET Core
  - Dependency Injection
coverImage:
  src: ./red-or-blue-pill-matrix-neo-morpheus.jpg
  alt: Overriding ASP.NET Core Framework-Provided Services
---
# Overview

In **.NET** it's really easy to create your own interfaces and implementations. Likewise, it's seemingly effortless to register them for dependency injection. But it is not always
obvious how to override existing implementations.  Let's discuss various aspects of "dependency injection" and how you can override the "framework-provided services".
  
As an example, let's take a recent story on our product backlog for building a security audit of login attempts.  The story involved the capture of attempted usernames along
with their corresponding IP addresses.  This would allow system administrators to monitor for potential attackers. This would require our **ASP.NET Core** application to have
custom logging implemented.

## Logging

Luckily [`ASP.NET Core Logging`](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging) is simple to use and is a first-class
citizen within `ASP.NET Core`.

In the **Logging** repository there is an extension method namely
[`AddLogging`](https://github.com/aspnet/Logging/blob/dev/src/Microsoft.Extensions.Logging/LoggingServiceCollectionExtensions.cs), here is what it
looks like:

```csharp
public static IServiceCollection AddLogging(this IServiceCollection services)
{
    if (services == null)
    {
        throw new ArgumentNullException(nameof(services));
    }

    services.TryAdd(ServiceDescriptor.Singleton<ILoggerFactory, LoggerFactory>());
    services.TryAdd(ServiceDescriptor.Singleton(typeof(ILogger<>), typeof(Logger<>)));

    return services;
}
```

As you can see, it is rather simple. It adds two `ServiceDescriptor` instances to the `IServiceCollection`, effectively registering the given service type to the
corresponding implementation type.

#### Following the rabbit down the hole

When you create a new `ASP.NET Core` project from **Visual Studio**, all the templates follow the same pattern. They have the `Program.cs` file with a `Main` method that looks
very similar to this:

```csharp
public static void Main(string[] args)
{
    var host = new WebHostBuilder()
        .UseKestrel()
        .UseContentRoot(Directory.GetCurrentDirectory())
        .UseIISIntegration()
        .UseStartup<Startup>()
        .UseApplicationInsights()
        .Build();

    host.Run();
}
```

###### Templates `Program.cs`

||||
|:-:|:-:|:-:|
| [Empty &nbsp; ](https://github.com/aspnet/Templates/blob/dev/src/BaseTemplates/EmptyWeb/Program.cs) | [Starter Web &nbsp; ](https://github.com/aspnet/Templates/blob/dev/src/BaseTemplates/StarterWeb/Program.cs) | [Web API &nbsp; ](https://github.com/aspnet/Templates/blob/dev/src/BaseTemplates/WebAPI/Program.cs) |

One thing that is concerning about a template like this is that the `IWebHost` is an `IDisposable`, so why then is this statement not wrapped in a `using`
[you ask](https://github.com/IEvangelist/Templates/commit/37e78bd0dc33069901cc51924fe8a2740d1e141c)? The answer is that the `Run` extension method
internally wraps itself in a `using`. If you were wondering where the `AddLogging` occurs, it is a result of invoking the `Build` function.

```yaml
[ Microsoft.AspNetCore.Hosting.WebHostBuilder ] 
    public IWebHost Build() ...
        private IServiceCollection BuildCommonServices() ...
            creates services then invokes services.AddLogging()
```

### A few words on the Service Descriptor

The `ServiceDescriptor` class is an object that _describes_ a _service_, and this is used by dependency injection. In other words, instances of the `ServiceDescriptor` are
descriptions of services. The `ServiceDescriptor` class exposes several static methods that allow its instantiation.

The `ILoggerFactory` interface is registered as a
[`ServiceLifetime.Singleton`](https://github.com/aspnet/DependencyInjection/blob/dev/src/Microsoft.Extensions.DependencyInjection.Abstractions/ServiceLifetime.cs#L14)
and its implementation is mapped to the `LoggerFactory`. Likewise, the generic type `typeof(ILogger<>)` is mapped to `typeof(Logger<>)`. This is just one of the several key
"Framework-Provided Services" that are registered.

## Putting it together

Now we know that the framework is providing all implementations of `ILogger<T>`, and resolving them as their `Logger<T>`. We also know that we could write our own implementation of
the `ILogger<T>` interface. Being that this is open-source
[we can look to their implementation](https://github.com/aspnet/Logging/blob/dev/src/Microsoft.Extensions.Logging.Abstractions/LoggerOfT.cs) for inspiration.

```csharp
public class RequestDetailLogger<T> : ILogger<T>
{
    private readonly ILogger _logger;

    public RequestDetailLogger(ILoggerFactory factory,
                               IRequestCategoryProvider requestCategoryProvider)
    {
        if (factory == null)
        {
            throw new ArgumentNullException(nameof(factory));
        }
        if (requestCategoryProvider == null)
        {
            throw new ArgumentNullException(nameof(requestCategoryProvider));
        }

        var category = requestDetailCategoryProvider.CreateCategory<T>();
        _logger = factory.CreateLogger(category);
    }

    IDisposable ILogger.BeginScope<TState>(TState state)
        => _logger.BeginScope(state);

    bool ILogger.IsEnabled(LogLevel logLevel)
        => _logger.IsEnabled(logLevel);

    void ILogger.Log<TState>(LogLevel logLevel, 
                             EventId eventId, 
                             TState state, 
                             Exception exception, 
                             Func<TState, Exception, string> formatter)
        => _logger.Log(logLevel, eventId, state, exception, formatter);
}
```

The `IRequestCategoryProvider` is defined and implemented as follows:

```csharp
using static Microsoft.Extensions.Logging.Abstractions.Internal.TypeNameHelper;

public interface IRequestCategoryProvider
{
    string CreateCategory<T>();
}

public class RequestCategoryProvider : IRequestCategoryProvider
{
    private readonly IPrincipal _principal;
    private readonly IPAddress _ipAddress;

    public RequestCategoryProvider(IPrincipal principal,
                                   IPAddress ipAddress)
    {
        _principal = principal;
        _ipAddress = ipAddress;
    }

    public string CreateCategory<T>()
    {
        var typeDisplayName = GetTypeDisplayName(typeof(T));

        if (_principal == null || _ipAddress == null)
        {
            return typeDisplayName;
        }

        var username = _principal?.Identity?.Name;
        return $"User: {username}, IP: {_ipAddress} {typeDisplayName}";
    }
}
```

If you're curious how to get the `IPrincipal` and `IPAddress` into this implementation (with DI) -
[I discussed it here](https://davidpine.net/blog/principal-architecture-changes/) briefly. It is pretty straight-forward. In the `Startup.ConfigureServices`
method do the following:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ... omitted for brevity

    services.AddTransient<IRequestCategoryProvider, RequestCategoryProvider>();
    services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();
    services.AddTransient<IPrincipal>(
        provider => provider.GetService<IHttpContextAccessor>()
                           ?.HttpContext
                           ?.User);
    services.AddTransient<IPAddress>(
        provider => provider.GetService<IHttpContextAccessor>()
                           ?.HttpContext
                           ?.Connection
                           ?.RemoteIpAddress);
}
```

Finally, we can
<a href="https://github.com/aspnet/DependencyInjection/blob/dev/src/Microsoft.Extensions.DependencyInjection.Abstractions/Extensions/ServiceCollectionDescriptorExtensions.cs"
   target="_blank">`Replace`</a> the implementations for the `ILogger<T>` by using the following:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ... omitted for brevity
    services.Replace(ServiceDescriptor.Transient(typeof(ILogger<>), 
                                                 typeof(RequestDetailLogger<>)));
}
```

Notice that we replace the framework-provided service as a `ServiceLifetime.Transient`. Opposed to the default `ServiceLifetime.Singleton`. This is more or less an extra
precaution. We know that with each request we get the `HttpContext` from the `IHttpContextAccessor`, and from this we have the `User`. This is what is passed to each
`ILogger<T>`.

# Conclusion

This approach is valid for overriding any of the various framework-provided service implementations. It is simply a matter of knowing the correct `ServiceLifetime` for your
specific needs. Likewise, it is a good idea to leverage the open-source libraries of the framework for inspiration. With this you can take finite control of your web-stack.

# Further Reading

- <a href="https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection" target="_blank">
     `ASP.NET Core - Dependency Injection`
   </a>
