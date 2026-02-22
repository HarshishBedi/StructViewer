interface ComplexityChip {
  label: string;
  complexity: string;
}

interface ModuleComplexityProps {
  chips: ComplexityChip[];
  note?: string;
  label?: string;
}

export function ModuleComplexity({ chips, note, label = 'Operation complexity' }: ModuleComplexityProps) {
  return (
    <div className="module-complexity" aria-label={label}>
      {chips.map((chip) => (
        <span className="complexity-chip" key={`${chip.label}-${chip.complexity}`}>
          <strong>{chip.label}</strong>
          <code>{chip.complexity}</code>
        </span>
      ))}
      {note ? <span className="complexity-note">{note}</span> : null}
    </div>
  );
}
