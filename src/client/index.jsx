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
import { XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL, createGrid, calculateGridNextGen } from './helpers'

/* Actions */
const GIVE_XP = 'GIVE_XP';
export const giveXPAC = createAction(GIVE_XP);
const GIVE_HP = 'GIVE_HP';
export const giveHPAC = createAction(GIVE_HP);
const REMOVE_HP = 'REMOVE_HP';
export const removeHPAC = createAction(REMOVE_HP);

const PLAY_GAME = 'PLAY_GAME';
export const playGameAC = createAction(PLAY_GAME);
const PAUSE_GAME = 'PAUSE_GAME';
export const pauseGameAC = createAction(PAUSE_GAME);
const CLEAR_GRID = 'CLEAR_GRID';
export const clearGridAC = createAction(CLEAR_GRID);
const RANDOMISE_GRID = 'RANDOMISE_GRID';
export const randomiseGridAC = createAction(RANDOMISE_GRID);
const SWITCH_STATE = 'SWITCH_STATE';
export const switchStateAC = createAction(SWITCH_STATE);
const NEXT_GENERATION = 'NEXT_GENERATION';
export const nextGenerationAC = createAction(NEXT_GENERATION);

/* Reducer */
// Answers to store.dispatch(ACTION);
const initialState = Immutable.fromJS({
    generation: 1,
    running: false,
    grid: createGrid(true),
    level: 1,
    hp: 10,
    xpTot: 0,
    xp: 0,
    weapon: {icon: "spoon", name: "Spoon", atkBonus: 1},
    map: undefined // Array[30][30] of {id: 0, data: {icon: , hp:  , level: , xpDrop: }}
    // 0 = Free space ; 1 = Wall ; 2 = Player ; 3 = Weapon (has data) ; 4 = Potion (has data) ; 5 = Monster (has data)
    // The Id tells what action walking toward a square will dispatch

    // 12 : Night working on states
});

const reducer = (state = initialState, action) => {
    switch (action.type) {
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
        case PLAY_GAME:
            return state.set('running', true);
        case PAUSE_GAME:
            return state.set('running', false);
        case CLEAR_GRID:
            return state.set('grid', Immutable.fromJS(createGrid(false))).set('generation', 1).set('running', false);
        case RANDOMISE_GRID:
            return state.set('grid', Immutable.fromJS(createGrid(true))).set('generation', 1).set('running', false);
        case SWITCH_STATE:
            return state.updateIn(['grid', action.payload.i, action.payload.j], value => !value);
        case NEXT_GENERATION:
            return state.update('generation', value => value + 1).set('grid', Immutable.fromJS(calculateGridNextGen(state.get('grid').toJS())));
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
