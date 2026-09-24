const GRID_COLUMNS = 17; 
const GRID_ROWS = 9;     

const BILLARD_BILLES = {
    'blanche': { id: 0, name: 'Blanche', color: '#ffffff', textColor: '#000', label: 'B' },
    'bille_1': { id: 1, name: '1 Jaune', color: '#ffcc00', textColor: '#000', label: '1' },
    'bille_2': { id: 2, name: '2 Bleu', color: '#0033cc', textColor: '#fff', label: '2' },
    'bille_3': { id: 3, name: '3 Rouge', color: '#cc0000', textColor: '#fff', label: '3' },
    'bille_4': { id: 4, name: '4 Violet', color: '#4a0e4e', textColor: '#fff', label: '4' },
    'bille_5': { id: 5, name: '5 Orange', color: '#ff6600', textColor: '#fff', label: '5' },
    'bille_6': { id: 6, name: '6 Vert', color: '#006633', textColor: '#fff', label: '6' },
    'bille_7': { id: 7, name: '7 Marron', color: '#663300', textColor: '#fff', label: '7' },
    'bille_8': { id: 8, name: '8 Noire', color: '#111111', textColor: '#fff', label: '8' },
    'bille_9': { id: 9, name: '9 Rayée', color: '#ffe066', textColor: '#000', label: '9' },
    'bille_10': { id: 10, name: '10 Rayée', color: '#668cff', textColor: '#fff', label: '10' },
    'bille_11': { id: 11, name: '11 Rayée', color: '#ff6666', textColor: '#fff', label: '11' },
    'bille_12': { id: 12, name: '12 Rayée', color: '#b366ff', textColor: '#fff', label: '12' },
    'bille_13': { id: 13, name: '13 Rayée', color: '#ff944d', textColor: '#fff', label: '13' },
    'bille_14': { id: 14, name: '14 Rayée', color: '#33cc33', textColor: '#fff', label: '14' },
    'bille_15': { id: 15, name: '15 Rayée', color: '#a64d79', textColor: '#fff', label: '15' }
};

let diagramTitle = "mon-diagramme-billard"; 
let diagramDescription = "";               
let diagramData = {};                      
let maxAvailableBilles = 15; // Nombre de billes numérotées max (de 1 à 15)

let activeCoords = null; 

const gridEl = document.getElementById('diagramGrid');
const titleInput = document.getElementById('cellTitle');
const descInput = document.getElementById('cellDesc');
const coordXEl = document.getElementById('coordX');
const coordYEl = document.getElementById('coordY');
const colorContainer = document.getElementById('colorContainer');
const clearCellBtn = document.getElementById('clearCellBtn');
const cellsListContainer = document.getElementById('cellsListContainer');
