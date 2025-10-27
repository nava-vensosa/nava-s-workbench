# A Dynamic Bayesian Network for Generative Harmonic Voice Allocation


---

The system models a continuously evolving probability field over the 128-note MIDI pitch space,  
where each note’s probability represents its contextual likelihood of being voiced in the next machine state.

Unlike discrete rule-based systems, this network operates through continuous **Bayesian feedback**.  
Each iteration computes a posterior probability vector describing the system’s updated musical belief state.  
This posterior then becomes the prior in the next iteration, forming a recursive inference loop that gradually  
morphs rather than resets the global probability field.

The probability field evolves based on **functional influences** — scalar-weighted rules and heuristics that encode  
musical logic, tonal context, and user interaction. The system accepts real-time input from a performance interface:  
key presses and slider controls modify weights, exception rules, and contextual parameters.  
Each user action reconfigures the topology of the Bayesian field, steering its evolution toward new harmonic regions.

The system maintains continuity between machine states. The probability vector \( i^{(t)} \) for \( t = 0 \)  
begins uniformly with every element \( i[n] = 1/128 \). From there, it is *never hard reset* — it continuously  
transforms under recursive Bayesian inference. Only two events cause a recomputation from the weighted influence  
functions rather than from the previous posterior:

1. When a **new user input** triggers the computation of a state transition diagram.  
2. Immediately **after the j-map is altered**, signifying that a note has been voiced or the system state has changed.

After each full enumeration cycle (once all key slots are filled), the final probability map becomes the **initial map  
for the next cycle**, inheriting its structure from prior inference. This creates a coherent temporal continuum —  
a Bayesian field that remembers its past and evolves musically over time.

---

## Mathematical Model

Let  

\[
i^{(t)} = [p_0^{(t)}, p_1^{(t)}, \ldots, p_{127}^{(t)}]
\]

denote the probability vector at iteration \( t \),  
where each \( p_n^{(t)} \) represents the probability that MIDI note \( n \)  
will be voiced in the next state.

### Functional Influence Model

We define a set of influence functions \( f_k(i^{(t)}) \),  
each representing a structural or heuristic rule.  
Each function has a scalar weight \( w_k \in [0,1] \),  
controlled interactively by the user.

The weighted combination of all influences produces a composite prior:

\[
P(A) = \text{normalize}\left(\sum_k w_k f_k(i^{(t)})\right)
\]

### Bayesian Update

At each inference step, the posterior for note \( n \) is computed as:

\[
p_n^{(t+1)} = \frac{P(A_n) \, P(B|A_n)}{P(B)}
\]
where  
\[
P(B) = \sum_m P(A_m) P(B|A_m)
\]

The resulting posterior \( i^{(t+1)} \) becomes the prior for the next iteration:

\[
i^{(t+1)} \rightarrow i^{(t)}
\]

### Reinitialization Exceptions

When either a **user input event** or a **j-map modification** occurs,  
the prior distribution is re-derived directly from the normalized influence sum:

\[
i^{(t+1)} = \text{normalize}\left(\sum_k w_k f_k(i^{(t)})\right)
\]

rather than from the previous posterior.  
This keeps the system responsive to external interaction while preserving  
the long-term continuity of the evolving probability field.

---

## State Transition Process

After a designated number of Bayesian enumerations, the system stochastically samples  
notes to fill the available key slots:

\[
j = \text{sample}(i^{(t+1)}, \text{num\_slots})
\]

Selected notes are removed from the probability space  
(\( i_n = 0 \) for all \( n \in j \)), and the distribution is renormalized.  
The Bayesian inference loop resumes on the modified field until all slots are filled.

When the terminal condition is reached (i.e., all key slots are voiced),  
the **final posterior field** becomes the **initial field for the next state**.  
The functional influences and their weights \( (f_k, w_k) \) are then reordered or  
reweighted based on user interaction, defining a new phase of evolution.

---

## Functional Implementation (NumPy Pseudocode)

```python
import numpy as np

def normalize(v):
    s = np.sum(v)
    return v / s if s > 0 else v

def compute_prior(i, funcs, weights):
    """Compute normalized weighted sum of influence functions."""
    return normalize(sum(w * f(i) for w, f in zip(weights, funcs)))

def bayesian_update(i, funcs, weights, likelihood, use_feedback=True):
    """Perform Bayesian inference step with optional posterior feedback."""
    if use_feedback:
        prior = i  # use previous posterior as prior
    else:
        prior = compute_prior(i, funcs, weights)  # recompute from influences

    posterior_unnorm = prior * likelihood
    return normalize(posterior_unnorm)

def dynamic_bayesian_network(i, funcs, weights, likelihood,
                             total_slots, iterations_per_selection,
                             user_event_trigger=False, j_map_changed=False):
    filled, j = [], []

    # determine initial prior source
    use_feedback = not (user_event_trigger or j_map_changed)

    for _ in range(total_slots):
        # Enumerate Bayesian inference loop
        for _ in range(iterations_per_selection):
            i = bayesian_update(i, funcs, weights, likelihood, use_feedback=use_feedback)
            use_feedback = True  # once started, always use posterior feedback

        # Sample note selection
        note = np.random.choice(128, p=i)
        j.append(note)
        filled.append(note)

        # Modify j map, recompute prior on next iteration
        i[note] = 0
        i = normalize(i)
        use_feedback = False  # trigger reweighting due to j update

    final_probability_map = i.copy()
    return filled, final_probability_map











---


flowchart TD

A[Start: Initialize i⁽⁰⁾ = 1/128 for all notes] --> B[Compute prior as Σ wₖ fₖ(i)]
B --> C[Run Bayesian update: P(A|B) = (P(A)P(B|A))/P(B)]
C --> D[Posterior i⁽ᵗ⁺¹⁾ becomes next prior]
D --> E{User Input or j-map Change?}
E -->|No| C
E -->|Yes| F[Recompute Prior from Σ wₖ fₖ(i)]
F --> C
C --> G{Terminal Condition Met?}
G -->|No| C
G -->|Yes| H[Transition to Next Machine State]
H --> I[Final i⁽ᵗ⁾ becomes new i⁽⁰⁾]
I --> B





---




