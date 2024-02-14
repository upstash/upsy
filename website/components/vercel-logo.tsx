import React from "react";

export interface Props extends React.HTMLProps<SVGSVGElement> {
  size?: number;
}

export default function VercelLogo({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      viewBox="0 0 76 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
    </svg>
  );
}
