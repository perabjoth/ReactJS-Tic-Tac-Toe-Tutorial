import React from 'react';
import ReactDOM from 'react-dom';
import Confetti from 'react-confetti';
import {Button, Container, Dropdown, Grid, Header, Icon, Segment, Table} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import {isMobile} from 'react-device-detect';

import './index.css';

function Square(props) {
    let squareClass = 'square';
    if (props.winningSquare) {
        squareClass += ' winner';
    }
    return (
        <button className={squareClass} id={props.id} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winningSquare={this.props.winningSquares.includes(i)}
            />
        );
    }

    render() {
        let gameRows = [];
        let x, j, max = 0;
        for (x = 0; x < 3; x++) {
            let row = [];
            for (j = 0; j < 3; j++) {
                row.push(this.renderSquare(max));
                max++;
            }
            gameRows.push(<div className="board-row" key={x + 1}>{row}</div>);
        }


        return (

            <div className="squaresHolder">
                {gameRows}
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {winningSquares: lines[i], winner: squares[a],};
        }
    }
    return null;
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                row: 0,
                col: 0,
                winner: '',
            }],
            stepNumber: 0,
            xIsNext: true,
            sortOrder: "Asc",
        };

        this.handleSort = this.handleSort.bind(this);
    }

    handleSort(event) {
        this.setState({sortOrder: event.target.value});
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(current.squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        let row = Math.floor(i / 3) + 1;
        let col = (i + 1) % 3;
        if (col === 0) {
            col = 3;
        }
        this.setState({
            history: history.concat([{squares: squares, col: col, row: row}]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    jumpTo(step) {
        const current = this.state.history.slice(0, step + 1);

        this.setState({
            history: current,
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];
        const winningCalculation = calculateWinner(current.squares);
        const winningSquares = winningCalculation ? winningCalculation.winningSquares : [];
        let moves = history.map((step, move) => {
            const desc = move ? 'Go to move #' + move + '\n(row: ' + step.row + ', col: ' + step.col + ')' : 'Go to game start';

            const active = move === history.length - 1 ;
            return (<Table.Row key={move} active={active}><Table.Cell selectable  key={move + '-' + step.row + '-' + step.col}
                                                      onClick={() => this.jumpTo(move)}>{desc}</Table.Cell></Table.Row>)
        });

        moves = (this.state.sortOrder === "Asc" ? moves : moves.reverse());

        let status;
        let confetti;
        if (winningCalculation) {
            status = (<Button
                fluid
                content='Winner'
                color='orange'
                label={{basic: true, content: (winningCalculation.winner), color: 'orange'}}
                labelPosition='right'
            />);
            confetti = <Confetti/>
        } else if (!current.squares.includes(null)) {
            status = (<Button
                fluid
                content='The game has ended in a draw.'
                color='purple'
            />);
        } else {
            const nextPlayerColor = this.state.xIsNext ? 'blue' : 'red';
            status = (
                <Button
                    fluid
                    content='Next Player'
                    color={nextPlayerColor}
                    label={{basic: true, content: (this.state.xIsNext ? 'X' : 'O'), color: nextPlayerColor}}
                    labelPosition='right'
                />
            );
        }

        return (
            <Container className="gameContainer">
                {confetti}

                <Grid columns={isMobile ? 1 : 3}>
                    <Grid.Row>
                        <Header as='h2' icon alignment='center'>
                            <Icon name='gamepad' align='center'/>
                            Tic Tac Toe
                            <Header.Subheader>
                                Will you win against your foe?
                            </Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        {isMobile ? null : <Grid.Column></Grid.Column>}
                        <Grid.Column>
                            <div className="game-board">
                                <Board squares={current.squares} winningSquares={winningSquares}
                                       onClick={(i) => this.handleClick(i)}/>
                            </div>
                        </Grid.Column>
                        {isMobile ? null : <Grid.Column></Grid.Column>}
                    </Grid.Row>
                    <Grid.Row>
                        {isMobile ? null : <Grid.Column></Grid.Column>}
                        <Grid.Column >
                            <Segment.Group >
                                <Segment >
                                    {status}
                                </Segment>
                                <Segment >
                                    <Button
                                        fluid
                                        content='Game History'
                                        icon='history'
                                        label={{basic: true, content: moves.length - 1}}
                                        labelPosition='right'
                                    />
                                </Segment>
                                <Segment >
                                    <Dropdown
                                        placeholder='Select Sort Order'
                                        fluid
                                        selection
                                        value={this.state.sortOrder}
                                        onChange={this.handleSort}
                                        options={[{key: "Asc", text: "Ascending", value: "Asc"},
                                            {key: "Desc", text: "Descending", value: "Desc"}]}
                                    />
                                </Segment>
                                <Segment >
                                    <Table celled>
                                        <Table.Body>
                                        {moves}
                                        </Table.Body>
                                    </Table>
                                </Segment>
                            </Segment.Group>
                        </Grid.Column>
                        {isMobile ? null : <Grid.Column></Grid.Column>}
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
