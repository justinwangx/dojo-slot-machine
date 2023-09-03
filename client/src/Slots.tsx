import { clear } from "console";
import React from "react";

const totalSymbols = 5;
function RepeatButton(props) {
  return (
    <svg
      id="repeatButton"
      onClick={props.onClick}
      width="1000"
      height="1000"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FE3733"
        d="M252.314 19.957c-72.036.363-142.99 33.534-189.18 95.97c-69.83 94.39-59.125 223.32 19.85 304.993l-37.238 50.332l151.22-22.613L174.35 297.42l-43.137 58.308c-44.08-54.382-47.723-133.646-4.16-192.53c30.676-41.466 77.863-63.504 125.758-63.753a156.808 156.808 0 0 1 48.645 7.467l-6.963-46.55a191.054 191.054 0 0 0-71.017-.997c-59.232 7.322-113.994 39.918-148.157 91.215c35.65-65.89 103.774-105.918 176.043-107.744a204.322 204.322 0 0 1 49.62 4.84l48.608-7.268c-31.14-13.906-64.32-20.62-97.274-20.453zm212.93 22.055l-151.217 22.61l22.614 151.22l41.126-55.588c42.204 54.29 45.092 132.048 2.187 190.043c-40.22 54.367-108.82 75.32-170.19 57.566l6.522 43.598a192.699 192.699 0 0 0 86.203-3.07c37.448-5.957 73.34-22.05 103.16-47.728c-49.196 54.65-122.615 77.514-191.744 64.34l-55.8 8.344c99.03 43.7 218.402 14.77 285.51-75.938c69.13-93.445 59.34-220.743-17.483-302.53l39.114-52.866z"
      />
    </svg>
  );
}

function WinningSound() {
  return (
    <audio autoPlay={true} className="player" preload="false">
      <source src="https://andyhoffman.codes/random-assets/img/slots/winning_slot.wav" />
    </audio>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      winner: null,
      targets: [0, 0, 0],
      matches: [],
    };
    this.finishHandler = this.finishHandler.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate(
    prevProps: Readonly<{}>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    if (prevProps.random !== this.props.random) {
      const random = this.props.random;
      const mod = totalSymbols;
      const target1 = Math.floor(random / (mod * mod));
      const target2 = Math.floor((random % (mod * mod)) / mod);
      const target3 = random % mod;
      console.log([target1, target2, target3]);
      this.setState({ targets: [target1, target2, target3] });

      this.setState({ winner: null });
      this.emptyArray();
      this._child1.forceUpdateHandler();
      this._child2.forceUpdateHandler();
      this._child3.forceUpdateHandler();
    }
  }

  handleClick() {
    this.props.requestRandom();
  }

  static loser = [
    "Not quite",
    "Stop gambling",
    "Hey, you lost!",
    "Ouch! I felt that",
    "Don't beat yourself up",
    "There goes the college fund",
    "I have a cat. You have a loss",
    "You're awesome at losing",
    "Coding is hard",
    "Don't hate the coder",
  ];

  finishHandler(value) {
    const { matches } = this.state;
    matches.push(value);
    this.setState({ matches });

    if (matches.length === 3) {
      const { winner } = this.state;
      const first = matches[0];
      const results = matches.every((match) => match === first);
      this.setState({ winner: results });
    }
  }

  emptyArray() {
    this.setState({ matches: [] });
  }

  render() {
    const { winner } = this.state;
    const getLoser = () => {
      return App.loser[Math.floor(Math.random() * App.loser.length)];
    };
    let winningSound = null;

    if (winner) {
      winningSound = <WinningSound />;
    }

    return (
      <div>
        {winningSound}
        {/*<h1 style={{ color: "white" }}>
          <span>
            {winner === null
              ? "Waiting…"
              : winner
              ? "🤑 Pure skill! 🤑"
              : getLoser()}
          </span>
            </h1>*/}
        <div className={`slots-container`}>
          <img src="/Slots.png" alt="Slots" />
        </div>
        <div className={`spinner-container`}>
          <Spinner
            onFinish={this.finishHandler}
            ref={(child) => {
              this._child1 = child;
            }}
            timer="1000"
            target={this.state.targets[0]}
          />
          <Spinner
            onFinish={this.finishHandler}
            ref={(child) => {
              this._child2 = child;
            }}
            timer="1400"
            target={this.state.targets[1]}
          />
          <Spinner
            onFinish={this.finishHandler}
            ref={(child) => {
              this._child3 = child;
            }}
            timer="2200"
            target={this.state.targets[2]}
          />
          <div className="gradient-fade"></div>
        </div>
        <RepeatButton onClick={this.handleClick} />
      </div>
    );
  }
}

class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  }

  forceUpdateHandler() {
    this.reset();
  }

  reset() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.start = this.setStartPosition();

    this.setState({
      position: this.start,
      timeRemaining: this.props.timer,
    });

    this.timer = setInterval(() => {
      this.tick();
    }, 100);
  }

  state = {
    position: 0,
    lastPosition: null,
  };
  static iconHeight = 128;
  multiplier = 1;

  start = this.setStartPosition();
  speed = Spinner.iconHeight * this.multiplier;

  setStartPosition() {
    return (
      108 + Math.floor(Math.random() * totalSymbols) * Spinner.iconHeight * -1
    );
  }

  moveBackground() {
    this.setState({
      position: this.state.position - this.speed,
      timeRemaining: this.state.timeRemaining - 100,
    });
  }

  getSymbolFromPosition() {
    const { position } = this.state;

    const thisSymbol = Math.abs(
      Math.floor(position / Spinner.iconHeight) % totalSymbols
    );
    return thisSymbol;
  }

  tick() {
    if (this.state.timeRemaining <= 0) {
      //clearInterval(this.timer);
      const curSymbol = this.getSymbolFromPosition();
      if (curSymbol === this.props.target) {
        this.props.onFinish(curSymbol);
        clearInterval(this.timer);
      } else {
        this.moveBackground();
      }
    } else {
      this.moveBackground();
    }
  }

  componentDidMount() {
    clearInterval(this.timer);

    this.setState({
      position: this.start,
      timeRemaining: this.props.timer,
    });

    this.timer = setInterval(() => {
      this.tick();
    }, 100);
  }

  render() {
    const { position, current } = this.state;

    return (
      <div
        style={{ backgroundPosition: "16px " + position + "px" }}
        className={`icons`}
      />
    );
  }
}

export default App;
