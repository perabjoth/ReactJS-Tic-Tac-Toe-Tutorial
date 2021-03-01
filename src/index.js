import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	let squareClass = 'square';
	if(props.winningSquare) {
		squareClass+=' winner';
		}
    return (
      <button className={squareClass} id={props.id} onClick={props.onClick} >
        {props.value}
      </button>
    );
}

class Board extends React.Component {	
  renderSquare(i) {
  return (
		<Square 
			key= {i}
			value={this.props.squares[i]} 
			onClick={() => this.props.onClick(i)}
			winningSquare={this.props.winningSquares.includes(i)}
		/>
		);
  }

  render() {
	  let gameRows =[];
	  let x, j, max = 0;
	  for(x=0; x<3; x++){
		  let row = [];		
		  for(j=0; j<3; j++){
			  row.push(this.renderSquare(max));
			  max++;
		  }
		gameRows.push(<div className="board-row" key={x+1}>{row}</div>);
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
      return {winningSquares: lines[i], winner: squares[a], };
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
			winner: '',
			}],
			stepNumber: 0,
			xIsNext: true,
			sortOrder: "Asc",
		};
		
		this.handleSort = this.handleSort.bind(this);
	}
	
	handleSort(event){
		this.setState({sortOrder: event.target.value});
	}
	
	handleClick(i){
		const history = this.state.history.slice(0,this.state.stepNumber+1);
		const current = history[history.length-1];
		const squares = current.squares.slice();
		
		if(calculateWinner(current.squares) || squares[i]){
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
	const history = this.state.history.slice();
	const current = history[this.state.stepNumber];
	const winningCalculation  = calculateWinner(current.squares);
	const winningSquares = winningCalculation ? winningCalculation.winningSquares : [];
	let moves = history.map((step, move) => {
		const desc = move ? 'Go to move #' + move + '\n(row: ' + step.row + ', col: ' + step.col +')' : 'Go to game start';
		let listClass = "list-group-item"
		listClass+= move===history.length-1 ? ' active' : '';
		return (<li className={listClass} key={move}>
					<button className="btn"  key={move+'-'+step.row+'-'+step.col} onClick={() => this.jumpTo(move)} >{desc}</button>
				</li>)
	});
	
	moves = (this.state.sortOrder==="Asc" ? moves : moves.reverse());
	
	console.log();
	
	let status;
	if(winningCalculation){
		status = 'Winner: ' + winningCalculation.winner;
	} else if (!current.squares.includes(null)){
		status = 'The game has ended in a draw.';
	} else {
		status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
	}

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} winningSquares={winningSquares} onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info h5">
          <div>{status}</div>
		  <div className="game-history">Game History: 
			  <select className="form-select" value={this.state.sortOrder} onChange={this.handleSort}>
				<option value="Asc">Ascending</option>
				<option value="Desc">Descending</option>
			  </select>
		  </div>
          <ol className="list-group">{moves}</ol>
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
