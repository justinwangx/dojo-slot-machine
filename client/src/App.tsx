import "./App.css";
import { useDojo } from "./DojoContext";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "./dojo/createSystemCalls";
import { EntityIndex, setComponent } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { getFirstComponentByType } from "./utils";
import { Moves, Position, Random, Block } from "./generated/graphql";
import Slots from "./Slots";
import { Button, HStack, Link, Text, Box } from "@chakra-ui/react";

// Truncate starknet address
export const formatAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

function App() {
  const [randomValue, setRandomValue] = useState<Random>();
  const [score, setScore] = useState<number>(0);
  const {
    setup: {
      systemCalls: { reset, random },
      components: { Moves, Position, Random, Block },
      network: { graphSdk, call },
    },
    account: { create, list, select, account, isDeploying },
  } = useDojo();

  const fetchData = async () => {
    const { data } = await graphSdk.getEntities();
    if (data) {
      const vals = getFirstComponentByType(
        data.entities?.edges,
        "Random",
        account.address
      );
      console.log(vals);
      const rand = vals?.r;
      setScore(vals?.score);
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
    const vals = await random(account);
    const r = vals?.r;
    setScore(vals?.score);
    console.log(r);
    if (r !== undefined) setRandomValue(r);
  }

  return (
    <>
      {" "}
      {/* Wrap the entire component in a Box */}
      <HStack position="absolute" top="0" w="full" p="20px" gap="60px">
        <Button
          backgroundColor="#FE3733" // Use Chakra UI styling
          isDisabled={isDeploying || account !== undefined}
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
      <Button onClick={() => reset(account)}>Start Score</Button>
      <Box
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex", // Add this CSS property
          alignItems: "center", // Center items vertically
        }}
      >
        {account.address && (
          <Button
            onClick={async () => {
              console.log("list", list());
              await create();
            }}
            isDisabled={isDeploying}
            isLoading={isDeploying}
          >
            {isDeploying ? "Resetting" : "Reset"}
          </Button>
        )}
        <div
          style={{
            fontSize: "20px",
            backgroundColor: "#FE3733",
            padding: "5px",
            paddingLeft: "20px",
            paddingRight: "20px",
            borderRadius: "5px",
            color: "#fff",
            marginLeft: "10px",
          }}
        >
          {score}
        </div>
      </Box>
      {/* Use a Box for the score */}
    </>
  );
}

export default App;
