import React from "react";
import cx from "@/utils/cx";

export interface Props extends React.ComponentProps<"a"> {
  theme?: "border" | "primary";
}

export default function Link({ theme = "border", className, ...props }: Props) {
  // theme
  const style = {
    border: cx("border border-current hover:bg-emerald-950/10"),
    primary: cx("bg-emerald-900 text-emerald-50 hover:bg-emerald-800"),
  };

  const classes = cx(
    "inline-flex items-center gap-1",
    "px-6 py-3",
    "font-medium leading-none",
    "select-none rounded-full hover:shadow-md",
    style[theme],
    className,
  );

  return <a className={cx(classes)} {...props} />;
}
