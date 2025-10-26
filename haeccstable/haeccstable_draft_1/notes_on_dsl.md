# Notes on the DSL Implementation for Haeccstable

---

1. The DSL for Haeccstable should be entirely functional.
2. There are certain pre-built objects which handle the low-level aspects of graphics rendering, as well as device detection, etc. These are the exception to the functional syntax to the DSL
3. Apart from the custom/pre-built objects (which we will detail at the end), there are only variables and functions.
4. Variables are generic -- you could say "var x = 'hello world'" and then "x = 0" and the value which "x" points to would change from a string to an integer. 
5. Functions are all single line lambda functions. So, if the user wants to perform complicated tasks, they must string a series of function calls to do so. The syntax for declaring a function: "func x(a, b) = 2 * a + b". Functions can perform basic operationssuch as multiplication, addition, boolean comparison (like "func x(a,b) = a < b" would return 1 or 0). 
6. System functions for the DSL include:
  - print() // n.b (f"characters + {var}") should work
  - println()
  - clear.console()
  - save(dossier.json, filename.json)
7. There will also be a set of object attributes, which default to optional (?) null -- we'll be switching the implementation to use Swift, Metal, and python, with C++ for certain efficiencies if needed, and perhaps with C++ for audio synthesis down the line. These object attributes will be for generating color for objects, or for binding their paths of motion to a parent object. Objects' motion will occur in the abstract, being tracked along with asynchronous math functions, only rendering when projected onto a visible layer.


The key feature at hand is: variables are experiencing functional and time dependent motion. These are paths -- sequences of numbers. Objects may be bound to the motion of these variables, and objects may be rendered as visual objects which can be cast onto layers that can be projected into windows which can be resized and moved between displays.

In total, we need to handle:
1. Coming up with DSL Syntax
2. Communicating between the Program's live-coding environment and .txt/.json files on the computer
3. Graphics rendering, including handling live video from devices that can be accessed like the webcam or external cameras, as well as video files, and also including generating and projecting visual objects into Cocoa windows.
4. Functional tracking -- where the user can describe functions, and bind objects (visual objects or invisible objects) to the motion of those functions, so as to programatically generate graphical representations of written math and display them being drawn over time or being sliced in different stereographic perspectives.
5. Basic audio synthesis -- if the user creates an audio object, binds its stereo or mono output to 
