-- Fibril Algorithm: Bayesian MIDI Note Selection
-- Lua Pseudocode Implementation

-- Constants
local MIDI_SIZE = 128
local NUM_ITERATIONS = 3
local INITIAL_PROBABILITY = 1.0 / MIDI_SIZE

-- User configuration
local config = {
    key = "C",  -- Musical key
    num_voices = 4  -- Number of voices to allocate
}

-- C Major scale MIDI notes (in one octave, pattern repeats)
local C_MAJOR_SCALE = {0, 2, 4, 5, 7, 9, 11}  -- C, D, E, F, G, A, B

-- Check if a MIDI note is in the specified key
function is_in_key(midi_note, key)
    -- For simplicity, assuming key is "C"
    local note_class = midi_note % 12
    for _, scale_note in ipairs(C_MAJOR_SCALE) do
        if note_class == scale_note then
            return true
        end
    end
    return false
end

-- Calculate harmonic boost based on interval
function get_interval_boost(interval, boost_type)
    local abs_interval = math.abs(interval)

    if boost_type == "fourth" and abs_interval == 5 then
        return 0.3
    elseif boost_type == "fifth" and abs_interval == 7 then
        return 0.25
    elseif boost_type == "voice_leading" and (abs_interval == 1 or abs_interval == 2) then
        return 0.2
    end

    return 0.0
end

-- COMPUTE function: Calculate harmonic relationship score
function compute(b_index, a_index, voicing_map, key)
    -- Rule 1: Key filtering
    if not is_in_key(b_index, key) then
        return 0.0
    end

    local score = 0.0

    -- Rule 2: Perfect fourths
    -- Check against A_index
    local interval_with_a = b_index - a_index
    score = score + get_interval_boost(interval_with_a, "fourth")

    -- Check against all voiced notes in VOICING_MAP
    for voiced_note = 0, MIDI_SIZE - 1 do
        if voicing_map[voiced_note] == 1 then
            local interval_with_voiced = b_index - voiced_note
            score = score + get_interval_boost(interval_with_voiced, "fourth")
        end
    end

    -- Rule 3: Perfect fifths
    -- Check against A_index
    score = score + get_interval_boost(interval_with_a, "fifth")

    -- Check against all voiced notes
    for voiced_note = 0, MIDI_SIZE - 1 do
        if voicing_map[voiced_note] == 1 then
            local interval_with_voiced = b_index - voiced_note
            score = score + get_interval_boost(interval_with_voiced, "fifth")
        end
    end

    -- Rule 4: Voice leading
    for voiced_note = 0, MIDI_SIZE - 1 do
        if voicing_map[voiced_note] == 1 then
            local interval_with_voiced = b_index - voiced_note
            score = score + get_interval_boost(interval_with_voiced, "voice_leading")
        end
    end

    return score
end

-- Sample from probability distribution using random seed
function sample_from_distribution(posterior, random_seed)
    math.randomseed(random_seed)
    local rand_value = math.random()

    local cumulative = 0.0
    for i = 0, MIDI_SIZE - 1 do
        cumulative = cumulative + posterior[i]
        if rand_value <= cumulative then
            return i
        end
    end

    return MIDI_SIZE - 1  -- Fallback
end

-- Initialize arrays
function initialize()
    local posterior = {}
    local uin_map = {}
    local voicing_map = {}

    for i = 0, MIDI_SIZE - 1 do
        posterior[i] = INITIAL_PROBABILITY
        uin_map[i] = INITIAL_PROBABILITY
        voicing_map[i] = 0
    end

    return posterior, uin_map, voicing_map
end

-- Perform one comparison iteration (Bayesian update)
function comparison_iteration(posterior, uin_map, voicing_map, key)
    local new_posterior = {}

    -- For each element j in POSTERIOR
    for j = 0, MIDI_SIZE - 1 do
        local sum = 0.0

        -- Sum over all elements i in UIN_MAP
        for i = 0, MIDI_SIZE - 1 do
            -- Bayes's theorem: P(A|B) = P(A) * P(B|A) / P(B)
            local p_a = uin_map[i]  -- Prior probability
            local p_b_given_a = compute(j, i, voicing_map, key)  -- Likelihood
            local p_b = posterior[j]  -- Normalizing constant

            -- Avoid division by zero
            if p_b > 0 then
                sum = sum + (p_a * p_b_given_a / p_b)
            end
        end

        new_posterior[j] = sum
    end

    -- Normalize the posterior to ensure it sums to 1
    local total = 0.0
    for j = 0, MIDI_SIZE - 1 do
        total = total + new_posterior[j]
    end

    if total > 0 then
        for j = 0, MIDI_SIZE - 1 do
            new_posterior[j] = new_posterior[j] / total
        end
    end

    return new_posterior
end

-- Perform three iterations of the comparison loop
function run_comparison_loop(posterior, voicing_map, key)
    for iteration = 1, NUM_ITERATIONS do
        -- Copy POSTERIOR to UIN_MAP at start of iteration
        local uin_map = {}
        for i = 0, MIDI_SIZE - 1 do
            uin_map[i] = posterior[i]
        end

        -- Perform Bayesian update
        posterior = comparison_iteration(posterior, uin_map, voicing_map, key)

        print("Iteration " .. iteration .. " complete")
    end

    return posterior
end

-- Allocate voices based on probability distribution
function allocate_voices(posterior, voicing_map, num_voices)
    -- Count currently allocated voices
    local current_voices = 0
    local allocated_indices = {}

    for i = 0, MIDI_SIZE - 1 do
        if voicing_map[i] == 1 then
            current_voices = current_voices + 1
            table.insert(allocated_indices, i)
        end
    end

    print("Current voices: " .. current_voices .. ", Target: " .. num_voices)

    -- Case 1: Need to allocate more voices
    if num_voices > current_voices then
        -- Allocate new voices
        for v = current_voices + 1, num_voices do
            local random_seed = os.time() + v
            local selected_index = sample_from_distribution(posterior, random_seed)
            voicing_map[selected_index] = 1
            print("Allocated voice " .. v .. " at MIDI " .. selected_index)
        end

        -- Optionally: free and reroll old voices one at a time
        -- (Implementation detail depends on specific requirements)

    -- Case 2: Need to free voices
    elseif num_voices < current_voices then
        -- Free voices one at a time until quota is reached
        for i = 1, current_voices - num_voices do
            if allocated_indices[i] then
                voicing_map[allocated_indices[i]] = 0
                print("Freed voice at MIDI " .. allocated_indices[i])
            end
        end
    end

    return voicing_map
end

-- Main algorithm
function fibril_algorithm()
    print("=== Fibril Algorithm ===")
    print("Initializing...")

    -- Initialize data structures
    local posterior, uin_map, voicing_map = initialize()

    -- Run the comparison loop (3 iterations)
    print("\nRunning comparison loop...")
    posterior = run_comparison_loop(posterior, voicing_map, config.key)

    -- Allocate voices
    print("\nAllocating voices...")
    voicing_map = allocate_voices(posterior, voicing_map, config.num_voices)

    -- Display results
    print("\n=== Results ===")
    print("Top 10 most probable notes:")

    -- Sort by probability (simplified - just showing concept)
    for rank = 1, 10 do
        local max_prob = 0.0
        local max_index = 0

        for i = 0, MIDI_SIZE - 1 do
            if posterior[i] > max_prob then
                max_prob = posterior[i]
                max_index = i
            end
        end

        print(rank .. ". MIDI " .. max_index .. ": " .. string.format("%.6f", max_prob))
        posterior[max_index] = 0  -- Remove from next search
    end

    print("\nAllocated voices (VOICING_MAP):")
    for i = 0, MIDI_SIZE - 1 do
        if voicing_map[i] == 1 then
            print("  MIDI " .. i)
        end
    end
end

-- Run the algorithm
fibril_algorithm()
