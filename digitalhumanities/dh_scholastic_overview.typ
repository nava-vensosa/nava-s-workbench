#import "templates/section-formatter.typ": section-formatter

#let title = section-formatter(
  font-family: "Montserrat",
  font-size: 22pt,
  hex1: rgb("#000000"),
  hex2: rgb("#8300ff"),
  mla-tracking-squeeze: 100%,
  indent-first-line: true
)

#let body = section-formatter(
  font-family: "Montserrat",
  font-size: 18pt,
  hex1: rgb("#444444"),
  hex2: rgb("#aa3faa"),
  mla-tracking-squeeze: 100%,
  indent-first-line: false
)

#let header = title(gradient-slice: 6)

#let subheader = body(gradient-slice: 6)

#let body-text = body(gradient-slice: 4)

#show: header

Digital Humanities Scholastic Overview
#line(length: 100%, stroke: 2pt + rgb("#aa3faa"))

#show: subheader

*Chronology* 

#show: body-text

#text(size: 11pt)[
  #table(
    columns: (1.5fr, 3fr, auto, 1fr, 1.7fr), 
    table.header([*Author*], [*Text*], [*Year*], [*School*], [*Notes*]),
    [Roberto Busa], ["The Annals of Humanities Computing: The Index Thomisticus"], [1980], [CAAL (Italy)], [Lemmatization, machine-readable corpus],
    [journal...], [Digital Scholarship in the Humanities (Journal, formerly LLC) is established], [1986], [], [],
    [Jerome McGann], [Radiant Textuality: Literature after the World Wide Web], [2001], [UVA], [Deformance, social editing, non-linear textuality],
    [Susan Schreibman, Ray Siemens, and John Unsworth (Eds.)], [A Companion to Digital Humanities], [2004], [], [],
    [Susan Hockey], ["The History of Humanities Computing" (Foundational essay)], [2004], [], [],
    [Bethany Nowviskie], ["Speculative Computing: Aesthetic Provocations in Humanities Computing"], [2004], [UVA, DLF, JMU], [Speculative Computing, Patacritical Design, digital cultural heritage labor, DH & Aesthetics],
    [journal...], [Digital Humanities Quarterly (DHQ) begins publication (Open-access theory hub)], [2007], [], [],
    [Matthew Kirschenbaum], [Mechanisms: New Media and the Forensic Imagination], [2008], [Maryland], [Forensic Materiality, bitstreams & hardware],
    [Johanna Drucker], [SpecLab: Digital Aesthetics and Projects in Speculative Computing], [2009], [UVA, UCLA], [Speculative Computing, DH & Aesthetics, graphesis, visual epiqstemology over data visualization],
    [Stephen Ramsay], [Reading Machines: Toward an Algorithmic Criticism], [2011], [UVA, Nebraska], [Algorithmic Criticism, Screwmanship],
    [Matthew K. Gold & Lauren F. Klein (Eds.)], [Debates in the Digital Humanities (First volume)], [2012], [], [],
    [Alan Liu], ["Where is Cultural Criticism in the Digital Humanities?"], [2012], [UCSB], [DH & Cultural Criticism],
    [Safiya Umoja Noble], [Algorithms of Oppression], [2018], [UCLA, USC], [Critical Inf5astructure, Algorithmic bias and the politics of search engines],
    [Catherine D'Ignazio & Lauren F. Klein], [Data Feminism], [2020], [Georgia Tech, Emory], [Data Feminism, intersectionality in Archival Recovery],
    [journal...], [Reviews in Digital Humanities (Journal) begins publication], [2020], [], []
  )
]
