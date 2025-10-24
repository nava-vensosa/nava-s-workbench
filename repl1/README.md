# README.md - REPL1

**This project attempts to create a live coding environment for video and animation. It can work with live video as well as video files, and it can also export video clips. The project will have its own language -- like TidalCycles -- which is really a wrapper for C/C++. It will run in a custom environment. The intended workflow is: the user has 1 composing monitor, and can be plugged into external monitors or projectors onto which the video output is projected in real time. The composing monitor will have this layout: in the top left hand corner, there is a rectangular display proportional to a 1920x1080p display (scaled down so the height of that display window takes up a third of the program window); in the top right hand corner, there is a rectangular display proportional to a mobile device's display size, scaled such that the height of that display takes up 1/2 the height of the program window; in the bottom right hand corner, taking up the remaining third under the mobile display section but sized in width to fit that mobile display section, there are two tmux-y windows -- a command shell for the user to run certain inputs, and a console log to write certain outputs to; in the remaining space (the bottom 2/3rds of the screen to the left of the mobile display and shell/log windows) are two more tmux-y windows -- the left one will be called "dossier.json" and to the right of that will be "REPL.txt"; if there is space remaining between the two display windows near the top 1/3 of the screen, that space will be filled with text containing information which will be written later. The user can navigate the bottom 4 windows using VIM (insert, navigaton, deletion, and everything should work the same as when using Vim to edit text files), and the user can toggle which of the 4 window's they're editing by pressing Alt/Option+Spacebar+[1/2/3/4], where 1 would take them to dossier.json, 2 would take them to REPL.txt, 3 would take them to command line, and 4 would take them to console log. We're going to write an entire pseudocode, which will translate down to C/C++ in order to perform video editing and animation.**

Implementation Step 1: Create the Application GUI; it should be run from terminal, and open a new window, which can be put in fullscreen or kept in resizeable window mode

Implementation Step 2: Create a video cat function, which takes the live webcam feed and displays it in the video display window; to run videocat, the following should be written into REPL.txt and then REPL.txt should be run from the command line:



// these double slashes indicate a comment
in_var videoIn = [device selection path for webcam];   // in_var instantiates a video input variable, videoIn is a variable name, some sort of path should replace the brackets to bind the videoIn input variable to the webcam's livestream, the semicolon indicates the end of a line

out_var videoOut = monitor1;     // out_var instantiates a video output variable, videoOut is a variable name, monitor1 is the default name for the video display window in the top left corner. if the user wants to videocat to an external monitor, they would have to replace "monitor1" in this line of code with [device selection path for external display]



The Program Window should look like this:


 ________________________________________________|
 |monitor1                       |monitor2       |
 |                               |               |
 |                               |               |
 |                               |               |
 |                               |               |
 |_______________________________|               |
 |dossier.json |REPL.txt         |               |
 |             |                 |               |
 |             |                 |_______________|
 |             |                 |console        |
 |             |                 |               |
 |             |                 |               |
 |             |                 |_______________|
 |             |                 |shell          |
 |             |                 |               |
 |             |                 |               |
 |             |                 |               |
 |_____________|_________________|_______________|


