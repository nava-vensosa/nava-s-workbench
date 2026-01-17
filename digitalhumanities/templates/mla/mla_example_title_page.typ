#import "mla-paper.typ": mla
#import "mla-cover-page.typ": mla-cover-page
#import "mla-toc.typ": mla-toc

// Define the content for the front matter
#let my-front-matter = [
  #mla-cover-page(
    title: "The Comprehensive Effects of Placeholder Text on Modern Typesetting",
    subtitle: "A Thesis Submitted in Partial Fulfillment of the Requirements",
    name: "Alex Novak",
    instructor: "Dr. Eleanor Rigby",
    course: "Advanced Typesetting 404",
    date: "9 January 2026",
    institution: "University of Typography"
  )
  #mla-toc()
]

#show: doc => mla(
  title: "The Comprehensive Effects of Placeholder Text",
  name: "Alex Novak",
  instructor: "Dr. Eleanor Rigby",
  course: "Typesetting 404",
  date: "9 January 2026",
  bib-file: "works.bib",
  // Pass the front matter
  front-matter: my-front-matter,
  // Disable the standard inline header since we have a cover page
  show-title-block: false, 
  doc
)

= Introduction
#lorem(50) @smith2020

== Problem Statement
#lorem(40)

= Literature Review
#lorem(60)

== Historical Perspectives
#lorem(40) @doe2021

== Modern Interpretations
#lorem(50)

= Methodology
#lorem(40)
The methodology was strictly followed as per the standard typesetting guidelines. #footnote[Note that standard guidelines are subject to change in future Typst releases.] #lorem(13) #footnote[testing if this second footnote acts right]

#figure(
  rect(width: 80%, height: 2cm, fill: luma(240)),
  caption: [Methodological Framework Diagram]
)

= Results
#lorem(100)

= Discussion
#lorem(80) @typst2023

= Conclusion
#lorem(50)
