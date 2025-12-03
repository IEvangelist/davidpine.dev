---
title: ASP.NET Core RC2 (Migration Guide)
published: '2016-05-21'
description: Migrating from RC1 to RC2
author: David Pine
tags:
  - .NET Core
  - ASP.NET Core
coverImage:
  src: ./migrating.jpg
  alt: ASP.NET Core RC2 (Migration Guide)
---
# Introduction

On Monday, May 16<sup>th</sup> 2016 there was an amazing announcement from the **.NET Blog** team!

>[Announcing .NET Core RC2 and .NET Core SDK Preview 1](https://blogs.msdn.microsoft.com/dotnet/2016/05/16/announcing-net-core-rc2/)

This post will serve as a guide that walks you through the steps as I experienced them from migrating existing `ASP.NET Core RC1` applications to `ASP.NET Core RC2`.
It is worth mentioning that I'm am targeting the `.NET 4.6` framework. So, I *do not* cover the `.netcoreapp` or `netstandard` TFMs (target framework monikers).

## Tooling

The **RC2** release brings the `.NET Core CLI` to the forefront, and with that all the other command line tooling that
you've grown accustomed to should be stricken from your environment, i.e.; `DNX`, `DNU`, and `DNVM`. Let's start with the
removal of all these utilities.

### Removing DNVM

Believe it or not, you might have a dated version of the **DNVM CLI** and in order to invoke the `uninstall` you might have to first
perform an `update-self` command. Doing so will ensure that you have the latest version, which will contain the `uninstall` command.
From a `cmd` window *running as admininistrator*, execute the following:

```
dnvm update-self
```

Then execute the following:

```
dnvm uninstall
```

#### Verification

From a new `cmd` window, the `dnvm` command should result in the following:

```
λ dnvm
'dnvm' is not recognized as an internal or external command, operable program or batch file.
```

### Removing DNX & DNU

From a `cmd` line window, execute `dnx` - you should see something similar to this as output:

```yaml
λ dnx
Microsoft .NET Execution environment Clr-x86-1.0.0-rc1-16231

Usage: dnx [options]

Options:
  --project|-p <PATH>              Path to the project.json file or the application folder. Defaults to the current folder if not provided.
  --appbase <PATH>                 Application base directory path
  --lib <LIB_PATHS>                Paths used for library look-up
  --debug                          Waits for the debugger to attach before beginning execution.
  --bootstrapper-debug             Waits for the debugger to attach before bootstrapping runtime.
  --framework <FRAMEWORK_ID>       Set the framework version to use when running (i.e. dnx451, dnx452, dnx46, ...)
  -?|-h|--help                     Show help information
  --version                        Show version information
  --watch                          Watch file changes
  --packages <PACKAGE_DIR>         Directory containing packages
  --configuration <CONFIGURATION>  The configuration to run under
  --port <PORT>                    The port to the compilation server
```

Likewise enter `dnu` in the same `cmd` window, expecting the following output:

```yaml
λ dnu
Microsoft .NET Development Utility Clr-x86-1.0.0-rc1-16231

Usage: dnu [options] [command]

Options:
  -v|--verbose  Show verbose output
  -?|-h|--help  Show help information
  --version     Show version information

Commands:
  build             Produce assemblies for the project in given directory
  clear-http-cache  Clears the package cache.
  commands          Commands related to managing application commands (install, uninstall)
  feeds             Commands related to managing package feeds currently in use
  install           Install the given dependency
  list              Print the dependencies of a given project
  pack              Build NuGet packages for the project in given directory
  packages          Commands related to managing local and remote packages folders
  publish           Publish application for deployment
  restore           Restore packages
  wrap              Wrap a csproj/assembly into a project.json, which can be referenced by project.json files

Use "dnu [command] --help" for more information about a command.
```

The `DNX` and `DNU` command line tools are simply `exe's` in your `%USERPROFILE%\.dnx` and `%USERPROFILE%\.dnx\bin` directories. Navigate to your `%USERPROFILE%`
directory from windows explorer and delete the `.dnx` directory entirely. Once you have successfully deleted this directory you
should be able to execute the `dnx` and `dnu` commands again from a `cmd` window and the system should complain that they are not
recognized.

#### Verification

From a new `cmd` window, the `dnx` and `dnu` commands should result in the following:

```
λ dnx
'dnx' is not recognized as an internal or external command, operable program or batch file.
```

```
λ dnu
'dnu' is not recognized as an internal or external command, operable program or batch file.
```

### Environment Variables

Unfortunately, the `PATH` environment variable is not cleaned up and this needs to be done manually.

Press the <kbd>Windows</kbd> key, then begin typing "environment", then select either of the two top options returned:

![Windows Search](./win-search.png)

You are then presented the "system properties" dialog, select **Environment Variables**.

![System Properties](./sys-props.png)

We will need to ensure that both `PATH` variables are cleaned up, including your `%USERPROFILE%` and the `System` variables. Let's <kbd>Edit</kbd> both of them.

![Environment Variables](./env-vars.png)

From the **Edit Variables** dialog, remove any and all of the following:

```
C:\Users\[ your global identifier ]\.dnx\bin;
C:\Users\[ your global identifier ]\.dnx\runtimes\dnx-clr-win-x86.1.0.0-rc1-update1\bin;
```

![Edit User Variables](./edit-vars.png)

### .NET Core CLI

Simply follow [these instuctions](https://www.microsoft.com/net/core#windows). Once you're able to "Run the app" from the new **CLI** you're good to go.

#### Review

You should the following checklist fully satisfied at this point.

 **DNX**, **DNU** and **DNVM** completely removed / uninstalled<br>
 **Visual Studio 2015 Update 2** installed<br>
 **.NET Core CLI** installed
***

## Edit by Hand 

There were changes to **APIs** which required changes to implementation aspects of the source code. Additionally, `namespace`
changes such as (but not limited to) `Microsoft.AspNet.*` to `Microsoft.AspNetCore.*`. But the bulk of the work was really in the hand-editing
of `.sln`, `global.json`, `.xproj`, `project.json`, etc. files. Let's look at what changed.

### The `.sln` file

Change the **VisualStudioVersion** from `14.0.24720.0` to `14.0.25123.0`.

```
VisualStudioVersion = 14.0.25123.0
```

### The `global.json` file

Change the **version** from `1.0.0-rc1-update1` to `1.0.0-preview1-002702`.

```json
{
  "projects": [ "src", "test" ],
  "sdk": {
    "version": "1.0.0-preview1-002702"
  }
}
```

### The `.xproj` file

The `.xproj` files are a little more involved, there are a few items that are required to be changed. In **RC1** we had proprerties that
were specific to **DNX**, now we replace these with **DOTNET**.

#### RC1

```
<Import Project="$(VSToolsPath)\DNX\Microsoft.DNX.Props" 
        Condition="'$(VSToolsPath)' != ''" />
```

#### RC2

```
<Import Project="$(VSToolsPath)\DotNet\Microsoft.DotNet.Props" 
        Condition="'$(VSToolsPath)' != ''" />
```

Additionally, we need to change the targets. This one requires that you know the type of project you're editing, for example *"class library"* vs. *"web site"*. In **RC1**
there was only one target, but with **RC2** they are differeniated.

#### RC1

```
<Import Project="$(VSToolsPath)\DNX\Microsoft.DNX.targets" 
        Condition="'$(VSToolsPath)' != ''" />
```

#### RC2 (class library)

```
<Import Project="$(VSToolsPath)\DotNet\Microsoft.DotNet.targets" 
        Condition="'$(VSToolsPath)' != ''" />
```

#### RC2 (web)

```
<Import Project="$(VSToolsPath)\DotNet.Web\Microsoft.DotNet.Web.targets" 
        Condition="'$(VSToolsPath)' != ''" />
```

### The `project.json` file

There has been a large reworking of the `project.json` file - detailed [here](https://github.com/aspnet/Announcements/issues/175). I will not be covering all
of the changes here, but I do intend calling attention to some of the observations I have made and changes that were most pertinent. Here is the link for the official
[`project.json schema`](https://json.schemastore.org/project-1.0.0-rc2).

We will look at various sections of the `project.json` file changes. Let's start with replacing `compilationOptionsbuildOptions` with `buildOptions`, and notice that
we are adding much more options than before.

#### RC1

```json
"compilationOptions": {
  "emitEntryPoint": true,
  "warningsAsErrors": true
},
```

#### RC2

```json
"buildOptions": {  
  "emitEntryPoint": true,
  "warningsAsErrors": true,
  "preserveCompilationContext": true,
  "embed": "Views/**", // Instead of ".:resource": "Views/**",
  "compile": {
    "exclude": [ "wwwroot", "node_modules" ] // Now here, instead of ".:exclude"
  }
},
```

Additionally, we have `publishOptions` that we can utilize - consider the following:

```json
"publishOptions": {
  "include": [
    "wwwroot",
    "appsettings.json",
    "web.config"
  ]
},
```

Finally, we have to be a little more specific with how we want the server to handle garbage collection.

```json
"runtimeOptions": {
  "gcServer": true, // Yes, please perform garbage collection
  "gcConcurrent": true // Yes, please do so concurrently...
},
```

### The `web.config` file

Now, **IIS** is a little smarter and is starting to recognize **ASP.NET Core** a little more.

#### RC1

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="httpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler" 
           resourceType="Unspecified"/>
    </handlers>
    <httpPlatform processPath="%DNX_PATH%" arguments="%DNX_ARGS%" stdoutLogEnabled="false" />
  </system.webServer>
</configuration>
```

#### RC2

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" 
           resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="%LAUNCHER_PATH%" arguments="%LAUNCHER_ARGS%" 
                forwardWindowsAuthToken="false" stdoutLogEnabled="false" />
  </system.webServer>
</configuration>
```

### The `hosting.json` file

With the release of **RC2**, the `project.json` schema removed the `webroot` property. Now in order to specify the websites' static content directory we need to
create a `hosting.json` file. This file should look like this.

```json
{
  "webroot": "wwwroot"
}
```

### The `appsettings.json` file

This was a minor change, but if you forgot to change this - then you'll end up with a runtime exception. The `Logging:LogLevel:Default` should now be
`Debug` as `Verbose` was removed altogether.

#### RC1

```json
"Logging": {
      "IncludeScopes": false,
      "LogLevel": {
        "Default": "Verbose", // < -- Change "Verbose"
        "System": "Information",
        "Microsoft": "Information"
      }
```

#### RC2

```json
"Logging": {
      "IncludeScopes": false,
      "LogLevel": {
        "Default": "Debug", // < --- To "Debug"
        "System": "Information",
        "Microsoft": "Information"
      }
```

### The `launchSettings.json` file

The `environmentVariables` changed, such that the key name for the environment is no longer referred to as "Hosting:Environment".

#### RC1

```json
"environmentVariables": {
  "Hosting:Environment": "Development" // < -- Change "Hosting:Environment"
}
```

#### RC2

```json
"environmentVariables": {
  "ASPNETCORE_ENVIRONMENT": "Development" // < -- To "ASPNETCORE_ENVIRONMENT"
}
```

### The `*.cs` files

Some of these were very simple to fix. After updating your `project.json` with the latest **RC2** versions - some changes are as simple as a `namespace` change (but others are more involed).

#### RC1

```csharp
using Microsoft.AspNet.*;
```

#### RC2

```csharp
using Microsoft.AspNetCore.*;
```

### API changes

There was an attempt to unify some of the APIs as it pertains to consistency. As such, I had to make the following changes to my projects.
The `IApplicationBuilder.Use*` pattern now takes a new `*Options` instance rather than an `Action<*Options>`, providing more control to the consumer.

#### RC1

```csharp
app.UseCookieAuthentication(options =>
{
    options.AuthenticationScheme = "AspNetCookie";
    options.AutomaticAuthenticate = true;
    options.AutomaticChallenge = true;
    options.LoginPath = "/account/login";
    options.LogoutPath = "/account/logout";
    options.AccessDeniedPath = "/account/forbidden";
});
```

#### RC2

```csharp
app.UseCookieAuthentication(new CookieAuthenticationOptions
{
    AuthenticationScheme = AuthenticationScheme.JciCookie,
    AutomaticAuthenticate = true,
    AutomaticChallenge = true,
    LoginPath = "/account/login",
    LogoutPath = "/account/logout",
    AccessDeniedPath = "/account/forbidden",
});
```

The service locator pattern (or should I say "anti-pattern") is slowing being removed from the framework. As such, if you were relying on the `CallContextServiceLocator.Locator.ServiceProvider`
you can no longer do so with the **RC2** release.

Wherever you were using the `IApplication` interface, you should be able to instead use the `IWebHost` interface.

### Controllers as Services

In **RC1**, there was a nice little feature that allowed for any `Type` to exist in a list of plausible controller/services - meaning that you could basically register external controllers as
valid API and View entry points into your hosting application. You simply needed to add the types via the following:

```csharp
IMvcBuilder.AddControllersAsServices(params Type[] types);
```

This method signature changed with **RC2** and it no longer accepts any arguments. In order to retain this functionality, you must first add the desired external assemblies as an `AssemblyPart`.

```csharp
foreach (var assembly in GetExternalAssemblies())
{
    builder.PartManager.ApplicationParts.Add(new AssemblyPart(assembly));    
}

builder.AddControllersAsServices();
```

### The Startup `.ctor`

One little change, you're now required to explicitly set the base path and you can do so with the following.

```csharp
public Startup(IHostingEnvironment env)
{
    var builder =
        new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath) // Explicity set base from the content root path
            .AddJsonFile("appsettings.json", true)
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json", true)
            .AddEnvironmentVariables();
    // Omitted for brevity...
}
```

### The `Program.cs` file

Yes, we are now a console application...so we'll need this for our entry point.

```csharp
public class Program
{
    public static void Main(string[] arguments)
    {
        using (var host = 
            new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();)
        {
            host.Run();
        }
    }
}
```

## Breaking changes

For a complete listing of all the announcements, please visit the official
[**ASP.NET  Repo**](https://github.com/aspnet/Announcements/issues?q=is%3Aopen+is%3Aissue+milestone%3A1.0.0-rc2) announcements issue.

## Further reading

The previous steps were really to get your environment in an **RC2** ready state, but there is so much more you can learn that has changed.
I encourage bookmarking and reading the following articles as time permits.

* [**Migrating from DNX to .NET Core CLI**](https://dotnet.github.io/docs/core-concepts/dnx-migration.html)
* [**Migrating from ASP.NET 5 RC1 to ASP.NET Core**](https://docs.asp.net/en/latest/migration/rc1-to-rc2.html)
* [**The .NET Platform Standard**](https://github.com/dotnet/corefx/blob/master/Documentation/architecture/net-platform-standard.md)
* [**Writing Libraries with Cross Platform Tools**](https://dotnet.github.io/docs/core-concepts/libraries/libraries-with-cli.html)

## Conclusion

There, that really wasn't too bad - was it? I'm certain that I didn't cover everything and that I probably missed something. I hope that this was helpful, please feel free to share this!
