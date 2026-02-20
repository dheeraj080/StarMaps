import React from "react";

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  results: any[];
  onSelect: (sat: any) => void;
}

export function SatelliteSearch({
  searchTerm,
  setSearchTerm,
  results,
  onSelect,
}: SearchProps) {
  return (
    <div className="hud-search-container">
      <div className="search-input-wrapper">
        <input
          className="minimal-search-input"
          type="text"
          placeholder="SEARCH_OBJECT"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon">⌖</span>
      </div>

      {results.length > 0 && (
        <div className="minimal-results-dropdown">
          {results.map((sat) => (
            <div
              key={sat.id} // Ensure this is a unique ID from your API
              className="minimal-result-item"
              onClick={() => onSelect(sat)}
            >
              {sat.name} <span className="result-id">[{sat.id}]</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
