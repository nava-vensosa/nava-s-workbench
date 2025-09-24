# This is for personal use

1. I'll need to first clone my existing webpage into my workbench
2. I'll need to learn how to edit my webpages from the workbench, then sync that with the existing webpage files, and then upload that to neocities
3. Implement the content loader
4. Page by page, refactor everything with content hooks-- Lorem Ipsum at first
5. Transcribe content from notebooks


Organization of the files in this directory:
1. pages/ contains all the .html files, in clean organization-- no raw content, no refined content, no images
2. raw_content/ will contain the bloated, unrefined data for the ITP/ content, CCWS/ content, and NI/ content
3. content/ will contain the refined and sorted content which the content hooks use to load in paragraph and title text for the html files. it will also include any images.
4. templates/ will contain html and css templates and stylings for families of webpages; for now, there's one standard format for all webpages, but down the line CCWS and NI and ITPG will have different templates.
5. css/ and js/ contain css and js files
6. README.md, implementation_notes.txt, and nachsterbinn_design_notes.txt are for the user

