---
title: 'Hey 4th Graders: Listen Closely Today'
author: David Pine
description: A kid-friendly career fair slide deck about software engineering, AI, curiosity, and active listening.
pubDate: '2026-05-05T12:00:00'
tags:
  - Career Fair
  - Software Engineering
  - AI
  - Microsoft
  - Education
transition: convex
controls: true
progress: true
slideNumber: true
autoSlide: 0
---

<!-- markdownlint-disable MD033 -->

<style>
  .reveal .career-fair {
    --cf-ink: #071326;
    --cf-blue: #045de9;
    --cf-teal: #008a7c;
    --cf-orange: #ea580c;
    --cf-pink: #c026d3;
    --cf-purple: #5b21b6;
    --cf-yellow: #ffd43b;
    --cf-lime: #84cc16;
    --cf-paper: #fffdf7;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: 0.55rem 0.75rem;
    border: 5px solid var(--cf-ink);
    border-radius: 24px;
    background: var(--cf-paper);
    color: var(--cf-ink) !important;
    text-align: left !important;
  }

  .reveal .career-fair * {
    box-sizing: border-box;
    letter-spacing: 0;
  }

  .reveal .slides section:has(.career-fair) {
    display: block !important;
    height: 100% !important;
    padding: 0 !important;
  }

  .reveal .career-fair.sunny {
    background:
      radial-gradient(circle at 86% 12%, rgba(255, 212, 59, 0.95) 0 12%, transparent 13%),
      linear-gradient(135deg, #fff7cc 0%, #d9f2ff 58%, #ffffff 100%);
  }

  .reveal .career-fair.blue-pop {
    background:
      radial-gradient(circle at 8% 12%, rgba(132, 204, 22, 0.35) 0 14%, transparent 15%),
      linear-gradient(135deg, #dbeafe 0%, #ffffff 48%, #e0f7fa 100%);
  }

  .reveal .career-fair.purple-pop {
    background:
      radial-gradient(circle at 88% 82%, rgba(192, 38, 211, 0.24) 0 18%, transparent 19%),
      linear-gradient(135deg, #f5f3ff 0%, #ffffff 55%, #fff7ed 100%);
  }

  .reveal .career-fair.green-pop {
    background:
      radial-gradient(circle at 92% 16%, rgba(4, 93, 233, 0.22) 0 16%, transparent 17%),
      linear-gradient(135deg, #ecfdf5 0%, #ffffff 58%, #fff7cc 100%);
  }

  .reveal .career-fair.orange-pop {
    background:
      radial-gradient(circle at 10% 82%, rgba(255, 212, 59, 0.42) 0 18%, transparent 19%),
      linear-gradient(135deg, #fff7ed 0%, #ffffff 52%, #ffe4ef 100%);
  }

  .reveal .career-fair.recipe-slide {
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .reveal .career-fair.agenda-slide {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: #ffffff;
  }

  .reveal .career-fair.full-photo-slide {
    position: relative;
    container-type: size;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: #071326;
  }

  .reveal .career-fair h2 {
    margin: 0;
    color: var(--cf-ink) !important;
    font-size: 3.3rem;
    line-height: 0.96;
    text-transform: none !important;
    text-shadow: none !important;
  }

  .reveal .career-fair p {
    margin: 0;
    color: var(--cf-ink) !important;
    font-size: 1.28rem;
    line-height: 1.08;
    font-weight: 850;
  }

  .reveal .career-fair strong {
    color: var(--cf-blue) !important;
  }

  .reveal .career-fair .stage {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(250px, 1.1fr);
    gap: 0.8rem;
    align-items: center;
    height: 100%;
  }

  .reveal .career-fair .stage.flip {
    grid-template-columns: minmax(250px, 1.05fr) minmax(0, 0.95fr);
  }

  .reveal .career-fair .center-stage {
    display: grid;
    gap: 0.55rem;
    align-content: center;
    justify-items: center;
    height: 100%;
    text-align: center !important;
  }

  .reveal .career-fair .copy {
    display: grid;
    gap: 0.45rem;
    align-content: center;
  }

  .reveal .career-fair.compact .copy {
    gap: 0.34rem;
  }

  .reveal .career-fair.compact h2 {
    font-size: 3.05rem;
    line-height: 0.94;
  }

  .reveal .career-fair.compact .template-art {
    max-height: 275px;
  }

  .reveal .career-fair.compact .tile,
  .reveal .career-fair.compact .question,
  .reveal .career-fair.compact .yt-link {
    padding: 0.34rem 0.56rem;
  }

  .reveal .career-fair.arctic-vault-slide {
    position: relative;
    isolation: isolate;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: var(--cf-ink);
  }

  .reveal .career-fair .arctic-vault-grid {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: 0.18rem;
    overflow: hidden;
    background: var(--cf-ink);
  }

  .reveal .career-fair .arctic-vault-grid::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(7, 19, 38, 0.74) 0 42%, rgba(7, 19, 38, 0.18) 68%, rgba(7, 19, 38, 0.26) 100%);
    pointer-events: none;
  }

  .reveal .career-fair .arctic-vault-grid img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(1.08) contrast(1.04);
  }

  .reveal .career-fair .arctic-vault-content {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.52rem;
    align-content: center;
    width: min(72%, 720px);
    height: 100%;
    padding: 0.95rem 1.08rem;
    border-right: 3px solid rgba(255, 255, 255, 0.82);
    background: rgba(7, 19, 38, 0.82);
    color: #ffffff !important;
    backdrop-filter: blur(3px);
    text-align: left !important;
  }

  .reveal .career-fair .arctic-vault-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    max-width: 100%;
    padding: 0.3rem 0.7rem;
    border: 3px solid var(--cf-yellow);
    border-radius: 999px;
    background: #071326;
    color: var(--cf-yellow) !important;
    font-size: 0.98rem;
    font-weight: 950;
    line-height: 1;
    text-transform: uppercase;
    box-shadow: 0.16rem 0.18rem 0 rgba(7, 19, 38, 0.35);
  }

  .reveal .career-fair .arctic-vault-content h2 {
    color: #ffffff !important;
    font-size: 3.2rem;
    line-height: 0.94;
    text-shadow: 0 0.12rem 0.4rem rgba(7, 19, 38, 0.5) !important;
  }

  .reveal .career-fair .arctic-vault-content h2 span {
    color: #fef08a !important;
  }

  .reveal .career-fair .arctic-vault-content h2 .arctic-vault-title-pop {
    color: #ffffff !important;
  }

  .reveal .career-fair .arctic-vault-facts {
    display: grid;
    gap: 0.36rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .reveal .career-fair .arctic-vault-facts li {
    --fact-color: var(--cf-teal);
    padding: 0.42rem 0.58rem;
    border-left: 6px solid var(--fact-color);
    border-radius: 8px;
    background: rgba(7, 19, 38, 0.78);
    color: #ffffff !important;
    font-size: 1.18rem;
    font-weight: 900;
    line-height: 1.08;
  }

  .reveal .career-fair .arctic-vault-facts li:nth-child(2) { --fact-color: var(--cf-yellow); }
  .reveal .career-fair .arctic-vault-facts li:nth-child(3) { --fact-color: var(--cf-orange); }
  .reveal .career-fair .arctic-vault-facts li:nth-child(4) { --fact-color: var(--cf-pink); }

  .reveal .career-fair .arctic-vault-facts strong {
    color: var(--fact-color) !important;
  }

  .reveal .career-fair.origin-chain .copy {
    gap: 0.3rem;
  }

  .reveal .career-fair.origin-chain {
    padding-top: 0.42rem;
    padding-bottom: 0.42rem;
  }

  .reveal .career-fair.origin-chain h2 {
    font-size: 2.72rem;
  }

  .reveal .career-fair.origin-chain .hero-word {
    font-size: 3.28rem;
  }

  .reveal .career-fair.origin-chain .template-art {
    max-height: 240px;
  }

  .reveal .career-fair.origin-chain .chain-step {
    min-height: 2.78rem;
    padding: 0.16rem 0.24rem;
  }

  .reveal .career-fair .eyebrow {
    justify-self: start;
    display: inline-flex;
    align-items: stretch;
    overflow: hidden;
    padding: 0;
    border: 3px solid var(--cf-ink);
    border-radius: 999px;
    background: var(--cf-yellow);
    color: var(--cf-ink) !important;
    font-size: 0.82rem;
    font-weight: 950;
    line-height: 1;
    text-transform: uppercase;
  }

  .reveal .career-fair .eyebrow-icon {
    flex: 0 0 2.25em;
    display: inline-grid;
    place-items: center;
    background: var(--cf-ink);
    color: #ffffff !important;
    font-size: 1.12em;
    line-height: 1;
    text-transform: none;
  }

  .reveal .career-fair .eyebrow-text {
    display: inline-block;
    padding: 0.2rem 0.68rem 0.18rem 0.56rem;
  }

  .reveal .career-fair .center-stage .eyebrow {
    justify-self: center;
  }

  .reveal .career-fair .microsoft-lockup {
    justify-self: start;
    display: inline-flex;
    gap: 0.42rem;
    align-items: center;
    width: fit-content;
    padding: 0.32rem 0.58rem;
    border: 4px solid var(--cf-ink);
    border-radius: 16px;
    background: #ffffff;
    color: var(--cf-ink) !important;
    box-shadow: 0.14rem 0.14rem 0 rgba(7, 19, 38, 0.2);
    font-size: 1.05rem;
    font-weight: 950;
    line-height: 1;
  }

  .reveal .career-fair .microsoft-mark {
    display: grid;
    grid-template-columns: repeat(2, 0.58em);
    gap: 0.1em;
  }

  .reveal .career-fair .microsoft-mark span {
    display: block;
    width: 0.58em;
    height: 0.58em;
  }

  .reveal .career-fair .microsoft-mark .red { background: #f25022; }
  .reveal .career-fair .microsoft-mark .green { background: #7fba00; }
  .reveal .career-fair .microsoft-mark .blue { background: #00a4ef; }
  .reveal .career-fair .microsoft-mark .yellow { background: #ffb900; }

  .reveal .career-fair .hero-word {
    display: block;
    color: var(--cf-blue) !important;
    font-size: 4.15rem;
    line-height: 0.92;
    font-weight: 950;
  }

  .reveal .career-fair .hot {
    color: var(--cf-orange) !important;
  }

  .reveal .career-fair .cool {
    color: var(--cf-teal) !important;
  }

  .reveal .career-fair .magic {
    color: var(--cf-pink) !important;
  }

  .reveal .career-fair .visual {
    display: grid;
    place-items: center;
    min-width: 0;
  }

  .reveal .career-fair .visual img {
    width: min(100%, 335px);
    max-height: 285px;
    object-fit: contain;
    filter: drop-shadow(0.24rem 0.3rem 0 rgba(7, 19, 38, 0.18));
  }

  .reveal .career-fair .center-image {
    width: min(62%, 390px);
    max-height: 172px;
    object-fit: contain;
    filter: drop-shadow(0.24rem 0.3rem 0 rgba(7, 19, 38, 0.18));
  }

  .reveal .career-fair .template-art {
    --frame-pop: var(--cf-blue);
    width: min(100%, 355px);
    max-height: 300px;
    padding: 0.16rem;
    border: 6px solid var(--cf-ink);
    background: #ffffff;
    object-fit: contain;
    box-shadow:
      0 0 0 0.15rem var(--frame-pop),
      0.22rem 0.26rem 0 rgba(7, 19, 38, 0.22);
    filter: none;
  }

  .reveal .career-fair .template-art.green { --frame-pop: var(--cf-teal); }
  .reveal .career-fair .template-art.orange { --frame-pop: var(--cf-orange); }
  .reveal .career-fair .template-art.purple { --frame-pop: var(--cf-purple); }
  .reveal .career-fair .template-art.yellow { --frame-pop: var(--cf-yellow); }

  .reveal .career-fair .agenda-art {
    display: block;
    width: 100%;
    height: 100%;
    background: #ffffff;
    object-fit: contain;
    filter: none;
  }

  .reveal .career-fair .full-photo-frame {
    --full-photo-aspect: 2.454545;
    --full-photo-ratio: 837 / 341;
    position: relative;
    width: min(100cqw, calc(100cqh * var(--full-photo-aspect)));
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: var(--full-photo-ratio);
  }

  .reveal .career-fair .valve-hammer-photo {
    --full-photo-aspect: 1.285141;
    --full-photo-ratio: 1280 / 996;
  }

  .reveal .career-fair .full-slide-photo {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    filter: none;
  }

  .reveal .career-fair .full-photo-label {
    position: absolute;
    left: 3px;
    bottom: 3px;
    max-width: calc(100% - 6px);
    padding: 0.34rem 0.72rem;
    border: 3px solid #ffffff;
    border-radius: 999px;
    background: var(--cf-ink);
    color: var(--cf-yellow) !important;
    font-size: 1rem;
    font-weight: 950;
    line-height: 1;
    box-shadow: 0.16rem 0.18rem 0 rgba(7, 19, 38, 0.35);
  }

  .reveal .career-fair .recipe-stage {
    container-type: size;
    gap: 0;
    min-height: 0;
    overflow: hidden;
  }

  .reveal .career-fair .recipe-art {
    width: auto;
    max-width: 96cqw;
    height: min(100cqh, 96cqw);
    max-height: 100cqh;
  }

  .reveal .career-fair .question {
    padding: 0.42rem 0.62rem;
    border: 4px solid var(--cf-blue);
    border-radius: 16px;
    background: #eaf2ff;
    color: var(--cf-blue) !important;
    font-size: 1.22rem;
    line-height: 1.04;
    font-weight: 950;
  }

  .reveal .career-fair .question.green {
    border-color: var(--cf-teal);
    background: #e6fffa;
    color: var(--cf-teal) !important;
  }

  .reveal .career-fair .question.orange {
    border-color: var(--cf-orange);
    background: #fff1e8;
    color: var(--cf-orange) !important;
  }

  .reveal .career-fair .question.pink {
    border-color: var(--cf-pink);
    background: #fce7f3;
    color: var(--cf-pink) !important;
  }

  .reveal .career-fair .material-chain {
    display: grid;
    grid-template-areas:
      "rock arrow-one sand"
      ". arrow-down ."
      "silicon arrow-two chip";
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 0.18rem 0.3rem;
    align-items: center;
    width: min(100%, 390px);
    padding: 0.32rem;
    border: 4px solid var(--cf-ink);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0.16rem 0.16rem 0 rgba(7, 19, 38, 0.18);
  }

  .reveal .career-fair .chain-step {
    display: grid;
    min-height: 3.15rem;
    gap: 0.08rem;
    place-items: center;
    padding: 0.2rem 0.28rem;
    border: 3px solid var(--cf-ink);
    border-radius: 14px;
    background: #ffffff;
    color: var(--cf-ink) !important;
    font-weight: 950;
    line-height: 0.95;
    text-align: center;
  }

  .reveal .career-fair .chain-symbol {
    display: grid;
    min-width: 1.55rem;
    min-height: 1.55rem;
    place-items: center;
    font-size: 1.18rem;
    line-height: 1;
  }

  .reveal .career-fair .chain-label {
    font-size: 0.62rem;
  }

  .reveal .career-fair .chain-step.rock { grid-area: rock; background: #fef3c7; }
  .reveal .career-fair .chain-step.sand { grid-area: sand; background: #fff7ed; }
  .reveal .career-fair .chain-step.silicon { grid-area: silicon; background: #dbeafe; }
  .reveal .career-fair .chain-step.chip { grid-area: chip; background: #dcfce7; }

  .reveal .career-fair .chain-step.silicon .chain-symbol {
    border: 2px solid var(--cf-blue);
    border-radius: 8px;
    background: #eff6ff;
    color: var(--cf-blue) !important;
    font-size: 0.88rem;
  }

  .reveal .career-fair .chain-arrow {
    color: var(--cf-orange) !important;
    font-size: 1.45rem;
    font-weight: 950;
    line-height: 1;
    text-align: center;
  }

  .reveal .career-fair .chain-arrow.one { grid-area: arrow-one; }
  .reveal .career-fair .chain-arrow.two { grid-area: arrow-two; }
  .reveal .career-fair .chain-arrow.down { grid-area: arrow-down; }

  .reveal .career-fair .big-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.48rem;
    width: 100%;
  }

  .reveal .career-fair .big-grid.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reveal .career-fair .tile {
    min-width: 0;
    padding: 0.52rem;
    border: 4px solid var(--cf-ink);
    border-radius: 18px;
    background: #ffffff;
    color: var(--cf-ink) !important;
    box-shadow: 0.16rem 0.16rem 0 rgba(7, 19, 38, 0.2);
    font-size: 1.18rem;
    font-weight: 950;
    line-height: 1;
    text-align: center;
  }

  .reveal .career-fair .tile.blue { background: #dbeafe; }
  .reveal .career-fair .tile.green { background: #dcfce7; }
  .reveal .career-fair .tile.orange { background: #ffedd5; }
  .reveal .career-fair .tile.purple { background: #ede9fe; }
  .reveal .career-fair .tile.yellow { background: #fef3c7; }
  .reveal .career-fair .tile.pink { background: #fce7f3; }

  .reveal .career-fair .prompt {
    padding: 0.55rem 0.72rem;
    border: 4px dashed var(--cf-purple);
    border-radius: 18px;
    background: #ede9fe;
    color: var(--cf-ink) !important;
    font-size: 1.15rem;
    line-height: 1.12;
    font-weight: 950;
  }

  .reveal .career-fair .yt-link {
    justify-self: start;
    display: inline-flex;
    gap: 0.42rem;
    align-items: center;
    width: fit-content;
    padding: 0.42rem 0.7rem;
    border: 4px solid var(--cf-ink);
    border-radius: 18px;
    background: #ffffff;
    color: var(--cf-ink) !important;
    font-size: 1.05rem;
    font-weight: 950;
    line-height: 1;
    text-decoration: none !important;
    box-shadow: 0.14rem 0.14rem 0 rgba(7, 19, 38, 0.2);
  }

  .reveal .career-fair .yt-link:focus,
  .reveal .career-fair .yt-link:hover {
    background: #fff1f2;
    color: #be123c !important;
  }

  .reveal .career-fair .yt-play {
    display: inline-grid;
    width: 1.65rem;
    height: 1.65rem;
    place-items: center;
    border-radius: 999px;
    background: #ef4444;
    color: #ffffff;
    font-size: 0.92rem;
    line-height: 1;
  }

  .reveal .career-fair .video-wrap {
    width: min(100%, 760px);
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border: 5px solid var(--cf-ink);
    border-radius: 20px;
    background: #102033;
    box-shadow: 0.2rem 0.2rem 0 rgba(7, 19, 38, 0.22);
  }

  .reveal .career-fair .video-wrap iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .reveal .career-fair.video-full {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: #102033;
  }

  .reveal .career-fair.video-full .video-wrap {
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .reveal .career-fair.video-full .video-wrap iframe {
    display: block;
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    max-height: none !important;
  }

  .slide-container.expanded .reveal .career-fair {
    padding: clamp(0.55rem, 2vh, 1.5rem) clamp(0.75rem, 2.4vw, 1.9rem);
    border-width: clamp(5px, 1vh, 10px);
    border-radius: clamp(24px, 3vw, 38px);
  }

  .slide-container.expanded .reveal .career-fair.video-full {
    padding: 0;
    border-width: 0;
    border-radius: 0;
  }

  .slide-container.expanded .reveal .career-fair.recipe-slide {
    padding: 0;
    border-width: 0;
    border-radius: 0;
  }

  .slide-container.expanded .reveal .career-fair.agenda-slide {
    padding: 0;
    border-width: 0;
    border-radius: 0;
  }

  .slide-container.expanded .reveal .career-fair .stage,
  .slide-container.expanded .reveal .career-fair .stage.flip {
    gap: clamp(0.8rem, 2.5vw, 2.2rem);
  }

  .slide-container.expanded .reveal .career-fair h2 {
    font-size: clamp(3.3rem, min(7vw, 10vh), 7.25rem);
  }

  .slide-container.expanded .reveal .career-fair p,
  .slide-container.expanded .reveal .career-fair .question,
  .slide-container.expanded .reveal .career-fair .tile,
  .slide-container.expanded .reveal .career-fair .prompt,
  .slide-container.expanded .reveal .career-fair .microsoft-lockup,
  .slide-container.expanded .reveal .career-fair .yt-link {
    font-size: clamp(1.18rem, min(2.2vw, 3.6vh), 2.55rem);
  }

  .slide-container.expanded .reveal .career-fair .hero-word {
    font-size: clamp(4.15rem, min(9vw, 13vh), 9rem);
  }

  .slide-container.expanded .reveal .career-fair .eyebrow {
    border-width: clamp(3px, 0.6vh, 5px);
    font-size: clamp(0.82rem, min(1.25vw, 2vh), 1.45rem);
  }

  .slide-container.expanded .reveal .career-fair .eyebrow-text {
    padding: clamp(0.2rem, 0.7vh, 0.36rem) clamp(0.68rem, 1.4vw, 1rem) clamp(0.18rem, 0.65vh, 0.34rem)
      clamp(0.56rem, 1.1vw, 0.9rem);
  }

  .slide-container.expanded .reveal .career-fair .visual img {
    width: min(48vw, 680px);
    max-height: 68vh;
  }

  .slide-container.expanded .reveal .career-fair .visual img.template-art {
    width: min(42vw, 620px);
    max-height: 62vh;
  }

  .slide-container.expanded .reveal .career-fair .recipe-art {
    width: auto;
    max-width: 92cqw;
    height: min(100cqh, 92cqw);
    max-height: 100cqh;
  }

  .slide-container.expanded .reveal .career-fair .center-image {
    width: min(46vw, 660px);
    max-height: 42vh;
  }

  .slide-container.expanded .reveal .career-fair .big-grid {
    gap: clamp(0.48rem, 1.8vw, 1.2rem);
  }

  .slide-container.expanded .reveal .career-fair .tile,
  .slide-container.expanded .reveal .career-fair .question,
  .slide-container.expanded .reveal .career-fair .prompt,
  .slide-container.expanded .reveal .career-fair .material-chain,
  .slide-container.expanded .reveal .career-fair .microsoft-lockup,
  .slide-container.expanded .reveal .career-fair .yt-link {
    padding: clamp(0.52rem, 1.5vh, 1rem) clamp(0.72rem, 1.5vw, 1.2rem);
    border-width: clamp(4px, 0.7vh, 6px);
    border-radius: clamp(18px, 2vw, 28px);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-grid {
    gap: clamp(0.18rem, 0.6vh, 0.45rem);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-content {
    gap: clamp(0.52rem, 1.35vh, 1.1rem);
    width: min(64%, 980px);
    padding: clamp(0.85rem, 2vh, 1.8rem) clamp(0.95rem, 2.2vw, 2rem);
    border-right-width: clamp(3px, 0.5vh, 6px);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-kicker {
    padding: clamp(0.3rem, 0.75vh, 0.56rem) clamp(0.7rem, 1.35vw, 1.2rem);
    border-width: clamp(3px, 0.55vh, 5px);
    font-size: clamp(0.98rem, min(1.55vw, 2.25vh), 1.7rem);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-content h2 {
    font-size: clamp(3.2rem, min(6.1vw, 9vh), 7rem);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-facts {
    gap: clamp(0.26rem, 0.85vh, 0.7rem);
  }

  .slide-container.expanded .reveal .career-fair .arctic-vault-facts li {
    padding: clamp(0.42rem, 1vh, 0.82rem) clamp(0.58rem, 1.15vw, 1.1rem);
    border-left-width: clamp(6px, 0.9vh, 10px);
    border-radius: clamp(8px, 1.2vh, 16px);
    font-size: clamp(1.18rem, min(2.05vw, 3.15vh), 2.38rem);
  }

  .slide-container.expanded .reveal .career-fair .material-chain {
    gap: clamp(0.18rem, 0.7vh, 0.42rem) clamp(0.3rem, 0.9vw, 0.65rem);
    width: min(100%, 760px);
  }

  .slide-container.expanded .reveal .career-fair .chain-step {
    min-height: clamp(3.15rem, 8.5vh, 6rem);
    padding: clamp(0.2rem, 0.8vh, 0.5rem) clamp(0.28rem, 0.8vw, 0.7rem);
    border-width: clamp(3px, 0.55vh, 5px);
    border-radius: clamp(14px, 1.7vw, 24px);
  }

  .slide-container.expanded .reveal .career-fair .chain-symbol {
    min-width: clamp(1.55rem, 3.6vh, 3rem);
    min-height: clamp(1.55rem, 3.6vh, 3rem);
    font-size: clamp(1.18rem, 3.2vh, 2.4rem);
  }

  .slide-container.expanded .reveal .career-fair .chain-step.silicon .chain-symbol {
    font-size: clamp(0.88rem, 2.4vh, 1.8rem);
  }

  .slide-container.expanded .reveal .career-fair .chain-label {
    font-size: clamp(0.62rem, min(1.25vw, 1.9vh), 1.3rem);
  }

  .slide-container.expanded .reveal .career-fair .chain-arrow {
    font-size: clamp(1.45rem, 3.8vh, 3.1rem);
  }

  .slide-container.expanded .reveal .career-fair.origin-chain .copy {
    gap: clamp(0.18rem, 0.65vh, 0.36rem);
  }

  .slide-container.expanded .reveal .career-fair.origin-chain h2 {
    font-size: clamp(2.85rem, min(5.6vw, 7.6vh), 5.6rem);
  }

  .slide-container.expanded .reveal .career-fair.origin-chain .material-chain {
    gap: clamp(0.12rem, 0.45vh, 0.3rem) clamp(0.22rem, 0.7vw, 0.5rem);
    padding: clamp(0.32rem, 0.9vh, 0.62rem) clamp(0.5rem, 1vw, 0.9rem);
  }

  .slide-container.expanded .reveal .career-fair.origin-chain .chain-step {
    min-height: clamp(2.5rem, 6.8vh, 4.8rem);
  }
</style>

<div class="career-fair agenda-slide">
  <img
    class="agenda-art"
    src="/media/career-fair/0-agenda.png"
    alt="Agenda: introduction, what do I do, how did I get there, fun and interesting parts, skills and advice, and let's talk"
  />
</div>

Note:
Use this as the visual roadmap for the original career fair template sections.

---

<div class="career-fair sunny origin-chain">
  <div class="stage">
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🤓</span><span class="eyebrow-text">Amazing fact</span></span>
      <h2>We tricked rocks into thinking!</h2>
      <div class="material-chain fragment" aria-label="Rock to sand to silicon to computer chip plus code">
        <div class="chain-step rock">
          <span class="chain-symbol" aria-hidden="true">🪨</span>
          <span class="chain-label">Rock</span>
        </div>
        <div class="chain-arrow one" aria-hidden="true">→</div>
        <div class="chain-step sand">
          <span class="chain-symbol" aria-hidden="true">🏖️</span>
          <span class="chain-label">Sand</span>
        </div>
        <div class="chain-arrow down" aria-hidden="true">↓</div>
        <div class="chain-step silicon">
          <span class="chain-symbol">Si</span>
          <span class="chain-label">Silicon</span>
        </div>
        <div class="chain-arrow two" aria-hidden="true">→</div>
        <div class="chain-step chip">
          <span class="chain-symbol" aria-hidden="true">💻</span>
          <span class="chain-label">Computer chip + code</span>
        </div>
      </div>
    </div>
    <div class="visual">
      <img
        class="template-art yellow"
        src="/media/career-fair/rock-thinking.png"
        alt="A smiling rock thinking about a brain"
      />
    </div>
  </div>
</div>

Note:
Open with the mystery, then point through the chain. Say: rocks become sand, sand helps make silicon, silicon becomes computer chips, and code gives chips instructions.

---

<div class="career-fair blue-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art green"
        src="/media/career-fair/1-introduction.png"
        alt="Introduction illustration with a waving hand and speech bubble"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">👋</span><span class="eyebrow-text">Introduction: David Pine</span></span>
      <h2>I build software.</h2>
      <div class="microsoft-lockup" aria-label="Microsoft">
        <span class="microsoft-mark" aria-hidden="true">
          <span class="red"></span>
          <span class="green"></span>
          <span class="blue"></span>
          <span class="yellow"></span>
        </span>
        <span>Microsoft</span>
      </div>
      <div class="question green fragment">Did you use an app, game, or AI this week?</div>
    </div>
  </div>
</div>

Note:
This directly answers the introduction template: name, job, and workplace. Translate software engineer as someone who helps computers do useful things.

---

<div class="career-fair green-pop compact">
  <div class="stage">
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">💻</span><span class="eyebrow-text">What do I do?</span></span>
      <h2>I turn ideas into apps.</h2>
      <div class="big-grid fragment">
        <div class="tile blue">Listen</div>
        <div class="tile yellow">Plan</div>
        <div class="tile green">Code</div>
        <div class="tile orange">Test</div>
        <div class="tile purple">Fix</div>
        <div class="tile pink">Help</div>
      </div>
    </div>
    <div class="visual">
      <img
        class="template-art"
        src="/media/career-fair/2-what-do-i-do.png"
        alt="What do I do illustration with code on a screen"
      />
    </div>
  </div>
</div>

Note:
This answers what I do and what a typical day looks like: listen, plan, code, test, fix, and help people.

---

<div class="career-fair orange-pop">
  <div class="center-stage">
    <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">💡</span><span class="eyebrow-text">Your turn</span></span>
    <h2>What would you improve?</h2>
    <span class="hero-word magic">One idea:</span>
    <div class="big-grid two">
      <div class="tile blue fragment">School</div>
      <div class="tile green fragment">Home</div>
      <div class="tile purple fragment">A robot</div>
      <div class="tile yellow fragment">A game</div>
    </div>
  </div>
</div>

Note:
This should come early so they feel part of the talk. Collect one or two concrete ideas before moving on.

---

<div class="career-fair sunny">
  <div class="center-stage recipe-stage">
    <img
      class="template-art purple recipe-art"
      src="/media/career-fair/code-as-a-recipe.png"
      alt="A code recipe card showing instructions that greet David"
    />
  </div>
</div>

Note:
Use a simple example: if the button is clicked, the character jumps.

--

<div class="career-fair purple-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art yellow"
        src="/media/career-fair/rock-thinking.png"
        alt="A thinking rock representing an AI mission"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🤖</span><span class="eyebrow-text">Optional AI moment</span></span>
      <h2>Tell AI exactly what to do.</h2>
      <div class="prompt fragment">Design a classroom helper. Give it a name and 3 jobs.</div>
    </div>
  </div>
</div>

Note:
Use only if you want the demo. Ask them what to change in the prompt.

--

<div class="career-fair green-pop">
  <div class="center-stage">
    <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">📡</span><span class="eyebrow-text">No Wi-Fi?</span></span>
    <h2>We can still think like coders.</h2>
    <div class="big-grid">
      <div class="tile blue fragment">Idea</div>
      <div class="tile purple fragment">Steps</div>
      <div class="tile green fragment">Result</div>
    </div>
    <div class="question fragment">Pick one idea. What happens first?</div>
  </div>
</div>

Note:
This backup keeps the interaction alive even without a live AI tool.

---

<div class="career-fair blue-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art orange"
        src="/media/career-fair/3-how-did-i-get-there.png"
        alt="How did I get there illustration with a winding road and flag"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🧭</span><span class="eyebrow-text">How I got there</span></span>
      <h2>I learned by doing.</h2>
      <div class="big-grid two">
        <div class="tile blue fragment">Ask</div>
        <div class="tile yellow fragment">Learn</div>
        <div class="tile orange fragment">4-year college</div>
        <div class="tile green fragment">Build</div>
      </div>
    </div>
  </div>
</div>

Note:
This answers the path/training question: stay curious, earn a bachelor's degree at a 4-year college, practice, build small projects, and share with people who help you grow.

---

<div class="career-fair full-photo-slide">
  <div class="full-photo-frame valve-hammer-photo">
    <img
      class="full-slide-photo"
      src="/media/career-fair/valve-hammer-3d.png"
      alt="A 3D valve hammer from a self-taught video game development project"
    />
    <div class="full-photo-label">Middleschool : Self-taught video game dev</div>
  </div>
</div>

---

<div class="career-fair orange-pop">
  <div class="stage">
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🐞</span><span class="eyebrow-text">Interesting challenge</span></span>
      <h2>Bugs help us learn.</h2>
      <div class="big-grid fragment">
        <div class="tile blue">Find it</div>
        <div class="tile orange">Try a fix</div>
        <div class="tile green">Test again</div>
      </div>
    </div>
    <div class="visual">
      <img
        class="template-art orange"
        src="/media/career-fair/bugs-in-code.png"
        alt="A rock detective finding a bug in code"
      />
    </div>
  </div>
</div>

Note:
Make failure feel normal. Debugging is detective work.

---

<div class="career-fair blue-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art purple"
        src="/media/career-fair/4-fun-interesting-parts.png"
        alt="Fun and interesting parts illustration with a van, code bubble, and globe"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🚐</span><span class="eyebrow-text">Fun part</span></span>
      <h2>Code can take you places.</h2>
      <div class="question fragment">Where would you teach code?</div>
    </div>
  </div>
</div>

Note:
If they ask, mention traveling across Serbia in a van to teach code.

---

<div class="career-fair full-photo-slide">
  <div class="full-photo-frame">
    <img
      class="full-slide-photo"
      src="/media/media.jpg"
      alt="David speaking with reporters and camera crews during a media interview"
    />
    <div class="full-photo-label">Serbian: National News</div>
  </div>
</div>

---

<div class="career-fair arctic-vault-slide">
  <div class="arctic-vault-grid" aria-hidden="true">
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-1.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-2.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-4.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-3.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-5.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-6.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-8.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-1-7.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-1.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-2.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-3.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-5.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-4.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-6.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-7.png" alt="" />
    <img src="/src/assets/slides/2026-04/career-fair/arctic-vault/scroll-2-8.png" alt="" />
  </div>
  <div class="arctic-vault-content">
    <span class="arctic-vault-kicker">Interesting part: cold storage</span>
    <h2><span>GitHub:</span> <span class="arctic-vault-title-pop">Arctic Code Vault</span></h2>
    <ul class="arctic-vault-facts">
      <li><strong>About 820 feet deep</strong> in an Arctic mountain.</li>
      <li><strong>Svalbard</strong>, closer to the North Pole than the Arctic Circle.</li>
      <li><strong>02/02/2020</strong> snapshot of public GitHub code.</li>
      <li><strong>21 TB</strong> archived on 186 film reels for 1,000 years.</li>
    </ul>
  </div>
</div>

Note:
Source: [GitHub Archive Program Arctic Vault](https://archiveprogram.github.com/arctic-vault/). The slide uses the Arctic Vault page images and facts from the GitHub Archive Program: Svalbard, about 820 feet deep, the 02/02/2020 public-code snapshot, 21TB, 186 film reels, and 1,000-year cold storage. Press down for the optional embedded video slide.

--

<div class="career-fair video-full">
  <div class="video-wrap">
    <iframe
      src="https://www.youtube.com/embed/fzI9FNjXQ0o"
      title="GitHub Archive Program cold storage video"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</div>

Note:
Use this only if there is time and the connection cooperates. Press up to return to the main cold storage slide.

---

<div class="career-fair green-pop">
  <div class="center-stage">
    <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">✨</span><span class="eyebrow-text">Best part</span></span>
    <h2>Your ideas can become real.</h2>
    <div class="big-grid">
      <div class="tile blue fragment">Create</div>
      <div class="tile green fragment">Help</div>
      <div class="tile purple fragment">Solve problems</div>
    </div>
  </div>
</div>

Note:
This replaces tool talk. If they ask about tools, answer verbally and keep moving.

---

<div class="career-fair sunny">
  <div class="stage">
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">👂</span><span class="eyebrow-text">Secret superpower</span></span>
      <h2>Listen first.</h2>
      <span class="hero-word hot fragment">Collaborate. Then build.</span>
    </div>
    <div class="visual">
      <img
        class="template-art green"
        src="/media/career-fair/5-skills-advice.png"
        alt="People and puzzle pieces representing listening and teamwork"
      />
    </div>
  </div>
</div>

Note:
Tie back to the event theme: listening closely is a career skill and a life skill.

---

<div class="career-fair green-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art green"
        src="/media/career-fair/5-skills-advice.png"
        alt="Skills and advice illustration with puzzle pieces, people, and speech bubble"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🧩</span><span class="eyebrow-text">Skills + advice</span></span>
      <h2>Start small.</h2>
      <div class="big-grid fragment">
        <div class="tile blue">Ask</div>
        <div class="tile yellow">Listen</div>
        <div class="tile green">Explain</div>
        <div class="tile orange">Try</div>
        <div class="tile purple">Team up</div>
        <div class="tile pink">Practice</div>
      </div>
    </div>
  </div>
</div>

Note:
This directly answers skills and advice: curiosity, active listening, communication, teamwork, and practice.

---

<div class="career-fair purple-pop">
  <div class="stage flip">
    <div class="visual">
      <img
        class="template-art"
        src="/media/career-fair/6-questions.png"
        alt="Let's talk illustration with question speech bubbles"
      />
    </div>
    <div class="copy">
      <span class="eyebrow"><span class="eyebrow-icon" aria-hidden="true">🙋</span><span class="eyebrow-text">Questions</span></span>
      <h2>Ask me anything.</h2>
      <div class="big-grid two">
        <div class="tile blue fragment">My job</div>
        <div class="tile green fragment">Microsoft</div>
        <div class="tile orange fragment">AI</div>
        <div class="tile pink fragment">Apps</div>
      </div>
    </div>
  </div>
</div>

Note:
End with questions. If nobody starts, point at one tile and answer it yourself quickly, then ask again.
