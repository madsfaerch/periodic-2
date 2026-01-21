import { X } from 'lucide-react';
import { getCategoryForElement } from '@/data/categories';
import { usePeriodicTableStore } from '@/store';

export function ElementDetails() {
  const { selectedElement, selectElement } = usePeriodicTableStore();

  if (!selectedElement) {
    return (
      <div className="w-80 border border-border rounded-lg p-6 flex items-center justify-center text-muted-foreground">
        Select an element to view details
      </div>
    );
  }

  const category = getCategoryForElement(selectedElement.category);

  return (
    <div className="w-80 border border-border rounded-lg overflow-hidden">
      {/* Header with element symbol */}
      <div
        className="p-4 text-neutral-900"
        style={{ backgroundColor: category?.color ?? 'hsl(var(--muted))' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm">{selectedElement.number}</span>
            <h2 className="text-5xl font-bold">{selectedElement.symbol}</h2>
            <h3 className="text-xl font-semibold">{selectedElement.name}</h3>
          </div>
          <button
            type="button"
            onClick={() => selectElement(null)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            aria-label="Close details"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm mt-2 capitalize">{selectedElement.category}</p>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Property
            label="Atomic Mass"
            value={selectedElement.atomic_mass.toFixed(4)}
          />
          <Property label="Phase" value={selectedElement.phase} />
          <Property label="Group" value={selectedElement.group} />
          <Property label="Period" value={selectedElement.period} />
          <Property label="Block" value={selectedElement.block.toUpperCase()} />
          <Property
            label="Density"
            value={
              selectedElement.density ? `${selectedElement.density} g/cm³` : '—'
            }
          />
          <Property
            label="Melting Point"
            value={selectedElement.melt ? `${selectedElement.melt} K` : '—'}
          />
          <Property
            label="Boiling Point"
            value={selectedElement.boil ? `${selectedElement.boil} K` : '—'}
          />
          <Property
            label="Electronegativity"
            value={selectedElement.electronegativity_pauling ?? '—'}
          />
          <Property
            label="Electron Config"
            value={selectedElement.electron_configuration_semantic}
            className="col-span-2"
          />
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Summary
          </h4>
          <p className="text-sm leading-relaxed">{selectedElement.summary}</p>
        </div>

        {/* Discovered by */}
        {selectedElement.discovered_by && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Discovered by
            </h4>
            <p className="text-sm">{selectedElement.discovered_by}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Property({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
