// section-formatter.typ

// The main factory function that creates a formatter instance.
#let section-formatter(
  font-family: "Times New Roman", // MLA standard default, though user can override
  font-size: 12pt,
  hex1: black,
  hex2: black,
  mla-tracking-squeeze: 100%,
  indent-first-line: true
) = {
  // 1. Compile Color Palette (7 slices)
  // We generate a 7-element array of colors derived from a linear OKLAB gradient.
  // Index 0 matches slice 1 (hex1), Index 6 matches slice 7 (hex2).
  let steps = 7
  let palette = range(steps).map(step => {
    let ratio = step / (steps - 1) * 100%
    color.mix(
      (hex1, 100% - ratio), 
      (hex2, ratio), 
      space: oklab
    )
  })

  // We return a closure that takes the gradient-slice index.
  // This closure returns a function intended to be used as a show rule.
  return (gradient-slice: 1) => {
    
    // 2. Select Color from Pre-calculated Palette
    // gradient-slice is 1-based (1 to 7)
    let safe-index = calc.clamp(gradient-slice, 1, steps) - 1
    let text-color = palette.at(safe-index)

    // 3. Calculate Spacing Metrics based on Squeeze
    // MLA Standard (100%):
    // - Double spacing (Leading approx 1em)
    // - Standard word spacing (approx 0.25em)
    // - Standard tracking (0pt)
    // - First line indent (0.5in)
    
    let squeeze-ratio = mla-tracking-squeeze / 100%
    
    let mla-leading = 1em
    let mla-word-spacing = 0.25em
    let mla-indent = 0.5in
    
    // Proportional adjustments
    let new-leading = mla-leading * squeeze-ratio
    let new-word-spacing = mla-word-spacing * squeeze-ratio
    
    // Indent scaling
    let new-indent = if indent-first-line { mla-indent * squeeze-ratio } else { 0pt }

    // For tracking, we apply a relative shift. 
    // If squeeze is 50%, we tighten by a small amount (e.g., -0.05em).
    // If squeeze is 150%, we loosen.
    // Factor 0.05em chosen for visible but readable effect.
    let new-tracking = (squeeze-ratio - 1.0) * 0.05em

    // 4. Return the style function (Show Rule)
    return body => {
      set text(
        font: font-family,
        size: font-size,
        fill: text-color,
        spacing: new-word-spacing,
        tracking: new-tracking
      )
      set par(
        leading: new-leading,
        first-line-indent: new-indent
      )
      
      body
    }
  }
}