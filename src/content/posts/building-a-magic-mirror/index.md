---
title: Building a Magic Mirror
published: '2016-12-23'
description: 'Windows 10 IoT Core, UWP, C#, Raspberry Pi 3'
author: David Pine
tags:
  - .NET Core
  - C#
  - IoT
  - Raspberry Pi
  - UWP
coverImage:
  src: ./mirror.jpg
  alt: Building a Magic Mirror
---
# Inspiration

I am certainly not the first one to create a magic mirror, and I will not be the last either. I was inspired by those who are true Innovators...some might say, "I'm standing on the shoulders of giants". They would probably we right, and I'm okay with that. Earlier this year, I stumbled upon a tweet about someone how created a magic mirror...this is the root of my inspiration.

[View post by @davidpine7](https://x.com/davidpine7/status/695318303326265345)

Before continuing on, allow me to explain what a magic mirror is. A magic mirror is simply a two-way mirror with a monitor positioned behind it that projects through the mirror. The monitor displays the application. The application is running on a small computer, in most cases a **Raspberry Pi**.

[![Raspberry Pi](./pi-logo.png)](https://www.raspberrypi.org)

I noticed that a lot of the magic mirrors had greeting messages such as "you look handsome" or "good morning sexy" and other curiously intuitive sayings.
I thought "wow" this really is a smart mirror, much to my surprise these were all just static messages (or only dynamic when accounting for the time of day). I was thinking to myself, "I wonder if I could improve upon this", and that was my motivation!

## Open Source

If you want to skip out from reading this post, you can checkout my project up on **GitHub** &nbsp;
 [IEvangelist.Mirror](https://www.github.com/IEvangelist/Mirror).

# Hardware

I was excited when **Microsoft** started selling the **Raspberry Pi 3, Model B** - I ordered one immediately.

![Raspberry Pi 3](./pi3.gif)

## Specs

![Specs](./pi-layout.png)

### Miscellaneous

Below is a semi-comprehensive listing of all the materials and their corresponding cost that I used for building my magic mirror.

|  Rough Cost | Hardware |
|:--|:--|
| $60  | <a href="https://www.microsoftstore.com/store/msusa/en_US/pdp/Raspberry-Pi-3-Bundle/productID.5068162700" target="_blank">Raspberry Pi 3 Bundle <a/> |
| $130 | <a href="https://www.amazon.com/gp/product/B00IZBIMLK/ref=oh_aui_search_detailpage?ie=UTF8&psc=1" target="_blank">BenQ 27" HDMI LED Monitor <a/> |
| $90  | <a href="https://www.tapplastics.com/product/plastics/cut_to_size_plastic/two_way_mirrored_acrylic/558" target="_blank">Custom-sized Two-way Mirrored Acrylic <a/> |
| $40  | <a href="https://www.amazon.com/Microsoft-LifeCam-Cinema-720p-Webcam/dp/B009CPC6QA" target="_blank">Microsoft LifeCam <a/> |
| $25  | <a href="https://www.amazon.com/gp/product/B00DEJXRAE/ref=oh_aui_search_detailpage?ie=UTF8&psc=1" target="_blank">Dell USB Wired Soundbar <a/> |  
| $6   | <a href="https://www.amazon.com/gp/product/B000234UFG/ref=oh_aui_detailpage_o06_s00?ie=UTF8&psc=1" target="_blank">Power Cord Splitter <a/> |
| $25  | Full HDMI Cable, USB Extension Cables |
| $50  | Carpentry Materials |
| $50  | Glenlivet 12 Year Old Scotch Whisky (not technically hardware) |
| <strong>~$480</strong> ||

Considering the total investment is still under $500 bucks, that's not too bad!

# OS -- Platform

One of my favorite parts about developing the magic mirror was the fact that I could do so from the comfort of **Visual Studio** using the worlds most powerful programming
language today, **C#**.

<a href="https://www.visualstudio.com/" target="_blank">
    <img src="/img/2016/12/vs.png" alt="Visual Studio" style="max-width: 175px;" />
</a>
&nbsp; &nbsp;
<a href="https://msdn.microsoft.com/en-us/library/kx37x362.aspx" target="_blank">
    <img src="/img/2016/12/csharp.png" alt="C#" style="max-width: 175px;" />
</a>

| Type | Name -- Link |
|:--|:--|
| <strong>OS</strong> | {{< url-link "`Windows 10 IoT Core, "Build 10.0.14393"` " "https://developer.microsoft.com/en-us/windows/iot/explore/iotcore" >}} |
| <strong>Platform</strong> | {{< url-link "`Universal Windows Platform (UWP), "UAP 1.0"` " "https://msdn.microsoft.com/en-us/windows/uwp/get-started/universal-application-platform-guide" >}} |

# Software

When people throw around the acronym **IoT** it can mean a lot of different things. For this specific application, it is essential. Using the built-in _WIFI_ on the **Pi 3** we
can leverage the power of the internet to gather and share information.

> Software is simply the movement and manipulation of data. But without context, said data is meaningless.

The magic mirror application strives to provide data that is all of the following:

- Relevant
- Practical
- Convenient
- Timely

 Below is the user-interface layout. Let's have a look at the various components that our application is built on.

 ![Layout](./layout.png)

## Components

From the layout above, it is clear to visualize the key components of the application. Most of these components implement the
`IContextSynthesizer` interface. These implementations are indicators that each component is capable of handling voice commands, and providing a message that is consumable
by the **UWP** speech-synthesizer.  More on this later...

### Weather -- Forecast

The current weather and forecast are retrieved every fifteen minutes from the free [Open Weather API](https://openweathermap.org/api).
The developer API key and zip code are configurable. Additionally, the unit-of-measure is configurable, where you can specify `imperial` or `metric` as valid settings.

### Clock

The clock is extremely simple. It is just the current date and time. It updates every second, formatting to the hour, minute, and second -- additionally displaying the name of the day followed by the month and day number.

**Example:**



:::note

I opted to omit whether or not we're in ante or post meridiem as it is assumed the user would know if it's morning or in the afternoon.

:::

### Event Calendar / Schedule

My magic mirror is configured to display an aggregation of two calendars. This is entirely configurable, so if you were to  [fork my repo](https://github.com/IEvangelist/Mirror#fork-destination-box) -- you would need to setup your desired endpoints. The only requirement is that the URL is an accessible endpoint that returns valid `iCal` [(*.ics) formatting](https://icalendar.org/).
The events are truncated to fit on the page and ordered by the date of the event.

### Music Player

Imagine you have the magic mirror mounted in your bathroom, or bedroom...it would be nice to say, "play a song", or "play Deftones" for example and music starts playing. That is the idea behind the music player component. The current implementation of the music player is limited. I spent a few long nights trying to figure out how to use the built-in **Bluetooth** on the **Pi 3**, while **UWP** does have some support it is limited. I was able to pair but not stream songs from my **iPod** for example, which was really frustrating. For the meantime, I simply placed several songs in the `Assets` directory as content and I can play these resources. Ideally, I will use a web-based service like Spotify or Pandora.

### Voice Commands

The **Universal Windows Platform** provides two very useful classes, the
[`SpeechRecognizer`](https://msdn.microsoft.com/en-us/library/windows/apps/windows.media.speechrecognition.speechrecognizer.aspx) and the
[`SpeechSynthesizer`](https://msdn.microsoft.com/en-us/library/windows/apps/windows.media.speechsynthesis.speechsynthesizer.aspx). Leveraging this
I have built out the ability to talk to my magic mirror, I can ask it things like "what's the weather", "what's my schedule for Wednesday", or even tell it commands like "turn
this up".

## Microsoft Cognitive Services

Formally known as "Project Oxford", Microsoft Cognitive Services offers a ton of programming power and you can start using it today for **free**. Simply [subscribe](https://www.microsoft.com/cognitive-services/en-us/subscriptions) and use your subscription key as the argument to the client `.ctor`. The magic mirror makes use of the Emotion API, and corresponding `EmotionServiceClient` from the [`Microsoft.ProjectOxford.Emotion`](https://www.nuget.org/packages/Microsoft.ProjectOxford.Emotion/) package.

Consider the following:

```csharp
async Task<IEnumerable<RawEmotion>> CaptureEmotionAsync()
{
    RawEmotion[] result;

    try
    {
        var photoFile = await _photoService.CreateAsync();
        var imageProperties = ImageEncodingProperties.CreateBmp();
        await _mediaManager.CapturePhotoToStorageFileAsync(imageProperties, photoFile);
        result = await _emotionClient.RecognizeAsync(await photoFile.OpenStreamForReadAsync());
    }
    finally
    {
        await _photoService.CleanupAsync();
    }

    return result.IsNullOrEmpty()
        ? await TaskCache<IEnumerable<RawEmotion>>.Value(() => Enumerable.Empty<RawEmotion>())
        : result;
}
```

- First our `_photoService` asynchronously creates a photo file
- From the `ImageEncodingProperties` class, we create a bitmap encoding property set
- Our `_mediaManager` captures a photo, storing it in the photo file with the specified encoding
- Finally we invoke the `_emotionClient` passing it the stream from the persisted photo

 The `result` object contains a `Scores` class that looks like the following (from my mugshot):  

![Set](./set.png)

The service returned a result. The result claims an **81.5%** level of confidence that I'm happy based on the given image, what do you think? What you don't see is that I'm taking a selfie with [Jeremy Foster](https://twitter.com/codefoster) -- so, yeah -- I was pretty happy!

# Construction

I would be lying if I tried taking credit for any of the construction. I'm slightly embarrassed to admit that I opted out of building it, as I lack the carpentry skills needed to do a decent job. Instead, I asked a friend who just so happens to be awesome at carpentry. After persuading him with a bottle of single malt scotch whiskey, I had my magic mirror constructed and the results were amazing! Needless to say, I was excited to try it out.



---



[Watch on YouTube](https://www.youtube.com/watch?v=KOTYW8EioBk)



<br/><br/>



[Watch on YouTube](https://www.youtube.com/watch?v=PWr1zRBO90o)



<br/><br/>
