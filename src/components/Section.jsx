import { forwardRef } from "react";

const Section = forwardRef(({ id, className = "", children }, ref) => {
  return (
    <section ref={ref} id={id} className={`py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  );
});

Section.displayName = "Section";

export default Section;
