# DWD Week 4 - Notes
---

Web Design!

1) Research - Context
  - Is this a product design website? Marketing website? Nonprofit Website? Academic? What is this? Web product like figma or runway?
2) Research - Requirements
  - What are the UX requirements?
  - What are the client's specifications?
    - functionality
    - design
    - accessibility
    - SEO
    - maintenance and support
    - hosting
    - timeline
3) Research - Information Architecture
  - Sequence Diagrams
  - User Flows
  - Wireframes
4) Sketches
  - Sketches don't have to be good -- in fact, they shouldn't be; don't waste time in this phase
5) Wireframing
  - Computerize your sketches so they're presentable
  - Plan responsiveness across devices
6) Visual Design
7) Style Guide
  - Colors & Information Hierarchy
8) Reverse Engineering Designs
  - Learn from other designers and websites


--- 
Web Design Overview

1. HTML
  - HTML is the content of the page (doesn't include CSS / Styles)
  - DOM ???
    - Document Object Model -- HTML is a node tree; the document is the top, its children are elements (h1, p, etc.), and their children are text nodes or attribute nodes (id, class, src, etc.)
2. Devtools: Interactive JS in the Console
3. CSS: Cascading Style Sheets
  - Selector, Property, Property Value
  - selector { property: value; }
  - Typography, Color, Padding, Border, Margin properties can be controlled by CSS
  - in CSS, in the DOM, everything is a box -- Box Model !!!
    - Box Model is 4 shells of boxes: content, padding, border, and margin
      - Margin is most external, Border is within that, Padding is within that, Content is within that
      - When sketching, plan your content layout with cells accounting for this CSS organization
  - Ask to see the Specificity of CSS slide again...
  - Units
    - px, rem, %, vw, vh
    - px: pixels
    - rem: relative to root font size
    - %: relative to parent element
    - vw: relative to viewport width
    - vh: relative to viewport height
  - Flexbox will help with layout & inheritence if % is confusing...
  - remember clamping your rem helps with repsonsiveness!
  - Position
    - Not the position itself, but how the box behaves positionally
      - Relative positioning will be based on "where it should have been"
      - Absolute positioning will be relative to the previous relative position
        - An absolute child with a relative parent will be relatively positioned within the parent's box, whose position is relative to its own parent
        - This is probably a waste of time -- it could be done with just relative...
      - Fixed positioning will remain in place on the viewport despite scrolling
        - Doesn't work with zoom!
  - Layout
    - DOM Display: block, inline, inline-block
    - Layouts used to be very hard to achieve
    - Flexbox fixed it
  - Flexbox
    - Flexbox is a layout system in CSS
    - Complicated layouts can be nested within one another
    - The way you make somethign a flex element is you take the containner and you put this display flex css attribute on it and then you can start working with the flex system
    -* Flexbox CSS Guide on css-tricks.com

- N.b. @media tag helps with media queries and responsiveness

- Async & XML (AJAX) is coming (using Fetch API) without reloading a page
- Single Page Applications (SPAs) update the page content without reloading the page
  - Faster page loads, look at how fast ITP homepage navigates around its title links once it's loaded in in the first place
- Pull references and document how you design it all; Post that documentation in the GitHub

- Specificity!
  - * is universal/global, and can be used to override browser defaults, such that you have to specify the exact container values for each object (Margin, Border, Padding, Content)
  - From general to specific, the order is:
    - Universal Selector (* {padding:0;} -- sets all objects' padding to 0, overrides browser defaults)
    - Type Selector (h1 {font-size:1.5rem;}
    - Class Selector (.class {color:red;}
    - Attribute Selector ([type="text"] {color:blue;}
    - ID Selector (#id {color:green;}
