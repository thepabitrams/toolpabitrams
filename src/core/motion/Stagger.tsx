// core/motion/Stagger.tsx
import React, { Children, isValidElement, cloneElement } from 'react';

interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  show?: boolean;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  delay = 100,
  show = true,
}) => {
  if (!show) return null;

  return (
    <>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        const delayValue = index * delay;

        return cloneElement(child, {
          delay: delayValue,
          show: show,
        } as any);
      })}
    </>
  );
};