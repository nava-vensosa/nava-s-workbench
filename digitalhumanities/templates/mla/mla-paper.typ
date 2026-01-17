// mla-paper.typ

#import "section-formatter.typ": section-formatter
#import "mla-title-page.typ": mla-title-header
#import "mla-works-cited.typ": mla-works-cited

#let mla(
  title: "Paper Title",
  name: "Author Name",
  instructor: "Instructor Name",
  course: "Course Name",
  date: "Date",
  paper-size: "us-letter",
  bib-file: none,
  front-matter: none, // Content to appear before the main body (e.g., Cover Page, TOC)
  show-title-block: true, // Whether to show the standard MLA header (Name, Instructor...)
  body
) = {
  // --- Font Configuration ---
  // Using Liberation Serif as Times New Roman substitute
  let main-font = "Liberation Serif"
  let last_name = name.split(" ").last()

  // --- 1. Page Setup ---
  set page(
    paper: paper-size,
    margin: 1in,
    // Default Header: Surname and Page Number in top right
    header: context {
       align(right)[#last_name #counter(page).display()]
    }
  )

  // --- 2. Define Styles using section-formatter ---
  
  // A. Main Body Text
  let text-style-gen = section-formatter(
    font-family: main-font,
    font-size: 12pt,
    hex1: black,
    hex2: black,
    mla-tracking-squeeze: 100%,
    indent-first-line: true
  )
  let apply-text-style = text-style-gen(gradient-slice: 1)

  // B. Headings
  let heading-style-gen = section-formatter(
    font-family: main-font,
    font-size: 12pt,
    hex1: black,
    hex2: black,
    mla-tracking-squeeze: 100%,
    indent-first-line: false
  )
  let apply-heading-style = heading-style-gen(gradient-slice: 1)

  // C. Captions (Figures)
  let caption-style-gen = section-formatter(
    font-family: main-font,
    font-size: 10pt,
    hex1: black,
    hex2: black,
    mla-tracking-squeeze: 100%,
    indent-first-line: false
  )
  let apply-caption-style = caption-style-gen(gradient-slice: 1)

  // D. Footnotes
  let footnote-style-gen = section-formatter(
    font-family: main-font,
    font-size: 10pt,
    hex1: black,
    hex2: black,
    mla-tracking-squeeze: 100%,
    indent-first-line: true
  )
  let apply-footnote-style = footnote-style-gen(gradient-slice: 1)

  // --- 3. Apply Styles ---

  // Apply Main Text Style
  show: apply-text-style

  // Apply Heading Style
  show heading: it => {
    apply-heading-style({
      set text(weight: "regular", style: "normal")
      set par(first-line-indent: 0pt)
      
      if it.level == 1 {
        strong(it.body)
      } else if it.level == 2 {
        emph(it.body)
      } else {
        it.body
      }
    })
    v(1em, weak: true)
  }
  
  // Apply Caption Styling
  show figure.caption: it => {
    apply-caption-style(it)
  }

  // Apply Footnote Styling
  
  set footnote.entry(
    // Ensure the separator is not indented by the global paragraph settings
    separator: {
      set par(first-line-indent: 0pt)
      line(length: 2in, stroke: 0.5pt)
    },
    clearance: 1em, // Gap between text and separator
    gap: 0.5em, // Gap between entries
  )

  show footnote.entry: it => {
    // MLA Footnotes:
    // - Indent first line 0.5in
    // - Subsequent lines flush left
    // - 10pt font (as requested for differentiation)
    // - Proportional double spacing (leading 1em relative to 10pt)
    // - Disable widows/orphans to prevent aggressive page breaking that pushes notes to next page
    
    set par(hanging-indent: 0pt, first-line-indent: 0.5in, leading: 1em)
    set text(font: main-font, size: 10pt, fill: black)
    
    // Output directly as content. 
    context {
      let loc = it.note.location()
      let number = if loc != none {
        counter(footnote).at(loc).first()
      } else {
        0 
      }
      
      // The paragraph setting handles the indentation of the first line.
      super(str(number)) + " " + it.note.body
    }
  }

  // --- 4. Content Output ---
  
  // A. Front Matter (if any)
  if front-matter != none {
    // Disable header for front matter
    set page(header: none, numbering: none)
    
    // We might need to ensure the font style is applied, which 'apply-text-style' does globally.
    // However, front matter usually doesn't want the first-line indent of the main text.
    {
       set par(first-line-indent: 0pt)
       front-matter
    }
    
    // Reset page numbering for main body
    counter(page).update(1)
    
    // Restore Header for Body
    set page(header: context {
       align(right)[#last_name #counter(page).display()]
    }, numbering: "1")
  }

  // B. Title Header (Standard MLA Top-Left Block)
  if show-title-block {
    set par(first-line-indent: 0pt)
    mla-title-header(name, instructor, course, date, title)
  }

  // C. Main Body
  body

  // D. Works Cited
  mla-works-cited(bib-file)
}