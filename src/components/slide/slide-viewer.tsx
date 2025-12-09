import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import type Reveal from "reveal.js";

// Import reveal.js CSS from npm package
import "reveal.js/dist/reveal.css";
import "reveal.js/plugin/highlight/monokai.css";

// Theme configuration for slide cards
const SLIDE_THEME_CONFIG: Record<
  string,
  {
    background: string;
    textColor: string;
    titleColor: string;
  }
> = {
  black: { background: "#191919", textColor: "#fff", titleColor: "#fff" },
  white: { background: "#fff", textColor: "#222", titleColor: "#222" },
  league: { background: "#2b2b2b", textColor: "#eee", titleColor: "#eee" },
  beige: { background: "#f7f3de", textColor: "#333", titleColor: "#333" },
  sky: { background: "#add9e4", textColor: "#333", titleColor: "#333" },
  night: { background: "#111", textColor: "#eee", titleColor: "#eee" },
  serif: { background: "#f0f1eb", textColor: "#000", titleColor: "#000" },
  simple: { background: "#fff", textColor: "#000", titleColor: "#000" },
  solarized: { background: "#fdf6e3", textColor: "#657b83", titleColor: "#657b83" },
  blood: { background: "#222", textColor: "#eee", titleColor: "#eee" },
  moon: { background: "#002b36", textColor: "#93a1a1", titleColor: "#93a1a1" },
  dracula: { background: "#282a36", textColor: "#f8f8f2", titleColor: "#f8f8f2" },
};

function getThemeBackgroundAttrs(theme: string): string {
  const config = SLIDE_THEME_CONFIG[theme] || SLIDE_THEME_CONFIG.black;
  return `data-background-color="${config.background}"`;
}

function generatePreviewStyles(theme: string, uniqueId: string): string {
  const config = SLIDE_THEME_CONFIG[theme] || SLIDE_THEME_CONFIG.black;
  const safeId = uniqueId.replace(/:/g, "-");

  return `
    .reveal-${safeId} .slides section {
      background: ${config.background} !important;
      padding-top: 30px;
    }
    .reveal-${safeId} .slides section h1,
    .reveal-${safeId} .slides section h2 {
      color: ${config.titleColor} !important;
      font-size: 32px !important;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      line-height: 1.2;
    }
    .reveal-${safeId} .slides section p,
    .reveal-${safeId} .slides section em {
      color: ${config.textColor} !important;
      font-size: 20px !important;
      line-height: 1.2 !important;
    }
    .reveal-${safeId} .slides section em {
      font-style: normal !important;
    }
    .reveal-${safeId} .reveal-viewport {
      border-radius: 0.5rem;
    }
  `;
}

interface SlideViewerProps {
  content: string;
  theme?: string;
  transition?: string;
  controls?: boolean;
  progress?: boolean;
  preview?: boolean;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  content,
  theme = "black",
  transition = "slide",
  controls = true,
  progress = true,
  preview = false,
}) => {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<Reveal.Api | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [stylesInjected, setStylesInjected] = useState(false);
  const uniqueId = useId();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load theme CSS dynamically (shared across instances)
  useEffect(() => {
    if (!isClient) return;

    const loadTheme = () => {
      // Check if this theme is already loaded globally
      const existingTheme = document.querySelector(`link[data-reveal-theme="${theme}"]`);
      if (existingTheme) {
        setThemeLoaded(true);
        return;
      }

      // Add new theme link
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/theme/${theme}.css`;
      link.setAttribute("data-reveal-theme", theme);
      link.onload = () => setThemeLoaded(true);
      link.onerror = () => {
        console.warn(`Failed to load theme: ${theme}`);
        setThemeLoaded(true);
      };
      document.head.appendChild(link);
    };

    loadTheme();
  }, [theme, isClient]);

  // Inject dynamic theme styles for preview mode
  useEffect(() => {
    if (!isClient || !preview) return;

    const styleId = `slide-theme-${uniqueId.replace(/:/g, "-")}`;

    // Remove existing styles for this instance
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new styles
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = generatePreviewStyles(theme, uniqueId);
    document.head.appendChild(styleElement);

    setStylesInjected(true);

    // Cleanup function
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [theme, isClient, preview, uniqueId]);

  // Initialize Reveal.js
  useEffect(() => {
    if (!deckRef.current || !isClient || !themeLoaded || (preview && !stylesInjected)) return;

    // Add a small random delay to prevent multiple instances from initializing simultaneously
    const initDelay = Math.random() * 200 + 50; // 50-250ms random delay

    const timer = setTimeout(async () => {
      await initializeReveal();
    }, initDelay);

    const initializeReveal = async () => {
      try {
        // Dynamically import reveal.js and plugins only on client side
        const { default: Reveal } = await import("reveal.js");
        const { default: Highlight } = await import("reveal.js/plugin/highlight/highlight.esm.js");
        const { default: RevealMarkdown } = await import("reveal.js/plugin/markdown/markdown.esm.js");
        const { default: Notes } = await import("reveal.js/plugin/notes/notes.esm.js");

        // Create HTML structure for reveal.js
        const backgroundAttrs = preview ? getThemeBackgroundAttrs(theme) : "";
        const slidesHtml = `\
          <section data-markdown ${backgroundAttrs}>
            <script type="text/template">
              ${content}
            </script>
          </section>`;

        // Set the HTML content
        if (deckRef.current && !revealRef.current) {
          // Add unique class to container for CSS isolation
          deckRef.current.className = `reveal reveal-${uniqueId.replace(/:/g, "-")}`;
          deckRef.current.innerHTML = `<div class="slides">${slidesHtml}</div>`;

          // Initialize reveal.js in embedded mode
          revealRef.current = new Reveal(deckRef.current, {
            hash: false,
            controls,
            progress,
            transition: transition as "none" | "fade" | "slide" | "convex" | "concave" | "zoom",
            plugins: [RevealMarkdown, Highlight, Notes],
            markdown: { smartypants: true },
            embedded: true,
            width: "100%",
            height: "100%",
          });

          await revealRef.current.initialize();
        }
      } catch (error) {
        console.error(`Failed to initialize reveal.js for ${uniqueId}:`, error);
      }
    };

    return () => {
      clearTimeout(timer);
      if (revealRef.current) {
        try {
          revealRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying reveal.js instance:", error);
        }
        revealRef.current = null;
      }
    };
  }, [content, theme, transition, controls, progress, preview, isClient, themeLoaded, stylesInjected, uniqueId]);

  return (
    <div
      className={`reveal reveal-container-${uniqueId.replace(/:/g, "-")}`}
      ref={deckRef}
      style={{ width: "100%", height: "100%" }}
    >
      {!isClient && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
          }}
        >
          Loading...
        </div>
      )}
      {/* Slides will be injected here */}
    </div>
  );
};

export default SlideViewer;
