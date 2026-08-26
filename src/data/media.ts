export type MediaKind = 'video' | 'podcast' | 'publication' | 'feature'

export interface MediaEntry {
  id: string
  kind: MediaKind
  title: string
  url: string
  description?: string
  date?: string
  youtubeId?: string
  embedUrl?: string
  image?: string
  featured?: boolean
}

const standardThumbnailIds = new Set([
  '5jCy7oHbDaE',
  'KenrBgNg8jk',
  'i3RXbOY6-0I',
  'wTvisUbU9FU',
  'izdnmBrTweA',
])

const video = (youtubeId: string, title: string, date: string): MediaEntry => ({
  id: `video-${youtubeId}`,
  kind: 'video',
  title,
  date,
  url: `https://www.youtube.com/watch?v=${youtubeId}`,
  youtubeId,
  image: `https://i.ytimg.com/vi/${youtubeId}/${
    standardThumbnailIds.has(youtubeId) ? 'hqdefault' : 'maxresdefault'
  }.jpg`,
})

export const mediaEntries: MediaEntry[] = [
  video(
    'Rp36LqdQm10',
    'OpenGraph Preview Canvas for the GitHub Copilot App',
    '2026-07-08',
  ),
  video('2tD8itLsYMg', 'Stop Rewriting. Start with Aspire.', '2026-06-16'),
  video(
    'vWsgwd9QN6w',
    'From Localhost to Liftoff: Aspire for Newbies - Aspire Conf 2026',
    '2026-03-27',
  ),
  video('1K5riRctUIg', 'Introduction to Azure Key Vault and Aspire', '2024-09-24'),
  video('KRb7T1LZZj0', "Let's Learn .NET - Write your first code using C#", '2023-09-20'),
  video('PDDAUtX6E7c', "Let's Learn .NET - Git & GitHub", '2022-03-03'),
  video('pR6fMsZPw3g', 'C# Source Generators for Blazor', '2023-04-28'),
  video('Bh1lUglDOq4', 'Exploring the Azure AI OpenAI .NET SDK', '2023-05-03'),
  video('RGPS0y2pl2k', 'Blazorators: C# Source Generators for Blazor', '2022-10-03'),
  video('6h_MNM0Tk2s', 'Coffee & Open Source Conversation', '2022-06-08'),
  video(
    'U8XriF2zxS0',
    'ASP.NET Community Standup - Blazorators: Blazor C# Source Generators',
    '2022-04-12',
  ),
  video(
    'WoIIMRYYlKc',
    'dotNET Dev Show: GitHub Actions for .NET Devs with David Pine',
    '2021-04-23',
  ),
  video(
    'JTQVbc-LI8s',
    'C# Language Highlights: Deconstructing Non-tuple Types',
    '2021-08-24',
  ),
  video('caE5VZD5XNk', 'C# Using SignalR in your Blazor applications', '2021-08-19'),
  video(
    'tnepPn3Py8s',
    'C# Language Highlights: Positional Pattern Matching',
    '2021-07-15',
  ),
  video('v_xKLwTv3AI', 'C# Language Highlights: Exhaustive Case Guards', '2021-07-22'),
  video('ZMkY51zGTkQ', 'C# Language Highlights: Tuple Pattern Matching', '2021-05-06'),
  video('b-1V5LfzLyg', 'C# Language Highlights: Property Pattern Matching', '2021-05-04'),
  video(
    'izdnmBrTweA',
    'Azure Cosmos DB Conf: Deep-dive into the repository-pattern .NET SDK',
    '2021-04-20',
  ),
  video('ko5RoLU4WV0', 'SignalR Crazy8s: The Refactoring | C# 9 Features', '2021-01-22'),
  video('KenrBgNg8jk', 'Cosmos DB: Repository Pattern .NET Wrapper SDK', '2020-10-14'),
  video('oX2COO_1iOM', 'Localize .NET apps with Azure AI', '2021-01-04'),
  video('-THCDHKyqJM', 'MADdotNET: Building The .NET Docs Show website', '2020-09-03'),
  video('lfKIYoyHXJc', 'Technology & Friends: .NET 5 Wave', '2020-07-16'),
  video('OUCN1i-ziLo', 'SignalR - ASP.NET Community Standup', '2020-04-14'),
  video('i3RXbOY6-0I', 'SignalR: Above & Beyond Chat', '2019-05-24'),
  video('wTvisUbU9FU', 'Exploring C# 8', '2019-05-22'),
  video('l0Yc9kDz7lU', 'Up & Running with Hugo', '2019-02-08'),
  video('L7IY9vKO2Bw', 'MkeJS - TypeScript: Making JavaScript Tolerable', '2018-07-04'),
  video('UEajhQHBa3Y', '#MVPBuzzChat CollabTalk', '2018-06-14'),
  video('5jCy7oHbDaE', 'Serbia, National News', '2018-04-18'),
  video('MjS_lVg0G8E', 'AskTHAT | Episode 35', '2018-04-11'),
  video('VW7b0WU_UDM', "Microsoft's Channel 9 - Magic Mirror", '2017-01-12'),
  {
    id: 'podcast-azure-devops-223',
    kind: 'podcast',
    title: 'David Pine: .NET Content Development - Episode 223',
    url: 'https://bit.ly/davidpine-azuredevops-podcast',
    embedUrl:
      'https://play.libsyn.com/embed/episode/id/25293084/theme/modern/tdest_id/768876',
    image:
      'https://assets.libsyn.com/secure/item/25293084?height=720&width=1280&overlay=true',
    description:
      'Jeffrey Palermo interviews David Pine about his role as a content developer for the .NET team, the future of .NET, GitHub Actions, the .NET SDK, Orleans, and practical sample code.',
  },
  {
    id: 'podcast-eat-sleep-code-typescript',
    kind: 'podcast',
    title: 'Eat Sleep Code - Why You Should Learn TypeScript',
    url: 'https://soundcloud.com/esc-podcast/why-you-should-learn-typescript',
    embedUrl:
      'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/379995980&color=%2314b6e5&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false',
    image: '/media/media.jpg',
    description:
      'David shares why TypeScript improves JavaScript application development, how it compiles, where it is strongest, and how to get started.',
  },
  {
    id: 'podcast-six-figure-developer-38',
    kind: 'podcast',
    title: '6 Figure Developer - Episode 38',
    url: 'https://6figuredev.com/podcast/episode-038-developer-community-with-david-pine',
    description:
      'David talks with John Callaway, Clayton Hunt, and Jon Ash about developer community, TypeScript, C#, speaking, and blogging.',
  },
  {
    id: 'podcast-developer-on-fire-305',
    kind: 'podcast',
    title: 'Developer On Fire - Episode 305',
    url: 'http://developeronfire.com/podcast/episode-305-david-pine-positive-brand',
    description:
      'David talks with Dave Rael about building a positive developer brand, mentorship, and sharing knowledge with the community.',
  },
  {
    id: 'publication-dotnet-devblog',
    kind: 'publication',
    title: 'David Pine on the official .NET DevBlog',
    url: 'https://devblogs.microsoft.com/dotnet/author/dapine/',
    image:
      'https://devblogs.microsoft.com/dotnet/wp-content/uploads/sites/10/2022/02/me-2.png',
    description:
      'Articles about Blazor, C#, Azure AI, Native AOT, containerized .NET apps, GitHub Actions, and more.',
  },
  {
    id: 'publication-twilio',
    kind: 'publication',
    title: 'David Pine on Twilio Blog',
    url: 'https://www.twilio.com/blog/authors/author.dpine',
    description:
      'Nine tutorials focused on Twilio Video, ASP.NET Core SignalR, and Twilio SMS.',
  },
  {
    id: 'publication-video-chat',
    kind: 'publication',
    title: 'Build a Video Chat App with ASP.NET Core, Angular, and Twilio',
    url: 'https://www.twilio.com/blog/video-chat-app-asp-net-core-angular-twilio',
    image:
      'https://www.twilio.com/content/dam/twilio-com/core-assets/social/twilio-blog-default-ogimage.png',
    description:
      'Build the client and server interactions needed to create rooms and publish or subscribe to audio and video tracks.',
  },
  {
    id: 'publication-future-dotnet-core',
    kind: 'publication',
    title: 'The Future of .NET Core',
    url: 'https://www.infoq.com/articles/future-of-net-core',
    description:
      'A look at how .NET Core benefits developers building robust, performant, and economical solutions.',
  },
  {
    id: 'publication-typescript-generics',
    kind: 'publication',
    title: 'TypeScript - A Tour of Generics',
    url: 'http://www.dotnetcurry.com/typescript/1439/typescript-generics',
    description:
      'A practical tour of TypeScript generics, language services, refactoring, type checking, compilation, and flow analysis.',
  },
  {
    id: 'publication-csharp-favorite-features',
    kind: 'publication',
    title: 'C#: Favorite Features through the Years',
    url: 'http://www.dotnetcurry.com/csharp/1411/csharp-favorite-features',
    description:
      'A version-by-version walkthrough of impactful C# language features and the problems they solve.',
  },
  {
    id: 'publication-aspnet-web-api-attributes',
    kind: 'publication',
    title: 'ASP.NET Core Web API Attributes',
    url: 'http://www.dotnetcurry.com/aspnet/1390/aspnet-core-web-api-attributes',
    description:
      'An explanation of ASP.NET Core Web API attributes, model binding, aliasing, strong typing, and HTTP verb usage.',
  },
  {
    id: 'feature-friday-five-2019-06-21',
    kind: 'feature',
    date: '2019-06-21',
    title: 'Friday Five: ASP.NET Core Slack Slash Commands, Cloud App Security',
    url: 'https://techcommunity.microsoft.com/t5/Microsoft-MVP-Award-Program-Blog/Friday-Five-ASP-NET-CORE-Slack-Slash-Commands-Cloud-App-Security/ba-p/713990',
  },
  {
    id: 'feature-friday-five-2019-01-18',
    kind: 'feature',
    date: '2019-01-18',
    title: 'Friday Five: January 18',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2019/01/18/friday-five-january-18/',
  },
  {
    id: 'feature-friday-five-2018-07-27',
    kind: 'feature',
    date: '2018-07-27',
    title: 'Friday Five: July 27',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/07/27/friday-five-july-27/',
  },
  {
    id: 'feature-friday-five-2018-07-20',
    kind: 'feature',
    date: '2018-07-20',
    title: 'Friday Five: July 20',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/07/20/friday-five-july-20/',
  },
  {
    id: 'feature-friday-five-2018-06-15',
    kind: 'feature',
    date: '2018-06-15',
    title:
      'How to use Azure Serverless to become GDPR compliant and more on the Friday Five',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/06/15/how-to-use-azure-serverless-to-become-gdpr-compliant-and-more-on-the-friday-five/',
  },
  {
    id: 'feature-friday-five-2018-06-01',
    kind: 'feature',
    date: '2018-06-01',
    title: 'Friday Five - June 1',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/06/01/friday-five-june-1st/',
  },
  {
    id: 'feature-friday-five-2018-05-25',
    kind: 'feature',
    date: '2018-05-25',
    title: 'Friday Five - May 25',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/05/25/friday-five-may-25th/',
  },
  {
    id: 'feature-friday-five-2018-04-27',
    kind: 'feature',
    date: '2018-04-27',
    title: 'Friday Five - April 27',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2018/04/27/friday-five-april-27th/',
  },
  {
    id: 'feature-friday-five-2017-12-08',
    kind: 'feature',
    date: '2017-12-08',
    title: 'Friday Five - December 8',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2017/12/08/friday-five-december-8th/',
  },
  {
    id: 'feature-friday-five-2017-09-22',
    kind: 'feature',
    date: '2017-09-22',
    title: 'Friday Five - September 22',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2017/09/22/friday-five-september-22/',
  },
  {
    id: 'feature-friday-five-2017-08-18',
    kind: 'feature',
    date: '2017-08-18',
    title: 'Friday Five - August 18',
    url: 'https://blogs.msdn.microsoft.com/mvpawardprogram/2017/08/18/friday-five-august-18th/',
  },
]

export interface FeaturedMediaEntry extends MediaEntry {
  featured: true
}

const featuredMediaIds = [
  'video-Rp36LqdQm10',
  'video-2tD8itLsYMg',
  'video-vWsgwd9QN6w',
  'video-PDDAUtX6E7c',
  'video-Bh1lUglDOq4',
  'video-RGPS0y2pl2k',
  'video-oX2COO_1iOM',
  'video-5jCy7oHbDaE',
  'podcast-azure-devops-223',
  'podcast-eat-sleep-code-typescript',
  'publication-dotnet-devblog',
  'publication-video-chat',
] as const

export const featuredMediaEntries: FeaturedMediaEntry[] = featuredMediaIds.map((id) => {
  const entry = mediaEntries.find((candidate) => candidate.id === id)
  if (!entry) {
    throw new Error(`Featured media entry not found: ${id}`)
  }

  return {
    ...entry,
    featured: true,
  }
})
