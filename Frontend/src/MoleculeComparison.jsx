import React, { useState, useEffect, useRef } from "react";
import "./MoleculeComparison.css";

export default function MoleculeComparison() {
  const [molecules, setMolecules] = useState([
    { id: "empagliflozin", name: "Empagliflozin" },
    { id: "semaglutide", name: "Semaglutide" },
    { id: "atorvastatin", name: "Atorvastatin" },
    { id: "metformin", name: "Metformin" },
    { id: "pirfenidone", name: "Pirfenidone" },
    { id: "nintedanib", name: "Nintedanib" },
  ]);

  const [selectedMolecules, setSelectedMolecules] = useState({});
  const [newMoleculeName, setNewMoleculeName] = useState("");
  const [hoveredMolecule, setHoveredMolecule] = useState(null);
  const [viewDifferences, setViewDifferences] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [moleculeFadeDirection, setMoleculeFadeDirection] = useState("");
  const [differencesFadeDirection, setDifferencesFadeDirection] = useState("");
  const [differences, setDifferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTexts, setExpandedTexts] = useState({});
  const [visibleDifferencesCount, setVisibleDifferencesCount] = useState(2);
  
  const containerRef = useRef(null);
  const MAX_CONTAINER_HEIGHT = 600;

  const moleculesPerPage = 5;
  const totalPages = Math.ceil(molecules.length / moleculesPerPage);
  const startIndex = currentPage * moleculesPerPage;
  const endIndex = startIndex + moleculesPerPage;
  const currentMolecules = molecules.slice(startIndex, endIndex);

  useEffect(() => {
    if (differences.length > 0 && containerRef.current) {
      calculateVisibleDifferences();
    }
  }, [differences, currentDiffIndex]);

  const calculateVisibleDifferences = () => {
    const remainingDiffs = differences.slice(currentDiffIndex);
    let count = 0;
    let estimatedHeight = 0;
    
    for (let i = 0; i < remainingDiffs.length; i++) {
      const diff = remainingDiffs[i];
      const selectedNames = getSelectedMoleculeNames();
      const mol1Key = selectedNames[0]?.toLowerCase();
      const mol2Key = selectedNames[1]?.toLowerCase();
      
      const content1 = diff[mol1Key] || '';
      const content2 = diff[mol2Key] || '';
      const isChart = content1 === 'chart' || content2 === 'chart';
      
      let itemHeight;
      if (isChart) {
        itemHeight = 250;
      } else {
        const maxLength = Math.max(content1.length, content2.length);
        const lines = Math.ceil(maxLength / 80);
        itemHeight = Math.max(100, lines * 25 + 80);
      }
      
      if (estimatedHeight + itemHeight <= MAX_CONTAINER_HEIGHT) {
        count++;
        estimatedHeight += itemHeight;
      } else {
        break;
      }
    }
    
    setVisibleDifferencesCount(Math.max(1, count));
  };

  const visibleDifferences = differences.slice(currentDiffIndex, currentDiffIndex + visibleDifferencesCount);
  const hasMoreDifferences = currentDiffIndex + visibleDifferencesCount < differences.length;
  const hasPreviousDifferences = currentDiffIndex > 0;

  const toggleMolecule = (id) => {
    setSelectedMolecules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addMolecule = () => {
    if (newMoleculeName.trim()) {
      const newId = newMoleculeName.toLowerCase().replace(/\s+/g, "-");
      const newMolecule = { id: newId, name: newMoleculeName.trim() };
      setMolecules([...molecules, newMolecule]);
      setSelectedMolecules((prev) => ({ ...prev, [newId]: false }));
      setNewMoleculeName("");
    }
  };

  const toggleExpandText = (diffIndex, columnKey) => {
    const key = `${diffIndex}-${columnKey}`;
    setExpandedTexts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDifferenceData = (moleculesData, selectedNames) => {
    if (!moleculesData || selectedNames.length < 2) return [];

    const mol1Key = selectedNames[0].toLowerCase();
    const mol2Key = selectedNames[1].toLowerCase();
    const mol1Data = moleculesData[mol1Key];
    const mol2Data = moleculesData[mol2Key];

    if (!mol1Data || !mol2Data) return [];

    const formattedDifferences = [];

    // Patent & IP Metrics
    if (mol1Data.patent && mol2Data.patent) {
      formattedDifferences.push({
        feature: "Patent Status",
        [mol1Key]: `Status: ${mol1Data.patent.base_molecule_patent_status || 'N/A'}. Active US Patents: ${mol1Data.patent.active_us_patents_count || 0}. Freedom to Operate: ${mol1Data.patent.freedom_to_operate || 'N/A'}.`,
        [mol2Key]: `Status: ${mol2Data.patent.base_molecule_patent_status || 'N/A'}. Active US Patents: ${mol2Data.patent.active_us_patents_count || 0}. Freedom to Operate: ${mol2Data.patent.freedom_to_operate || 'N/A'}.`,
      });

      formattedDifferences.push({
        feature: "Patent Details",
        [mol1Key]: `Earliest Expiry: ${mol1Data.patent.earliest_active_patent_expiry || 'N/A'}. Latest Expiry: ${mol1Data.patent.latest_active_patent_expiry || 'N/A'}. Orange Book Listings: ${mol1Data.patent.orange_book_listings_count || 0}. Patent Thicket Complexity: ${mol1Data.patent.patent_thicket_complexity || 'N/A'}.`,
        [mol2Key]: `Earliest Expiry: ${mol2Data.patent.earliest_active_patent_expiry || 'N/A'}. Latest Expiry: ${mol2Data.patent.latest_active_patent_expiry || 'N/A'}. Orange Book Listings: ${mol2Data.patent.orange_book_listings_count || 0}. Patent Thicket Complexity: ${mol2Data.patent.patent_thicket_complexity || 'N/A'}.`,
      });
    }

    // Clinical Development Metrics
    if (mol1Data.clinical && mol2Data.clinical) {
      formattedDifferences.push({
        feature: "Clinical Trials Overview",
        [mol1Key]: `Total Trials: ${mol1Data.clinical.total_clinical_trials || 0}. Completed: ${mol1Data.clinical.completed_trials_count || 0}. Failed: ${mol1Data.clinical.failed_trials_count || 0}. Approved Indications: ${mol1Data.clinical.approved_indications_count || 0}.`,
        [mol2Key]: `Total Trials: ${mol2Data.clinical.total_clinical_trials || 0}. Completed: ${mol2Data.clinical.completed_trials_count || 0}. Failed: ${mol2Data.clinical.failed_trials_count || 0}. Approved Indications: ${mol2Data.clinical.approved_indications_count || 0}.`,
      });

      const formatPhases = (phases) => {
        if (!phases || Object.keys(phases).length === 0) return 'N/A';
        return Object.entries(phases).map(([phase, count]) => `${phase}: ${count}`).join(', ');
      };

      formattedDifferences.push({
        feature: "Active Trials Details",
        [mol1Key]: `Trials by Phase: ${formatPhases(mol1Data.clinical.active_trials_count_by_phase)}. Average Enrollment: ${mol1Data.clinical.average_enrollment_size_active_trials ? mol1Data.clinical.average_enrollment_size_active_trials.toFixed(0) : 'N/A'}. Pipeline Diversity: ${mol1Data.clinical.pipeline_diversity_indications_count || 'N/A'} indications.`,
        [mol2Key]: `Trials by Phase: ${formatPhases(mol2Data.clinical.active_trials_count_by_phase)}. Average Enrollment: ${mol2Data.clinical.average_enrollment_size_active_trials ? mol2Data.clinical.average_enrollment_size_active_trials.toFixed(0) : 'N/A'}. Pipeline Diversity: ${mol2Data.clinical.pipeline_diversity_indications_count || 'N/A'} indications.`,
      });
    }

    // Market & Commercial Metrics
    if (mol1Data.market && mol2Data.market) {
      formattedDifferences.push({
        feature: "Market Size & Exports",
        [mol1Key]: `Global Market Size: ${mol1Data.market.global_therapy_area_market_size_usd ? `$${mol1Data.market.global_therapy_area_market_size_usd.toLocaleString()}` : 'N/A'}. API Export Volume: ${mol1Data.market.api_export_volume_metric_tons_total ? mol1Data.market.api_export_volume_metric_tons_total.toFixed(2) : '0'} metric tons. Export Value: $${mol1Data.market.api_export_value_usd_millions_total ? mol1Data.market.api_export_value_usd_millions_total.toFixed(2) : '0'}M.`,
        [mol2Key]: `Global Market Size: ${mol2Data.market.global_therapy_area_market_size_usd ? `$${mol2Data.market.global_therapy_area_market_size_usd.toLocaleString()}` : 'N/A'}. API Export Volume: ${mol2Data.market.api_export_volume_metric_tons_total ? mol2Data.market.api_export_volume_metric_tons_total.toFixed(2) : '0'} metric tons. Export Value: $${mol2Data.market.api_export_value_usd_millions_total ? mol2Data.market.api_export_value_usd_millions_total.toFixed(2) : '0'}M.`,
      });

      formattedDifferences.push({
        feature: "Import & Growth Metrics",
        [mol1Key]: `Formulation Import Value: $${mol1Data.market.formulation_import_value_usd_millions_total ? mol1Data.market.formulation_import_value_usd_millions_total.toFixed(2) : '0'}M. YoY Growth Average: ${mol1Data.market.yoy_growth_average_percent ? mol1Data.market.yoy_growth_average_percent.toFixed(2) + '%' : 'N/A'}.`,
        [mol2Key]: `Formulation Import Value: $${mol2Data.market.formulation_import_value_usd_millions_total ? mol2Data.market.formulation_import_value_usd_millions_total.toFixed(2) : '0'}M. YoY Growth Average: ${mol2Data.market.yoy_growth_average_percent ? mol2Data.market.yoy_growth_average_percent.toFixed(2) + '%' : 'N/A'}.`,
      });
    }

    return formattedDifferences;
  };

  const handleViewDifferences = async () => {
    const selectedNames = getSelectedMoleculeNames();
    
    if (selectedNames.length < 2) {
      setError("Please select at least 2 molecules to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    setViewDifferences(true);
    setExpandedTexts({});

    try {
      const response = await fetch('http://localhost:8000/api/compare-molecules/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          molecules: selectedNames
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const formattedDiffs = formatDifferenceData(data.molecules_data, selectedNames);
      setDifferences(formattedDiffs);
      setCurrentDiffIndex(0);
      
    } catch (err) {
      console.error('Error fetching molecule data:', err);
      setError(`Failed to fetch molecule data: ${err.message}`);
      setDifferences([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selectedMolecules).filter(Boolean).length;
  const canViewDifferences = selectedCount >= 2;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setMoleculeFadeDirection("fade-out");
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setMoleculeFadeDirection("fade-in");
        setTimeout(() => setMoleculeFadeDirection(""), 300);
      }, 300);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setMoleculeFadeDirection("fade-out");
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setMoleculeFadeDirection("fade-in");
        setTimeout(() => setMoleculeFadeDirection(""), 300);
      }, 300);
    }
  };

  const handleNextDifferences = () => {
    if (hasMoreDifferences) {
      setDifferencesFadeDirection("fade-out");
      setTimeout(() => {
        setCurrentDiffIndex(currentDiffIndex + visibleDifferencesCount);
        setDifferencesFadeDirection("fade-in");
        setTimeout(() => setDifferencesFadeDirection(""), 300);
      }, 300);
    }
  };

  const handlePreviousDifferences = () => {
    if (hasPreviousDifferences) {
      setDifferencesFadeDirection("fade-out");
      setTimeout(() => {
        let newIndex = currentDiffIndex - visibleDifferencesCount;
        if (newIndex < 0) newIndex = 0;
        setCurrentDiffIndex(newIndex);
        setDifferencesFadeDirection("fade-in");
        setTimeout(() => setDifferencesFadeDirection(""), 300);
      }, 300);
    }
  };

  const getSelectedMoleculeNames = () => {
    return molecules
      .filter((mol) => selectedMolecules[mol.id])
      .map((mol) => mol.name);
  };

  const renderTextWithReadMore = (text, diffIndex, columnKey) => {
    if (!text || text === 'chart') return text;
    
    const MAX_LENGTH = 530;
    const key = `${diffIndex}-${columnKey}`;
    const isExpanded = expandedTexts[key];
    
    if (text.length <= MAX_LENGTH) {
      return <div className="content-card">{text}</div>;
    }
    
    const displayText = isExpanded ? text : text.substring(0, MAX_LENGTH);
    
    return (
      <div className="content-card">
        {displayText}
        {!isExpanded && '...'}
        <button 
          className="read-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpandText(diffIndex, columnKey);
          }}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      </div>
    );
  };

  const selectedNames = getSelectedMoleculeNames();

  return (
    <div className="molecule-page">
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>
      <div className="bg-gradient-3"></div>

      {/* Left Sidebar */}
      <aside className="molecule-left">
        <div className="panel-glow"></div>

        <h2 className="title">
          <span className="title-icon">⚗️</span>
          Molecule Selector
        </h2>

        {/* Search and Add Section */}
        <div className="search-section">
          <input
            type="text"
            className="molecule-search"
            placeholder="Enter molecule name"
            value={newMoleculeName}
            onChange={(e) => setNewMoleculeName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addMolecule()}
          />
          <button
            className="add-molecule-button"
            onClick={addMolecule}
            disabled={!newMoleculeName.trim()}
          >
            <span className="add-icon">+</span>
            Add Molecule
          </button>
        </div>

        <div className="divider"></div>

        {/* Molecule List with Pagination */}
        <div className={`molecule-list-container ${moleculeFadeDirection}`}>
          {currentPage > 0 && (
            <button className="pagination-arrow arrow-up" onClick={handlePreviousPage}>
              <span>▲</span>
            </button>
          )}

          <div className="molecule-list">
            {currentMolecules.map((mol) => (
              <label
                key={mol.id}
                className={`molecule-item ${hoveredMolecule === mol.id ? "hovered" : ""} ${
                  selectedMolecules[mol.id] ? "selected" : ""
                }`}
                onMouseEnter={() => setHoveredMolecule(mol.id)}
                onMouseLeave={() => setHoveredMolecule(null)}
              >
                <input
                  type="checkbox"
                  checked={selectedMolecules[mol.id] || false}
                  onChange={() => toggleMolecule(mol.id)}
                />
                <span className="molecule-name">{mol.name}</span>
                {selectedMolecules[mol.id] && <div className="checkmark-glow"></div>}
              </label>
            ))}
          </div>

          {currentPage < totalPages - 1 && (
            <button className="pagination-arrow arrow-down" onClick={handleNextPage}>
              <span>▼</span>
            </button>
          )}
        </div>

        <button
          className={`view-differences-button ${!canViewDifferences ? "disabled" : ""}`}
          onClick={handleViewDifferences}
          disabled={!canViewDifferences || loading}
        >
          {loading ? "Loading..." : "View Differences"}
        </button>

        {viewDifferences && differences.length > 0 && (
          <div className="chart-options">
            <button className="chart-option-button">
              <span className="chart-icon">📊</span>
              View Bar Graph
            </button>
            <button className="chart-option-button">
              <span className="chart-icon">🎯</span>
              View Radar Chart
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="molecule-right">
        <div className="main-glow"></div>

        <div className="compare-table">
          {!viewDifferences || differences.length === 0 ? (
            <div className="placeholder-message">
              {error ? (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              ) : loading ? (
                <div className="loading-message">
                  <span className="loading-icon">⏳</span>
                  <p>Loading molecule data...</p>
                </div>
              ) : (
                <>
                  <span className="placeholder-icon">🔬</span>
                  <p>Select molecules to view the differences.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="table-header">
                <div className="header-col feature-col">
                  <span className="header-text">Feature</span>
                </div>
                {selectedNames.slice(0, 2).map((name, idx) => (
                  <div key={idx} className="header-col drug-col">
                    <div className="drug-header">
                      <span className="drug-icon">💊</span>
                      <span className="header-text">{name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Differences Rows */}
              <div ref={containerRef} className={`differences-container ${differencesFadeDirection}`}>
                {visibleDifferences.map((diff, idx) => {
                  const actualIndex = currentDiffIndex + idx;
                  const mol1Key = selectedNames[0].toLowerCase();
                  const mol2Key = selectedNames[1].toLowerCase();
                  
                  return (
                    <div key={`${actualIndex}-${diff.feature}`} className="table-row">
                      <div className="col feature-col">
                        <span className="feature-label">{diff.feature}</span>
                      </div>
                      <div className="col content-col">
                        {diff[mol1Key] === "chart" ? (
                          <div className="chart-placeholder">
                            <div className="chart-icon">📊</div>
                            <span className="chart-text">Chart Visualization</span>
                          </div>
                        ) : (
                          renderTextWithReadMore(diff[mol1Key], actualIndex, mol1Key)
                        )}
                      </div>
                      <div className="col content-col">
                        {diff[mol2Key] === "chart" ? (
                          <div className="chart-placeholder">
                            <div className="chart-icon">📊</div>
                            <span className="chart-text">Chart Visualization</span>
                          </div>
                        ) : (
                          renderTextWithReadMore(diff[mol2Key], actualIndex, mol2Key)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <div className="diff-navigation">
                {hasPreviousDifferences && (
                  <button className="diff-arrow prev-arrow" onClick={handlePreviousDifferences}>
                    <span>‹</span>
                  </button>
                )}
                {hasMoreDifferences && (
                  <button className="diff-arrow next-arrow" onClick={handleNextDifferences}>
                    <span>›</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}