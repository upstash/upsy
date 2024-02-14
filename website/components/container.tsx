import React from "react";
import cx from "@/utils/cx";

export interface Props extends React.HTMLProps<HTMLDivElement> {}

export default function Container({ className, ...props }: Props) {
  return <div className={cx("max-w-screen-lg px-8 lg:px-20 mx-auto", className)} {...props}></div>;
}
