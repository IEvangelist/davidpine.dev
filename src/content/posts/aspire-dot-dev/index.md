---
title: Deploying aspire.dev with aspire deploy
published: '2025-10-27'
description: >-
  A journey of rebranding, replatforming, dogfooding, and mild existential
  crises
author: David Pine
tags:
  - Aspire
  - C#
  - JavaScript
  - Polyglot
coverImage:
  src: ./aspire-dev.png
  alt: ...
---
In this post, I'll walk you through the journey of how <https://aspire.dev> came to be—from the initial spark of rebranding to the technical challenges of deploying it with our own tools. It's a story of design iterations, platform decisions, and the kind of dogfooding that makes you question your life choices... Spoiler: we made it work, and learned a lot along the way.

## 🕓 A bit of history

The first commit of [`dotnet/docs-aspire` was November 10, 2023](https://github.com/dotnet/docs-aspire/commit/78c7da55237dfdcd806bcf135169814eb7777a4d), but we were building out content for this well before then. Spawning itself into existence from an evolving [extensions ecosystem (code named "R9")](https://github.com/search?q=repo%3Adotnet%2Fextensions%20r9&type=code), Astra was the original name, before later becoming Aspire! The name still isn't something I like, it's too ambiguous, but it's what we have now.

:::tip{title="🙄 What's in a name?"}

I lobbied hard for "Aspect" as the product name—you could say your `AppHost` runs or deploys "as specified." or "as spec'd" Clever, right? Unfortunately, I pitched this *after* we'd already bought the domain. Timing is everything.

:::

Let's be clear: we're proud of .NET. Aspire wouldn't exist without it—the runtime, the ecosystem, the community. But from a branding perspective, we made a deliberate choice to simplify. For years, it was ".NET Aspire." That worked, but it also created boundaries. When you lead with ".NET," you signal a specific audience. We wanted to widen our stance in the industry.

Here's the reality: Aspire is polyglot. We're targeting Python, JavaScript/TypeScript, and more in the near future. The orchestration, observability, and deployment story we've built isn't just for C# developers—it's for anyone building cloud-native apps.

Dropping the ".NET" prefix wasn't about distancing ourselves. It was about making room. Aspire is still deeply rooted in .NET, but the brand needed to reflect where we're going, not just where we came from.

## 👋 Aspire: Exiting Microsoft Learn

Next came the big decision: move Aspire off [Microsoft Learn](https://learn.microsoft.com/dotnet/aspire/). Why? Because Aspire isn't just another Microsoft product—it's an OSS-first experience. We wanted a site that felt like it belonged in the same league as:

- [Playwright](https://playwright.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TypeSpec](https://typespec.io/)
- [Visual Studio Code](https://code.visualstudio.com/)

These projects have thriving communities and beautiful docs. We wanted that vibe. So I started asking questions: What works for them? How do they structure docs? What makes their landing pages feel developer-first? What technologies power their sites? What would they do differently if they were starting from scratch today? I then applied those learnings to Aspire and its new home! 🤓

The migration strategy? Deliberate and thoughtful. We're not doing a straight port. Instead, we're slowly moving content over, giving ourselves time to learn from other teams' platform choices and apply those insights. Eventually, all "Aspire" content will move off Microsoft Learn, but we're using this transition to rethink how we position and message Aspire—not just copy-paste what exists.

:::note{title="📢 Important: Issue Tracking Changes"}


As we transition to **aspire.dev**, we're consolidating our documentation efforts. Going forward:

- **New issues and feedback** should be filed at [microsoft/aspire.dev](https://github.com/microsoft/aspire.dev/issues)
- The [dotnet/docs-aspire](https://github.com/dotnet/docs-aspire) repository will be archived
- Existing issues will be migrated or closed as appropriate

This change helps us maintain a single source of truth and makes it easier for the community to contribute. If you spot something wrong or have suggestions, head to the new repo!


:::

Spoiler: there's no universal playbook. Everyone does their own thing—and that's okay. The lesson? Focus on clarity, speed, and developer experience. And take the time to do it right.

## 🚀 Choosing Astro + Starlight

After weeks of research (and way too much coffee), we landed on [Astro](https://astro.build/) with [Starlight](https://starlight.astro.build/). Why? Because it checked all the boxes:

- Fast local dev loop
- Reliable builds
- Accessible by default
- Island architecture for interactivity
- Markdown-first content strategy
- First-class TypeScript support
- Customizable and extensible
- Localization support

Astro gave us the flexibility we needed without sacrificing performance. Honestly, it felt like love at first build. If you're building a docs site today, Astro is a strong contender.

## ♻️ Design and Iteration

Once the tech stack was locked, the real fun began: design and messaging. We worked closely with our design team to craft a modern look and feel. We wanted Aspire to speak to developers who don't live in the .NET ecosystem. So we ran user studies with non-.NET users, iterating along the way, applying our learnings, and refining the UX.

Some feedback stung—"Feels too corporate" and "Looks too much like a Microsoft product." Other comments made us laugh—"What's Aspire? A yoga app?"—but every datapoint helped us shape a site that feels OSS-first, approachable, and fast. And yes, we're still tweaking—because good UX is never done.

## 📦 The Deployment Saga

Here's where things got interesting. Aspire.dev is a static web app. Easy mode would be:

- Push files to Netlify or GitHub Pages
- Add a CNAME for `aspire.dev`

:::tip{title="😅 Easy mode"}


While early developments were underway, my fork of `dotnet/aspire` had a `docs` branch that I was deploying to GitHub Pages using GitHub Actions and a custom workflow. You can still see that version here:

- <https://ievangelist.github.io/aspire/>


:::

But easy mode is boring. We wanted to dogfood `aspire deploy`—because if we're asking you to trust it, we should trust it first.

It's a simple static site, right? How hard could it be? Well, interestingly enough, Aspire was never really built for static sites. It started with containers and cloud providers, so we hadn't prioritized static web hosting scenarios. We had to get creative.

By the way, I did end up writing a [Netlify hosting integration](https://github.com/IEvangelist/netlify-aspire-integration) for Aspire. It's still targeting preview bits, but it might end up in the Community Toolkit. And our integration story for Aspire is expanding rapidly:

[![Aspire Integrations Gallery page showing a grid of colorful integration cards for various services and technologies including database providers, messaging systems, cloud services, and observability tools](./integrations.png)](https://aspire.dev/integrations/gallery)

### ✂️ Cue the plot twists

First, we tried Azure Storage with "serve as web app." Simple, right? Wrong. SFI (Microsoft Secure Future Initiative) and public endpoint limitations killed that dream.

Next, we tried Azure Static Web Apps. Great service, but Aspire couldn't represent that resource well. Another pivot.

Then we moved to Azure Container Apps. Promising! But then we hit MIME type issues (hello `.cast` files from asciinema) and custom 404 handling. We needed a static web host inside the container. More complexity.

Finally, we landed on:

- Azure App Service running a containerized static host
- Azure Front Door in front for performance, scalability, and reliability

Here's the `AppHost` code today:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

if (builder.ExecutionContext.IsRunMode)
{
    // For local development: Use ViteApp for hot reload and development experience
    builder.AddViteApp("frontend", "../../frontend")
           .WithNpmPackageInstallation()
           .WithUrlForEndpoint("http",
                static url => url.DisplayText = "aspire.dev (Local)")
           .WithExternalHttpEndpoints();
}
else
{
    // For deployment: We want to pick ACA as the environment to publish to.
    var appService = builder.AddAzureAppServiceEnvironment("production");

    var staticHostWebsite = builder.AddProject<Projects.StaticHost>("aspiredev")
        .WithExternalHttpEndpoints();

    builder.AddAzureFrontDoor("frontdoor", staticHostWebsite);
}

builder.Build().Run();
```

In run mode, we simply use `ViteApp` for a great local dev experience with hot reload. But in deploy mode, we set up an Azure App Service Environment, deploy our static host project, and put Azure Front Door in front.

The `AddAzureFrontDoor` extension method sets up Front Door with sensible defaults for Aspire deployments, including routing rules, health probes, and custom domains:

```csharp
using Aspire.Hosting.Azure;

internal static class DeploymentExtensions
{
    public static IResourceBuilder<AzureFrontDoorResource> AddAzureFrontDoor(
        this IDistributedApplicationBuilder builder,
        [ResourceName] string name,
        IResourceBuilder<ProjectResource> appServiceWebsite)
    {
        var frontDoorName = $"{name}-afd";
        var frontdoor = new AzureFrontDoorResource(
            frontDoorName, "Bicep/front-door-appservice.bicep");

        return builder.AddResource(frontdoor)
            .WithParameter("frontDoorName", frontDoorName)
            .WithParameter("appServiceHostName", appServiceWebsite.Resource.Name);
    }
}

public sealed class AzureFrontDoorResource(
    string name, string? templateFile = null)
        : AzureBicepResource(
            name,
            templateFile: templateFile ?? "Bicep/front-door.bicep"),
        IComputeResource;
```

And admittedly, the Bicep template is less fun to look at, so I'll spare you that here.

## 🏫 Lessons Learned

Dogfooding `aspire deploy` wasn't just about deployment—it shaped the product. We discovered gaps, fixed them, and made Aspire CLI more robust. Along the way, we proved that Aspire can handle real-world complexity.

We're proud of what we've built:

- A modern marketing page
- A docs experience that feels OSS-first
- A deployment story that's equal parts painful and rewarding

## ✅ What's Next?

We'd love for you to check out <https://aspire.dev> and tell us what you think. Is the messaging clear? Does the site feel fast? Are we missing something obvious? Your feedback will help shape where we go next.

The site is fully open source at <https://github.com/microsoft/aspire.dev>—so if you spot a typo, have a design idea, or want to contribute content, we're all ears. PRs welcome. Issues encouraged. Rants accepted (but keep them constructive 😄).

This is just the beginning. We're continuing to migrate content, refine the experience, and expand Aspire's polyglot story. Stick around—it's going to be a fun ride.
