import { X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getCategoryForElement } from '@/data/categories';
import { usePeriodicTableStore } from '@/store';
import { OrbitalViewer } from '@/components/orbital';
import { propertyMap } from '@/lib/heatmap';
import { cn } from '@/lib/utils';
import { parseValenceOrbital, getOrbitalDescription } from '@/lib/orbital/orbitalParser';

export function ElementDetails({ condensed = false }: { condensed?: boolean }) {
  const { selectedElement, selectElement } = usePeriodicTableStore();
  const [orbitalModalOpen, setOrbitalModalOpen] = useState(false);
  const orbital = useMemo(
    () => selectedElement ? parseValenceOrbital(selectedElement.electron_configuration_semantic) : null,
    [selectedElement?.electron_configuration_semantic],
  );
  const orbitalDescription = orbital ? getOrbitalDescription(orbital) : '';

  if (!selectedElement) {
    return (
      <div className={cn(
        'border border-border rounded-lg p-6 flex items-center justify-center text-muted-foreground',
        condensed ? 'w-full' : 'w-80',
      )}>
        Select an element to view details
      </div>
    );
  }

  const category = getCategoryForElement(selectedElement.category);

  return (
    <div className={cn(
      'border border-border rounded-lg overflow-hidden',
      condensed ? 'w-full' : 'w-80',
    )}>
      {/* Header with element symbol + mini orbital */}
      <div
        className="p-4 text-neutral-900"
        style={{ backgroundColor: category?.color ?? 'hsl(var(--muted))' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-sm">{selectedElement.number}</span>
            <h2 className="text-5xl font-bold">{selectedElement.symbol}</h2>
            <h3 className="text-xl font-semibold">{selectedElement.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => selectElement(null)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              aria-label="Close details"
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setOrbitalModalOpen(true)}
              className="w-20 h-20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              aria-label="View orbital"
            >
              <OrbitalViewer element={selectedElement} compact />
            </button>
          </div>
        </div>
        <Property
          label="Category"
          value={selectedElement.category}
          propertyKey="category"
          className="mt-2 text-sm capitalize"
          dark
        />
      </div>

      {/* Orbital modal */}
      {orbitalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOrbitalModalOpen(false)}
        >
          <div
            className="relative w-[90vmin] max-w-lg flex flex-col items-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOrbitalModalOpen(false)}
              className="absolute top-2 right-2 p-1 text-white/70 hover:text-white rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="size-6" />
            </button>
            <OrbitalViewer element={selectedElement} className="w-full" />
            <div className="mt-3 text-center">
              <p className="text-white text-lg font-bold">
                {selectedElement.symbol} — {selectedElement.name}
              </p>
              <p className="text-white/60 text-sm mt-1">{orbitalDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Property
            label="Atomic Mass"
            value={selectedElement.atomic_mass.toFixed(4)}
            propertyKey="atomic_mass"
          />
          <Property label="Phase" value={selectedElement.phase} propertyKey="phase" />
          <Property label="Group" value={selectedElement.group} propertyKey="group" />
          <Property label="Period" value={selectedElement.period} propertyKey="period" />
          <Property label="Block" value={selectedElement.block.toUpperCase()} propertyKey="block" />
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
            label="Atomic Radius"
            value={selectedElement.atomic_radius ? `${selectedElement.atomic_radius} pm` : '—'}
            propertyKey="atomic_radius"
          />
          <Property
            label="Covalent Radius"
            value={selectedElement.covalent_radius ? `${selectedElement.covalent_radius} pm` : '—'}
            propertyKey="covalent_radius"
          />
          <Property
            label="VdW Radius"
            value={selectedElement.van_der_waals_radius ? `${selectedElement.van_der_waals_radius} pm` : '—'}
            propertyKey="van_der_waals_radius"
          />
          <Property
            label="Electron Config"
            value={selectedElement.electron_configuration_semantic}
            className="col-span-2"
          />
        </div>

        {/* Summary */}
        {!condensed && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Summary
            </h4>
            <p className="text-sm leading-relaxed">{selectedElement.summary}</p>
          </div>
        )}

        {/* Discovered by */}
        {!condensed && selectedElement.discovered_by && (
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
  dark,
}: {
  label: string;
  value: string | number;
  className?: string;
  propertyKey?: string;
  dark?: boolean;
}) {
  const { activeProperty, setActiveProperty } = usePeriodicTableStore();
  const isClickable = propertyKey != null && propertyMap.has(propertyKey);
  const isActive = propertyKey != null && activeProperty === propertyKey;

  return (
    <div
      className={cn(
        className,
        isClickable && 'cursor-pointer rounded px-1 -mx-1 transition-colors',
        isClickable && !dark && 'hover:bg-muted/50',
        isClickable && dark && 'hover:bg-black/10',
        isActive && !dark && 'bg-muted ring-1 ring-ring/30 rounded px-1 -mx-1',
        isActive && dark && 'bg-black/15 ring-1 ring-black/20 rounded px-1 -mx-1',
      )}
      onClick={
        isClickable
          ? () => setActiveProperty(isActive ? null : propertyKey!)
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <dt className={cn('text-xs', dark ? 'text-neutral-700' : 'text-muted-foreground')}>
        {label}
        {isClickable && (
          <span className="ml-1 text-[10px] opacity-50">{isActive ? '✕' : '◉'}</span>
        )}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
