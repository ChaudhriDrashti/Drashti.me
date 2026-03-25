interface Props {
  number: string;
  title: string;
}

const SectionHeading = ({ number, title }: Props) => (
  <div className="flex items-center gap-4 mb-12">
    <span className="font-mono text-primary text-lg">{number}.</span>
    <h2 className="text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">{title}</h2>
    <div className="h-px bg-border flex-1 max-w-xs" />
  </div>
);

export default SectionHeading;
