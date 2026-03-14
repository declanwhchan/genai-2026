import { Fragment, createElement, type ReactNode } from "react";

type AnyProps = Record<string, unknown> & { children?: ReactNode };

function stripMotionProps(props: AnyProps) {
  const {
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    layout,
    layoutId,
    ...rest
  } = props;

  void initial;
  void animate;
  void exit;
  void transition;
  void whileHover;
  void whileTap;
  void layout;
  void layoutId;

  return rest;
}

function makeMotionTag(tag: string) {
  return function MotionTag(props: AnyProps) {
    return createElement(tag, stripMotionProps(props));
  };
}

export const motion = {
  div: makeMotionTag("div"),
  button: makeMotionTag("button"),
  span: makeMotionTag("span"),
  g: makeMotionTag("g"),
  circle: makeMotionTag("circle"),
};

export function AnimatePresence({ children }: { children?: ReactNode }) {
  return <Fragment>{children}</Fragment>;
}
