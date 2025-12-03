---
title: Building a GitHub profanity filter with .NET Core and Azure Functions
published: '2019-11-23'
description: It's better to laugh it off
author: David Pine
tags:
  - .NET Core
  - Azure Functions
  - C#
coverImage:
  src: ./profanity-filter.png
  alt: Building a GitHub profanity filter with .NET Core and Azure Functions
---
# Intro

With more than [40 million active users](https://github.com/search?q=type:user&type=Users), GitHub is by far the largest source code hosting platform in the world. It's an open source developers dream, and ecosystem and developer community unlike any other. And with all these users and such profound openness, there's bound to be frustration from time to time. In this post we will explore an **Azure Function** written with **ASP.NET Core 3.0** and **C# 8.0**. It has been designed to handle a **GitHub webhook** for issues and pull requests. In other words, we are able to target a specific GitHub repository and listen for new issues or pull requests - as they occur, our **Azure Function** is called.

When the **Azure Function** is invoked, it will examine the body text and title text of the issue or pull request. If either contain profanity, it replaces the profanity with less offensive content -- such as:

<span style='font-size: 4em'>👼 🐳 💝 </span>

We'll see how to orchestrate various technologies together, and take a look at **GitHub webhooks**, **Azure Functions**, **C# 8.0**, **CosmosDB** and **GraphQL**. As always the complete  [source code](https://github.com/IEvangelist/GitHub.ProfanityFilter) is available for you're eager eyes 👀...enjoy!

## GitHub Webhooks

I'm going to assume that you're unfamiliar with "webhooks". Think of a webhook as simply being an event. Like all other events, you can subscribe to them. Much like an event, when you subscribe you provide a handler or a callback. When the event occurs, it calls your handler. But with a webhook, you get a bit more control over how the event is communicated. GitHub offers [webhooks for many types of events](https://developer.github.com/webhooks/#events).

Open a GitHub repository that you're the owner of. From within the GitHub user interface navigate to ** Settings**, then select **Webhooks** from the left panel. Click the **Add webhook** button and explore the various options available to you for configuring a webhook.

| Setting | Details |
|----------------:|-------------|
| Payload URL     | The fully qualified URL of the **Azure Function**.  |
| Content Type    | The content type of the post for your corresponding endpoint, let's select `application/json` for JSON. |
| Secret          | This secret is used to validate that requests made to your endpoint are truly from the webhook and not malicious. |
| Events          | There are several options. For this post, I have selected **Let me select individual events** and I have chosen the **Issues** and **Pull requests**. |
| Active          | Whether or not to deliver event details when the hook is triggered. This is useful, as you can easily toggle it off and on for troubleshooting. |

### Securing webhooks

GitHub has [an article](https://developer.github.com/webhooks/securing/) on securing webhooks, which is useful but unfortunately it's written for **Ruby**. Since we've written an ASP.NET Core with C# application, we'll take a look a closer look at how to do this.

```csharp
[FunctionName(nameof(ProcessWebhook))]
public async Task<IActionResult> ProcessWebhook(
    [HttpTrigger(AuthorizationLevel.Function, "POST")] HttpRequest request,
    [FromServices] IGitHubPayloadValidator payloadValidator,
    [FromServices] IGitHubWebhookDispatcher webhookDispatcher)
{
    try
    {
        var signature =
            request.Headers
                   .GetValueOrDefault("X-Hub-Signature");

        using var reader = new StreamReader(request.Body);
        var payloadJson = await reader.ReadToEndAsync();

        if (!payloadValidator.IsPayloadSignatureValid(
                Encoding.UTF8.GetBytes(payloadJson),
                signature))
        {
            return new StatusCodeResult(500);
        }

        var eventName = request.Headers.GetValueOrDefault("X-GitHub-Event");
        await webhookDispatcher.DispatchAsync(eventName, payloadJson);

        return new OkObjectResult($"Successfully handled the {eventName} event.");
    }
    catch (Exception ex)
    {
        return new StatusCodeResult(500);
    }
}
```

The method above is the primary entry point for our **Azure Function**. We decorate our method with a `FunctionName` attribute assigning the name of the method. Our method is defined as an `async Task<IActionResult>` returning method. It has three parameters, all of which are provided by the **Azure Function** runtime. The first parameter is the `HttpRequest` and is triggered via an HTTP POST. The next two parameters are decorated with the `FromServices` attribute, which instruct the ASP.NET Core dependency injection pipeline to resolve the corresponding implementations. We are then provided instances of a payload validator and a webhook dispatcher, we'll explore these both in more detail in a bit.

The method functions by attempting to read the `X-Hub-Signature` header from the request, this will be used to compare our computed signature based off the known secret. We leverage **C# 8 using declarations**, to instantiate a `StreamReader` from the request body stream. We then read the entire body, and assign our `jsonPayload` variable the resulting JSON response. With the signature from the header and the JSON bytes, we're ready to validate the signature.

```csharp
public bool IsPayloadSignatureValid(
  byte[] bytes,
  string receivedSignature)
{
    if (string.IsNullOrWhiteSpace(receivedSignature))
    {
        return false;
    }

    using var hmac = new HMACSHA1(Encoding.ASCII.GetBytes(_options.WebhookSecret));
    var hash = hmac.ComputeHash(bytes);
    var actualSignature = $"sha1={hash.ToHexString()}";

    return IsSignatureValid(actualSignature, receivedSignature);
}

static bool IsSignatureValid(string a, string b)
{
    var length = Math.Min(a.Length, b.Length);
    var equals = a.Length == b.Length;
    for (var i = 0; i < length; ++ i)
    {
        equals &= a[i] == b[i];
    }

    return equals;
}
```

The `IsPayloadSignatureValid` implementation leverages **C# 8 using declarations** and instantiates a `HMACSHA1` with the bytes from the configured webhook secret. The `HMACSHA1` is the C# representation of the "[hash-based message authentication code (HMAC)](https://en.wikipedia.org/wiki/HMAC), for the [secure hash algorithm 1 (SHA1)](https://en.wikipedia.org/wiki/SHA-1)". It will allow us to compute the hash of the payload bytes, then we can use our computed hash and compare it to the signature in the header. If these two are a match -- we know that the request is valid. Otherwise, it may be malicious and we can simply disregard it.

You may have noticed that we also pulled out another header, this was the `X-GitHub-Event` header. It tells us which GitHub event was firing. We'll use that in our dispatcher to determine which shape our JSON payload is expected to be delivered in.

Great, wow what? We have a valid call into our **Azure Function** from our **GitHub webhook**, let's do something with it. We want to examine the title and body text of incoming `issues` or `pull_request`, so let's start there.

## Handling Issues and Pull Requests

If you recall earlier in this post, we are subscribed for both `issues` and `pull_request` events. We need to determine which event we're handling and take the appropriate action.

```csharp
public class GitHubWebhookDispatcher : IGitHubWebhookDispatcher
{
    static readonly ValueTask NoopTask = new ValueTask();

    readonly IIssueHandler _issueHandler;
    readonly IPullRequestHandler _pullRequestHandler;

    public GitHubWebhookDispatcher(
        IIssueHandler issueHandler,
        IPullRequestHandler pullRequestHandler) =>
        (_issueHandler, _pullRequestHandler) = (issueHandler, pullRequestHandler);

    public ValueTask DispatchAsync(string eventName, string payloadJson)
        => eventName switch
        {
            "issues" => _issueHandler.HandleIssueAsync(payloadJson),
            "pull_request" => _pullRequestHandler.HandlePullRequestAsync(payloadJson),

            _ => NoopTask,
        };
}
```

The webhook dispatcher class requires both `IIssueHandler` and `IPullRequestHandler` implementations. It defines a dispatch functionality, that maps the issue based events to the corresponding issue handler and pull requests to its handler. This is expressed as a **C# 8 switch expression**. The `eventName` value is our target in the `switch` expression, and our case labels are simple expressions for our intent. This removes much of the verbosity of writing out the word, `case` and `break`. We're left with easier to read code!

Now, let's take a look at the `IssueHandler` implementation.

```csharp
public class IssueHandler
    : GitHubBaseHandler<IssueHandler>, IIssueHandler
{
    readonly GitHubOptions _options;
    readonly IProfanityFilter _profanityFilter;
    readonly IRepository<FilterActivity> _repository;

    public IssueHandler(
        IGitHubGraphQLClient client,
        ILogger<IssueHandler> logger,
        IOptions<GitHubOptions> options,
        IProfanityFilter profanityFilter,
        IRepository<FilterActivity> repository)
        : base(client, logger) =>
        (_profanityFilter, _options, _repository) =
            (profanityFilter, options.Value, repository);
}
```

You may have noticed the `.ctor` logic is expressed as a tuple assignment. When I discovered this was possible, I questioned it - what do you think? Leave your comments on the tweet below.

[View post by @davidpine7](https://x.com/davidpine7/status/1169418926217973760)

Now, back to the handling of issues. What's that look like?

```csharp
public async ValueTask HandleIssueAsync(string payloadJson)
{
    var payload = payloadJson.FromJson<IssueEventPayload>();
    if (payload is null)
    {
        _logger.LogWarning("GitHub issue payload is null.");
        return;
    }

    switch (payload.Action)
    {
        case "opened":
            await HandleIssueAsync(payload);
            break;

        case "reopened":
        case "edited":
            var activity =
                await _repository.GetAsync(payload.Issue.NodeId);
            if (activity?.WorkedOn
                        .Subtract(DateTime.Now)
                        .TotalSeconds <= 1)
            {
                _logger.LogInformation(
                    $"Just worked on this issue {payload.Issue.NodeId}...");
            }

            await HandleIssueAsync(payload, activity);
            break;

        case "closed":
        case "deleted":
            await _repository.DeleteAsync(payload.Issue.NodeId);
            break;

        case "assigned":
        case "demilestoned":
        case "labeled":
        case "locked":
        case "milestoned":
        case "pinned":
        case "transferred":
        case "unassigned":
        case "unlabeled":
        case "unlocked":
        case "unpinned":
            break;
    }
}
```

We start with a `string`, which represents the payload from **GitHub** -- it deserializes as an `IssueEventPayload` type. If it `is null`, then we're done but if it has a value we'll `switch` on the specific event action. When `opened`, we'll handle the issue but first let's discuss a bit more of what's going on here.

### Cosmos DB

You're probably asking yourself, "where did this `_repository` come from and where is it reading from?". Since **Azure Functions** are stateless, and we have no way of identifying how often we're called from **GitHub** or when we've already worked on an issue -- we need a way of tracking this activity. I decided to use **Cosmos DB** as a data store. It's freakishly fast, and with a beautiful abstraction over the top of it -- we can seamlessly perform CRUD operations on any POCO object asynchronously. It's literally amazing! Here's the abstraction.

```csharp
public class CosmosContainerProvider : ICosmosContainerProvider, IDisposable
{
    readonly RepositoryOptions _options;

    CosmosClient _client;
    Container _container;

    public CosmosContainerProvider(
        IOptions<RepositoryOptions> options) =>
        _options =
            options?.Value ??
            throw new ArgumentNullException(nameof(options));

    public Container GetContainer()
    {
        if (_container is null)
        {
            _client = new CosmosClient(_options.CosmosConnectionString);
            var database = _client.GetDatabase(_options.DatabaseId);
            _container = database.GetContainer(_options.ContainerId);
        }

        return _container;
    }

    public void Dispose() => _client?.Dispose();
}
```

We start by defining a `CosmosContainerProvider` class, which encapsulates the logic to instantiate and provide a `Microsoft.Azure.Cosmos.Container` instance. The container is available from a `Microsoft.Azure.Cosmos.Database` object, and requires our connection string in order to function correctly. This is what we use to read from and write to, next we have our `Repository<T>` implementation.

```csharp
public class Repository<T> : IRepository<T> where T : BaseDocument
{
    readonly ICosmosContainerProvider _containerProvider;

    public Repository(
        ICosmosContainerProvider containerProvider) =>
        _containerProvider =
            containerProvider ??
            throw new ArgumentNullException(nameof(containerProvider));

    public async ValueTask<T> GetAsync(string id)
    {
        try
        {
            var container = _containerProvider.GetContainer();
            var response = await container.ReadItemAsync<T>(id, new PartitionKey(id));

            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return default;
        }
    }

    public async ValueTask<IEnumerable<T>> GetAsync(Expression<Func<T, bool>> predicate)
    {
        try
        {
            var iterator =
                _containerProvider.GetContainer()
                                  .GetItemLinqQueryable<T>()
                                  .Where(predicate)
                                  .ToFeedIterator();

            IList<T> results = new List<T>();
            while (iterator.HasMoreResults)
            {
                foreach (var result in await iterator.ReadNextAsync())
                {
                    results.Add(result);
                }
            }

            return results;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return Enumerable.Empty<T>();
        }
    }

    public async ValueTask<T> CreateAsync(T value)
    {
        var container = _containerProvider.GetContainer();
        var response = await container.CreateItemAsync(value, value.PartitionKey);

        return response.Resource;
    }

    public Task<T[]> CreateAsync(IEnumerable<T> values) =>
        Task.WhenAll(values.Select(v => CreateAsync(v).AsTask()));

    public async ValueTask<T> UpdateAsync(T value)
    {
        var container = _containerProvider.GetContainer();
        var response = await container.UpsertItemAsync<T>(value, value.PartitionKey);

        return response.Resource;
    }

    public async ValueTask<T> DeleteAsync(string id)
    {
        var container = _containerProvider.GetContainer();
        var response = await container.DeleteItemAsync<T>(id, new PartitionKey(id));

        return response.Resource;
    }
}
```

This is a little gem, it provides all of the common functionality that you should need to start reading from and writing to a **Cosmos DB** data store. It exposes functions that create, read, update or delete any subclass of a `BaseDocument`. This base document only requires an `Id` and a `PartitionKey`.

```csharp
public class BaseDocument
{
    [JsonProperty("id")]
    public string Id { get; set; }

    internal PartitionKey PartitionKey => new PartitionKey(Id);
}
```

The real beauty of this abstraction is the support we get from **ASP.NET Core**. In our `ServiceCollectionExtensions` we define dependency injection additions for these services. We get to leverage a less-known generic dependency injection functionality.

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGitHubRepository(
        this IServiceCollection services,
        IConfiguration configuration) =>
        services.AddSingleton<ICosmosContainerProvider, CosmosContainerProvider>()
                .AddSingleton(typeof(IRepository<>), typeof(Repository<>))
                .Configure<RepositoryOptions>(
                    configuration.GetSection(nameof(RepositoryOptions)));
}
```

In our **Azure Function** it is perfectly fine to register certain dependencies as singletons. This is the interesting like, `.AddSingleton(typeof(IRepository<>), typeof(Repository<>))`. We `AddSingleton` but noticed that we're doing a `typeof(IRepository<>)`? This means that for any generic type, provide the corresponding generic implementation! In a single line we opened up a repository pattern of infinite possibilities...I know, that sounds pretty epic, but seriously amazing. Now, back to our regularly scheduled programming. Where were we? Ah, yes...the `HandleIssueAsync` given the `IssueEventPayload`. If we're able to read from the repo previous activity from this  

```csharp
async ValueTask HandleIssueAsync(
    IssueEventPayload payload,
    FilterActivity activity = null)
{
    var issue = payload.Issue;
    var (title, body) = (issue.Title, issue.Body);
    var wasJustOpened = activity is null;
    if (!wasJustOpened)
    {
        (title, body) =
            await _client.GetIssueTitleAndBodyAsync(issue.Number);
    }

    var filterResult =
        TryApplyProfanityFilter(title, body);
    if (filterResult.IsFiltered)
    {
        var updateIssue = issue.ToUpdate();
        updateIssue.Title = filterResult.Title;
        updateIssue.Body = filterResult.Body;
        await _client.UpdateIssueAsync(issue.Number, updateIssue);

        var clientId = Guid.NewGuid().ToString();
        if (wasJustOpened)
        {
            await _repository.CreateAsync(new FilterActivity
            {
                Id = issue.NodeId,
                WasProfane = true,
                Type = ActivityType.Issue,
                MutationOrNodeId = clientId,
                WorkedOn = DateTime.Now,
                OriginalTitleText = title,
                OriginalBodyText = body,
                ModifiedTitleText = filterResult.Title,
                ModifiedBodyText = filterResult.Body
            });
        }
        else
        {
            activity.WasProfane = true;
            activity.WorkedOn = DateTime.Now;
            await _repository.UpdateAsync(activity);
        }

        await _client.AddReactionAsync(
            issue.NodeId,
            ReactionContent.Confused,
            clientId);
        await _client.AddLabelAsync(
            issue.NodeId,
            new[] { _options.ProfaneLabelId },
            clientId);
    }
}
```

From the payload instance we get the issue, we pick out the title and body with tuple deconstruction and assignment into two local variables. If `activity is null` then we're working with a new issue -- otherwise this issue was worked on before. Due to the stateless nature of our app, if we are working on an issue that we previously worked on, it is best to read the issue title and body from **GitHub** again to ensure that we're working with the latest version. As you can imagine there are potential race conditions, we need to be mindful of that possibility.

### Profane Filtering

Next, we will call the `ApplyProfanityFilter` function.

```csharp
internal FilterResult TryApplyProfanityFilter(
    string title,
    string body)
{
    if (string.IsNullOrWhiteSpace(title) &&
        string.IsNullOrWhiteSpace(body))
    {
        return FilterResult.NotFiltered;
    }

    var (resultingTitle, isTitleFiltered) = TryApplyFilter(title, '*');
    var (resultingBody, isBodyFiltered) = TryApplyFilter(body);

    return new FilterResult(
        resultingTitle,
        isTitleFiltered,
        resultingBody,
        isBodyFiltered);
}
```

If both the `title` and `body` are invalid values, we'll early exit and return a filter result of "not filtered". However, if they have values we will conditionally try to apply the filter.

```csharp
(string text, bool isFiltered) TryApplyFilter(
    string text,
    char? placeHolder = null)
{
    var filterText = _profanityFilter?.IsProfane(text) ?? false;
    var resultingText =
        filterText
            ? _profanityFilter?.ApplyFilter(text, placeHolder)
            : text;

    return (resultingText, filterText);
}
```

If the text is profane, we apply the filter. Titles do not support markdown, as such we have to replace profane content with asterisk characters. But with the body text, **GitHub** supports markdown and emoji. When we are done working on the issue, we store the activity as a `FilterActivity` instance with all of the details we need. If there was profanity we react to the issue with the confused emoji 😕 and we'll label the issue.

### GraphQL

There are several default labels, none of which suited my needs. I needed to signify that an issue or pull request contained profane content -- the label I created was "profane content 🤬". The way that the app knows about this label is via its identifier, and we can retrieve that using the **GitHub GraphQL** [explorer](https://developer.github.com/v4/explorer) and the following query.

```js
query {
  repository(
    owner: "IEvangelist",
    name: "GitHub.ProfanityFilter") {
    labels(first: 20) {
      nodes {
        id,
        name
      }
    }
  }
}
```

I really love how **GraphQL** allows the consumer to retrieve only the shape of the items it's querying, this is really powerful. Executing this query returns my labels, their `name` and `id`. The label identifier is configured in our **Azure **Function** as an environment variable. If you're looking for the **GitHub GraphQL SDK**, look no further -- this project relies on the [Oktokit.GraphQL](https://www.nuget.org/packages/Octokit.GraphQL) package. It is a fluent API, which enables developers to author complex graph-based queries and mutations with ease. For details, see the  [source code](https://github.com/IEvangelist/GitHub.ProfanityFilter).

## Conclusion

This article started with detailing the underlying sentiment of an open source ecosystem, and the potential for frustration and angst. And while it's not all rainbows and ponies, it's awesome when the community comes together. I received a pull request that added the "lint licker" word replacer implementation -- yes, inspired by this commercial! For your viewing pleasure, here is what the filter looks like in action.

{{< video poster="/img/2019/11/poster.png" src="/img/2019/11/in-action.mp4" >}}

As you can see, the profanity filter works 🤘.
