#set page(width: 8.5in, height: 11in)
#set text(font: "Times New Roman", size: 12pt)

#set par(
  spacing: 1em,
  leading: 2em,
  justify: true,
)

= Applications Essay Skeleton

#line(length: 100%, stroke: .35pt + oklab(10%, 0%, 10%, 80%))

+ Purpose & Approach

+ Methodological Framework

+ Argumentative Framework

+ Origins of the Study

 + Psychagogia

 + Ontogenesis & Complementarity

 + Concomitance & Coextension in Aesthetics

 + (Dis)Content, Skleros, Diathesis

+ Argumentative Construction of Harmonic Machines

+ Practical Construction of Harmonic Machines - Autoethnographic Comparative Case Study

+ Theoretical Construction of Harmonic Machines - Software Development as Research & the Concept of Reapportionment




#pagebreak()

This essay is a study of Harmonic Machines. Specifically, it's an investigation into the politics of form and information in conjunction with experience at hand in generation. "Generation" serves as a lens into the poetic, the mimetic, and the technical. 

One difficult of this essay is the extent to which it strives to be interdisciplinary. 


1. Acknowledgements
Thanks to Ethan Hein of the MusEd Lab and NYU Steinhardt for helping me refine the methodology and structure of this essay. Thanks to Annie Lewandowski of Cornell and Marianne Constable of Berkeley for introducing me to the work of Roger Moseley and David Sudnow -- exemplars of interdisciplinary classical, psychological, philosophical, and critical study through the lenses of claviers, musicology, and games. Thanks as well to Victoria Wohl of UToronto for her book "Euripides and the Politics of Form" and her Sather Lectures on the Presocratics (and the book those lectures became) which were the impetus for this essay's direction. Thanks as well to Jim Porter of Berkeley for his thorough work on classical aesthetics, and his work on Empedocles, which were very informative for the argumentative portions of this essay. Finally, thanks to Fumi Okiji, who first gave me the space to explore critical studies through Software Development as Research.

2. Purpose & Approach
This is the first draft of an essay for the criteria of the ITP Applications course. It considers a thesis and argues a perspective reinforced by practice-based research. 

At the time of writing this draft, I have not yet completed my study of Plato's _Timaeus_ and _Phaedo_, which are crucial to my ability to do what I'm trying to do; as such, this draft is incomplete, and will be significantly revised.

Now, to describe what I'm trying to do with this essay... 

There's a budding field of practice-driven, interdisciplinary critical research that's been coming out in the last couple of decades. Such "Alternative Scholarship" as I like to refer to it as has been extremely inspiring. The way I work through theoretical or critical concepts -- Blanchot's Literature, Glissant's Errantry, etc. -- tends to be through musical and computational means. This has been a compulsion of mine over the last several years -- writing songs, or making sonic machines which are part of my struggling with the texts I'm reading. 

Of the problems I've been working through in this way, one stands above the others: a critical prospectus in political geography on Kant's Transcendental Doctrine conducted through reapportionment algorithms and publicly lived experience. This project investiages the question: "By what authority do we differentiate a space into subspaces and ascribe politics of ownership/belonging and representation? and what authority does this leverage in ordinary political living?" This is Kant's "quid iuris", and I approach this question through studying the concept of reapportionment algorithms, such as those created by FiveThirtyEight, Dave's Redistricting, and AlphaPhoenix in their statistical and algorithmic derivation of Gerrymandering Maps.

My purpose in this essay is to begin learning to robustly conduct and argue such a study which combines pure maths, computer science, musicology, classics, philosophy, political science, and critical theory -- for, the confluence of these frames of study are exactly what generate the study itself.

This essay begins with the question of generation, and stays with it. Before launching into this discussion, I will first present the methodological framework appleid in the practice-based research supplementing the argument. Then, I will describe the framework of the argument itself. A discussion of the origins of the study -- the formation and maturing of the driving question for this essay -- will be pasted at the end, but the essay itself consists of 3 sections: The Argumentative Construction of Harmonic Machines as a generative proxy site for engagement and critique, a phronetic analysis via Comparative Case Study, and then a theoretical critique via SDR introducing reapportionment as a problem in generation.




= bahhh
#line(length: 100%, stroke: .35pt + oklab(10%, 0%, 10%, 80%))

#pagebreak()

Learning to play clavier teaches the mind a certain kind of proprioception. This proprioception gathers time, space, content, and technique under expressive play. This proprioception is acquired by the hands, the eyes, and the mind in the process of learning the clavier (Sudnow 12-13); at any moment during play at a clavier, the hand rests at a given position, possesses a limited capacity to "grab at" other keys, retains a certain kind of fatigue, and must maintain measures in rhythm and volume by contextual retention of what has recently been played while also under the pressure of cognitive protention for what comes next, still bearing the load of coordination and performance. I cannot distill the range and detail involved in just the hand's mechanics, let alone the space and concept of jazz piano which arise from the hands' interaction with the clavier -- that is expressed in Sudnow's work. In this essay, my attention pivots from piano to pipe organs.

\

Particularly when sight-reading at pipe organ, the athletic feat is pushed to the limit. Fingers must take over from one another to play legato (this technique is called "crawling"), which further limits the hand's range and increases cognitive load. The feet must play an awkward tap dance, and the arms must not be thrown off by the body's ever-changing center of balance. Space or time must be reserved for changing stops or flipping pages, and then there's also choice in using the shades to control tone and dynamics. All the while, the eyes must read three staves at once and communicate that information to all 4 limbs. 

\

Compounded with composers' lived experiences and skills, this site -- sitting at the clavier -- is the generator for musical compositions as elegant as BWV 654 or as computationally intricate as Philip Glass's "Mad Rush". The clavier is also the generator for David Sudnow and Roger Moseley's ludomusicological texts *Ways of the Hand*, *Pilgrim in the Microworld*, and *Keys to Play*. 

\

*Ways of the Hand* explores Heideggarian and Merleau-Pontian phenomenology through an autoethnographic experiment in learning jazz piano, as the systems and cognitive processes involved introduce unique insights regarding semiology and technics that could not be arrived at elsewhere. *Pilgrim in the Microworld* similarly explores lived experience with video games as a lens into Freud's cathexis -- an idea detailed in the 1895 essay "Project for a Scientific Psychology" as a neuronal behavior of imbuing Towards arts of the body with energy, from which cognitions, attention, and beliefs arise. *Keys to Play* in part "[...] explores the concept of ludomusicality and its manifestations
in contexts ranging from the mythical contest between Apollo and Marsyas to
contemporary digital games. Its approach to musical play navigates a course
in relation to routes established by Plato, Kant, Schiller, Herder, Nietzsche,
Huizinga, Roger Caillois, Gadamer, Foucault, Kittler, and contemporary
scholars of ludic phenomena" (Moseley 6).Ludomusicology is the study of game and musical play and structure; Sudnow and Moseley are exemplars of using the ludomusicological lens for comparative literature and critique. 

\

This essay seeks to occupy a similar ambitious space, viewing the design and construction of claviers as an insightful lens into phenomenology and poetics. Drawing methodology from autoethnography, the digital humanities, and speculative computing, this essay relies on practice-based research to supplement a critical prospectus based on discussion of diatithenai. The critical prospectus concerns reapportionment and generators, directed at Kant's Transcendental Deduction; this essay lays the foundation for starting that study by discussing poetics and aesthetics through comparative analysis of Simondon, Porter, Wohl, and Plato.


