# Project Documentation
---

## Contents

1. Glissant Quote
2. FIBRIL is a technological gathering site for discourse. Topics in discussion include
  - Poetics
  - Relation & Ontogenesis
  - The Angel & Daemon of History
  - Metaphysics
  - Psychagogia
  - Absence; Memory; the Siren
  - Invisible Design
3. In implementation, FIBRIL is an algorithmic harmonizer
4. FIBRIL arose from study of Glissant, Mallarmé, and Blanchot, as well as Sudnow's "Ways of the Hand"
5. Most crucially, FIBRIL engages with the politics of absence, crisis, silence, poetics, and metaphysics
6. FIBRIL grieves exegesis of errantry, and likely must be reduced
7. Critical work to follow technical implementation materials

---
## Technical Implementation Materials
1. Harmonizer Design Background
2. Daemon -- Grey Code Arithmetic & Rank Proximity Clustering to interpret gesture and derive non-arbitrary heuristics for a DBN to reapportion the space of harmony
3. What is a DBN (and how is it implemented)?
4. Reapportionment (technical exploration of Transcendental Deduction)
5. Sequence Diagram
6. Data Structures
7. Tree Graph Visualization
8. Numpy
9. Hardware Design
10. Conclusion

---
## Harmonizer Design Background

In 2005, Imogen Heap released "Hide and Seek". She had manually autotuned several vocal tracks to create a polyphonic wall of sound with one voice.

Justin Vernon was heavily inspired by her work a couple years later. That inspiration shows in his composition choices in Bon Iver's debut album "For Emma, Forever Ago". In that album, he layered his voce several times to create an analogous effect, though without autotune. 8 years later, he and Chris Messina collaborated to make an instrument (named the "Messina") which required two people to play. The Messina is a real-time harmonizer, which can take a live audio signal and programatically generate several harmonies.

A few years after this, Jacob Collier had Ben Bloomberg of the MIT Media Lab create a harmonizer for him. While the Messina mainly relies on Short-Time Fourier Transforms (STFTs) with specific windowing choices to create its unique, characteristic tone, Bloomberg's harmonizer uses an old school approach -- the vocoder.

A vocoder grafts an incoming audio signal onto a carrier signal -- for example, a sine wave. The result sounds like a synthesizer which has characteristics resembling the human voice. Vocoders work just like talkboxes -- talkboxes emit a soundwave into the user's mouth, and the user's mouth articulation imparts speech characteristics onto the carrier wave. Both sound very artificial, and the vocoder sounds synthetic (in that it resembles the sound of an analog synthesizer).

The STFT approach does not sound synthetic like a vocoder or a talkbox. Instead, it sounds "windowed". This is because the STFT slices up the incoming signal into windows, analytically deconstructs those windows' data, deforms that raw data through vectorized algebra, and resynthesizes the transformed signal to substitute in place of the sampled window. The smaller the window sizes, the smoother and more organic the re-stitched signal sounds. However, this is an extremely computationally exhausting process compared to the vocoder approach (which only requires polar translation of two signals, multiplication of that data, and cartesian re-translation -- a simple unwrap-multiply-rewrap process, rather than a costly analysis process followed by a bespoke deformation, then a resynthesis and reinsertion under near-impossible real tie latency challenges). 

Tinkering with an STFT approach to vocal harmonization (as opposed to a basic vocoder implementation) opens up worlds for creative exploration in designing unique tonalities of a computerized human voice -- for, strange things happen to speech components like formants, fricatives, and harmonic relations when playing with window sizes and translation ranges. The characteristic of the input signal also transfers a unique quality on the resultant sound, as it's not a mere spectral graft but an essential reconstruction of the input signal with computational deformations baked in at crucial junctions.

Bloomberg's harmonizer mainly uses a vocoder implementation, but augments it with STFT analysis, handling fricatives elegantly and supplementing further effects like reverb, advanced time-shifting, and digital synthesis.

In the last 7 years, the harmonizer effect has broken into the mainstream, appearing in several Billie Eilish songs, for example. However, real-time harmonizer technology remains a mystery for the indie public. People don't have harmonizers, and they don't know how they work.

Imogen Heap's harmonization was a manual process. The Messina is a 2-man machine. Collier's harmonizer is just a novation keyboard hooked up to a suite of well-crafted software. 

FIBRIL is a harmonizer for anyone. You don't need to know how to play clavier to use it, the algorithm and interface are designed to read intuitive gestures. Let's get into how it works.

---
## Daemon -- Grey Code Arithmetic & Rank ProximityClustering for Interpretating Intuitive Gestures to Derive Heuristics for a DBN Reapportioning the Space of Harmony

My obsession with real-time harmonization began inhigh school, back in 2016. At first, I studied work on STFT and floating formant transposition out of IRCAM and CNMAT/Cycling '74. Most recently, I've been appreciative of Geraint Luff's time/pitch shifting algorithm design. 

The problem has been so engaging because of the range of invisible design choices in two fields: how to do the STFT Windowing to preserve or play with formants, fricatives, and spectrogram distributions, as well as how to generate harmony for a variable input to go with that transposition engine. 

I tried writing transposition algorithms. Unsurprisingly, IRCAM's and Geraint Luff's were always leagues ahead. However, with time, the question of note selection became more and more challenging. Every iteration of a harmony algorithm I wrote lacked the kind of organic fluidity I was used to from playing the piano. 

When playing the piano, it's really easy to 
