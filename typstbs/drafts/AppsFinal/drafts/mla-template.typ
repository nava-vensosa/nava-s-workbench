// ============================================
// MLA Essay Template
// ============================================
// Configure these variables for your essay:

#let author = "Your Name"
#let professor = "Professor Name"
#let course = "Course Name"
#let date = "Date"
#let title = "Essay Title"
#let bib-file = "citations.bib"  // Path to your bibliography file

// ============================================
// MLA Formatting (do not modify below)
// ============================================

#set page(
  width: 8.5in,
  height: 11in,
  margin: 1in,
  header: context align(right)[#author.split(" ").last() #counter(page).display()],
)

#set text(font: "Times New Roman", size: 12pt)
#set par(
  first-line-indent: 0.5in,
  justify: true,
  leading: 2em,
  spacing: 2em,
)
#set heading(numbering: none)
#show heading: set block(above: 2em, below: 0em)
#show heading: it => {
  it
  par(first-line-indent: 0pt)[#text(size: 0pt)[#h(0pt)]]
}

// ============================================
// MLA Header (no title page)
// ============================================

#author \
#professor \
#course \
#date \

#set align(center)
#title
#set align(left)

// ============================================
// Essay Body
// ============================================

=== Section One

#lorem(50)

=== Section Two

#lorem(50)

=== Section Three

#lorem(50)

// ============================================
// Works Cited
// ============================================

#pagebreak()

#set par(
  first-line-indent: 0em,
  hanging-indent: 0.5in,
)

#set align(center)
*Works Cited*
#set align(left)

#bibliography(bib-file, style: "mla", full: true, title: none)
