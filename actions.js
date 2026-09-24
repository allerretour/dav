// ==========================================
// 💾 GESTION DES ACTIONS & FICHIERS
// ==========================================

function clearCurrentCell() {
    if (!activeCoords) return;
    delete diagramData[activeCoords];
    updateCellDOM(activeCoords);
    updatePaletteSelection(null);
    updateCellsList();
    disableUsedBillesInPalette();
}

function clearAll() {
    if (confirm("Voulez-vous vider toutes les billes du tapis ?")) {
        diagramData = {};
        diagramTitle = "mon-diagramme-billard";
        diagramDescription = "";
        activeCoords = null;
        
        titleInput.value = diagramTitle;
        descInput.value = diagramDescription;
        clearCellBtn.disabled = true;
        coordXEl.textContent = "X: --";
        coordYEl.textContent = "Y: --";
        renderAllGrid();
    }
}

function distributeRandomBilles() {
    diagramData = {};
    const includeBlanche = document.getElementById('includeBlancheCheck').checked;
    let billesToPlace = [];
    
    if (includeBlanche) {
        billesToPlace.push('blanche');
    }

    for (let i = 1; i <= maxAvailableBilles; i++) {
        billesToPlace.push(`bille_${i}`);
    }

    let possibleSlots = [];
    for (let x = 0; x < GRID_COLUMNS; x++) {
        for (let y = 0; y < GRID_ROWS; y++) {
            possibleSlots.push(`${x},${y}`);
        }
    }

    billesToPlace.forEach(billeKey => {
        if (possibleSlots.length === 0) return;
        const randomIndex = Math.floor(Math.random() * possibleSlots.length);
        const chosenCoordinate = possibleSlots.splice(randomIndex, 1);
        diagramData[chosenCoordinate] = { billeType: billeKey };
    });

    renderAllGrid();
}

function generateDiagramImage() {
    const targetGrid = document.getElementById('diagramGrid');
    const activeCell = document.querySelector('.cell.active');
    if (activeCell) activeCell.classList.remove('active');

    const options = {
        backgroundColor: '#0f3019',
        logging: false,
        useCORS: true,
        scale: 2
    };

    html2canvas(targetGrid, options).then(canvas => {
        const imageURI = canvas.toDataURL("image/png");
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", imageURI);
        const safeFileName = diagramTitle.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
        downloadAnchor.setAttribute("download", `${safeFileName || 'diagramme'}.png`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        if (activeCell) activeCell.classList.add('active');
    }).catch(err => {
        alert("Erreur lors de la création de l'image.");
        if (activeCell) activeCell.classList.add('active');
    });
}

function exportToTextFile() {
    const activeKeys = Object.keys(diagramData).filter(k => diagramData[k] && diagramData[k].billeType !== null);

    if (activeKeys.length === 0) {
        alert("Le tapis est vide. Rien à exporter sous forme de texte.");
        return;
    }

    let textContent = `=========================================\n`;
    textContent += `DIAGRAMME DE JEU : ${diagramTitle.toUpperCase()}\n`;
    textContent += `=========================================\n`;
    textContent += `Description : ${diagramDescription.trim() || 'Aucune description.'}\n\n`;
    textContent += `COORDONNÉES DES BILLES PLACÉES (${activeKeys.length}) :\n`;
    textContent += `-----------------------------------------\n`;

    activeKeys.sort((a, b) => {
        const idA = BILLARD_BILLES[diagramData[a].billeType] ? BILLARD_BILLES[diagramData[a].billeType].id : 99;
        const idB = BILLARD_BILLES[diagramData[b].billeType] ? BILLARD_BILLES[diagramData[b].billeType].id : 99;
        return idA - idB;
    });

    activeKeys.forEach(key => {
        const billeInfo = BILLARD_BILLES[diagramData[key].billeType];
        if (billeInfo) {
            const [x, y] = key.split(',');
            textContent += `- Bille ${billeInfo.name.padEnd(12)} -> Position [ X : ${x.padStart(2)} , Y : ${y} ]\n`;
        }
    });

    textContent += `\nFait le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeFileName = diagramTitle.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
    downloadAnchor.setAttribute("download", `${safeFileName || 'coordonnees-diagramme'}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function exportToFile() {
    const fullPayload = {
        title: diagramTitle,
        description: diagramDescription,
        billes: diagramData
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullPayload));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeFileName = diagramTitle.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
    downloadAnchor.setAttribute("download", `${safeFileName || 'diagramme'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// 🎯 FONCTION INTERNE CORRECTE POUR NETTOYER ET PASSER AU FORMAT MODULAIRE
function importFromFile(event) {
    const files = event.target.files; 
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            diagramData = {}; // Réinitialise la mémoire locale
            
            // Format 1 : Structure globale (Titre + Description + Billes)
            if (parsed && parsed.billes !== undefined) {
                diagramTitle = parsed.title || "mon-diagramme-billard";
                diagramDescription = parsed.description || "";
                
                Object.keys(parsed.billes).forEach(key => {
                    const node = parsed.billes[key];
                    if (node && typeof node === 'object' && node.billeType !== undefined) {
                        diagramData[key] = { billeType: node.billeType };
                    } else if (node) {
                        diagramData[key] = { billeType: node };
                    }
                });
            } 
            // Format 2 : Fichier brut (Uniquement les coordonnées)
            else if (parsed) {
                Object.keys(parsed).forEach(key => {
                    const node = parsed[key];
                    if (node && typeof node === 'object' && node.billeType !== undefined) {
                        diagramData[key] = { billeType: node.billeType };
                    } else if (node) {
                        diagramData[key] = { billeType: node };
                    }
                });
            }

            // Rafraîchir les éléments d'affichage du texte (Inputs)
            titleInput.value = diagramTitle;
            descInput.value = diagramDescription;
            
            // Redessiner intégralement le tapis
            renderAllGrid();
            alert("Diagramme importé avec succès !");
        } catch (error) {
            console.error("Détail de l'erreur d'import :", error);
            alert("Erreur de lecture : Ce fichier n'est pas un fichier JSON de configuration de billard valide.");
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Réinitialisation de l'input de fichier
}
