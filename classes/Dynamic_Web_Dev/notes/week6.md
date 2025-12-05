- the "web stack" -- Express & Node.js interfacing HTML and CSS
- Frontend Frameworks -- React, jQuery, ...
  - These are code libraries that simplify the task of making a front end
  - React introduces .JSX files which are JS + HTML combined ... somehow ... and it's only for developers, as browsers will experience a .JSX file as HTML+CSS+JS because a "Build System" transforms the .JSX file


React example:

function MyButton() {
    const handleClick = () => {
        console.log("clicked");
    };
    return (
        <button onClick={handleClick}>
            Click me
        </button>
    );
}

- N.b. what's being returned looks like HTML; the interactivity associated with it earlier looks like JS though ...
- In React, a "component" is a single reusable module for HTML (DRY!)
  - Compnoents are also composable -- you can define an instance of a component, and then generate arrays of it
  - You can pass "parameters" into components, which can differentiate aspects of it as it generates (labels, flex-positions...)
- React is for client-side rendering... Next.js works for server-side rendering (.ejs was used for server-side rendering)
  - Next.js is written by Vercel


- In terminal...
> npx create-next-app@latest
(>>> name type)
(>>> use TypeScript ? / no)
(>>> Like to use a linter? / no)
(>>> Like to use  a React Compiler? / no)
(>>> ... Tailwind? / yes)
...

open what it generates and....

egads! bloat!

try somehting like...


in src/app/page.js:

"use client";

function MyButton () {
    const handleClick = () => {
        console.log("clicked");
    };
    return (
        <button onClick={handleClick}>
            Click me
        </button>
    );
}

export default function Home() {
    return (
            <MyButton />
    );
}
