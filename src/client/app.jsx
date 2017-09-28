import React from 'react';
import { connect } from 'react-redux';
import { Icon, Label, Progress, Header, Button } from 'semantic-ui-react';

import '../../public/style/style.scss';
import { APP_NAME } from '../shared/config';
import { moveAC, restartAC, newMapAC } from './index';
import { XP_PER_LEVEL, DEFAULT_HP, HP_PER_LEVEL } from './helpers'

const HeaderCn = () => (
    <Header as='h2'>
        <Icon name='compass' />
        <Header.Content>
            {APP_NAME}
            <Header.Subheader>
                Destroy the secret warplane!
            </Header.Subheader>
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


const ButtonsCom = ({ hp, win, handleRestartClick, handleNewMapClick }) => (
    <div>
        {hp===0 && <Button icon='repeat' content='You are dead, press to try again' onClick={handleRestartClick} />}
        {hp>0 && win===false && <Button icon='repeat' content='Press to restart' onClick={handleRestartClick} />}
        {win===true && <Button icon='hand victory' content='You won, press to restart!' onClick={handleRestartClick} />}
        <Button icon='add square' content='Use a new map' onClick={handleNewMapClick} />
    </div>
);
const ButtonsCn = connect(
    state => ({
        hp: state.get('hp'),
        win: state.get('win')
    }),
    dispatch => ({
        handleRestartClick: () => { dispatch(restartAC())},
        handleNewMapClick: () => {dispatch(newMapAC())}
    })
)(ButtonsCom);


const Square = ({ nature, row, column, playerX, playerY, hp }) => {
    let iconToReturn;
    const distanceToPlayer = Math.sqrt(Math.pow(row - playerX, 2) + Math.pow(column - playerY , 2))// TODO
    const isTooFarToSee = distanceToPlayer > 3;

    switch(nature) {
        case 'wall':
            iconToReturn = <Icon name='align justify' disabled />;
            break;
        case 'player':
            iconToReturn = <Icon name='user' disabled={hp===0} />;
            break;
        case 'recovery':
            iconToReturn = <Icon name='medkit' color='red' />;
            break;
        case 'upgrade':
            iconToReturn = <Icon name='trash' color='yellow' />;
            break;
        case 'bug':
            iconToReturn = <Icon name='bug' color='purple' />;
            break;
        case 'paw':
            iconToReturn = <Icon name='paw' color='purple' />;
            break;
        case 'spy':
            iconToReturn = <Icon name='spy' color='purple' />;
            break;
        case 'military':
            iconToReturn = (
                <Icon.Group>
                    <Icon loading name='sun' color='red' />
                    <Icon name='military' color='purple' />
                </Icon.Group>
            );
            break;
    }

    return <td className={isTooFarToSee && 'hide'}>{iconToReturn}</td>; // className='hide' if too far from the player
};
const BoardCom = ({ grid, playerX, playerY, hp }) => {
    return (
        <div className='Board' >
            <table>
                <tbody>
                    {grid.map((row, i) => (
                        <tr key={i}>
                            {row.map((square, j) => (
                                <Square
                                    nature={square.get('nature')}
                                    key={j}
                                    row={i}
                                    column={j}
                                    playerX={playerX}
                                    playerY={playerY}
                                    hp={hp}
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
        playerX: state.get('x'),
        playerY: state.get('y'),
        hp: state.get('hp')
    })
)(BoardCom);


class KeyboardCom extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyup = this.handleKeyup.bind(this);
    }

    handleKeyup(event) {
        this.props.handleKeyUp(event.keyCode);
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleKeyup );
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeyup );
    }

    render() {
        return null;
    }
}
const KeyboardCn = connect(
    undefined ,
    dispatch => ({
        handleKeyUp: (payload) => { dispatch(moveAC(payload)) },
    })
)(KeyboardCom);


const App = () => (
    <div id="my-wrapper">
        <div className='container'>
            <HeaderCn/>
            <LabelsCn/>
            <BarsCn/>
            <ButtonsCn/>
        </div>
        <BoardCn />
        <KeyboardCn />
    </div>
);

export default App;