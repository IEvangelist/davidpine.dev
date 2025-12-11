---
title: 'Hello from the GitHub Actions: Core .NET SDK'
published: '2022-11-30'
description: >-
  The unofficial .NET equivalent of the official GitHub actions/toolkit
  @actions/core project.
author: David Pine
tags:
  - .NET
  - C#
  - GitHub
  - TypeScript
coverImage:
  src: ./dotnet-github-sdk.png
  alt: Example source code for the GitHub Actions Core .NET SDK.
---
:::tip{title="📢 ATTENTION"}

This post is part of the C# advent calendar 2022, for other articles in this collection see [C# Advent Calendar 2022](https://csadvent.christmas). This is the third time I've written for the calendar, past entries include [2017: C# Special Edition](/blog/csharp-special-edition) and [2018: C# All The Things](blog/csharp-all-the-things). 🙏🏽

:::

# GitHub Actions: Core .NET SDK

SDKs are great, but why do we need one for GitHub Actions? The short answer is, you don't! You can write a GitHub Action in .NET without using one. I've written about this already, if you're interested see the [Tutorial: Create a GitHub Action with .NET](https://learn.microsoft.com/dotnet/devops/create-dotnet-github-action). There are a few ways in which you can write a GitHub Action. You can do so using JavaScript, Docker, or as a composite action. One of the easiest ways was to use JavaScript, as the GitHub team maintains an open-source SDK (or [`actions/toolkit`](https://github.com/actions/toolkit)) written in TypeScript. Their toolkit is comprised of a set of packages to make creating actions easier.

I wanted to make it easier for .NET developers to write GitHub Actions, so I created an unofficial .NET equivalent of the official GitHub actions/toolkit `@actions/core` and `@actions/github` projects.

## Why should I care about GitHub Actions?

If you're unfamiliar with GitHub Actions, the **TL;DR;** is that they allow you to automate tasks such as building, testing, packaging, and deploying your code. If you want a deeper look beyond that definition, see [GitHub Docs: Actions](https://docs.github.com/actions). Just know that GitHub Actions are a powerful tool, and the team has done an amazing job of making them easy to use.

You should care about GitHub Actions because they are a great way to automate by writing workflows. A GitHub Action is then consumed by a repositories workflow, which is a set of instructions that are executed when a specific event occurs. For example, you can create a workflow that runs when a pull request is created, or when a new release is published. You can also create a workflow that runs on a schedule, such as every day at 3:00 AM. Workflows are defined in a YAML file, and you can create as many workflows as you want. You can also create a workflow that is triggered by another workflow. For example, you can create a workflow that runs when a pull request is created, and then create another workflow that runs when that workflow completes. The possibilities are endless!

### Inspiration from `actions/toolkit`

The [`actions/toolkit`](https://github.com/actions/toolkit) specifies the standard I/O, and it defines specific environment variables that are used within a GitHub Action workflow. If you're familiar with any of my other open-source projects, you'll likely be aware of my appreciation for what [🤓 TypeScript](/categories/typescript) has done for the web. Moreover, you know that [I'm all about that C# 💜](/categories/csharp).

I've been working on various other projects that leverage TypeScript in the world of .NET. There are certainly parallel efforts in this regard, for more information, see [Blazorators](/blog/blazorators). As this relates to the `actions/toolkit` specifically, let's start by having a look at the possible inputs and outputs, and the formats in which they can be set.

## Commanding the workflow 

 GitHub Action workflows rely heavily on environment variables. The following are the environment variables that are used to interact with the workflow:

- `GITHUB_ACTION`: The name of the action.
- `GITHUB_OUTPUT`: A file path to a file containing any custom data that the workflow cares to write.
- `GITHUB_PATH`: A file path to a file containing environment variables to add to the `PATH` environment variable for all subsequent steps in the current job.
- `GITHUB_STATE`: Custom user data that is persisted across workflow jobs and steps.
- `GITHUB_TOKEN`: The token used to authenticate with GitHub. This value is provided by GitHub, and contextually available to make whatever `permissions` the workflow has available to it. This value is always written to the log in a masked format.

These are but a few of the environment variables that are available to a GitHub Action workflow. For a complete list, see [GitHub Docs: Environment variables](https://docs.github.com/actions/reference/environment-variables#default-environment-variables).

## Outputs 

The workflow can write outputs to a file, and even custom state. In the case of output, files are written to the file path from the `GITHUB_OUTPUT` environment variable. The output in this scenario would be a JSON file that contains anything we want to serialize to and from. We're not limited by that, it is trivial in C# with the `System.IO` for reading and writing JSON, and either `System.Text.Json` or `Newtonsoft.Json` for JSON serialization of C# objects. In addition to files, any arbitrary string can be written to the log. The log is written to the standard output stream and is available to the workflow. Certain logged messages receive special treatment and are parsed by the workflow as _commands_. The following are the special messages that are parsed by the workflow:

| Command name | Description |
|---|---|
| `add-mask` | Registers a secret which will get masked from logs. |
| `add-path` | Prepends the input path to the `PATH` (for this action and future actions). |
| `echo` | Enables or disables the echoing of commands into stdout for the rest of the step. |
| `debug` | Writes debug message to user log. |
| `error` | Adds an error issue. |
| `warning` | Adds a warning issue. |
| `notice` | Adds a notice issue. |
| `group` | Begin an output group. |
| `endgroup` | End the output group. |

If you're seeing these commands and wondering where the `save-state` and `set-output` commands are, they have been deprecated. For more information, see [GitHub Actions: Deprecating `save-state` and `set-output` commands](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands). Now that we're familiarizing ourselves with the commands, let's have a look at the `@actions/core` package to see how it implements commanding the workflow.

### TypeScript `Command` object 

This code is from the `@actions/core` project, and it's TypeScript code that represents a command. The _command.ts_ file exposes a few functions to issue commands. Read through the contents of the [actions/toolkit/blob/main/packages/core/src/command.ts](https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts) file:

```typescript
import * as os from 'os'
import {toCommandValue} from './utils'

export interface CommandProperties {
  [key: string]: any
}

/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
export function issueCommand(
  command: string,
  properties: CommandProperties,
  message: any
): void {
  const cmd = new Command(command, properties, message)
  process.stdout.write(cmd.toString() + os.EOL)
}

export function issue(name: string, message = ''): void {
  issueCommand(name, {}, message)
}

const CMD_STRING = '::'

class Command {
  private readonly command: string
  private readonly message: string
  private readonly properties: CommandProperties

  constructor(command: string, properties: CommandProperties, message: string) {
    if (!command) {
      command = 'missing.command'
    }

    this.command = command
    this.properties = properties
    this.message = message
  }

  toString(): string {
    let cmdStr = CMD_STRING + this.command

    if (this.properties && Object.keys(this.properties).length > 0) {
      cmdStr += ' '
      let first = true
      for (const key in this.properties) {
        if (this.properties.hasOwnProperty(key)) {
          const val = this.properties[key]
          if (val) {
            if (first) {
              first = false
            } else {
              cmdStr += ','
            }

            cmdStr += `${key}=${escapeProperty(val)}`
          }
        }
      }
    }

    cmdStr += `${CMD_STRING}${escapeData(this.message)}`
    return cmdStr
  }
}

function escapeData(s: any): string {
  return toCommandValue(s)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
}

function escapeProperty(s: any): string {
  return toCommandValue(s)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C')
}
```

A few things to observe about the preceding code:

  1. The `issueCommand` function is one of the two functions that are exported. It's used to issue a command to the standard output stream.
  2. The `issue` function is a convenience function that issues a command with no `properties` parameter.
  3. The `Command` class is used to represent a command. It has a `toString` method that returns the string representation of the command.
  4. The `escapeData` and `escapeProperty` functions are used to escape the `message` and `properties` of the command, respectively.

This is standard TypeScript code, but how might we want to implement this in C#? Let's take a look at the `Command` class in `Microsoft.GitHub.Actions` project:

### C# `Command` object 

While inspired, I decided this could be implemented in C#, and with a few minor tweaks — it was. Let's start by discussing what this would look like in C#. The following is the C# implementation of the `Command` object, this corresponds to the [_Microsoft.GitHub.Actions/Workflows/Command.cs_](https://github.com/IEvangelist/dotnet-github-actions-sdk/blob/main/src/Microsoft.GitHub.Actions/Workflows/Command.cs):

```csharp
namespace Microsoft.GitHub.Actions.Workflows;

/// <summary>
/// Command format:
/// <c>::name key=value,key=value::message</c>
/// </summary>
/// <example>
/// <list type="bullet">
/// <item><c>::warning::This is the message</c></item>
/// <item><c>::set-env name=MY_VAR::some value</c></item>
/// </list>
/// </example>
internal readonly record struct Command<T>(
    string? CommandName = "missing.command",
    T? Message = default,
    IReadOnlyDictionary<string, string>? CommandProperties = default)
{
    const string CMD_STRING = "::";

    internal bool Conventional =>
        CommandNames.IsConventional(CommandName);

    /// <summary>
    /// The string representation of the workflow command, i.e.; 
    /// <code>::name key=value,key=value::message</code>.
    /// </summary>
    public override string ToString()
    {
        StringBuilder builder = new($"{CMD_STRING}{CommandName}");

        if (CommandProperties?.Any() ?? false)
        {
            builder.Append(' ');
            foreach (var (isNotFirst, key, value)
                in CommandProperties.Select(
                    (kvp, index) => (index is > 0, kvp.Key, kvp.Value)))
            {
                if (isNotFirst)
                {
                    builder.Append(',');
                }
                builder.Append($"{key}={EscapeProperty(value)}");
            }
        }

        builder.Append($"{CMD_STRING}{EscapeData(Message)}");

        return builder.ToString();
    }

    static string EscapeProperty<TSource>(TSource? value) =>
        value.ToCommandValue()
            .Replace("%", "%25")
            .Replace("\r", "%0D")
            .Replace("\n", "%0A")
            .Replace(":", "%3A")
            .Replace(",", "%2C");

    static string EscapeData<TSource>(TSource? value) =>
        value.ToCommandValue()
            .Replace("%", "%25")
            .Replace("\r", "%0D")
            .Replace("\n", "%0A");
}
```

I wanted the `Command` object to be a `readonly record struct` for immutability, value-based comparison semantics, deconstruction, and performance (it's lightweight). The `Command` object has a `CommandName` property, a `Message` property, and a `CommandProperties` property. The `CommandName` property is a `string` that represents the name of the command, and it defaults to `"missing.command"`. The `Message` property is a generic type that represents the message of the command. The `CommandProperties` property is a `IReadOnlyDictionary<string, string>` that represents the properties of the command.

### Command format 

Workflow commands are written to the standard output stream. For a command with a name of `name`, properties of `{ "key1" = "value", "key2" = "value" }`, and a message of `message`, it's formatted as follows when issued to the standard output stream:

```console
::name key1=value,key2=value::message
```

Another example is when writing a debug message to the log:

```console
::debug::This is a debug message
```

One final example is the `set-env` command:

```console
::set-env name=ENVIRONMENT_VARIABLE::value
```

All of these commands are delimited with the `::` characters. The command name is the first token after the first `::` delimiter. The command properties are the second token after the first `::` delimiter, following the first space character. The command properties are key/value pairs expressed with the `=` character and delimited by the `,` character. The command message is optional. Any given `Command` instance results in the appropriate command being written to the standard output stream.

## Installing the NuGet package 📦

Welcome to the [Microsoft.GitHub.Actions] .NET SDK. This SDK is used to create GitHub Actions in .NET. The SDK is a thin wrapper around the .NET implementation of the GitHub Actions a select few packages from the [`@actions/toolkit`](https://github.com/actions/toolkit).

:::caution{title="⚠️ DISCLAIMER"}
This package is **not** an official _Microsoft_ or _GitHub_ product. It is a community-driven project. However, I do choose to use the `Microsoft.GitHub[.*]` namespace for the package. I'm not trying to mislead anyone, but I do want to make it clear that this is not an official product.
:::

You'll need to install the [GitHub Actions: Core .NET SDK](https://www.nuget.org/packages/GitHub.Actions.Core) NuGet package to use the .NET APIs. The package is available on NuGet.org. The following is the command to install the package:

### Adding the package reference

Either add the package reference to your project file:

```xml
<PackageReference Include="GitHub.Actions.Core" Version="0.0.1" />
```

Or use the [`dotnet add package`](https://learn.) .NET CLI command:

```bash
dotnet add package GitHub.Actions.Core
```

### Registering the services for consumption

The SDK is dependency injection ready, meaning that you can call the `AddGitHubActions` extension method on the `IServiceCollection` interface to register the services for consumption. The following is an example of how to register the services, and an example of how to consume the `ICoreService`:

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.GitHub;
using Microsoft.GitHub.Actions.Extensions;
using Microsoft.GitHub.Actions.Services;

using var provider = new ServiceCollection()
    .AddGitHubActions()
    .BuildServiceProvider();

var core = provider.GetRequiredService<ICoreService>();

try
{
    // "who-to-greet" input defined in action metadata file
    var nameToGreet = core.GetInput("who-to-greet");
    core.Info($"Hello {nameToGreet}!");
    await core.SetOutputAsync("time", DateTime.UtcNow.ToString("o"));

    // Get the JSON webhook payload for the event that triggered the workflow
    var payload = JsonSerializer.Serialize(Context.Current.Payload);
    core.Info($"The event payload: {payload}");
}
catch (Exception ex)
{
    core.SetFailed(ex.ToString());
}
```

Compare this to the following JavaScript code in the _index.js_ file from the [Creating a JavaScript action: Writing the action code](https://docs.github.com/actions/creating-actions/creating-a-javascript-action#writing-the-action-code) article, which would achieve the same thing with the TypeScript toolkit:

```javascript
const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}
```

## Issuing commands 

Instead of being able to `export` any custom data structures, and corresponding functions, the `Command` object is `internal readonly record struct` that can be used to issue commands. The following is the C# implementation of the `issueCommand` and `issue` functionality:

```csharp
namespace Microsoft.GitHub.Actions.Commands;

internal interface ICommandIssuer
{
    void IssueCommand<T>(
        string commandName,
        IReadOnlyDictionary<string, string>? properties = default,
        T? message = default);

    void Issue<T>(string commandName, T? message = default);
}
```

I'm a big fan of triple-slash comments, and as a consumer of many various APIs written by different authors, I've enjoyed learning APIs with good and meaningful triple-slash comments. I say all of this to say, that I've omitted them from the code pasted here. If you want to see them, check them out on GitHub. The `ICommandIssuer` interface has two methods, `IssueCommand`, and `Issue`. Consider the implementation that's defined in the following `DefaultCommandIssuer` class:

```csharp
namespace Microsoft.GitHub.Actions.Commands;

internal sealed class DefaultCommandIssuer : ICommandIssuer
{
    private readonly IConsole _console;

    public DefaultCommandIssuer(IConsole console) => _console = console;

    public void Issue<T>(string commandName, T? message = default) =>
        IssueCommand(commandName, null, message);

    public void IssueCommand<T>(
        string commandName,
        IReadOnlyDictionary<string, string>? properties = default,
        T? message = default)
    {
        var cmd = new Command<T>(
            commandName, message, properties);

        if (cmd is not { Conventional: true })
        {
            _console.WriteLine("Issuing unconventional command.");
        }

        var commandMessage = cmd.ToString();
        _console.WriteLine(commandMessage);
    }
}
```

Some commands require interactions with the file system. This functionality is defined as _file commands_.

### File commands 

In addition to standard commands, file commands are also supported. File commands write to a file instead of the standard output stream. A file command is free to write any value to the file. The following are file-based commands:

- `add-path`: Writes the value to the file path from the `GITHUB_PATH` environment variable.
- `save-state`: Writes the value to the file path from the `GITHUB_STATE` environment variable.
- `set-env`: Writes the value to the file path from the `GITHUB_ENV` environment variable.
- `set-output`: Writes the value to the file path from the `GITHUB_OUTPUT` environment variable.

The corresponding .NET APIs that are used to issue file commands are:

- `ICoreService.AddPathAsync`: Issues an `add-path` command.
- `ICoreService.ExportVariableAsync`: Issues the `set-env` command.
- `ICoreService.SaveStateAsync`: Issues the `save-state` command.
- `ICoreService.SetOutputAsync`: Issues the `set-output` command.

### The `IFileCommandIssuer` interface 

```csharp
namespace Microsoft.GitHub.Actions.Commands;

internal interface IFileCommandIssuer
{
    ValueTask IssueFileCommandAsync<TValue>(string commandSuffix, TValue message);

    string PrepareKeyValueMessage<TValue>(string key, TValue value);
}
```

The `IFileCommandIssuer` interface is used to issue file-based commands. The `DefaultFileCommandIssuer` class implements this interface:

```csharp
namespace Microsoft.GitHub.Actions.Commands;

internal sealed class DefaultFileCommandIssuer : IFileCommandIssuer
{
    private readonly Func<string, string, ValueTask> _writeLineTask;

    public DefaultFileCommandIssuer(
        Func<string, string, ValueTask> writeLineTask) =>
        _writeLineTask = writeLineTask.ThrowIfNull();

    ValueTask IFileCommandIssuer.IssueFileCommandAsync<TValue>(
        string commandSuffix, TValue message)
    {
        var filePath = GetEnvironmentVariable($"{GITHUB_}{commandSuffix}");
        if (string.IsNullOrWhiteSpace(filePath))
        {
            throw new Exception(
                "Unable to find environment variable for file " +
                $"command suffix '{commandSuffix} ({GITHUB_}{commandSuffix})'.");
        }

        if (File.Exists(filePath) is false)
        {
            throw new Exception(
                $"Missing file at path: '{filePath}' " +
                $"for file command '{commandSuffix}'.");
        }
        
        return _writeLineTask.Invoke(filePath, message.ToCommandValue());
    }

    string IFileCommandIssuer.PrepareKeyValueMessage<TValue>(
        string key, TValue value)
    {
        var delimiter = $"ghadelimiter_{Guid.NewGuid()}";
        var convertedValue = value.ToCommandValue();

        // These should realistically never happen, but just in case someone finds a
        // way to exploit uuid generation let's not allow keys or values that contain
        // the delimiter.
        if (key.Contains(
            delimiter, StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception(
                $"Unexpected input: name should not contain the delimiter {delimiter}");
        }

        if (convertedValue.Contains(delimiter, StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception(
                $"Unexpected input: value should not contain the delimiter {delimiter}");
        }

        return $"{key}<<{delimiter}{NewLine}{convertedValue}{NewLine}{delimiter}";
    }
}
```

This code is derived from the TypeScript implementation of the [_core/src/file-command.ts_](https://github.com/actions/toolkit/blob/main/packages/core/src/file-command.ts) file:

```typescript
import * as fs from 'fs'
import * as os from 'os'
import {v4 as uuidv4} from 'uuid'
import {toCommandValue} from './utils'

export function issueFileCommand(
    command: string, message: any): void {
    const filePath = process.env[`GITHUB_${command}`]
    if (!filePath) {
        throw new Error(
            `Unable to find environment variable ` +
            `for file command ${command}`
        )
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`)
    }
    
    fs.appendFileSync(
        filePath, `${toCommandValue(message)}${os.EOL}`, {
      encoding: 'utf8'
    })
}

export function prepareKeyValueMessage(
    key: string, value: any): string {
    const delimiter = `ghadelimiter_${uuidv4()}`
    const convertedValue = toCommandValue(value)

    // These should realistically never happen, but just in case someone finds a
    // way to exploit uuid generation let's not allow keys or values that contain
    // the delimiter.
    if (key.includes(delimiter)) {
        throw new Error(
            `Unexpected input: name should not ` +
            `contain the delimiter "${delimiter}"`
        )
    }

    if (convertedValue.includes(delimiter)) {
        throw new Error(
            `Unexpected input: value should not ` +
            `contain the delimiter "${delimiter}"`
        )
    }

    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`
}
```

The C# implementation matches the TypeScript implementation, except for the use of `ValueTask` instead of `void` for the `IssueFileCommandAsync` method. All of the command-issuing functionality is internal to the `ICoreService` implementation.

## The SDK continues to evolve ⚒️

More than 90% of the functionality of the `packages/src/core.ts` and `packages/github/src/github.ts` files have been implemented in the SDK.

I'm not going to paste more than 100 lines for multiple files, this blog post isn't the place for that. If you're interested in seeing the rest of the SDK, you can find it on [ GitHub](https://github.com/IEvangelist/dotnet-github-actions-sdk). The SDK is still evolving, and the following features are still in development:

- I want to create a GitHub repository template that can be used to create a new containerized .NET GitHub Action.
- I want to continue working on adding missing functionality to the SDK.
- I want to implement the other packages that exist in the [ actions/toolkit](https://github.com/actions/toolkit/tree/main/packages).

## The future is bright ☀️

I'm always open to collaborating with developer community members, 🙌🏽 who are interested in helping this code live on to help others. I encourage you to explore the code and be sure to see the sample use cases.

:::tip{title="🤓 COLLABORATE"}

If you're interested in helping, please reach out to me on Twitter, or open an issue on the [GitHub Actions Core .NET SDK](https://github.com/IEvangelist/dotnet-github-actions-sdk).

:::

### See also

- [.NET 💜 GitHub Actions: Intro to GitHub Actions for .NET](https://devblogs.microsoft.com/dotnet/dotnet-loves-github-actions?WT.mc_id=dapine)
- [GitHub Actions and .NET](https://learn.microsoft.com/dotnet/devops/github-actions-overview?WT.mc_id=dapine)
- [Tutorial: Create a GitHub Action with .NET](https://learn.microsoft.com/dotnet/devops/create-dotnet-github-action?WT.mc_id=dapine)
- [.NET Version Sweeper: GitHub Action for .NET](https://github.com/dotnet/versionsweeper)
- [Resource Translator: GitHub Action](https://github.com/IEvangelist/resource-translator)
- [Localize .NET applications with machine-translation](https://devblogs.microsoft.com/dotnet/localize-net-applications-with-machine-translation?WT.mc_id=dapine)
