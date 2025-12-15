// ============================================
// MLA Essay Template
// ============================================
// Configure these variables for your essay:

#let author = "Novalynn Daniel"
#let professor = "Professor De La Cruz"
#let course = "Applications"
#let date = "27 November 2025"
#let title = "Opacity and Harmonic Machines: A Ludomusicological Framework"
#let bib-file = "citations.bib"  // Path to your bibliography file

// ============================================
// MLA Formatting (do not modify below)
// ============================================

#set page(
  width: 8.5in,
  height: 11in,
  margin: 1in,
  header: context align(right)[#author.split(" ").last() #counter(page).display()],
)

#set text(font: "Times New Roman", size: 12pt)
#set par(
  first-line-indent: 0.5in,
  justify: true,
  leading: 2em,
  spacing: 2em,
)
#set heading(numbering: none)
#show heading: set block(above: 2em, below: 0em)
#show heading: it => {
  it
  par(first-line-indent: 0pt)[#text(size: 0pt)[#h(0pt)]]
}

// ============================================
// MLA Header (no title page)
// ============================================

#author \
#professor \
#course \
#date \

#set align(center)
#title
#set align(left)

// ============================================
// Essay Body
// ============================================

=== 1. First Opacity: The Problem of Approach

This paper considers two opacities and proposes a ludomusicological analytic framework for engaging with them.

The first opacity is the problem of approach. This is a hylomorphic issue -- regarding 'matter' and 'form'. Jacques Garelli, introducing Simondon's problematic in #underline[Individuation in LIght of Notions of Form and Information], describes an inciting premise: "on the methodological plane there is an attitude shared by Merleau-Pontian phenomenology and the epistemology of microphysics, such as it is stated in Niels Bohr and Werner Heisenberg, according to which we cannot radically separate the scientific 'object' discovered at the end of research from the path of thought and the operative processes that have led to revealign and constructing it" (Simondon xv-xvi). In other words, the matter of our inquiry will assume a form determined by the technique of our approach; the way in which we ask a question restricts what the mode and content of what responses can arise.

Simondon digs into the hylomorphic mechanics of this opacity by arguing that the matter of becoming is a thermodynamic process ocurring over time, with a prior metastable system of organized elements which undergo a technical process to form into some posterior state. He illustrates this matter of arising or becoming with the baking of a clay brick -- in which case the metastable state is the colloidal form of the clay's molecules' arrangement in a slurry; this metastable system undergoes a thermodynamic process to _take shape_. "The clay yields a brick because this deformation operates on masses whose molecules are already aranged relative to one another [...] The mold limits and stabilizes rather than imposing a form: [...] it _modulates_ the ensemble of the already formed sections: the action of the worker who fills the mold and packs the clay continues the prior action of the kneading, stretching, and shaping..." (Simondon 24-25). The operative process enacts the becoming, while the mold is already in place so that the matter can take shape; the technical operaiton is the handiwork of whoever arranges the system, kneads the clay, applies the heat. The artificer is invisible within the machine of becoming -- the Creator present in the work by the act of making.

In this construction, the limited system of call and response -- the approach, and the way it skews what results may be found -- expands into an assemblage of 1) a pre-existing material state, 2) an end -- some telos, like the idea of a brick to be made, or the actual brick that has been made, 3) some technical process which performs the transmutation, and 4) the agent conducting the affair. The project of this paper is to explore the politics between these bodies acting in formation. To do so, we must carefully consider the design of our approach.

=== 2. Insights from a Ludomusicological Approach 

The ubiquity of our first opacity rears its head in more than aesthetic, phenomenological, or quantum theory -- it also appears in H.L.A. Hart's #underline[The Concept of Law]. In his chapter on Sovereign and Subject, he presents the issue: systems of governance can be cleanly designed, enacted, and critiqued if the sovereign body stands separate from the governed body, in that the author of the laws has direct authority over the governed -- but how does it work when the governing body is also subject to the laws itself? He writes: "where the sovereign person is not identifiable independently of the rules... The rules are *constitutive* of the sovereign..." (76). I struggled for years with the question of how we might understand the politics in play given a situation such as this -- which, if we take correlationism or Wittgenstein's philosophy to heart, is every situation of ordinary language use -- when our tools for analysis and reflection are themselves subject to the rules of language use or even thinking? Thomas Turino's theory of Presentational and Participatory Music gave me better tools for reasoning.

In "Music as Social Life: The Politics of Participation" Turino describes two cultures for musical performance. Presentational Music has distinct bodies for authoring, interpreting, enacting, and listening -- the composer writes a piece, some other person interprets the score and conducts a body of individual performers, and they prepare to present the work for an audience at a given time and place. In American legal practice, we can somewhat liken the author to Constitutional Law, the interpreting body as national and state legislators, the enacting body as law enforcement and the courts, and the audience as citizens, criminals, and immigrants. Participatory Music, on the other hand, blurs the lines between the se bodies -- composer, interpreter, listener, and performer are all subject to the social and political improvisation of musical performance. This occurs when people gather in the yard to play folk or jazz standards, or in hip-hop cyphers. This is closer to the actual case of ordinary language use -- where no instance of speech or writing is without submliminal cultural, aesthetic, and otherwise contextual signaling. The relevance of this for the topic of this paper is: in the approach of our study, we cannot cleanly decompose opacities into analytic frameworks, but instead we must consider the holistic politics of performance in forming without reducing the opacity; this paper argues one way to conduct such a study not for legal or linguistic reflection, but on the focus of designing for the body, hand, and mind in constructing harmonic machines.

=== 3. Second Opacity: The Space of Relation

Ludomusicology is a field of study which invites interdisciplinary study concerning music and games. David Sudnow and Roger Moseley have used this framework to argue unique insights on Freudian Cathexis, Luhmann's systems theory, and more -- insights best arrived at through consideration of the interactions of poetics and noetics in the play of hands at the clavier. This paper combines the ludomusicological approach with an experiment in speculative computing to explore Edouard Glissant's concept of errant work in #underline[The Poetics of Relation].

While the first opacity regarding the approach of our inquiry is crucial for the actual argument of this paper, this second opacity -- the rendered silent in Relation -- is the actual necessity of this work. The rendered silent in Relation refers to the opening of Glissant's book, in which he describes three abysses which took root during the transatlantic slave trade. The first abyss was the "womb abyss" (6) of the boat that swallowed actual people, uprooting them from their homeland, never to return; it is a womb abyss, for its act of consumption was a simultaneous act of consummation, in that the uprooting set the trajectory for the people's future. The second abyss was the death of those who were uprooted -- "Whenever a fleet of ships gave chase to slave ships, it was easiest just to lighten the boat by throwing cargo overboard... These underwater signposts mark the course between the Gold Coast and the Leeward Islands." The third abyss is that of forgetting -- "the abyss thus projects a reverse image of all that had been left behind, not to be regained for generations except -- more and more threadbare -- in the blue savannas of memory or imagination" (7). As generations pass, the progeny of the dispossessed lose technical and cultural access to genuine historical reflection upon the smothered lives that mark the passage which brought them to where they are. This is paralleled in Benjamin's idea of the Angel of History -- who, in seeking to recover some connection with an irrecoverably fragmented history, outlines a myth tracing back techno-artifacts that are remnants of deterritorializing violence, and in doing so displaces themself out of time, no longer able to reconcile their present circumstance for how disfigured the history that led them to today has grown. This is the second opacity -- that we must reckon with the actual history, which has been rendered absolutely silent by the functions of time and dispossession, that carried us here in the first place.

Glissant proposes errant work in response to the rendered silent in Relation. Errant work does not shy from opacity in historical reflection, but takes up the incomplete and mythological in its approaches of critical reflection. "Because the thought of errantry is also the thought of what is relative, the thing relayed as well as the thing related. The thought of errantry is a poetics, which always infers that at some moment it is told. The tale of errantry is the tale of Relation." He lists Rimbaud's and Saint-John Perse's poetry as examples of errant work, which serves as a site for reflection upon relative objects, bearing account for the opaque in their considerations. The overarching experiment of this paper is to attempt at some appropriation of this idea of errantry into the digital humanities, through the technical and cultural affordances of ludomusicology.

In asking how might we engage ourselves in critical reflection with the opaque in a space of relation, we shift our gaze toward harmonic machines.

=== 4. Argumentative Construction of Harmonic Machines

- Simondon
- Porter
- Actual & Speculative Harmonic Machines

=== 5. Case Study #1: Austin & Aeolian-Skinner Organs

In Group Theory, a generator is some mathematical formulation which could be said to generate, model, or represent all the elements a group comprises of. For example, a generator for all even numbers can be written as $E = {2n : n in NN}$ ("E is the set of all numbers in the set of Natural Numbers multiplied by two; this is equivalent to the set of all even numbers"). A generator is a formulation -- a made or articulated thing -- which begets all possible matter of a specific order -- it is autopoietic, "self-making".

In this sense, a harmonic machine is any assemblage generative of harmonic experience. Returning to Simondon's argument for how things get made, a harmonic machine would as such be something that facilitates the transformation of a prior matter into something posterior by means of an agent applying some operative process -- the result of which is harmonic. For example, a pipe organ is an electrical, pneumatic, and mechanical technology which allows an organist to create music by playing with keys that route and shade pressurized air. The prior matter is the machine at rest, the agent is the player, and the operative process is play.

What does it mean for a machine to be harmonic? What makes a well made machine?

For both the theoretical construction and critique of harmonic machines, I turn to James Porter's work in classical aesthetics. He writes: "Individual terms tell their own stories, which can be followed like clues. Leaving aside the wide resonance, and not just applicatbilitym of terms like poiesis, techne, or mimesis, which point to the largest roles of art, no matter what the medium, as a form of making, technique, or representation -- or more simply, as a form of production and reproduction -- consider... Terms like [euschemosune (gracefulness),] harmonia (fittingness), poikilia (variety), diathesis or dispositio (arrangement), rhuthmos (rhythm, shape), charis or gratia (charm), megethos or pondus (grandeur or weight), skleros or durus (hard, severe, rough)..." (59). Particularly, I'd like to focus on euschemosune, harmonia, skleros, and diatithenai -- grace, fittingness, roughness, and arranging. I will place euschemosune and skleros in opposition, as what is graceful begets ease and fluidity, while what is rough may restrict, constrain, or abrase. Harmonia and diatithenai need more attention, though.



- Austin's design philosophy
- Aeolian-Skinner's design philosophy
- Grace Cathedral's Arrhythmia

=== 6. Case Study #2: FIBRIL

- Design challenges anciticpating this generation's needs & Bricolage
- FIBRIL's algorithmic design -- rendering silent with computer science

=== 7. Hephaestus's Playground: NMachine Architecture as a Site for Errant Exploration

- Exteriorizing erantry for a new generation reading for opacity
- Latour's attachment, the Creator in the Poetic, & Hephaestus's Playground

// ============================================
// Works Cited
// ============================================

#pagebreak()

#set par(
  first-line-indent: 0em,
  hanging-indent: 0.5in,
)

#set align(center)
*Works Cited*
#set align(left)

#bibliography(bib-file, style: "mla", full: true, title: none)
