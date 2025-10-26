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
  - 
