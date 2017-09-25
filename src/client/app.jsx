import React from 'react';
import { connect } from 'react-redux';
import { Icon, Label, Progress, Segment, Header, Button, Divider, Grid, Table } from 'semantic-ui-react';

import '../../public/style/style.scss';
import { APP_NAME } from '../shared/config';
import { giveXPAC, giveHPAC, removeHPAC, upgradeWeaponAC, moveAC } from './index';
import { XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL } from './helpers'

const HeaderCn = () => (
    <Header as='h2'>
        <Icon name='compass' />
        <Header.Content>
            {APP_NAME}
        </Header.Content>
    </Header>
);


const LabelsCom = ({ level, weapon }) => (
    <div>
        <Label as='a' color='blue' image>
            <Icon name="user plus" />
            Level
            <Label.Detail>{level}</Label.Detail>
        </Label>
        <Label as='a' color='teal' image>
            <Icon name="lightning" />
            Attack Power
            <Label.Detail>{level}+{weapon.get('atkBonus')}</Label.Detail>
        </Label>
        <Label as='a' color='yellow' image>
            <Icon name={weapon.get('icon')} />
            Weapon
            <Label.Detail>{weapon.get('name')}</Label.Detail>
        </Label>
    </div>
);
const LabelsCn = connect(
    state => ({
        level: state.get('level'),
        weapon: state.get('weapon')
    })
)(LabelsCom);


const BarsCom = ({ hp, xp, level }) => (
    <div className="barDiv">
        <div className="sameLine">
            <Label className="barLabel" icon='heart' color='red'/>
            <Progress className="bar" value={hp} total={DEFAULT_HP+level*HP_PER_LEVEL} progress='percent' color='red' precision={0}/>
        </div>
        <div className="sameLine">
            <Label className="barLabel" icon='add' color='blue'/>
            <Progress className="bar" value={xp} total={level*XP_PER_LEVEL} progress='percent' color='blue' precision={0}/>
        </div>
    </div>
);
const BarsCn = connect (
    state => ({
        hp: state.get('hp'),
        xp: state.get('xp'),
        level: state.get('level')
    })
)(BarsCom);


const ButtonsCom = ({ hp, handleXPClick, handleHPClick, handleRHPClick, handleUpgradeClick, handleNextGeneration }) => (
    <div>
        {hp===0 && <Button content='You are dead'/>}
        <Button icon='play' content='Give XP' onClick={handleXPClick} />
        <Button icon='pause' content='Give HP' onClick={handleHPClick} />
        <Button icon='bomb' content='Remove HP' onClick={handleRHPClick} />
        <Button icon='shuffle' content='Upgrade Weapon' onClick={handleUpgradeClick} />
    </div>
);
const ButtonsCn = connect(
    state => ({
        hp: state.get('hp'),
    }),
    dispatch => ({
        handleXPClick: () => { dispatch(giveXPAC(1)) },
        handleHPClick: () => { dispatch(giveHPAC(1)) },
        handleRHPClick: () => { dispatch(removeHPAC(1)) },
        handleUpgradeClick: () => { dispatch(upgradeWeaponAC()) }
    })
)(ButtonsCom);


const Square = ({ id }) => {
    let iconToReturn;

    switch(id) {
        case 1:
            iconToReturn = <Icon name='align justify' disabled />;
            break;
        case 2:
            iconToReturn = <Icon name='user' />;
            break;
    }

    return <td>{iconToReturn}</td>;
};
const BoardCom = ({ grid, handleKeyUp }) => {
    return (
        <div className='Board' onKeyUp={handleKeyUp} >
            <table>
                <tbody>
                    {grid.map((row, i) => (
                        <tr key={i}>
                            {row.map((square, j) => (
                                <Square
                                    id={square.get('id')}
                                    key={j}
                                    row={i}
                                    column={j}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const BoardCn = connect(
    state => ({
        grid: state.get('grid'),
    }),
    dispatch => ({
        handleKeyUp: (event) => { dispatch(moveAC(event)) },
    })
)(BoardCom);


const App = () => (
    <div id="my-wrapper">
        <div className='container'>
            <HeaderCn/>
            <LabelsCn/>
            <BarsCn/>
            <ButtonsCn/>
        </div>
        <BoardCn />
    </div>
);

export default App;