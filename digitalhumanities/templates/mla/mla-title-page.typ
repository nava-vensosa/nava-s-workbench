// mla-title-page.typ

#let mla-title-header(name, instructor, course, date, title) = {
  // MLA Header is top-left, double spaced (standard)
  // No indentation for the header info
  set par(first-line-indent: 0pt)
  
  [
    #name \
    #instructor \
    #course \
    #date
  ]
  
  // Title is centered
  align(center)[#title]
}

