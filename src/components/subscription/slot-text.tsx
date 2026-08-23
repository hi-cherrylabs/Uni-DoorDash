import { useEffect, useRef, useState } from "react";

function SlotDigit({ char }: { char: string }) {
  const [display, setDisplay] = useState(char);
  const [key, setKey] = useState(0);
  const prev = useRef(char);

  useEffect(() => {
    if (char !== prev.current) {
      prev.current = char;
      setDisplay(char);
      setKey((k) => k + 1);
    }
  }, [char]);

  return (
    <span className="slot-text-cell">
      <span key={key} className="slot-text-inner">
        {display === " " ? "\u00A0" : display}
      </span>
    </span>
  );
}

export function SlotText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`slot-text-row ${className}`}>
      {text.split("").map((char, i) => (
        <SlotDigit key={i} char={char} />
      ))}
    </span>
  );
}
