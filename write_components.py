content_timeline = '''"use client";
import React from "react";

interface TimelineContentProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animationNum?: number;
  customVariants?: unknown;
  timelineRef?: unknown;
}

export const TimelineContent = ({
  as: Component = "div",
  children,
  className,
  style,
}: TimelineContentProps) => {
  const El = Component as React.ElementType;
  return <El className={className} style={style}>{children}</El>;
};
'''

content_vertical = '''"use client";
import React from "react";

interface VerticalCutRevealProps {
  children?: React.ReactNode;
  className?: string;
  splitBy?: string;
  staggerDuration?: number;
  staggerFrom?: string;
}

export const VerticalCutReveal = ({
  children,
  className,
}: VerticalCutRevealProps) => {
  return <div className={className}>{children}</div>;
};
'''

base = r"c:\MY FOLDER\LIVE PROJECT\saas-landing-template\components\ui"

with open(base + r"\timeline-animation.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content_timeline)

with open(base + r"\vertical-cut-reveal.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content_vertical)

print("Done")
