---
title: WebAssembly
published: '2018-08-05'
description: Interview with Steve Sanderson (Talking Blazor)
author: David Pine
tags:
  - WASM
  - Web
  - WebAssembly
coverImage:
  src: ./blazor.png
  alt: WebAssembly
---
I set out a while ago to try to interview various community leaders for their take on WebAssembly. If you're unfamiliar with WebAssembly, here's a definition for you.

> WebAssembly is a binary instruction format for a stack-based virtual machine
> <cite>[webassembly.org](https://webassembly.org/)</cite>

<br/>
That's a lot to try to parse, right?! I was able to get an interview with Steve Sanderson, which I'm going to share in this post. Steve is a pretty amazing individual and I'm grateful to have been able to interview him.

[![Steve Sanderson](./steve.jpg)](https://twitter.com/stevensanderson)

Additionally, one of the other's that I reached out to was Scott Hanselman. Scott offered up something really special, rather than replying to the questions - he gave me an _unpublished interview_ (that has since been published) that he did with Steve Sanderson on his [hanselminutes podcast](https://hanselminutes.com/642/blazor-brings-net-to-web-assembly-with-steve-sanderson)!

---

## Interview

So, here is the interview itself. Rather short and sweet - a meager six questions but I'm grateful to share it with you all.

### Question 1

> WebAssembly - is it just hype or do you believe this is the future of web development?

<br/>
While this question is rather broad, it was my hope to gauge the true overarching value of this web technology. I really like Steve's answer.

> I hope that the future of web development includes giving developers a wider choice of languages and platforms.<br/>There's nothing wrong with JavaScript, but our industry would be healthier if multiple paradigms and specializations were better catered for.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
This response is really powerful, he's absolutely right. We as developer's should have the choice of technology that will make us happy, but more importantly - we should have more options so that we are empowered to pick the right tool for the job.

### Question 2

> Why is Blazor labeled an "experiment", there seems to be a significant effort in developing it?

<br/>
Part of the motivation behind this question was to dig a little more. Blazor has been active development now for eight months, and has a lot of attention from the developer community.

I think Steve's response was rather generic and I still believe that this will become a full-blown product!

> Because it _is_ an experiment, in the sense that it's not a committed product. We are putting significant effort into working out whether it's a product we should build.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
I'll leave it to you, does this look like an "experiment"?

<a href="https://github.com/aspnet/Blazor" target="_blank">
    <img src="/img/2018/08/blazor-github.png" />
</a>

### Question 3

> Should developers be learning about WebAssembly today and considering it for future projects as an alternative to existing technologies?

<br/>
With this question I wanted to try to understand where web developers should be focusing their efforts. There is so many new things that come and go, kudos to Microsoft for taking that problem seriously and evaluating Blazor. Here is what Steve had to say about this.

> I would be very surprised if JavaScript isn't involved in web development for as long as the web exists as an application platform. It may become analogous to Bash scripts: ubiquitous, can do everything in theory, and excellent for gluing together other technologies.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
### Question 4

> Silverlight is dead, WebForms is still dying and Razor Pages (and MVC) are fairly prevalent. SPA frameworks like Angular and React are pushing business logic client-side, WebAssembly would make this easier too. Is Blazor an attempt to compete with SPA frameworks?

There are lots of web development technologies out there today, what makes blazor special - right?

> Blazor is an attempt to move the SPA world forwards into an era where developers have more freedom to choose other languages and platforms.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
There you have it, blazor is a SPA framework giving us the magic of C# in the browser.

<img src="/img/2018/08/magic.png" />

### Question 5

> If you could change one thing about WebAssembly, what would you change and why?

<br/>
I love these kinds of questions, it gives us a look into potential shortcomings of things we've yet to invest much time in.

> I'd like true multithreading, because lots of languages and platforms assume that exists. Fortunately it is on the spec roadmap.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
### Question 6

> WebAssembly performance seems almost too good to be true, is it overrated - why or why not?

<br/>
There are indications of its performance being "near native" and some say that, but what does it really mean? Steve explains that pretty well.

> I don't find it surprising or too good to be true. We have known for a long time that a high-level bytecode plus modern JIT allows performance close to plain machine code. WebAssembly is a JITing platform so it should perform similarly.
> <cite>[Steve Sanderson](https://twitter.com/stevensanderson)</cite>

<br/>
## Conclusion

WebAssembly is a pretty amazing bit of technology. Microsoft's vision of bring C# everywhere is coming to fruition with the help of WebAssembly. I'm thankful to be a web developer in this day and age, as I'll be given the opportunity to take my favorite programming language to the web!
