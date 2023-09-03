import "../App.css";
import { useDojo } from "../DojoContext";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "../dojo/createSystemCalls";
import { EntityIndex, setComponent } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { getFirstComponentByType } from "../utils";
import {
  Moves,
  Position,
  Random,
  Block,
  GetEntitiesQuery,
} from "../generated/graphql";
import Slots from "../Slots";
import { Button, HStack, Link, Text, Box } from "@chakra-ui/react";

// Truncate starknet address
export const formatAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

function Leaderboard() {
  const [score, setScore] = useState<number>(0);
  const [leaderboardData, setLeaderboardData] =
    useState<GetEntitiesQuery | null>(null);
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
    setLeaderboardData(data);
  };

  useEffect(() => {
    fetchData();
  });

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
      <div
        style={{
          width: "100%",
          height: "100dvh",
        }}
      >
        <Box
          style={{
            position: "relative",
            display: "flex",
            fontSize: "24px",
            flexDirection: "column",
          }}
        >
          <h1>Leaderboard</h1>
          {leaderboardData ? (
            leaderboardData.entities.edges.map((edge, index) => (
              <div key={index}>
                <div>Keys: {edge.node.keys.join(", ")}</div>
                {edge.node.components.map((component, i) => (
                  <div key={i}>
                    <span>Score: {component.score}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </Box>
      </div>
      <Box
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
        }}
      >
        <Button onClick={async () => {}}>Back</Button>
      </Box>
      <Box
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex", // Add this CSS property
          alignItems: "center", // Center items vertically
        }}
      >
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

export default Leaderboard;
