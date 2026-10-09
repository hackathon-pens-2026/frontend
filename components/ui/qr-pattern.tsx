import React from "react";

export function QrCodeMiniPattern() {
  const binaryString = "111011110101011011100101110110100101";
  return (
    <div className="grid grid-cols-6 gap-px">
      {binaryString.split("").map((bit, idx) => (
        <span
          key={idx}
          className={`size-1 ${bit === "1" ? "bg-midnight" : "bg-transparent"}`}
        />
      ))}
    </div>
  );
}
