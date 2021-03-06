import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Immutable from 'immutable';
import { createAction } from 'redux-actions';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import App from './app';
import { APP_CONTAINER_SELECTOR } from '../shared/config';
import { isProd } from '../shared/util';
import weapons from './weapons';
import { createGrid } from './helpers'
import { XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL, RECOVERY_POWER } from './config'

/* Actions */
const MOVE = 'MOVE';
export const moveAC = createAction(MOVE);
const NEW_MAP = 'NEW_MAP';
export const newMapAC = createAction(NEW_MAP);

/* Reducer */
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
    grid: createGrid()

});

const reducer = (state = initialState, action) => {
    const receiveDamages = (damages) => {
        const randomExtraDamage = Math.floor(Math.random() * 2);
        return state.update('hp', value => (value - damages - randomExtraDamage <= 0) ? 0 : value - damages - randomExtraDamage );
    };

    const receiveXp = (xpGained) => {
        const newState = state.update('xpTot', value => value + xpGained);

        let xpLeft = newState.get('xpTot');
        let level = 1;

        while (xpLeft >= level*XP_PER_LEVEL) {
            xpLeft -= level*XP_PER_LEVEL;
            level += 1;
        }

        return newState.set('level', level).set('xp', xpLeft);
    };

    switch (action.type) {
        case NEW_MAP:
            return initialState.set('grid', Immutable.fromJS(createGrid()));
        case MOVE: {
            if (state.get('hp') > 0) {
                const currentPos = {x: state.get('x'), y: state.get('y')};
                let targetPos = {x: undefined, y: undefined};

                // Handle key press
                switch (action.payload) {
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
                    state = state.set('x', targetPos.x).set('y', targetPos.y);
                };

                // What is the player trying to walk into?
                const natureTarget = state.getIn(['grid', targetPos.x, targetPos.y, 'nature']);
                switch (natureTarget) {
                    case 'void':
                        movePlayer();
                        break;
                    case 'wall':
                        break;
                    case 'recovery':
                        const hpTot = DEFAULT_HP + state.get('level') * HP_PER_LEVEL;
                        const hpRecovered = Math.floor(hpTot * RECOVERY_POWER);
                        state = state.update('hp', value => (value + hpRecovered > hpTot) ? hpTot : value + hpRecovered);
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
                        const ennemyLevel = ennemyData.get('level');
                        const attackPower = state.get('level') + state.get('weapon').get('atkBonus');
                        const randomExtraDamage = Math.floor(Math.random() * 2);
                        const isDead = attackPower + randomExtraDamage >= ennemyHp;

                        // Damage the ennemy
                        state = state.updateIn(['grid', targetPos.x, targetPos.y, 'data', 'hp'], value => value -= (attackPower + randomExtraDamage));

                        // If dead, receive xp, if boss win else move player
                        // If not dead, take damages
                        if (isDead) {
                            state = receiveXp(ennemyLevel);
                            movePlayer();
                            if (natureTarget === 'military') {
                                state = state.set('win', true);
                            }
                        } else {
                            state = receiveDamages(ennemyLevel);
                        }
                        break;
                }
            }

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
