---
title: ASP.NET Core Unit Testing For Security Attributes
published: '2018-03-23'
description: Authorization Attribute Safety Net
author: David Pine
tags:
  - ASP.NET Core
  - C#
  - xUnit
coverImage:
  src: ./security.jpg
  alt: ASP.NET Core Unit Testing For Security Attributes
---
## Intro

As a developer, I can say that developers are lazy - at least I know and acknowledge that I am. If I'm tasked with something even the slightest bit repetitious I'll script it out, or find a way to automate it. Likewise, if I fall into a habit of forgetting something important - I'll figure out a way to _not forget_. Especially when it comes to securing an application.

## Security Soapbox

We should take application security very seriously! With __ASP.NET Core__ there's a lot of [existing documentation](https://docs.microsoft.com/en-us/aspnet/core/security/) for securing your application. This covers identity, authentication, authorization, data protection, HTTPS, safe storage, Azure key vault, anti-request forgery, open redirect attack, cross-site scripting, etc... the list goes on and on. All these things are important and as a developer you're ultimately accountable for writing secure code.

## The Dilemma

A while back I spent a fair amount of time writing some __ASP.NET Core Web API__ endpoints and I kept forgetting to provide the `AuthorizeAttribute` on various controller classes or even controller actions.

There is an easy way to solve this. Within `ConfigureServices` we could apply an `AuthorizeFilter` with a policy that requires an authenticated user. This serves as a nice security blanket, that ensures all endpoints are only accessible from an authenticated user.

```csharp
public void ConfigureServices(IServicesCollection services)
{
    services.AddMvc(
        options =>
        {
            // Only allow authenticated users.
            var defaultPolicy =
                new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

            options.Filters.Add(new AuthorizeFilter(defaultPolicy));    
        });
}
```

However, based on your needs - you may choose to not apply this filter. If you choose to not apply this filter you're left with three options.

 1. Apply an `AuthorizeAttribute` at the controller class level (cascades onto all the actions)
 2. Apply an `AuthorizeAttribute` on each individual action method 
 3. Not protect your API at all 

## Automation To The Rescue

Some of our __ASP.NET Core Web APIs__ were protected by the filter, some by controller class level `AuthorizeAttribute` decoration and others by the individual action... and some not at all. This is a problem! It is common practice to run unit tests prior to pushing code into a feature branch for a pull request. If I forget to do that, my build system has some pull request pre-checks in place - one of which is to run the unit tests. As such, I know that unit tests will be executed. With this, I decided to write a unit test that leveraged a bit of reflection. Since it is a unit test, I'm not terribly concerned with performance - so reflection is fine...

Here was the thought process to write a unit test that could ensure that I'm not forgetful.

- Load all assemblies into the current `AppDomain`
- Of all the loaded assemblies, get all the controller types
  - Of those controller types, get the ones that are missing the `AuthorizeAttribute`
  - Of the unauthorized controller types, get the `HttpMethodAttribute` methods
  - If missing both the `AuthorizeAttribute` and `AllowAnonymousAttribute` - __fail__ 

### Codify

So, our step one is to load all assemblies into the current `AppDomain`. This makes some assumptions. It assumes that our test project will have a reference to the __ASP.NET Core Web API__ project, so that its `.dll` will be available to us for loading (in our `bin` directory). We will also assume the root namespace we're looking for, we should know this anyway as we follow naming conventions and we're the owner of the corresponding project.

```csharp
public class ActionTests
{
    const string RootNamespace = nameof(IEvangelist);
    static readonly string[] ExecutableExtensions = { ".exe", ".dll" };

    public ActionTests()
        => Directory.EnumerateFiles(
                Path.GetDirectoryName(
                        Assembly.GetExecutingAssembly().Location) ?? string.Empty,
                        $"{RootNamespace}.*")
                     .Where(IsExeOrDll)
                     .Select(Assembly.LoadFrom)
                     .Select(assembly => 
                        TryCatchIgnore(
                            () => AppDomain.CurrentDomain.Load(assembly.GetName())))
                     .ToList();

    static bool IsExeOrDll(string path)
        => ExecutableExtensions.Any(
            extension => 
                extension.Equals(
                    Path.GetExtension(path), 
                    StringComparison.OrdinalIgnoreCase));

    static T TryCatchIgnore<T>(Func<T> func) {
        try { return func(); }
        catch { return default; }
    }
```

Step two, is really the entry point of our core functionality for the test itself. We'll need a `Fact` test method. Yes, [I'm a HUGE fan of __xUnit__](/blog/xunit-powered-by-roslyn) - they have done some amazing things! In this test method we will start by getting all the types that are a subclass of `Controller`.

```csharp
[Fact]
public void AllActionsOrParentControllerHaveAuthorizationAttributeTest()
{
    var allControllers = GetAllControllerTypes();

    // we'll continue here ...
}

static List<Type> GetAllControllerTypes()
    => AppDomain.CurrentDomain
                .GetAssemblies()
                .Where(a => a.FullName.StartsWith(RootNamespace))
                .SelectMany(a => a.GetTypes()
                                  .Where(t => t.FullName.Contains(Controller)
                                           || t.BaseType == ControllerType
                                           || t.DeclaringType == ControllerType))
                .ToList();
```

Now that we have all the controller types from all the assemblies loaded into our `AppDomain`, we need to filter them. We need to find the types that are missing the `AuthorizeAttribute`, we'll call these `unauthorizedControllers` for now.

```csharp
[Fact]
public void AllActionsOrParentControllerHaveAuthorizationAttributeTest()
{
    var allControllers = GetAllControllerTypes();
    var unauthorizedControllers = 
        GetControllerTypesThatAreMissing<AuthorizeAttribute>(allControllers);

    // We'll continue from here...
}

static List<Type> GetControllerTypesThatAreMissing<TAttribute>(
    IEnumerable<Type> types)
    where TAttribute : Attribute
    => types.Where(t => t.GetCustomAttribute<TAttribute>() == null)
            .ToList();
```

This method iterates through the given `IEnumerable<Type>` and returns a `List<Type>` that are not attributed with the `AuthorizeAttribute`. The reason that we're filtering out controller types that are attributed, is that we'll consider them to be protected from the standpoint of our unit-testing capabilities. Now, we need to find all the methods on these types that match the following criteria:

  1. Are a `public` instance method
  2. Have any `HttpMethodAttribute` subclass

These methods are the controller's actions. From these actions, we need to find the unauthorized actions. This is done by filtering out actions that explicitly declare themselves with the `AllowAnonymousAttribute` and are also missing the `AuthorizeAttribute`.

```csharp
foreach (var controller in unauthorizedControllers)
{
    var actions =
        controller.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                    .Where(m => m.GetCustomAttributes<HttpMethodAttribute>().Any())
                    .ToList();

    var unauthorizedActions = 
        actions.Where(
            action => 
                action.GetCustomAttribute<AuthorizeAttribute>() == null &&
                action.GetCustomAttribute<AllowAnonymousAttribute>() == null)
               .ToList();
    
    // If unauthorizedActions.Any() is true, sound the alarms!
}
```

We can add a few additional sanity checks along the way - with the caveat that this is not your typical "unit test". For example we could add the following:

- Assert that we do in fact load assemblies
- Assert that count of all the controllers is greater than the unauthorized controllers
- Assert that we find our "white-listed" controller

### Putting It All Together

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Xunit;

namespace IEvangelist.Tests
{
    public class ActionTests
    {
        const string RootNamespace = nameof(_Evangelist);
        const string Controller = nameof(Controller);
        const string WhiteListed = nameof(UnauthorizedActionInController.GetZero);

        static readonly Type ControllerType = typeof(Controller);
        static readonly string[] ExecutableExtensions = { ".exe", ".dll" };

        public ActionTests()
            => LoadAllAssemblies();

        void LoadAllAssemblies()
        {
            var assemblies =
                Directory.EnumerateFiles(
                    Path.GetDirectoryName(
                            Assembly.GetExecutingAssembly().Location) ?? string.Empty,
                            $"{RootNamespace}.*")
                        .Where(IsExeOrDll)
                        .Select(Assembly.LoadFrom)
                        .Select(assembly => 
                            TryCatchIgnore(
                                () => AppDomain.CurrentDomain.Load(assembly.GetName())))
                        .ToList();

            Assert.False(assemblies.IsNullOrEmpty());        
        }

        [Fact]
        public void AllActionsOrParentControllerHaveAuthorizationAttributeTest()
        {
            var allControllers = GetAllControllerTypes();
            var unauthorizedControllers = 
                GetControllerTypesThatAreMissing<AuthorizeAttribute>(allControllers);
            
            Assert.True(allControllers.Count > unauthorizedControllers.Count);
            
            foreach (var controller in unauthorizedControllers)
            {
                var actions =
                    controller.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                              .Where(m => m.GetCustomAttributes<HttpMethodAttribute>().Any())
                              .ToList();

                var unauthorizedActions = 
                    actions.Where(
                        action => 
                            action.GetCustomAttribute<AuthorizeAttribute>() == null &&
                            action.GetCustomAttribute<AllowAnonymousAttribute>() == null)
                           .ToList();

                if (unauthorizedActions.IsNullOrEmpty() ||
                   (unauthorizedActions.Count == 1 && 
                    unauthorizedActions[0].Name == WhiteListed))
                {
                    continue;
                }

                unauthorizedActions.ForEach(
                    action => Console.WriteLine($"{action} is unauthorized!"));

                Assert.True(false, $"Unauthorized action(s) found!");
            }
        }

        static List<Type> GetAllControllerTypes()
            => AppDomain.CurrentDomain
                        .GetAssemblies()
                        .Where(a => a.FullName.StartsWith(RootNamespace))
                        .SelectMany(a => a.GetTypes()
                                          .Where(t => t.FullName.Contains(Controller) ||
                                                      t.BaseType == ControllerType ||
                                                      t.DeclaringType == ControllerType))
                        .ToList();

        static List<Type> GetControllerTypesThatAreMissing<TAttribute>(
            IEnumerable<Type> types)
            where TAttribute : Attribute
            => types.Where(t => t.GetCustomAttribute<TAttribute>() == null)
                    .ToList();

        static bool IsExeOrDll(string path)
            => ExecutableExtensions.Any(
                extension => 
                    extension.Equals(
                        Path.GetExtension(path), 
                        StringComparison.OrdinalIgnoreCase));

        static T TryCatchIgnore<T>(Func<T> func) {
            try { return func(); }
            catch { return default; }
        }
    }

    public class UnauthorizedTestController 
        : Controller
    {
    }

    public class UnauthorizedActionInController 
        : Controller
    {
        [HttpGet]
        public int GetZero() => 0;

        [Authorize, HttpPost]
        public IActionResult Post([FromBody] int number) => Ok();

        [OverrideAge, HttpDelete]
        public IActionResult Delete() => Ok();
    }
    
    public class OverrideAge : Authorize {  }
}
```

## Conclusion

This solution is not perfect, it has a lot of opportunity for improvement. I'm open to suggestions... If you have an idea, drop it in the comments and feel free to share your source. Likewise, if you like this idea - let me know. I was hoping to eventually find a way to turn this into a __C# Roslyn-Powered Analyzer__ but I'm not sure that is possible. There is one fact that remains, this has actually proven itself useful - there have been several times where this test failed as a result of someone (myself included) forgot to apply the appropriate security attributes to an __ASP.NET Core Web API__ endpoint we were writing. I hope that this can help you too!
