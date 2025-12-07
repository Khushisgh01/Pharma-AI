import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
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
  
  // View States
  const [viewDifferences, setViewDifferences] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState("text");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Data States
  const [differences, setDifferences] = useState([]);
  const [rawData, setRawData] = useState(null);
  
  // Pagination & Animation States
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [moleculeFadeDirection, setMoleculeFadeDirection] = useState("");
  const [differencesFadeDirection, setDifferencesFadeDirection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTexts, setExpandedTexts] = useState({});
  const [visibleDifferencesCount, setVisibleDifferencesCount] = useState(2);
  
  const containerRef = useRef(null);
  const MAX_CONTAINER_HEIGHT = 600;

  const moleculesPerPage = 5;
  const totalPages = Math.ceil(molecules.length / moleculesPerPage);
  const startIndex = currentPage * moleculesPerPage;
  const currentMolecules = molecules.slice(startIndex, startIndex + moleculesPerPage);

  useEffect(() => {
    if (differences.length > 0 && containerRef.current && visualizationMode === "text") {
      calculateVisibleDifferences();
    }
  }, [differences, currentDiffIndex, visualizationMode]);

  const getSelectedMoleculeNames = () => {
    return molecules
      .filter((mol) => selectedMolecules[mol.id])
      .map((mol) => mol.name);
  };

  const calculateVisibleDifferences = () => {
    const remainingDiffs = differences.slice(currentDiffIndex);
    let count = 0;
    let estimatedHeight = 0;
    
    const selectedNames = getSelectedMoleculeNames();
    if (selectedNames.length < 2) return;

    for (let i = 0; i < remainingDiffs.length; i++) {
      const diff = remainingDiffs[i];
      const mol1Key = selectedNames[0]?.toLowerCase();
      const mol2Key = selectedNames[1]?.toLowerCase();
      
      if (!mol1Key || !mol2Key) continue;

      const content1 = diff[mol1Key] || '';
      const content2 = diff[mol2Key] || '';
      const itemHeight = Math.max(100, (Math.max(content1.length, content2.length) / 80) * 25 + 80);
      
      if (estimatedHeight + itemHeight <= MAX_CONTAINER_HEIGHT) {
        count++;
        estimatedHeight += itemHeight;
      } else {
        break;
      }
    }
    setVisibleDifferencesCount(Math.max(1, count));
  };

  const toggleMolecule = (id) => {
    if (viewDifferences) {
      resetView();
    }
    setSelectedMolecules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetView = () => {
    setViewDifferences(false);
    setVisualizationMode("text");
    setDifferences([]);
    setRawData(null);
    setError(null);
    setShowDropdown(false);
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

    // 1. Patent
    if (mol1Data.patent && mol2Data.patent) {
      formattedDifferences.push({
        feature: "Patent Status",
        [mol1Key]: `Status: ${mol1Data.patent.base_molecule_patent_status}. Active US Patents: ${mol1Data.patent.active_us_patents_count}. FTO: ${mol1Data.patent.freedom_to_operate}.`,
        [mol2Key]: `Status: ${mol2Data.patent.base_molecule_patent_status}. Active US Patents: ${mol2Data.patent.active_us_patents_count}. FTO: ${mol2Data.patent.freedom_to_operate}.`,
      });
    }

    // 2. Clinical
    if (mol1Data.clinical && mol2Data.clinical) {
      formattedDifferences.push({
        feature: "Clinical Overview",
        [mol1Key]: `Total Trials: ${mol1Data.clinical.total_clinical_trials}. Completed: ${mol1Data.clinical.completed_trials_count}. Approved Indications: ${mol1Data.clinical.approved_indications_count}.`,
        [mol2Key]: `Total Trials: ${mol2Data.clinical.total_clinical_trials}. Completed: ${mol2Data.clinical.completed_trials_count}. Approved Indications: ${mol2Data.clinical.approved_indications_count}.`,
      });
    }

    // 3. Market
    if (mol1Data.market && mol2Data.market) {
      formattedDifferences.push({
        feature: "Market & Exports",
        [mol1Key]: `Export Value: $${mol1Data.market.api_export_value_usd_millions_total}M. YoY Growth: ${mol1Data.market.yoy_growth_average_percent}%.`,
        [mol2Key]: `Export Value: $${mol2Data.market.api_export_value_usd_millions_total}M. YoY Growth: ${mol2Data.market.yoy_growth_average_percent}%.`,
      });
    }

    return formattedDifferences;
  };

  const handleViewDifferences = async (targetMode = "text") => {
    const mode = typeof targetMode === 'string' ? targetMode : "text";
    const selectedNames = getSelectedMoleculeNames();
    
    if (selectedNames.length < 2) {
      setError("Please select at least 2 molecules to compare.");
      return;
    }

    setShowDropdown(false);

    if (differences.length > 0 && viewDifferences) {
        setVisualizationMode(mode);
        return;
    }

    setLoading(true);
    setError(null);
    setViewDifferences(true);
    setVisualizationMode(mode);
    setExpandedTexts({});

    try {
      const response = await fetch('http://localhost:8000/api/compare-molecules/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ molecules: selectedNames })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      setRawData(data.molecules_data);
      const formattedDiffs = formatDifferenceData(data.molecules_data, selectedNames);
      setDifferences(formattedDiffs);
      setCurrentDiffIndex(0);
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setDifferences([]);
    } finally {
      setLoading(false);
    }
  };

  // --- CHART DATA PREPARATION ---

  const getBarChartData = () => {
    const names = getSelectedMoleculeNames();
    if (names.length < 2 || !rawData) return [];

    const m1 = names[0].toLowerCase();
    const m2 = names[1].toLowerCase();
    const d1 = rawData[m1];
    const d2 = rawData[m2];

    if (!d1 || !d2) return [];

    return [
      {
        name: "Clinical Trials",
        [names[0]]: d1.clinical?.total_clinical_trials || 0,
        [names[1]]: d2.clinical?.total_clinical_trials || 0,
      },
      {
        name: "Active Patents",
        [names[0]]: d1.patent?.active_us_patents_count || 0,
        [names[1]]: d2.patent?.active_us_patents_count || 0,
      },
      {
        name: "Indications",
        [names[0]]: d1.clinical?.approved_indications_count || 0,
        [names[1]]: d2.clinical?.approved_indications_count || 0,
      },
      {
        name: "Export ($M)",
        [names[0]]: d1.market?.api_export_value_usd_millions_total || 0,
        [names[1]]: d2.market?.api_export_value_usd_millions_total || 0,
      },
    ];
  };

  const getRadarChartData = () => {
    const names = getSelectedMoleculeNames();
    if (names.length < 2 || !rawData) return [];

    const m1 = names[0].toLowerCase();
    const m2 = names[1].toLowerCase();
    const d1 = rawData[m1];
    const d2 = rawData[m2];

    if (!d1 || !d2) return [];

    const normalize = (val, max) => Math.min(100, Math.round((val / max) * 100));

    return [
      {
        subject: "Clinical Maturity",
        A: normalize(d1.clinical?.total_clinical_trials || 0, 50),
        B: normalize(d2.clinical?.total_clinical_trials || 0, 50),
        fullMark: 100,
      },
      {
        subject: "Patent Strength",
        A: normalize(d1.patent?.active_us_patents_count || 0, 20),
        B: normalize(d2.patent?.active_us_patents_count || 0, 20),
        fullMark: 100,
      },
      {
        subject: "Market Share",
        A: normalize(d1.market?.global_therapy_area_market_size_usd || 0, 10000000000), 
        B: normalize(d2.market?.global_therapy_area_market_size_usd || 0, 10000000000),
        fullMark: 100,
      },
      {
        subject: "Export Vol",
        A: normalize(d1.market?.api_export_volume_metric_tons_total || 0, 500),
        B: normalize(d2.market?.api_export_volume_metric_tons_total || 0, 500),
        fullMark: 100,
      },
      {
        subject: "Growth (YoY)",
        A: normalize(d1.market?.yoy_growth_average_percent || 0, 20),
        B: normalize(d2.market?.yoy_growth_average_percent || 0, 20),
        fullMark: 100,
      },
    ];
  };

  // --- RENDERERS ---

  const renderBarChart = () => {
    const data = getBarChartData();
    const names = getSelectedMoleculeNames();
    
    return (
      <div className="chart-container fade-in">
        <h3 className="chart-title">Direct Metric Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey={names[0]} fill="#8884d8" name={names[0]} />
            <Bar dataKey={names[1]} fill="#82ca9d" name={names[1]} />
          </BarChart>
        </ResponsiveContainer>
        <button className="back-to-table-btn" onClick={() => setVisualizationMode("text")}>
          Back to Table
        </button>
      </div>
    );
  };

  const renderRadarChart = () => {
    const data = getRadarChartData();
    const names = getSelectedMoleculeNames();

    return (
      <div className="chart-container fade-in">
        <h3 className="chart-title">Competitive Landscape (Normalized Score)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#666" />
            <PolarAngleAxis dataKey="subject" stroke="#ccc" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#999" />
            <Radar
              name={names[0]}
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name={names[1]}
              dataKey="B"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444' }}
              itemStyle={{ color: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <button className="back-to-table-btn" onClick={() => setVisualizationMode("text")}>
          Back to Table
        </button>
      </div>
    );
  };

  const renderTextComparison = (selectedNames) => {
    const visibleDifferences = differences.slice(currentDiffIndex, currentDiffIndex + visibleDifferencesCount);
    const hasMoreDifferences = currentDiffIndex + visibleDifferencesCount < differences.length;
    const hasPreviousDifferences = currentDiffIndex > 0;

    return (
      <>
        {selectedNames.length >= 2 && (
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
        )}

        <div ref={containerRef} className={`differences-container ${differencesFadeDirection}`}>
          {visibleDifferences.map((diff, idx) => {
            const actualIndex = currentDiffIndex + idx;
            if (selectedNames.length < 2) return null;
            const mol1Key = selectedNames[0]?.toLowerCase();
            const mol2Key = selectedNames[1]?.toLowerCase();

            return (
              <div key={`${actualIndex}-${diff.feature}`} className="table-row">
                <div className="col feature-col">
                  <span className="feature-label">{diff.feature}</span>
                </div>
                <div className="col content-col">
                  <div className="content-card">{diff[mol1Key]}</div>
                </div>
                <div className="col content-col">
                  <div className="content-card">{diff[mol2Key]}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="diff-navigation">
          {hasPreviousDifferences && (
            <button className="diff-arrow prev-arrow" onClick={() => setCurrentDiffIndex(prev => Math.max(0, prev - visibleDifferencesCount))}>
              <span>‹</span>
            </button>
          )}
          {hasMoreDifferences && (
            <button className="diff-arrow next-arrow" onClick={() => setCurrentDiffIndex(prev => prev + visibleDifferencesCount)}>
              <span>›</span>
            </button>
          )}
        </div>
      </>
    );
  };

  const selectedNames = getSelectedMoleculeNames();
  const selectedCount = Object.values(selectedMolecules).filter(Boolean).length;
  const canViewDifferences = selectedCount >= 2;

  // Pagination Handlers
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

  return (
    <div className="molecule-page">
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>
      <div className="bg-gradient-3"></div>

      <aside className="molecule-left">
        <div className="panel-glow"></div>
        <h2 className="title"><span className="title-icon">⚗️</span>Molecule Selector</h2>

        <div className="search-section">
          <input
            type="text"
            className="molecule-search"
            placeholder="Enter molecule name"
            value={newMoleculeName}
            onChange={(e) => setNewMoleculeName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addMolecule()}
          />
          <button className="add-molecule-button" onClick={addMolecule} disabled={!newMoleculeName.trim()}>
            <span className="add-icon">+</span> Add
          </button>
        </div>

        <div className="divider"></div>

        <div className={`molecule-list-container ${moleculeFadeDirection}`}>
           {currentPage > 0 && <button className="pagination-arrow arrow-up" onClick={handlePreviousPage}><span>▲</span></button>}
          <div className="molecule-list">
            {currentMolecules.map((mol) => (
              <label key={mol.id} className={`molecule-item ${hoveredMolecule === mol.id ? "hovered" : ""} ${selectedMolecules[mol.id] ? "selected" : ""}`}
                onMouseEnter={() => setHoveredMolecule(mol.id)}
                onMouseLeave={() => setHoveredMolecule(null)}>
                <input type="checkbox" checked={selectedMolecules[mol.id] || false} onChange={() => toggleMolecule(mol.id)} />
                <span className="molecule-name">{mol.name}</span>
              </label>
            ))}
          </div>
          {currentPage < totalPages - 1 && <button className="pagination-arrow arrow-down" onClick={handleNextPage}><span>▼</span></button>}
        </div>

        <div className="view-diff-group">
          <button 
            className={`view-differences-button main-btn ${!canViewDifferences ? "disabled" : ""}`} 
            onClick={() => handleViewDifferences("text")} 
            disabled={!canViewDifferences || loading}
          >
            {loading ? "Loading..." : "View Differences"}
          </button>
          
          <button 
            className={`dropdown-toggle-button ${!canViewDifferences ? "disabled" : ""}`}
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={!canViewDifferences || loading}
          >
            <span className={`arrow-icon ${showDropdown ? 'open' : ''}`}>▼</span>
          </button>
          
          {showDropdown && (
            <div className="view-options-dropdown">
               <button className="dropdown-item" onClick={() => handleViewDifferences("text")}>
                 <span className="icon">📝</span> Table View
               </button>
               <button className="dropdown-item" onClick={() => handleViewDifferences("bar")}>
                 <span className="icon">📊</span> Bar Graph
               </button>
               <button className="dropdown-item" onClick={() => handleViewDifferences("radar")}>
                 <span className="icon">🎯</span> Radar Chart
               </button>
            </div>
          )}
        </div>

      </aside>

      <main className="molecule-right">
        <div className="main-glow"></div>
        <div className="compare-table">
          {!viewDifferences || differences.length === 0 ? (
            <div className="placeholder-message">
              {error ? (
                <div className="error-message"><span className="error-icon">⚠️</span><p>{error}</p></div>
              ) : loading ? (
                <div className="loading-message"><span className="loading-icon">⏳</span><p>Loading data...</p></div>
              ) : (
                <><span className="placeholder-icon">🔬</span><p>Select molecules to view the differences.</p></>
              )}
            </div>
          ) : (
            <>
              {visualizationMode === 'text' && renderTextComparison(selectedNames)}
              {visualizationMode === 'bar' && renderBarChart()}
              {visualizationMode === 'radar' && renderRadarChart()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}