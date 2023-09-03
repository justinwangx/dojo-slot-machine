import "./App.css";
import { useDojo } from "./DojoContext";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "./dojo/createSystemCalls";
import { EntityIndex, setComponent } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { getFirstComponentByType } from "./utils";
import { Moves, Position, Random, Block } from "./generated/graphql";
import Slots from "./Slots";
import { Button, HStack, Link, Text } from "@chakra-ui/react";

// Truncate starknet address
export const formatAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

function App() {
  const [randomValue, setRandomValue] = useState<Random>();
  const {
    setup: {
      systemCalls: { spawn, move, random },
      components: { Moves, Position, Random, Block },
      network: { graphSdk, call },
    },
    account: { create, list, select, account, isDeploying },
  } = useDojo();

  const fetchData = async () => {
    const { data } = await graphSdk.getEntities();
    if (data) {
      const rand = getFirstComponentByType(
        data.entities?.edges,
        "Random",
        account.address
      ).r;
      if (rand !== randomValue) setRandomValue(rand);
    }
  };

  useEffect(() => {
    if (!account || !account.address) return;
    fetchData();
  }, [account.address]);

  function randomMod(random) {
    const div = 125;
    console.log(random % div);
    return random % div;
  }

  async function requestRandom() {
    const r = await random(account);
    console.log(r);
    if (r !== undefined) setRandomValue(r);
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
          style={{ backgroundColor: "#FE3733" }}
          isDisabled={isDeploying || account != undefined}
          isLoading={isDeploying}
          onClick={create}
        >
          {account ? formatAddress(account.address) : "Create Burner"}
        </Button>
      </HStack>
      <br />
      <Slots
        requestRandom={requestRandom}
        random={randomValue ? randomMod(randomValue) : 0}
      />
      {account.address && (
        <Button
          onClick={async () => {
            console.log("list", list());
            const account = await create();
            console.log("account", account);
          }}
          isDisabled={isDeploying}
          isLoading={isDeploying}
        >
          {isDeploying ? "Resetting" : "Reset"}
        </Button>
      )}
    </div>
  );
}

export default App;
