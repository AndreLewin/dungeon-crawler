import {MAX_LENGTH, MAX_HEIGHT, PROBABILITY_WALL, XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL} from './config';
import items from './items';
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
    for (let i = 0 ; i < items.length ; i++) {
        grid = place(items[i].id, items[i].max, grid);
    }
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

