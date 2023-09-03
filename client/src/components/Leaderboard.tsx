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
import {
  Button,
  HStack,
  Link,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

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
          width: "100vw",
          display: "flex",
          justifyContent: "center", // Center horizontally
        }}
      >
        <Box
          style={{
            position: "relative",
            display: "flex",
            fontSize: "24px",
            flexDirection: "column",
            alignItems: "center", // Center horizontally
          }}
        >
          <h1>Leaderboard</h1>
          {leaderboardData ? (
            <Table variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Keys</Th>
                  <Th>Score</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboardData.entities.edges
                  .slice() // Create a copy of the array
                  .sort(
                    (a, b) =>
                      b.node.components[0].score - a.node.components[0].score
                  ) // Sort by score in descending order
                  .map((edge, index) => (
                    <Tr key={index}>
                      <Td>{formatAddress(edge.node.keys[0])}</Td>
                      {edge.node.components.map((component, i) => (
                        <Td key={i}>{component.score}</Td>
                      ))}
                    </Tr>
                  ))}
              </Tbody>
            </Table>
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
