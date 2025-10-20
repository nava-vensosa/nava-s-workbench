# Astrid - State Based Approach

*Astrid is the name of a project in which I'm creating a drum machine software modeled after planetary motion. The state-based approach is an implementation attempt using NES-style state-diagram system architecture. I'd like to program the entire thing in C++*


1. Program Expectations:
- Runs out of terminal
- Upon running, opens up a window (can be put into fullscreen)
- User is able to navigate the program with the keyboard (navigation and text entry uses the same key motions as Vim)
- The user sees a graphical interface describing what's going on in the data
- The data is sending OSC information in real time via UDP network to the localhost:5879
- User is able to save a system state into a JSON, as well as load a JSON to restore a system state; User is able to auto-load a string of JSONs which run after the intended cycles' completion, so as to sequentially load different tracker patches
- Effectively, it works just like a tracker drum software, just with a unique interface and interaction method

2. Implementation approach:
- First, I'd like to develop the structure of the JSON
- Then, I'd like to load a graphical testing environment, which draws lines and sends OSC signals according to the JSON data. In its final implementation, this will be the prototype of the program.

3. JSON structure
- The JSON describes aspects of: System, Planets, Satellites
  - The System has a clock, visualized as the Sun at the center of the solar system
  - Planets orbit the solar system (the Sun is the parent of its planets, and the Sun is the center of the Planets' orbit)
  - Planets have:
    - Orbits
      - by default, an orbit is a unit circle centered around the sun
      - the user can transform the radius of this circle with a constant, which will only have a graphical effect 
      - the user can also squeeze the circle into an ellipse, specifying a vertex ratio 
      - the user can also rotate where the foci of the ellipse are by specifying a rotation in degrees or radians)
    - Transits
      - 
      
