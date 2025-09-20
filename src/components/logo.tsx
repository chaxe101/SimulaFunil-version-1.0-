import { type SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M 224,48 H 32 l 80,112 v 48 h -32 v 32 h 96 v -32 h -32 v -48 z"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}
