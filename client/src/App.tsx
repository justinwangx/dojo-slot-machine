import "./App.css";
import { useDojo } from "./DojoContext";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "./dojo/createSystemCalls";
import { EntityIndex, setComponent } from "@latticexyz/recs";
import { useEffect } from "react";
import { getFirstComponentByType } from "./utils";
import { Moves, Position, Random, Block } from "./generated/graphql";
import Slots from "./Slots";
import { Button, HStack, Link, Text } from "@chakra-ui/react";

// Truncate starknet address
export const formatAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

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
    const div = 1000000;
    return (random % div) / div;
  }

  function requestRandom() {
    random(account);
  }

  return (
    <div>
      <HStack
        position="absolute"
        top="0"
        w="full"
        p="20px"
        gap="60px"
        // justify="left"
      >
        <Button
          color="#F88975"
          style={{ backgroundColor: "#FE3733" }}
          isDisabled={isDeploying || account != undefined}
          isLoading={isDeploying}
          onClick={create}
        >
          {account ? formatAddress(account.address) : "Create Burner"}
        </Button>
      </HStack>
      <Slots
        requestRandom={requestRandom}
        random={randomValue ? randomMod(randomValue["r"]) : 0}
      />
    </div>
  );
}

export default App;
