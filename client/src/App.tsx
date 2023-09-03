import "./App.css";
import { useDojo } from "./DojoContext";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "./dojo/createSystemCalls";
import { EntityIndex, setComponent } from "@latticexyz/recs";
import { useEffect } from "react";
import { getFirstComponentByType } from "./utils";
import { Moves, Position, Random, Block } from "./generated/graphql";

function App() {
  const {
    setup: {
      systemCalls: { spawn, move, random },
      components: { Moves, Position, Random, Block },
      network: { graphSdk, call },
    },
    account: { create, list, select, account, isDeploying },
  } = useDojo();

  // entity id - this example uses the account address as the entity id
  const entityId = account.address;

  // get current component values
  const position = useComponentValue(
    Position,
    parseInt(entityId.toString()) as EntityIndex
  );
  const moves = useComponentValue(
    Moves,
    parseInt(entityId.toString()) as EntityIndex
  );
  const randomValue = useComponentValue(
    Random,
    parseInt(entityId.toString()) as EntityIndex
  );
  const block = useComponentValue(
    Block,
    parseInt(entityId.toString()) as EntityIndex
  );

  useEffect(() => {
    if (!entityId) return;

    const fetchData = async () => {
      const { data } = await graphSdk.getEntities();

      if (data) {
        const remaining = getFirstComponentByType(
          data.entities?.edges,
          "Moves"
        ) as Moves;
        const position = getFirstComponentByType(
          data.entities?.edges,
          "Position"
        ) as Position;
        const randomValue = getFirstComponentByType(
          data.entities?.edges,
          "Random"
        ) as Random;
        const block = getFirstComponentByType(
          data.entities?.edges,
          "Block"
        ) as Block;

        setComponent(Moves, parseInt(entityId.toString()) as EntityIndex, {
          remaining: remaining.remaining,
        });
        setComponent(Position, parseInt(entityId.toString()) as EntityIndex, {
          x: position.x,
          y: position.y,
        });
        setComponent(Random, parseInt(entityId.toString()) as EntityIndex, {
          r: randomValue?.r,
        });
        setComponent(Block, parseInt(entityId.toString()) as EntityIndex, {
          b: block?.b,
        });
      }
    };
    fetchData();
  }, [account.address]);

  function randomMod(random) {
    console.log("random", random);
    return random % 1000;
  }

  return (
    <>
      <button onClick={create}>
        {isDeploying ? "deploying burner" : "create burner"}
      </button>
      <div className="card">
        select signer:{" "}
        <select onChange={(e) => select(e.target.value)}>
          {list().map((account, index) => {
            return (
              <option value={account.address} key={index}>
                {account.address}
              </option>
            );
          })}
        </select>
      </div>
      <div className="card">
        <button onClick={() => spawn(account)}>Spawn</button>
        <div>
          Moves Left: {moves ? `${moves["remaining"]}` : "Need to Spawn"}
        </div>
        <div>
          Position:{" "}
          {position ? `${position["x"]}, ${position["y"]}` : "Need to Spawn"}
        </div>
      </div>
      <div className="random">
        <button onClick={() => random(account)}>Randomize</button>
        <div>
          Random: {randomValue ? randomMod(randomValue["r"]) : "No Value"}
        </div>
      </div>

      <div className="card">
        <button onClick={() => move(account, Direction.Up)}>Move Up</button>{" "}
        <br />
        <button onClick={() => move(account, Direction.Left)}>Move Left</button>
        <button onClick={() => move(account, Direction.Right)}>
          Move Right
        </button>{" "}
        <br />
        <button onClick={() => move(account, Direction.Down)}>Move Down</button>
      </div>
    </>
  );
}

export default App;
