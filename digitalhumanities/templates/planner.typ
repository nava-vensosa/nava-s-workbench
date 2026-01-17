#import "section-formatter.typ": section-formatter

#let title_temp = section-formatter(
  font-family: "Montserrat",
  font-size: 20pt,
  hex1: rgb("#99ff88"),
  hex2: rgb("#000000"),
  mla-tracking-squeeze: 80%,
  indent-first-line: false
)

#let text_temp= section-formatter(
  font-family: "Montserrat",
  font-size: 14pt,
  hex1: rgb("#1aff1a"),
  hex2: rgb("#000000"),
  mla-tracking-squeeze: 70%,
  indent-first-line: false
)

#let title = title_temp(gradient-slice: 3)
#let text = text_temp(gradient-slice: 5)


#show: title

Planner

#line(length: 100%, stroke: 1.2pt + rgb("#227a22"))

#show: text

#lorem(30)
