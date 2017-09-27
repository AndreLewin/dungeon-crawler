import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Immutable from 'immutable';
import { createAction } from 'redux-actions';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import App from './app';
import { APP_CONTAINER_SELECTOR } from '../shared/config';
import { isProd } from '../shared/util';
import weapons from './weapons';
import { XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL, createGrid, calculateGridNextGen } from './helpers'

/* Actions */
const GIVE_XP = 'GIVE_XP';
export const giveXPAC = createAction(GIVE_XP);
const GIVE_HP = 'GIVE_HP';
export const giveHPAC = createAction(GIVE_HP);
const REMOVE_HP = 'REMOVE_HP';
export const removeHPAC = createAction(REMOVE_HP);
const UPGRADE_WEAPON = 'UPGRADE_WEAPON';
export const upgradeWeaponAC = createAction(UPGRADE_WEAPON);
const MOVE = 'MOVE';
export const moveAC = createAction(MOVE);
const RESTART = 'RESTART';
export const restartAC = createAction(RESTART);

/* Reducer */
// Answers to store.dispatch(ACTION);
const initialState = Immutable.fromJS({
    win: false,
    level: 1,
    hp: 10,
    xpTot: 0,
    xp: 0,
    currentWeaponId: 0,
    weapon: weapons[0],
    x: 5, // x is going down
    y: 5, // y is going right
    // TODO: set x y to position = {x, y}
    grid: createGrid()

});

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case RESTART:
            return initialState; // Does not create new grid, so easier after death
        case GIVE_XP: {
            const newState = state.update('xpTot', value => value + action.payload);

            let xpLeft = newState.get('xpTot');
            let level = 1;

            while (xpLeft >= level*XP_PER_LEVEL) {
                xpLeft -= level*XP_PER_LEVEL;
                level += 1;
            }

            return newState.set('level', level).set('xp', xpLeft);
        }
        case GIVE_HP:
            return state.update('hp', value => (value + action.payload > DEFAULT_HP+state.get('level')*HP_PER_LEVEL) ? DEFAULT_HP+state.get('level')*HP_PER_LEVEL : value + action.payload );
        case REMOVE_HP:
            return state.update('hp', value => (value - action.payload <= 0) ? 0 : value - action.payload );
        case UPGRADE_WEAPON: {
            const currentWeaponId = state.get('currentWeaponId');
            if (currentWeaponId < weapons.length - 1) {
                return state.update('currentWeaponId', value => value + 1).set('weapon', Immutable.fromJS(weapons[currentWeaponId + 1]));
            } else {
                return state;
            }
        }
        case MOVE: {

            const currentPos = {x: state.get('x'), y: state.get('y')};
            let targetPos = {x: undefined, y: undefined};

            // Handle key press
            switch(action.payload) {
                case 37: // Left
                    targetPos = {x: currentPos.x, y: currentPos.y - 1};
                    break;
                case 38: // Up
                    targetPos = {x: currentPos.x - 1, y: currentPos.y};
                    break;
                case 39: // Right
                    targetPos = {x: currentPos.x, y: currentPos.y + 1};
                    break;
                case 40: // Down
                    targetPos = {x: currentPos.x + 1, y: currentPos.y};
                    break;
            }

            const movePlayer = () => {
                state = state.setIn(['grid', targetPos.x, targetPos.y, 'nature'], 'player').setIn(['grid', targetPos.x, targetPos.y, 'data'], undefined);
                state = state.setIn(['grid', currentPos.x, currentPos.y, 'nature'], 'void').setIn(['grid', targetPos.x, targetPos.y, 'data'], undefined);
                state = state.set('x', targetPos.x).set('y',  targetPos.y);
            };

            // What is the player trying to walk into?
            const idTarget = state.getIn(['grid', targetPos.x, targetPos.y, 'nature']);
            switch(idTarget) {
                case 'void':
                    movePlayer();
                    break;
                case 'wall':
                    break;
                case 'recovery':
                    console.log("Here is 30% of your life");
                    const hpTot = DEFAULT_HP+state.get('level')*HP_PER_LEVEL;
                    const hpRecovered = Math.floor(hpTot/3);
                    state = state.update('hp', value => (value + hpRecovered > hpTot) ? hpTot : value + hpRecovered );
                    movePlayer();
                    break;
                case 'upgrade':
                    const currentWeaponId = state.get('currentWeaponId');
                    if (currentWeaponId < weapons.length - 1) {
                        state = state.update('currentWeaponId', value => value + 1).set('weapon', Immutable.fromJS(weapons[currentWeaponId + 1]));
                    }
                    movePlayer();
                    break;
                case 'bug':
                case 'paw':
                case 'spy':
                case 'military':

                    const ennemyData = state.getIn(['grid', targetPos.x, targetPos.y, 'data']);
                    const ennemyHp = ennemyData.get('hp');
                    const attackPower = state.get('level') + state.get('weapon').get('atkBonus');
                    const isDead = attackPower >= ennemyHp;

                    console.log(attackPower);
                    console.log(ennemyHp);
                    console.log(attackPower);

                    // Damage the ennemy

                    // If dead, receive xp, if boss win else move player

                    // If not dead, take damages


                    break;
            }

            console.log(targetPos);
            return state;
        }
        default:
            return state;
    }
};


/* Store */
const store = createStore(reducer,
    isProd ? undefined : window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


/* Rendering */
const rootEl = document.querySelector(APP_CONTAINER_SELECTOR);

const wrapApp = (AppComponent, reduxStore) => (
    <Provider store={reduxStore}>
        <AppContainer>
            <AppComponent />
        </AppContainer>
    </Provider>
);

ReactDOM.render(wrapApp(App, store), rootEl);

// Hot Module Replacement
if (module.hot) {
    module.hot.accept('./app', () => {
        const NextApp = require('./app').default;
        ReactDOM.render(wrapApp(NextApp, store), rootEl);
    })
}
