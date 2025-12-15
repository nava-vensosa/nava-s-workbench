// ================================
//  LEARN TYPST — COMPLETE GUIDE
//  Save as: learn-typst.typ
// ================================

#set page(width: 8.5in, height: 11in, margin: 1in)
#set par(justify: true)

// ----------------
// Title Page
// ----------------
= Learning Typst
A practical walkthrough of formatting, layout, and rendering.

#v(2em)
*Last Updated:* #datetime.today().display()

#pagebreak()

// ----------------
// 1. HEADINGS
// ----------------
= Heading Level 1
== Heading Level 2
=== Heading Level 3

You create headings with `=` at the start of a line.

#v(1em)

// ----------------
// 2. TEXT FORMATTING
// ----------------
*Bold*, _italic_, and `code`.

You can combine them: *bold and _italic_*.

Line breaks happen with a blank line.

Hard break:  
Use two spaces at end of a line.

// ----------------
// 3. LISTS
// ----------------
== Unordered List

- First item
- Second item
  - Nested item

== Ordered List

+ Step one
+ Step two
+ Step three

// ----------------
// 4. LINKS & REFERENCES
// ----------------
== Links

External link: https://typst.app

Internal reference:

= About Typst <about>
Typst is a modern markup-based typesetting system.

// Refer back: See @about.
// (References to headings require numbering to be enabled)

// ----------------
// 5. QUOTES & NOTES
// ----------------
== Quote

```quote
The limits of my language mean the limits of my world.
— Wittgenstein
```

== Sidebar / Admonition

```note
You can make notes using the `note` element.
```

// ----------------
// 6. MATH
// ----------------
== Math Mode

Inline math: $a^2 + b^2 = c^2$

Display math:

$
sum_(i=1)^n i = (n(n+1))/2
$

Matrices:

$
mat(
  1, 2;
  3, 4
)
$

Fractions and symbols:

$
f(x) = a/b + integral_0^infinity e^(-x^2) dif x + alpha + beta + gamma
$

// ----------------
// 7. TABLES
// ----------------
== Tables

#table(
  columns: 3,
  align: center,
  [Feature], [Typst], [LaTeX],
  [Syntax], [Clean], [Arcane],
  [Realtime], [Yes], [No]
)

// ----------------
// 8. IMAGES
// ----------------
== Images

// put an image file in the same folder
// e.g. example.png
// comment this out if you don't have one yet

// #import "example.png" as img
// #img(width: 50%)

// ----------------
// 9. CODE BLOCKS
// ----------------
== Code

```typst
= Title
Paragraph text goes here.
```

```rust
fn main() {
    println!("Hello from Rust!");
}
```

```python
for i in range(5):
    print(i)
```

// ----------------
// 10. PAGE LAYOUT
// ----------------
== Columns

#columns(2, gutter: 1em, [
  This text will be arranged in two columns within this specific block. The `gutter` parameter controls the spacing between the columns. This provides more granular control over layout for particular sections of your document, such as an abstract or a specific figure caption.
])

This text, following the `columns` block, will revert to the default page layout (e.g., single column if not explicitly set otherwise).


More sample text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Pellentesque habitant morbi tristique senectus et netus.

#v(2em)

// Reset to single column
#set page(columns: 1)

// ----------------
// 11. STYLES
// ----------------
== Custom Styling

#set heading(
  numbering: "1.1"
)

= Styled Heading
This heading uses custom styling.

Body styling:

#set text(font: "Times New Roman", size: 11pt)

This paragraph uses a different font and size.

// ----------------
// 12. VARIABLES & FUNCTIONS
// ----------------
== Variables

#let name = "Typst"
Hello, #name!

== Functions

#let square(x) = x * x

`square(4)` = #square(4)

#let greet(who: "world") = "Hello, " + who + "!"
#greet(who: "Typst")

// ----------------
// 13. BIBLIOGRAPHY (OPTIONAL)
// ----------------
// Requires a .bib file and:
// #bibliography("refs.bib")
// Then cite with: [@einstein1905]

// ----------------
// 14. EXPORTING
// ----------------
// Compile to PDF:
//   typst compile learn-typst.typ
//
// Watch mode:
//   typst watch learn-typst.typ
//
// With typst-preview:
//   typst-preview learn-typst.typ

// ----------------
// THE END
// ----------------
#pagebreak()
= Done!

You've learned core Typst formatting, math, layout, styling, functions, and structure.
Experiment by modifying and recompiling!
