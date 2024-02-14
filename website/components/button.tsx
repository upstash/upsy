import React from "react";
import cx from "@/utils/cx";

export interface Props extends React.ComponentProps<"button"> {
  theme?: "border" | "primary";
}

const Button = ({ theme = "border", className, ...other }: Props, ref: any) => {
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

  return <button className={cx(classes)} type="button" {...other} ref={ref} />;
};

export default React.forwardRef(Button);
