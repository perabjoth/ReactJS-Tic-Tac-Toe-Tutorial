import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className="square" id={props.id} onClick={props.onClick} >
        {props.value}
      </button>
    );
}

class Board extends React.Component {	
  renderSquare(i) {
  return (
		<Square 
			value={this.props.squares[i]} 
			onClick={() => this.props.onClick(i)}
			id = {i}
		/>
		);
  }

  render() {
	  let gameRows =[];
	  let x, j, max = 0;
	  for(x=0; x<3; x++){
		  let row = [];		
		  for(j=0; j<3; j++){
			  max++
			  row.push(this.renderSquare(max));
		  }
		gameRows.push(<div className="board-row" id={x+1}>{row}</div>);
	  }
    return (
	
      <div>
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
      return squares[a];
    }
  }
  return null;
}

class Game extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			history: [{squares: Array(9).fill(null),
			row: 0,
			col: 0,
			}],
			stepNumber: 0,
			xIsNext: true,
		};
	}
		
	handleClick(i){
		const history = this.state.history.slice(0,this.state.stepNumber+1);
		const current = history[history.length-1];
		const squares = current.squares.slice();
		
		if(calculateWinner(squares) || squares[i]){
			return;
		}
		
		squares[i]= this.state.xIsNext ? 'X' : 'O';		
		let row = Math.floor(i/3)+1;
		let col = (i+1)%3;
		if(col===0) {
			col = 3;	
		}
		this.setState({
						history: history.concat([{squares: squares, col: col, row: row}]),
						xIsNext: !this.state.xIsNext,
						stepNumber: history.length,
					});
	}
	
	jumpTo(step){
		const current = this.state.history.slice(0, step+1);
		
		this.setState({
			history: current,
			stepNumber: step,
			xIsNext: (step%2) === 0,
		});
	}
	
  render() {
	const history = this.state.history
	const current = history[this.state.stepNumber];
	const winner  = calculateWinner(current.squares);
	
	const moves = history.map((step, move) => {
		const desc = move ? 'Go to move #' + move + ', row: ' + step.row + ', column: ' +step.col : 'Go to game start';
		return (<li key={move}>
					<button onClick={() => this.jumpTo(move)}  style= {move===history.length-1 ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>{desc}</button>
				</li>)
	});
	
	let status;
	if(winner){
		status = 'Winner: ' + winner;
	} else {
		status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
	}

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={ (i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
