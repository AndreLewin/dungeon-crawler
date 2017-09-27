export const XP_PER_LEVEL = 10;
export const DEFAULT_HP = 5;
export const HP_PER_LEVEL = 5;

export const idMap = {0: 'void', 1: 'wall', 2: 'player'};

const MAX_LENGTH = 20;
const MAX_HEIGHT = 20;
const PROBABILITY_WALL = 1/6;
const MAX_RECOVERIES = 10;
const MAX_UPGRADES = 4;

export const createGrid = () => {
    let grid = new Array(MAX_HEIGHT);
    for (let i = 0; i < MAX_HEIGHT; i++) {
        grid[i] = new Array(MAX_LENGTH);
        for (let j = 0; j < MAX_LENGTH; j++) {
            grid[i][j] = {nature: (Math.random() < PROBABILITY_WALL ? 'wall' : 'void'), data: undefined};
        }
    }

    grid = drawBorders(grid);
    grid = placePlayer(grid);
    grid = placeRecoveries(grid);
    grid = placeUpgrades(grid);
    return grid;
};

const drawBorders = (grid) => {
    // Horizontal lines
    for (let j = 0; j < MAX_LENGTH; j++){
        grid[0][j] = {nature: 'wall', data: undefined};
        grid[MAX_HEIGHT-1][j] = {nature: 'wall', data: undefined};
    }

    // Vertical lines
    for (let i = 0; i < MAX_HEIGHT; i++){
        grid[i][0] = {nature: 'wall', data: undefined};
        grid[i][MAX_LENGTH-1] = {nature: 'wall', data: undefined};
    }

    return grid;
};

const placePlayer = (grid) => {
    // grid[getRandomInt(1, MAX_HEIGHT-2)][getRandomInt(1, MAX_LENGTH-2)] = {id: 2, data: undefined};
    grid[5][5] = {nature: 'player', data: undefined};
    return grid;
};

const placeRecoveries = (grid) => {
    let nbRecoveries = 0;

    while (nbRecoveries < MAX_RECOVERIES) {
        const randomX = getRandomInt(0, MAX_HEIGHT-1);
        const randomY = getRandomInt(0, MAX_LENGTH-1);

        if (grid[randomX][randomY].nature === 'void') {
            grid[randomX][randomY] = {nature: 'recovery', data: undefined};
            nbRecoveries++;
        }
    }
    return grid;
};

const placeUpgrades = (grid) => {
    let nbUpgrades = 0;

    while (nbUpgrades < MAX_UPGRADES) {
        const randomX = getRandomInt(0, MAX_HEIGHT-1);
        const randomY = getRandomInt(0, MAX_LENGTH-1);

        if (grid[randomX][randomY].nature === 'void') {
            grid[randomX][randomY] = {nature: 'upgrade', data: undefined};
            nbUpgrades++;
        }
    }
    return grid;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
export const createGrid = (random) => {
    const grid = new Array(MAX_HEIGHT);
    for (let i = 0; i < MAX_HEIGHT; i++) {
        grid[i] = new Array(MAX_LENGTH);
        for (let j = 0; j < MAX_LENGTH; j++) {
            grid[i][j] = random && Math.random() < PROBABILITY_ALIVE;
        }
    }
    return grid;
};
*/


export const calculateGridNextGen = (grid) => {
    const nextGrid = JSON.parse(JSON.stringify(grid));
    for (let i = 0; i < MAX_HEIGHT; i++) {
        for (let j = 0; j < MAX_LENGTH; j++) {
            const nbNeighbors = calculateNeighbors(grid, i, j);
            nextGrid[i][j] = (nbNeighbors === 3) || (nbNeighbors === 2 && grid[i][j] === true);
        }
    }
    return nextGrid;
};

const calculateNeighbors = (grid, i, j) => {
    let nbNeighbors = 0;

    if (grid[sphereGrid(i-1)][sphereGrid(j-1)])
        nbNeighbors++;
    if (grid[sphereGrid(i-1)][sphereGrid(j)])
        nbNeighbors++;
    if (grid[sphereGrid(i-1)][sphereGrid(j+1)])
        nbNeighbors++;
    if (grid[sphereGrid(i)][sphereGrid(j-1)])
        nbNeighbors++;
    if (grid[sphereGrid(i)][sphereGrid(j+1)])
        nbNeighbors++;
    if (grid[sphereGrid(i+1)][sphereGrid(j-1)])
        nbNeighbors++;
    if (grid[sphereGrid(i+1)][sphereGrid(j)])
        nbNeighbors++;
    if (grid[sphereGrid(i+1)][sphereGrid(j+1)])
        nbNeighbors++;

    return nbNeighbors;
};

const sphereGrid = (x) => {
    if (x >= MAX_HEIGHT) {
        return 0;
    } else if (x < 0) {
        return MAX_HEIGHT - 1;
    } else {
        return x;
    }
};