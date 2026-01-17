#import "section-formatter.typ": section-formatter

#let title_temp = section-formatter(
  font-family: "Montserrat",
  font-size: 20pt,
  hex1: rgb("#9988ff"),
  hex2: rgb("#000000"),
  mla-tracking-squeeze: 80%,
  indent-first-line: false
)

#let text_temp= section-formatter(
  font-family: "Montserrat",
  font-size: 14pt,
  hex1: rgb("#1a1aff"),
  hex2: rgb("#000000"),
  mla-tracking-squeeze: 70%,
  indent-first-line: false
)

#let title = title_temp(gradient-slice: 2)
#let text = text_temp(gradient-slice: 3)


#show: title

Stack

#line(length: 100%, stroke: 1.2pt + rgb("#4040aa"))

#show: text

- #lorem(8)
- #lorem(8)
- #lorem(8)

