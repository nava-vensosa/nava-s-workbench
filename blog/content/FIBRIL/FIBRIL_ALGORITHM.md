


- k,,0: # of voices
- k,,1: next # of voices
- j,,0: list containing currently active voices
- j,,1: transitory list of next active voices
- beta: voice in j,,1 (this is a midi number)
- x: object that points to a function alpha which returns the sum of the contents of a list l passed into alpha
- i: list of objects x,,n where n is in the range (0, 127) and each x,,n points to alpha,,n at that instance of n
- l: list of bayesian inferences defined below
- r: set of rules, which compare two variables (midi,,1 and midi,,2) and returns a value in the range (0, 1)
- prior: the sum of r(i, beta,,0->n) where i is in range (0, 127) and n is len(beta)


l,,i => P(i|prior) = (1/len(l)) * P(i) * P(prior|i)
  - prior given i means passing i through the sum of r
