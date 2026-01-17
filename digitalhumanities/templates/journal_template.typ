#import "section-formatter.typ": section-formatter

#let title = section-formatter(
  font-family: "Montserrat",
  font-size: 22pt,
  hex1: rgb("#ff0000"),
  hex2: rgb("#000000"),
  mla-tracking-squeeze: 100%,
  indent-first-line: true
)

#let body = section-formatter(
  font-family: "Montserrat",
  font-size: 18pt,
  hex1: rgb("#000000"),
  hex2: rgb("#ffffff"),
  mla-tracking-squeeze: 100%,
  indent-first-line: false
)

#let time = body(gradient-slice: 6)

#let text = body(gradient-slice: 4)

#show: title(gradient-slice: 7)

DATE

#line(length: 100%, stroke: 2pt + gray)

#show: time

*TIME* 

#show: text

#lorem(10)
