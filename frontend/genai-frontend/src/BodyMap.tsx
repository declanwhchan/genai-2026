
import BodySVG from '/anatomy/Male_template_with_organs.svg'
export default function BodyMap() {
  return <BodySVG />
}

// This lets you treat the SVG like a normal React component and style its internals with CSS/JS.

// ---

// ## How to find the actual IDs

// Once you can see the SVG source, there are 3 ways:

// **1. Open in VS Code and search:**
// Open the `.svg` file and do `Ctrl+F` → search for `id=` — you'll see every named element listed. Look for ones like `id="heart"`, `id="lung_left"` etc.

// **2. Open in browser DevTools:**
// Drag the SVG file into Chrome, right-click any organ shape → **Inspect** — the element panel shows the `id` and `class` right there.

// **3. Open in Figma (most visual):**
// Import the SVG, and the left-hand layers panel shows every named layer with its ID. You can visually click an organ and see its ID instantly.

// ---

// For the Wikimedia male template specifically, the IDs tend to look like this — but **verify them yourself** since file versions vary:

// #heart
// #lung_left / #lung_right  
// #liver
// #stomach
// #kidney_left / #kidney_right
// #brain
// #intestine_large / #intestine_small