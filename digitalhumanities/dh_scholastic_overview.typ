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
    columns: (1fr, 3fr, auto, 1fr, 1.5fr), 
    table.header([*Author*], [*Text*], [*Year*], [*School*], [*Notes*]),
    [Roberto Busa], ["The Annals of Humanities Computing: The Index Thomisticus"], [1980], [CAAL (Italy)], [Lemmatization, machine-readable corpus],
    [journal...], [Digital Scholarship in the Humanities (Journal, formerly LLC) is established], [1986], [], [],
    [Jerome McGann], [Radiant Textuality: Literature after the World Wide Web], [2001], [UVA], [Deformance, social editing, non-linear textuality],
    [Susan Schreib-\man, Ray Siemens, and John Unsworth (Eds.)], [A Companion to Digital Humanities], [2004], [], [],
    [Susan Hockey], ["The History of Humanities Computing" (Foundational essay)], [2004], [], [],
    [Bethany Nowviskie], ["Speculative Computing: Aesthetic Provocations in Humanities Computing"], [2004], [UVA, DLF, JMU], [Speculative Computing, Patacritical design and digital cultural heritage labor],
    [journal...], [Digital Humanities Quarterly (DHQ) begins publication (Open-access theory hub)], [2007], [], [],
    [Matthew Kirschen-\baum], [Mechanisms: New Media and the Forensic Imagination], [2008], [Maryland], [Forensic Materiality, physical hardware & bitstreams],
    [Johanna Drucker], [SpecLab: Digital Aesthetics and Projects in Speculative Computing], [2009], [UVA, UCLA], [Speculative Computing & Aesthetics, Graphesis, Visual Epistemology over Data Visualization],
    [Stephen Ramsay], [Reading Machines: Toward an Algorithmic Criticism], [2011], [UVA, Nebraska], [Algorithmic Criticism, Screwmanship, code to  provoke new interpretations],
    [Matthew K. Gold & Lauren F. Klein (Eds.)], [Debates in the Digital Humanities (First volume)], [2012], [Georgia Tech, Emory], [Critical / Feminish DH, Data Feminism, Intersectionality in Archival recovery],
    [Alan Liu], ["Where is Cultural Criticism in the Digital Humanities?"], [2012], [UCSB], [DH & Cultural Criticism (laws of cool)],
    [Safiya Umoja Noble], [Algorithms of Oppression], [2018], [UCLA, USC], [Critical Infrastructure, Algorithmic Bias and the politics of search engines],
    [Catherine D'Ignazio & Lauren F. Klein], [Data Feminism], [2020],  
[], [],
    [journal...], [Reviews in Digital Humanities (Journal) begins publication], [2020], [], []
  )
]
