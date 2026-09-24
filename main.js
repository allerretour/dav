// ==========================================
// ðŸŽ¨ RENDU VISUEL ET EN-TÃŠTES
// ==========================================

function createGrid() {
    gridEl.innerHTML = '';
    
    // 1. Déplacement de la ligne de 40px (header) à la fin des lignes
    gridEl.style.gridTemplateColumns = `40px repeat(${GRID_COLUMNS}, 45px)`;
    gridEl.style.gridTemplateRows = `repeat(${GRID_ROWS}, 45px) 40px`;

    // 2. On génère d'abord les lignes de données (du haut vers le bas)
    for (let y = GRID_ROWS - 1; y >= 0; y--) {
        const vCell = document.createElement('div');
        vCell.classList.add('cell', 'header-cell');
        vCell.textContent = y;
        gridEl.appendChild(vCell);

        for (let x = 0; x < GRID_COLUMNS; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.key = `${x},${y}`;
            cell.innerHTML = `<div class="cell-number-circle" style="display: none;"></div><span class="cell-title-preview"></span>`;
            
            if (y === 4 || x === 4 || x === 8 || x === 12) {
                cell.style.backgroundColor = '#386641'; 
                cell.style.border = '1px dashed rgba(255,255,255,0.25)';
            }

            cell.addEventListener('click', () => selectCell(x, y));
            gridEl.appendChild(cell);
        }
    }

    // 3. On génère enfin la ligne du bas : le coin inférieur gauche...
    const corner = document.createElement('div');
    corner.classList.add('cell', 'header-cell', 'header-corner');
    gridEl.appendChild(corner);

    // ...suivi des étiquettes de colonnes (X)
    for (let x = 0; x < GRID_COLUMNS; x++) {
        const hCell = document.createElement('div');
        hCell.classList.add('cell', 'header-cell');
        hCell.textContent = x;
        gridEl.appendChild(hCell);
    }
}


function createBillePalette() {
    colorContainer.innerHTML = '';
    Object.keys(BILLARD_BILLES).forEach(key => {
        const bille = BILLARD_BILLES[key];
        const btn = document.createElement('button');
        btn.classList.add('color-btn');
        btn.style.backgroundColor = bille.color;
        btn.style.color = bille.textColor;
        btn.textContent = bille.label;
        btn.title = bille.name;
        btn.dataset.billeKey = key;
        btn.addEventListener('click', () => changeCellBille(key));
        colorContainer.appendChild(btn);
    });
}

// Fonction de mise Ã  jour liÃ©e au champ numÃ©rique
function updateMaxAvailableBilles() {
    const input = document.getElementById('billesCountInput');
    let val = parseInt(input.value, 10);
    
    // Forcer le respect des bornes de 1 Ã  15
    if (isNaN(val) || val < 1) val = 1;
    if (val > 15) val = 15;
    input.value = val;
    
    maxAvailableBilles = val;
    
    // Nettoyer du tapis les billes posÃ©es qui dÃ©passeraient la nouvelle limite numÃ©rique
    Object.keys(diagramData).forEach(coordKey => {
        const currentBilleType = diagramData[coordKey].billeType;
        if (currentBilleType && currentBilleType !== 'blanche') {
            const currentBilleId = BILLARD_BILLES[currentBilleType].id;
            if (currentBilleId > maxAvailableBilles) {
                delete diagramData[coordKey];
            }
        }
    });

    renderAllGrid();
}

function disableUsedBillesInPalette() {
    const usedBilleTypes = Object.keys(diagramData)
        .map(key => diagramData[key].billeType)
        .filter(type => type !== null);

    document.querySelectorAll('.color-btn').forEach(btn => {
        const key = btn.dataset.billeKey;
        const bille = BILLARD_BILLES[key];

        // Ã‰liminer / masquer les billes numÃ©rotÃ©es au-delÃ  de la limite max dÃ©finie
        if (bille.id > maxAvailableBilles) {
            btn.disabled = true;
            btn.classList.add('hidden-bille');
            btn.classList.remove('selected');
        } else if (usedBilleTypes.includes(key)) {
            // Griser les billes dÃ©jÃ  prÃ©sentes sur le tapis
            btn.disabled = true;
            btn.classList.remove('hidden-bille');
            btn.style.opacity = '0.2';
            btn.style.cursor = 'not-allowed';
            btn.classList.remove('selected');
        } else {
            // Libre et disponible
            btn.disabled = false;
            btn.classList.remove('hidden-bille');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

function selectCell(x, y) {
    const previousActive = document.querySelector('.cell.active');
    if (previousActive) previousActive.classList.remove('active');

    activeCoords = `${x},${y}`;
    document.querySelector(`[data-key="${activeCoords}"]`).classList.add('active');

    clearCellBtn.disabled = false;
    coordXEl.textContent = `X: ${x}`;
    coordYEl.textContent = `Y: ${y}`;

    if (!diagramData[activeCoords]) diagramData[activeCoords] = { billeType: null };
    
    disableUsedBillesInPalette();
    updatePaletteSelection(diagramData[activeCoords].billeType);
}

function changeCellBille(billeKey) {
    if (!activeCoords) return;
    diagramData[activeCoords].billeType = billeKey;
    updateCellDOM(activeCoords);
    disableUsedBillesInPalette(); 
    updatePaletteSelection(billeKey);
    updateCellsList();
}

function updatePaletteSelection(currentBilleType) {
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.billeKey === currentBilleType && !btn.disabled) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function updateCellDOM(key) {
    const cellEl = document.querySelector(`[data-key="${key}"]`);
    if (!cellEl) return;

    const data = diagramData[key];
    const numEl = cellEl.querySelector('.cell-number-circle');

    if (data && data.billeType && BILLARD_BILLES[data.billeType]) {
        const bille = BILLARD_BILLES[data.billeType];
        cellEl.classList.add('has-bille');
        cellEl.setAttribute('data-bille-type', data.billeType);
        cellEl.style.backgroundColor = bille.color;
        numEl.style.display = 'flex';
        numEl.textContent = bille.label;

        // ?? CORRECTION RADICALE DE LA COULEUR DU TEXTE
        if (data.billeType === 'blanche') {
            // Pour la bille blanche (sans cercle central), on utilise sa propre couleur de texte
            numEl.style.color = bille.textColor; 
        } else {
            // Pour TOUTES les autres billes (1 à 15), le numéro est écrit dans le cercle blanc : il DOIT être noir
            numEl.style.color = '#000000'; 
        }

        // Ajustement automatique de la taille de la police selon le numéro
        if (bille.label.length > 1) {
            numEl.style.fontSize = '0.7rem'; // Plus petit pour 10, 11, 12...
        } else if (data.billeType !== 'blanche') {
            numEl.style.fontSize = '0.8rem'; // Normal pour 1 à 8
        } else {
            numEl.style.fontSize = '1.1rem'; // Grand "B" pour la bille blanche
        }

        // Gestion des textures 3D et des rayures
        if (bille.id >= 9) {
            cellEl.style.backgroundImage = `
                radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 40%),
                radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.3) 100%),
                linear-gradient(to bottom, ${bille.color} 25%, #ffffff 25%, #ffffff 75%, ${bille.color} 75%)
            `;
        } else if (data.billeType === 'blanche') {
            cellEl.style.backgroundImage = 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e6e6e6 60%, #b3b3b3 100%)';
        } else {
            cellEl.style.backgroundImage = 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 40%), radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)';
        }
    } else {
        cellEl.classList.remove('has-bille');
        cellEl.removeAttribute('data-bille-type');
        cellEl.style.backgroundImage = '';
        numEl.style.display = 'none';

        const [x, y] = key.split(',').map(Number);
        if (y === 4 || x === 4 || x === 8 || x === 12) {
            cellEl.style.backgroundColor = '#386641';
        } else {
            cellEl.style.backgroundColor = ''; 
        }
    }
}



function updateCellsList() {
    cellsListContainer.innerHTML = '';
    const activeKeys = Object.keys(diagramData).filter(k => diagramData[k].billeType !== null);

    if (activeKeys.length === 0) {
        cellsListContainer.innerHTML = `<div style="color: #999; font-style: italic;">Aucune bille sur le tapis</div>`;
        return;
    }

    activeKeys.sort().forEach(key => {
        const item = diagramData[key];
        const row = document.createElement('div');
        const bInfo = BILLARD_BILLES[item.billeType];
        row.innerHTML = `<span><strong>[${key}]</strong> ${bInfo ? 'Bille ' + bInfo.name : ''}</span><span class="badge-color" style="background-color: ${bInfo ? bInfo.color : 'transparent'}"></span>`;
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => { const [x, y] = key.split(',').map(Number); selectCell(x, y); });
        cellsListContainer.appendChild(row);
    });
}

function renderAllGrid() {
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLUMNS; x++) { updateCellDOM(`${x},${y}`); }
    }
    disableUsedBillesInPalette(); 
    updateCellsList();
}

titleInput.addEventListener('input', (e) => { diagramTitle = e.target.value; });
descInput.addEventListener('input', (e) => { diagramDescription = e.target.value; });

window.onload = function() {
    createGrid();
    createBillePalette();
    titleInput.disabled = false;
    descInput.disabled = false;
    titleInput.value = diagramTitle;
    descInput.value = diagramDescription;
    renderAllGrid();
};
