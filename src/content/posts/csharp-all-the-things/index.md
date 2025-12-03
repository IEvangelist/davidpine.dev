---
title: C# All The Things
published: '2018-12-16'
description: .NET Core Global Tools. You don't need glasses to C#.
author: David Pine
tags:
  - .NET Core
  - ASP.NET Core
  - C#
  - Tooling
coverImage:
  src: ./csharp-advent.png
  alt: C# All The Things
---
> I'm proud to share that this post is part of the C# Advent Calendar and it's my second year contributing to it! I encourage you to check out all the others [here](https://crosscuttingconcerns.com/The-Second-Annual-C-Advent).

<br />

# Developers Are Lazy

In the world of web development it is hard to escape certain tools that we are forced to rely on. As developers we're innately lazy and it is safe to say that perhaps we don't really care enough to look into other tooling options. Let's face it... you're lazy, and I'm lazy and that is all there is to it. __.NET Core__ offers [global tooling](https://aka.ms/global-tools), much like __NPM__ you can use these tools for various build automation tasks. It's worth exploring __.NET Core Global Tooling__ to see how it might enable us to be even more lazy!

In this post I will cover how I have utilized the __.NET Core Global Tooling__ feature to my advantage, and how you as a developer can easily consume it.

## Let's Use It Already

I was recently working on a small and very simple web project. It served up some light-weight HTML, CSS and JavaScript. I thought to myself "it would be useful to minify these files", but in order to do so I would have relied on __NPM__ and I simply didn't want to. Instead, I wrote a __.NET Core Global Tool__. It's named [Miglifier](https://github.com/IEvangelist/IEvangelist.DotNet.Miglifier), well because naming things is hard and it does two things..."minifies" and "uglifies" files, thus it "miglifies" them 😅. It is extremely simple to consume.

From the `.NET CLI` execute the following command to install the latest version.

```bash
dotnet tool install --global dotnet-miglifier
```

This will install "miglifier" globally. You can then use it by simply invoking the following command and passing in the `"wwwroot"` directory. The `"wwwroot"` directory argument instructs "miglifier" where to scan for files.

> <cite>__ProTip__</cite>
> You do not actually need to invoke `dotnet miglifier`, you can simply say `miglifier` and omit the `dotnet` from the command.

<br/><br/>

Each file that is found will be "miglified" and then written back to disk.

```bash
miglifier "wwwroot"
Scanning for CSS, JavaScript and HTML files to process.
Processing 1 Css file(s).
        .\wwwroot\main.min.css

Processing 1 Js file(s).
        .\wwwroot\main.min.js
        .\wwwroot\utilities.min.js

Processing 1 Html file(s).
        .\wwwroot\main.min.html

Successfully miglified 3 files!
```

It is limited in its functionality at this point. The ability to configure how the "miglifier" will operate is supported through a `miglify.json` file. It supports globing for input directories. It allows each type to have their own output directory. All the settings for the CSS, HTML and JavaScript files are serialized versions of their C# equivalent. As such, you can control it anyway you see fit...that is to say so long as it confines to the [`NUglify`](https://github.com/xoofx/NUglify) package. By default, it simply works as an in-place minification of CSS, HTML and JavaScript files - for now (more to come soon)! This results in a `*.min.*` file of the corresponding file type. It maintains the same folder hierarchy and will leave files where they were.

## Building the .NET Core Tool

I relied heavily on the documentation from the official __Microsoft__ site on [How to Create a .NET Core Global Tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools-how-to-create). I was thoroughly inspired by my good friend Andrew Lock and [his awesome post on the subject here](https://andrewlock.net/creating-a-net-core-global-cli-tool-for-squashing-images-with-the-tinypng-api/). We begin our process with a simple command line template from within the `File > New Project` menu option of __Visual Studio__.

Then we'll need to edit the `.csproj` file and manually set `<IsPackable>true</IsPackable>` and `<PackAsTool>true</PackAsTool>`. This enables your command line app to be treated as a __.NET Core Global Tool__. Note that we've given it a title, command line and assembly name - all for good measure.

```xml
<PropertyGroup>
    <OutputType>Exe</OutputType>
    <IsPackable>true</IsPackable>
    <PackAsTool>true</PackAsTool>
    <LangVersion>latest</LangVersion>
    <Title>dotnet-miglifier</Title>
    <ToolCommandName>dotnet-miglifier</ToolCommandName>
    <AssemblyName>dotnet-miglifier</AssemblyName>
</PropertyGroup>
```

# C# Bits 😎

Make no mistake, this little command line application is packed full of some awesome __C#__ bits! It starts out as a McMaster command line utilitarian app - [details here](https://github.com/natemcmaster/CommandLineUtils). It is powered by the __.NET__ library for globing, [Glob](https://github.com/kthompson/glob/) - this is what enables our config file to have input patterns like `"**/*.js"`. I wrote a few extension methods for mapping my __C#__ `MiglifySettings` class object to __JSON__. Let's start there... here is the settings class, it is rather simple.

```csharp
public class MiglifySettings
{
    public IDictionary<MiglifyType, DirectorySettings> Globs { get; set; } =
        new Dictionary<MiglifyType, DirectorySettings>
        {
            [MiglifyType.Css] = new DirectorySettings { Input = "**/*.css" },
            [MiglifyType.Html] = new DirectorySettings { Input = "**/*.html" },
            [MiglifyType.Js] = new DirectorySettings { Input = "**/*.js" }
        };

    public CodeSettings JavaScriptSettings { get; set; } = new CodeSettings();
    public CssSettings CssSettings { get; set; } = new CssSettings();
    public HtmlSettings HtmlSettings { get; set; } = new HtmlSettings();
}

public class DirectorySettings
{
    public string Input { get; set; }
    public string Output { get; set; }
}
```

One cool bit of __C#__ to call attention to here is the usage of collection initializers with our dictionary instantiation. Note how we can directly assign into an index. This was introduced as part of __C# 6__ to make initialization more consistent with common usage. For `Dictionary<TKey, TValue>` it is common to add or update values via the indexer. Here is the extension methods I mentioned that I'm using to serialize this class to and from __JSON__.

```csharp
public static class StringExtensions
{
    public static T To<T>(this string json) 
        => JsonConvert.DeserializeObject<T>(json, JsonSettings.SerializerDefaults);
}

public static class ObjectExtensions
{
    public static string ToJson<T>(this T instance) 
        => JsonConvert.SerializeObject(instance, JsonSettings.SerializerDefaults);
}
```

With these two extension methods we can easily walk up to an instance of the `MiglifySettings` class, serialize it to a __JSON__ `string` and vice versa -- it is pretty powerful. In case you're wondering where the `JsonSettings.SerializerDefaults` comes from, it is a simple helper class with the default settings that I prefer for serializing __JSON__. Here they are...

```csharp
static class JsonSettings
{
    static readonly DefaultContractResolver _contractResolver =
        new DefaultContractResolver
        {
            NamingStrategy = new CamelCaseNamingStrategy()
        };

    internal static JsonSerializerSettings SerializerDefaults { get; } =
        new JsonSerializerSettings
        {
            DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate,
            ContractResolver = _contractResolver,
            Formatting = Formatting.Indented,
            NullValueHandling = NullValueHandling.Ignore
        };
}
```

Now, in the spirit of __C#__ I'd like to share something rather special with you. Consider this my Christmas 🎁 to you as part of the __C# Advent Calendar__...deconstruction 😈! I posted about {{< url-link "__C# 7__ when it was first released" "" >}} and while this is a __C# 7__ feature it is a little different. With the introduction of _tuples_ the language also gave us deconstruction of _tuples_.  In addition to deconstructing _tuples_ we can actually deconstruct anything that has a `public void Deconstruct([out T value])` method, where the `out` parameters serve as the ordinals to deconstructing a target tuple type. In other words, we can deconstruct non-tuple types into tuples. Let's explore this a bit more, shall we?

In the miglifier app we accept two arguments.

  1. The `Path` argument is the root directory in which we'll scan for files
  2. The `MiglifyJsonPath (optional)` argument is the path to the `miglify.json` file

This configuration file is deserialized and passed into the `GetMiglifiedFiles` function. This uses glob patterns to search for all the target files to work on processing them along the way. Eventually it will return the results -- the results are of type `IEnumerable<MiglifyFile>`. We group the results and then convert them to a `Dictionary<MiglifyType, List<MiglifyFile>>` and `foreach` over our collection. Here is the beauty of it... we can deconstruct the `KeyValuePair<MiglifyType, List<MiglifyFile>>`!

```csharp
var settings = await LoadMiglifySettingsAsync(miglifyJson);
var results = GetMiglifiedFiles(wwwroot, settings);

// Deconstruct our key value pairs into type and files.
foreach (var (type, files) in results.GroupBy(f => f.Type)
                                     .ToDictionary(grp => grp.Key, grp => grp.ToList()))
{
    // Iterate our files
    foreach (var file in files)
    {
        // Do other stuff here...
    }
}
```

When I first learned about this, I was so excited to tweet about it!

[View post by @davidpine7](https://x.com/davidpine7/status/1032709720505831425)

## Credit 🙏🏼

I would like to call attention to the 3rd party dependencies that helped make this __.NET Core Global Tool__ possible. Without them, it would have been a much larger undertaking. Here are all list of packages that I'm using.

```xml
<PackageReference Include="Centare.Extensions" Version="1.0.19" />
<PackageReference Include="Glob" Version="0.4.0" />
<PackageReference Include="McMaster.Extensions.CommandLineUtils" Version="2.2.5" />
<PackageReference Include="Humanizer.Core" Version="2.5.1" />
<PackageReference Include="Newtonsoft.Json" Version="11.0.2" />
<PackageReference Include="NUglify" Version="1.5.12" />
```

The [__Centare.Extensions__](https://github.com/centare/Centare.Extensions/wiki#Usage) is an amazing package, with tons of great extension methods. There is one in particular that does the bulk of the work, that is the [`NUglify`](https://github.com/xoofx/NUglify) package. There is an immense background to this project that is documented [here in their very detailed README.md](https://github.com/xoofx/NUglify/blob/master/doc/readme.md). Know that, without this package the "miglifier" would probably not exist for you today!

# Badges 🤘🏼

The __NuGet__ & __Azure DevOps__ badges are only part of the story, by all means please check out the project yourself  [IEvangelist.DotNet.Miglifier](https://github.com/IEvangelist/IEvangelist.DotNet.Miglifier)! I look forward to pull-requests, feature requests, or issues. Happy coding, friends...

<img src="https://dev.azure.com/davidpine/IEvangelist.DotNet.Miglifier/_apis/build/status/IEvangelist.DotNet.Miglifier%20.NET%20Core-CI"
     alt="Build status"
     data-canonical-src="https://dev.azure.com/davidpine/IEvangelist.DotNet.Miglifier/_apis/build/status/IEvangelist.DotNet.Miglifier%20.NET%20Core-CI"
     style="max-width:100%;">
<a href="https://www.nuget.org/packages/dotnet-miglifier/" rel="nofollow" target="_blank">
   <img src="https://img.shields.io/nuget/v/dotnet-miglifier.svg"
        alt="NuGet version (dotnet-miglifier)"
        data-canonical-src="https://img.shields.io/nuget/v/dotnet-miglifier.svg?style=flat-square"
        style="max-width:100%;">
</a>
