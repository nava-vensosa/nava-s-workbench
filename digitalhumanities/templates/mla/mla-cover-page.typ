// mla-cover-page.typ

#let mla-cover-page(
  title: "Title",
  subtitle: none,
  name: "Author",
  instructor: "Instructor",
  course: "Course",
  date: "Date",
  institution: "Institution"
) = {
  // MLA Cover Page typically:
  // Title (1/3 down)
  // Name, Course, etc. (Centered)
  
  page(
    margin: 1in,
    header: none,
    footer: none,
  )[
    #set align(center)
    #v(2in) // Approx 1/3 down
    
    #text(size: 12pt)[
      #title
      #if subtitle != none [ \ #subtitle ]
    ]
    
    #v(1fr) // Push the rest to the bottom/middle
    
    #text(size: 12pt)[
      #name \ 
      #course \ 
      #instructor \ 
      #date \ 
      #if institution != none [ \ #institution ]
    ]
    
    #v(2in) // Bottom padding
  ]
}
