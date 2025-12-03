---
title: ASP.NET Core Configuration Tips
published: '2018-03-10'
description: Configuration tips for success
author: David Pine
tags:
  - ASP.NET Core
  - C#
  - Configuration
  - JSON
coverImage:
  src: ./settings.jpeg
  alt: ASP.NET Core Configuration Tips
---
Being a software developer, it's in our nature to configure various aspects of the applications that we write. With __ASP.NET Core__ configuring our applications is really straight forward. Luckily, there is a lot of really well written documentation surrounding this topic.

-  [ASP.NET Core - Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?tabs=basicconfiguration)
-  [ASP.NET Core - Options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options)

However, there is still room for improvement. I've prepared a few tips that can enhance developer productivity by taking advantage of various C# features.

## C# Class < -- > JSON

__ASP.NET Core__ configuration via the `IOptions<T>` and `IOptionsSnapshot<T>` have been around for a long time. Their usage is a first class citizen within __ASP.NET Core__ applications, and work to tie `appsettings.json` values to corresponding configuration [POCO's](https://en.wikipedia.org/wiki/Plain_old_CLR_object). As a refresher on configuration, there is a one-to-one relationship between a JSON object in the `appsettings.json` and the C# class that represents it.

### `appsettings.json`

```json
{
    "notificationSettings": {
        "notificationInterval": "00:15:00",
        "isMulticast": true,
        "sources": [
            {
                "url": "https://www.contoso.com/notificationHub",
                "key": "f7ea5e2b22bf907344f3a780caa0a166"
            }
        ]
    }
}
```

### `NotificationSettings.cs` and `NotificationSource.cs`

```csharp
public class NotificationSettings
{
    public TimeSpan NotificationInterval { get;set; }
    public TimeSpan TimeoutInterval { get; set; }
    public bool IsImplicit { get; set; }
    public List<NotificationSource> Sources { get; set; }

    public NotificationSetting()
    {
        IsImplicit = true;
        TimeoutInterval = TimeSpan.FromSeconds(30);
    }
}

public class NotificationSource
{
    public Uri Url { get; set; }
    public string Key { get; set; }
}
```

If you looked at both the `appsettings.json` and the two C# classes, I'm hoping that you noticed something. I hope that you noticed that the JSON settings didn't fully provide a value for all the mapped properties in the `NotificationSettings` object. We have however, set these values as part of the object's `.ctor`.

> <cite>__ProTip__</cite>
> Use C# 6 Property Initializers to set default values. If the corresponding property exists in the JSON object mapping, it will be overwritten as to be expected; however, if omitted your default value is used.

<br/><br/>

Using property initializers, this is simplified as follows:

```csharp
public class NotificationSettings
{
    public TimeSpan NotificationInterval { get;set; }
    public TimeSpan TimeoutInterval { get; set; } = TimeSpan.FromSeconds(30);
    public bool IsImplicit { get; set; } = true;
    public List<NotificationSource> Sources { get; set; }
}
```

It is a good practice to specify default values for your settings classes. As part of the `Startup.cs` class, the `ConfigureServices` method is where you will "Configure" your mappings of the JSON section that is associated to the C# object representing it. For example:

```csharp
public void ConfigureServices(
    IServiceCollection services)
{
    // Configure the "NotificationSettings"
    // mapping it to the corresponding JSON section

    services.Configure<NotificationSettings>(
        Configuration.GetSection("NotificationSettings"));
}
```

This should look very familiar.

> <cite>__ProTip__</cite>
> Use C# 6 `nameof` operator to configure your C# class mapping. This alleviates the usage of magic strings and enforces a consistent naming convention.

<br/><br/>

The change is tiny, however; this is another great usage of the `nameof` operator. This assumes that the the section in the JSON file matches the name of the class object representing it. Additionally, it serves as a reason to keep the names matching.

```csharp
public void ConfigureServices(
    IServiceCollection services)
{
    services.Configure<NotificationSettings>(
        Configuration.GetSection(nameof(NotificationSettings)));
}
```

## Conclusion

I have provided a few simple tips for __ASP.NET Core__ configuration leveraging a few C# 6 features. They are nothing earth-shattering, but they are practical and very useful. I often see developers _not_ taking advantage of simple features like these when they are available. These two features alone in an __ASP.NET Core__ configuration could simplify refactoring and stream-line readability -- that's enough reason for me, I hope it is for you too!
