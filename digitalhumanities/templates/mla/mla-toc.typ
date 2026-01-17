// mla-toc.typ

#let mla-toc() = {
  pagebreak()
  
  // No header on TOC usually, or Roman numerals. 
  // For simplicity in this MLA template, we keep standard flow but ensure title formatting.
  
  set par(first-line-indent: 0pt)
  
  align(center)[Table of Contents]
  
  v(1em)
  
  // Use standard outline but styled
  outline(
    title: none,
    indent: auto,
    depth: 3
  )
  
  pagebreak()
}
