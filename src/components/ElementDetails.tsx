import { X } from 'lucide-react';
import { getCategoryForElement } from '@/data/categories';
import { usePeriodicTableStore } from '@/store';
import { OrbitalViewer } from '@/components/orbital';
import { heatmapPropertyMap } from '@/lib/heatmap';
import { cn } from '@/lib/utils';

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

      {/* Orbital visualization */}
      <div className="p-4 pb-0">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Valence Orbital
        </h4>
        <OrbitalViewer element={selectedElement} />
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Property
            label="Atomic Mass"
            value={selectedElement.atomic_mass.toFixed(4)}
            propertyKey="atomic_mass"
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
            propertyKey="density"
          />
          <Property
            label="Melting Point"
            value={selectedElement.melt ? `${selectedElement.melt} K` : '—'}
            propertyKey="melt"
          />
          <Property
            label="Boiling Point"
            value={selectedElement.boil ? `${selectedElement.boil} K` : '—'}
            propertyKey="boil"
          />
          <Property
            label="Electronegativity"
            value={selectedElement.electronegativity_pauling ?? '—'}
            propertyKey="electronegativity_pauling"
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
  propertyKey,
}: {
  label: string;
  value: string | number;
  className?: string;
  propertyKey?: string;
}) {
  const { activeProperty, setActiveProperty } = usePeriodicTableStore();
  const isClickable = propertyKey != null && heatmapPropertyMap.has(propertyKey);
  const isActive = propertyKey != null && activeProperty === propertyKey;

  return (
    <div
      className={cn(
        className,
        isClickable && 'cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-muted/50',
        isActive && 'bg-muted ring-1 ring-ring/30 rounded px-1 -mx-1',
      )}
      onClick={
        isClickable
          ? () => setActiveProperty(isActive ? null : propertyKey!)
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <dt className="text-xs text-muted-foreground">
        {label}
        {isClickable && (
          <span className="ml-1 text-[10px] opacity-50">{isActive ? '✕' : '◉'}</span>
        )}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
