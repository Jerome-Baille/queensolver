import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const colorToNameMapping = {
   "V": "#BBA3E1", // Soft Purple
   "O": "#FECA91", // Soft Orange
   "G": "#B3DFA0", // Soft Green
   "B": "#96BDFE", // Soft Blue
   "W": "#DFDFDF", // Soft Gray
   "C": "#E6F389", // Lime Green
   "P": "#DFA0BF", // Elegant Pink
   "R": "#FE7B5F", // Soft Red
   "E": "#B9B29F", // Beige
   "L": "#A52A2A", // Velvet Brown
   "A": "#A3D2D8", // Light Blue
   "T": "#62EFE9", // Turquoise
   "": "#3A3A4A"  // Default color
};

function App() {
   const [boardSize, setBoardSize] = useState(7);
   const [board, setBoard] = useState(Array(7).fill().map(() => Array(7).fill("")));
   const [solution, setSolution] = useState(null);
   const [currentColor, setCurrentColor] = useState("");
   const [loading, setLoading] = useState(false);
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10)); // default today
   const [configVisible, setConfigVisible] = useState(false); // new config panel state

   const handleCellClick = (r, c) => {
      const newBoard = board.map((row, rowIndex) =>
         row.map((cell, colIndex) =>
            rowIndex === r && colIndex === c ? currentColor : cell
         )
      );
      setBoard(newBoard);
   };

   const handleSizeChange = (size) => {
      setBoardSize(size);
      setBoard(Array(size).fill().map(() => Array(size).fill("")));
      setSolution(null);
      // Add this line to update the CSS variable
      document.documentElement.style.setProperty('--board-size', size);
      setConfigVisible(false); // close config panel when board size is changed
   };

   // Add this to set initial board size on component mount
   React.useEffect(() => {
      document.documentElement.style.setProperty('--board-size', boardSize);
   }, []);

   const handleSolve = async () => {
      setLoading(true);
      const boardStr = board.map(row => row.join("")).join("\n");
      const coloredRegions = convertToColoredRegions(boardStr);
      try {
         const response = await axios.get('https://queen-solver.jerome-baille.fr/solve', {
            params: {
               board_size: boardSize,
               colored_regions: JSON.stringify(coloredRegions)
            }
         });
         setSolution(response.data.solution);
      } catch (error) {
         console.error("Error solving the board:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleReset = () => {
      setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill(""))); 
      setSolution(null); 
   };

   const handleFillBoard = () => {
      setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill(currentColor)));
   };

   const convertToColoredRegions = (boardStr) => {
      const coloredRegions = {};
      const rows = boardStr.split("\n");
      rows.forEach((row, r) => {
         row.split("").forEach((colorKey, c) => {
            if (colorKey === "") {
               return;
            } else {
               if (!coloredRegions[colorKey]) {
                  coloredRegions[colorKey] = [];
               }
               coloredRegions[colorKey].push([r, c]);
            }
         });
      });
      return coloredRegions;
   };

   // Helper: Convert colored regions back to board matrix
   const convertRegionsToBoard = (coloredRegions, size) => {
      const newBoard = Array(size).fill().map(() => Array(size).fill(""));
      Object.keys(coloredRegions).forEach(colorKey => {
         coloredRegions[colorKey].forEach(([r, c]) => {
            newBoard[r][c] = colorKey;
         });
      });
      return newBoard;
   };

   // Updated: Save current board using selectedDate if provided
   const handleSaveBoard = async () => {
      setConfigVisible(false); // close config panel on save
      const boardStr = board.map(row => row.join("")).join("\n");
      const coloredRegions = convertToColoredRegions(boardStr);
      // Use selectedDate or default to today
      const dateToSave = selectedDate || new Date().toISOString().slice(0,10);
      try {
         const response = await axios.post('https://queen-solver.jerome-baille.fr/save', {
            board_size: boardSize,
            colored_regions: coloredRegions,
            date: dateToSave
         });
         alert("Board saved for " + response.data.record.date);
      } catch (error) {
         console.error("Error saving the board:", error);
      }
      setSelectedDate(new Date().toISOString().slice(0,10)); // reset date picker to today
   };

   const handleLoadBoard = async () => {
      if (!selectedDate) return;
      setConfigVisible(false); // close config panel on load
      try {
         const response = await axios.get('https://queen-solver.jerome-baille.fr/data', {
            params: { date: selectedDate }
         });
         const records = response.data.records;
         if (records.length > 0) {
            // For simplicity, take the first record.
            const record = records[0];
            setBoardSize(record.board_size);
            setBoard(convertRegionsToBoard(record.colored_regions, record.board_size));
            setSolution(record.solution);
         } else {
            alert("No board data found for the selected date.");
         }
      } catch (error) {
         console.error("Error loading board data:", error);
      }
      setSelectedDate(new Date().toISOString().slice(0,10)); // reset date picker to today
   };

   return (
      <>
         {loading && (
            <div className="loading-overlay">
               <div className="loading-spinner"></div>
            </div>
         )}
         <main className='main'>
            {/* Removed board size selector from here */}
            <div className="board-container">
               <div className="board">
                  {board.map((row, r) => (
                     <div key={r} className="board-row">
                        {row.map((cell, c) => (
                           <button
                              key={c}
                              className="board-cell"
                              style={{ backgroundColor: colorToNameMapping[cell] }}
                              onClick={() => handleCellClick(r, c)}
                           >
                              {solution && solution[r][c] ? <span className="queen-icon">♛</span> : ""}
                           </button>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
            <div className="color-buttons">
               {["V", "O", "G", "B", "W", "C", "P", "R", "E", "L", "A", "T"].map(colorKey => (
                  <button
                     key={colorKey}
                     className={`color-button ${currentColor === colorKey ? 'selected' : ''}`}
                     style={{ backgroundColor: colorToNameMapping[colorKey] }}
                     onClick={() => setCurrentColor(colorKey)}
                  />
               ))}
               <button 
                  className="fill-board-button"
                  onClick={handleFillBoard}
                  disabled={!currentColor}
               >
                  Fill Board
               </button>
            </div>
         </main>
         <footer className='footer'>
            <div className="button-container">
               <button className="solve-button" onClick={handleSolve} disabled={loading}>
                  Solve
               </button>
               <button onClick={handleReset} disabled={loading}>
                  Reset
               </button>
               <button onClick={() => setConfigVisible(!configVisible)}>
                  Config
               </button>
            </div>
         </footer>
         {configVisible && (
            <div className="config-overlay" onClick={() => setConfigVisible(false)}>
               <div className="config-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="config-item">
                     <div className="md-form-field">
                        <label htmlFor="board-size" className="md-label">Board Size</label>
                        <select
                           id="board-size"
                           className="md-input"
                           value={boardSize}
                           onChange={(e) => handleSizeChange(Number(e.target.value))}
                        >
                           {Array.from({length: 15 - 5}, (_, i) => i + 6).map(size => (
                              <option key={size} value={size}>{size}x{size}</option>
                           ))}
                        </select>
                     </div>
                  </div>
                  <div className="config-item">
                     <div className="md-form-field">
                        <label htmlFor="date-input" className="md-label">Date</label>
                        <input 
                           id="date-input"
                           type="date" 
                           className="md-input"
                           value={selectedDate} 
                           onChange={(e) => setSelectedDate(e.target.value)} 
                        />
                     </div>
                  </div>
                  <div className="config-item">
                     <button className="save-button" onClick={handleSaveBoard} disabled={loading}>
                        Save Board
                     </button>
                     <button onClick={handleLoadBoard} disabled={loading}>
                        Load Board
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}

export default App;