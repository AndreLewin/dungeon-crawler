// config.js
export const XP_PER_LEVEL = 3;
export const DEFAULT_HP = 5;
export const HP_PER_LEVEL = 5;

// map.js
const MAX_LENGTH = 20;
const MAX_HEIGHT = 20;
const PROBABILITY_WALL = 1/6;

// items.js
const MAX_RECOVERIES = 10;
const MAX_UPGRADES = 4;

import monsters from './monsters';

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
    grid = place('recovery', MAX_RECOVERIES, grid);
    grid = place('upgrade', MAX_UPGRADES, grid);
    for (let i = 0 ; i < monsters.length ; i++) {
        grid = place(monsters[i].id, monsters[i].max, grid, monsters[i].data);
    }
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
    grid[5][5] = {nature: 'player', data: undefined};
    return grid;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const place = (nature, numberMax, grid, data=undefined) => {
    let nb = 0;

    while (nb < numberMax) {
        const randomX = getRandomInt(0, MAX_HEIGHT-1);
        const randomY = getRandomInt(0, MAX_LENGTH-1);

        if (grid[randomX][randomY].nature === 'void') {
            grid[randomX][randomY] = {nature: nature, data: data};
            nb++;
        }
    }
    return grid;
};

