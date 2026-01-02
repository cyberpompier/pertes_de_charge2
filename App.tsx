import React, { useState, useEffect, useCallback } from 'react';
import { DIAMETERS, DIVISORS } from './constants';
import type { Diameter } from './types';

// --- Helper & Icon Components (Defined outside App to prevent re-creation) ---

const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl font-bold text-red-500 tracking-tight sm:text-5xl font-orbitron">
      PERTES DE CHARGE
    </h1>
    <p className="mt-2 text-lg text-gray-300">
      Calculateur pour tuyaux de sapeurs-pompiers
    </p>
  </header>
);

interface DiameterButtonProps {
  diameter: Diameter;
  isSelected: boolean;
  onSelect: (diameter: Diameter) => void;
}

const DiameterButton: React.FC<DiameterButtonProps> = ({ diameter, isSelected, onSelect }) => {
  const baseClasses = "w-full text-center px-2 py-2 rounded-md text-sm font-bold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700";
  const selectedClasses = "bg-red-600 text-white shadow-lg scale-105";
  const unselectedClasses = "bg-gray-600 text-gray-200 hover:bg-gray-500";

  return (
    <button
      onClick={() => onSelect(diameter)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      aria-pressed={isSelected}
    >
      Ø {diameter}
    </button>
  );
};

interface CalculatorInputProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allowNegative?: boolean;
}

const CalculatorInput: React.FC<CalculatorInputProps> = ({ id, label, unit, value, onChange, allowNegative = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-3 pl-4 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0"
        min={allowNegative ? undefined : "0"}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-400">{unit}</span>
      </div>
    </div>
  </div>
);

interface ResultDisplayProps {
  pressureLoss: number | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ pressureLoss }) => (
  <div className="bg-gray-900 rounded-lg p-6 text-center mt-6">
    <p className="text-sm font-medium text-red-400 uppercase tracking-wider">Pertes de Charge Totales</p>
    <div className="mt-2 text-5xl sm:text-6xl font-bold text-white font-orbitron">
      {pressureLoss !== null ? pressureLoss.toFixed(2) : '0.00'}
      <span className="text-2xl sm:text-3xl text-gray-400 ml-2">bars</span>
    </div>
  </div>
);

// --- New Section Component ---
interface HoseSectionState {
  id: number;
  diameter: Diameter;
  length: string;
}

interface HoseSectionProps {
  section: HoseSectionState;
  sectionNumber: number;
  onUpdate: (id: number, newValues: Partial<HoseSectionState>) => void;
  onRemove: (id: number) => void;
  canBeRemoved: boolean;
}

const HoseSection: React.FC<HoseSectionProps> = ({ section, sectionNumber, onUpdate, onRemove, canBeRemoved }) => {
  const handleLengthChange = (step: number) => {
    const currentLength = parseInt(section.length, 10) || 0;
    const newLength = Math.max(0, currentLength + step); // Prevent negative length
    onUpdate(section.id, { length: newLength.toString() });
  };
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 relative border border-gray-600">
       <h3 className="font-semibold text-gray-100 mb-3 flex items-center">
         <span className="bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">{sectionNumber}</span>
         Section {sectionNumber}
       </h3>
       <div className="space-y-4">
         <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Diamètre</label>
            <div className="grid grid-cols-3 gap-2">
              {DIAMETERS.map((d) => (
                <DiameterButton
                  key={d}
                  diameter={d}
                  isSelected={section.diameter === d}
                  onSelect={(diameter) => onUpdate(section.id, { diameter })}
                />
              ))}
            </div>
         </div>
         <div>
            <label htmlFor={`length-${section.id}`} className="block text-sm font-medium text-gray-300 mb-1">
              Longueur
            </label>
            <div className="flex items-stretch rounded-lg focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
              <button
                onClick={() => handleLengthChange(-20)}
                className="bg-gray-600 text-white font-bold text-lg px-3 rounded-l-lg hover:bg-red-600 focus:outline-none transition-colors border-2 border-r-0 border-gray-600"
                aria-label="Diminuer la longueur de 20m"
              >
                -20
              </button>
              <div className="relative flex-grow">
                <input
                  type="number"
                  id={`length-${section.id}`}
                  name={`length-${section.id}`}
                  value={section.length}
                  onChange={(e) => onUpdate(section.id, { length: e.target.value })}
                  className="w-full bg-gray-800 border-y-2 border-gray-600 py-3 pl-4 pr-16 text-white text-center placeholder-gray-500 focus:outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  min="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">m</span>
                </div>
              </div>
              <button
                onClick={() => handleLengthChange(20)}
                className="bg-gray-600 text-white font-bold text-lg px-3 rounded-r-lg hover:bg-red-600 focus:outline-none transition-colors border-2 border-l-0 border-gray-600"
                aria-label="Augmenter la longueur de 20m"
              >
                +20
              </button>
            </div>
         </div>
       </div>
       {canBeRemoved && (
          <button
            onClick={() => onRemove(section.id)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors"
            aria-label="Supprimer la section"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
       )}
    </div>
  );
};

// --- Main App Component (Refactored) ---

const App: React.FC = () => {
  const [sections, setSections] = useState<HoseSectionState[]>([
    { id: Date.now(), diameter: 45, length: '40' }
  ]);
  const [flowRate, setFlowRate] = useState<string>('250');
  const [elevation, setElevation] = useState<string>('0');
  const [pressureLoss, setPressureLoss] = useState<number | null>(null);

  useEffect(() => {
    const Q = parseFloat(flowRate);
    const H = parseFloat(elevation);

    const elevationLoss = isNaN(H) ? 0 : H / 10;

    if (!isNaN(Q) && Q >= 0) {
      const frictionLoss = sections.reduce((total, section) => {
        const L = parseFloat(section.length);
        const K = DIVISORS[section.diameter];

        if (!isNaN(L) && L > 0 && K) {
          const sectionLoss = (L / 100) * Math.pow(Q / K, 2);
          return total + sectionLoss;
        }
        return total;
      }, 0);
      
      const totalLoss = frictionLoss + elevationLoss;
      setPressureLoss(totalLoss);
    } else {
      setPressureLoss(elevationLoss);
    }
  }, [sections, flowRate, elevation]);

  const handleUpdateSection = useCallback((id: number, newValues: Partial<HoseSectionState>) => {
    setSections(currentSections =>
      currentSections.map(s => (s.id === id ? { ...s, ...newValues } : s))
    );
  }, []);

  const handleAddSection = () => {
    const lastDiameter = sections[sections.length - 1]?.diameter || 70;
    setSections([
      ...sections,
      { id: Date.now(), diameter: lastDiameter, length: '40' }
    ]);
  };

  const handleRemoveSection = useCallback((id: number) => {
    setSections(currentSections => currentSections.filter(s => s.id !== id));
  }, []);

  const handleElevationChange = useCallback((step: number) => {
    setElevation(current => {
        const currentValue = parseFloat(current) || 0;
        return (currentValue + step).toString();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center sm:justify-center p-4 pt-8 sm:pt-4">
      <main className="w-full max-w-2xl mx-auto">
        <Header />
        <div className="bg-gray-800 rounded-xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          <div className="space-y-6">
            
            <fieldset>
              <legend className="text-lg font-semibold text-gray-100 mb-4">
                1. Définir l'établissement
              </legend>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <HoseSection
                    key={section.id}
                    section={section}
                    sectionNumber={index + 1}
                    onUpdate={handleUpdateSection}
                    onRemove={handleRemoveSection}
                    canBeRemoved={sections.length > 1}
                  />
                ))}
              </div>
            </fieldset>

            <button
              onClick={handleAddSection}
              className="w-full bg-red-800/50 text-red-200 hover:bg-red-800/80 hover:text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter une section
            </button>
            
            <fieldset className="pt-2">
               <legend className="text-lg font-semibold text-gray-100 mb-4">
                 2. Paramètres globaux
               </legend>
               <div className="grid sm:grid-cols-2 gap-4">
                 <CalculatorInput
                   id="flowRate"
                   label="Débit de la lance"
                   unit="L/min"
                   value={flowRate}
                   onChange={(e) => setFlowRate(e.target.value)}
                 />
                 <div>
                    <label htmlFor="elevation" className="block text-sm font-medium text-gray-300 mb-1">
                      Dénivelé (+/-)
                    </label>
                    <div className="flex items-stretch rounded-lg focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                      <button
                        onClick={() => handleElevationChange(-1)}
                        className="bg-gray-700 text-white font-bold text-2xl px-4 rounded-l-lg hover:bg-red-600 focus:outline-none transition-colors border-2 border-r-0 border-gray-700"
                        aria-label="Diminuer le dénivelé"
                      >
                        &mdash;
                      </button>
                      <div className="relative flex-grow">
                        <input
                          type="number"
                          id="elevation"
                          name="elevation"
                          value={elevation}
                          onChange={(e) => setElevation(e.target.value)}
                          className="w-full bg-gray-900 border-y-2 border-gray-700 py-3 pl-4 pr-16 text-white text-center placeholder-gray-500 focus:outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">m</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleElevationChange(1)}
                        className="bg-gray-700 text-white font-bold text-2xl px-4 rounded-r-lg hover:bg-red-600 focus:outline-none transition-colors border-2 border-l-0 border-gray-700"
                        aria-label="Augmenter le dénivelé"
                      >
                        +
                      </button>
                    </div>
                 </div>
               </div>
            </fieldset>
            
            <ResultDisplay pressureLoss={pressureLoss} />
          </div>
        </div>
        <footer className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Cet outil est destiné à des fins d'estimation et de formation. Référez-vous toujours aux manuels officiels.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
