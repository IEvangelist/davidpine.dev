---
title: 'DMP in 3: RxJS Debounce'
published: '2018-11-11'
description: Three minute solution for delayed filtering to avoid performance implications
author: David Pine
tags:
  - Angular
  - RxJS
  - TypeScript
coverImage:
  src: ./bounce.jpg
  alt: 'DMP in 3: RxJS Debounce'
---
I recently decided to give creating videos a test drive. The problem with creating video content is the fact that it's really _time consuming_ to do, but the time investment can be worth the effort if you're able to truly deliver some sort of value. Another problem we're faced with in the technical community is that videos can be very lengthy. Enter __DMP in 3__, a video series of 3 minute videos. The idea is to identify a common programming problem, demonstrate a common solution with explanation and then quickly review the entire scenario.

I've managed to put my first episode together, and I have so much more respect for those video content developers in our community. This was a HUGE effort and I'm still not fully satisfied with it, but I will improve with practice. If you have ideas for something you want covered - please leave a comment below.

# Episode 1

In this first episode we cover a scenario where we're working a large set of data. We need to implement a filter feature for the end user. The issue is that when filtering a large data set, the user will experience performance implications as each char they input performing the filtering logic. To solve this we use the __RxJS__ `debounce` operator.

###  Video



[Watch on YouTube](https://www.youtube.com/watch?v=z-kYoR1cqSM)



<br/><br/>

-  [GitHub Source Code](https://github.com/IEvangelist/dmp-in-three-debounce)
