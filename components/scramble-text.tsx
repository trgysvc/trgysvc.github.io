"use client";

import React, { useEffect, useState, useCallback } from "react";

const chars = "!@#$%^&*()_+{}:\"<>?,./;'[]-=";

interface ScrambleTextProps {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  duration = 800,
  delay = 0,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);

  const scramble = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }

      iteration += text.length / (duration / 30);
    }, 30);

    return () => clearInterval(interval);
  }, [text, duration]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsScrambling(true);
      scramble();
    }, delay);

    return () => clearTimeout(timeout);
  }, [scramble, delay]);

  return <span className={className}>{displayText || (isScrambling ? "" : text)}</span>;
};
