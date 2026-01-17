// mla-works-cited.typ

#let mla-works-cited(bib-file) = {
  if bib-file != none {
    pagebreak()
    
    // MLA Works Cited formatting
    // Center the title "Works Cited"
    // Typst's bibliography function handles the hanging indent and ordering.
    // We ensure the title is explicit if needed, or let Typst handle it.
    // Typst default "mla" style usually adds the title "Works Cited".
    
    set par(first-line-indent: 0pt) 
    
    bibliography(bib-file, style: "mla", title: [Works Cited])
  }
}
