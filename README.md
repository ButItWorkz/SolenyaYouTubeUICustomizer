# Solenya YouTube UI Customizer

## Abstract & Philosophy
The modern web frequently prioritizes homogenized, prescriptive design systems over individual user autonomy. Recently, standard user interfaces have increasingly imposed arbitrary limitations on viewport geometry—such as restricting the number of rendered items per row regardless of display scale—while simultaneously forcing the integration of auxiliary content (micro-video formats, community posts, and browser games) without providing native opt-out or customization mechanisms. 

Imposing overarching interface rules without granting users the freedom of configuration degrades the functional experience of the application. The end-user should always maintain the ultimate authority over how information is structured and delivered to their screen. 

**Solenya YouTube UI Customizer** is a custom UI engineering tool built to correct this imbalance. It utilizes native JavaScript MutationObservers and strict CSS mathematical recalculations to dynamically override the platform's layout constraints, restoring basic UI customization features to the user.

## Core Features

* **Viewport Geometry Override:** Overrides internal maximum-width variables to allow for mathematically perfect, user-defined column counts (e.g., forcing an adjustable integer-column grid that scales flawlessly with browser zoom).
* **Component Rendering Control:** Gives users the ability to selectively filter out unwanted DOM elements, keeping the viewport strictly focused on primary video content. Includes toggles to suppress:
  * Shorts shelves
  * Playables (integrated games)
  * Community Posts
  * Explore / Trending suggestions
  * Experimental generative AI search prompts (Beta)
* **Structural Normalization:** Actively parses the DOM to detect and collapse empty layout containers, "skeleton" placeholders, and integrated promotional banners that would otherwise disrupt the mathematical flow of the grid.
* **Dynamic State Observation:** Leverages an efficient `MutationObserver` to ensure custom UI constraints are maintained even as the platform's Single Page Application (SPA) architecture dynamically injects new content during infinite scrolling or page navigation.
* **Zero-Dependency Architecture:** Built entirely with vanilla JavaScript and native CSS. It operates efficiently within the browser without the overhead of external frameworks or libraries.

## Architecture & Methodology
The extension operates via a lightweight `content.js` script that acts as an intermediary between the browser's rendering engine and the platform's DOM. 
1. **Mathematical Flexbox Injection:** It injects a dynamically generated stylesheet that strips away the platform's rigid row wrappers (`ytd-rich-grid-row`) and forces the primary content container into a continuous, fractionally calculated Flexbox layout. 
2. **DOM Filtration:** As the platform's lazy-loading framework attempts to render new components, the script intercepts the nodes and applies user-defined display constraints, preventing the rendering of unselected content categories before they disrupt the visual flow.
3. **Hierarchical Normalization:** Actively overrides encapsulated Shadow DOM properties to flatten rigid row hierarchies, ensuring that all valid media elements participate in a single, continuous flex container while automatically eliminating vertical dead space.

## Installation Instructions

This extension is built on Manifest V3 and is fully compatible with Chromium-based browsers (Chrome, Edge, Brave, Vivaldi, etc.).

1. Download or clone this repository to your local machine.
2. Open your browser and navigate to the extensions management page (e.g., `chrome://extensions/`).
3. Enable **Developer Mode** (usually a toggle in the top right corner).
4. Click **Load unpacked** and select the directory containing the repository files.
5. Pin the extension to your toolbar to access the configuration interface and define your preferred grid geometry.

## Development Transparency

This project was engineered with the assistance of an AI Large Language Model (LLM). The AI functioned as a pair-programming collaborator, assisting with complex DOM telemetry analysis, viewport geometry calculations, and the reconciliation of encapsulated Shadow DOM hierarchies. The underlying architectural vision, operational constraints, and final code validation remain strictly human-driven.

## License

**MIT License**

Copyright (c) 2026 ButItWorkz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.