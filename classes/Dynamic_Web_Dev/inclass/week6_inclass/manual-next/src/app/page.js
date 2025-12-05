"use client";

function MyButton() {
  const handleClick = () => {
    console.log("clicked");
  };
  return (
    <button onClick={handleClick}>
      <h1>Hello World</h1>
    </button>
  );
}

export default function Home() {
  return (
    <div>
      <MyButton />
    </div>
  );
}
