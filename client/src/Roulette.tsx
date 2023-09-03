import { useDojo } from "./DojoContext";
import { useEffect, useState } from "react";
import { getFirstComponentByType } from "./utils";
import { Moves, Position, Random, Block } from "./generated/graphql";
import { Wheel } from "react-custom-roulette";
import { Button, Box, VStack, HStack } from "@chakra-ui/react"; // Import Chakra UI components
import "./App.css";

const data = [];
for (let index = 0; index < 5; index++) {
  data.push({
    option: (index * 2 + 1).toString(),
    style: { backgroundColor: "#D9241D", textColor: "white" },
  });
  data.push({
    option: (index * 2 + 2).toString(),
    style: { backgroundColor: "black", textColor: "white" },
  });
}

export const formatAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

export default function Roulette({ setComponent }) {
  const [randomValue, setRandomValue] = useState<Random>();
  const [score, setScore] = useState<number>(0);
  const [resetting, setResetting] = useState<boolean>(false);
  const {
    setup: {
      systemCalls: { reset, random, spinner },
      components: { Moves, Position, Random, Block },
      network: { graphSdk, call },
    },
    account: { create, list, select, account, isDeploying },
  } = useDojo();
  const [spin, setSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [betAmount, setBetAmount] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleBetAmountChange = (event) => {
    setBetAmount(event.target.value);
  };

  const handleSelectedNumberChange = (event) => {
    setSelectedNumber(event.target.value);
  };

  const handleSpinClick = async () => {
    if (!betAmount || betAmount <= 0 || !selectedNumber) {
      // Add validation logic here if needed
      return;
    }
    const res = await spinner(account, betAmount, selectedNumber);
    console.log(res);

    setPrizeNumber(res?.r - 1);
    setSpin(true);
    setScore(res?.score);
  };

  const reset_account = async () => {
    const res = await reset(account);
    setScore(res?.score);
  };

  const fetchData = async () => {
    const { data } = await graphSdk.getEntities();
    console.log(data);
    if (data) {
      const vals = getFirstComponentByType(
        data.entities?.edges,
        "Random",
        account.address
      );
      console.log(vals);
      if (!vals) {
        reset_account();
      }
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
      <Box
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
        }}
      >
        <Button
          onClick={async () => {
            setComponent("Slots");
          }}
        >
          Slots
        </Button>
        <Button
          style={{ marginLeft: "0.5em" }}
          onClick={async () => {
            setComponent("Leaderboard");
          }}
        >
          Leaderboard
        </Button>
      </Box>
      <VStack spacing={4} top="20">
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <HStack spacing={4}>
            <input
              type="number"
              placeholder="Bet amount"
              size="lg"
              value={betAmount}
              onChange={handleBetAmountChange}
              style={{
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="number"
              placeholder="Number to bet on"
              size="lg"
              value={selectedNumber}
              onChange={handleSelectedNumberChange}
              style={{
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Button onClick={handleSpinClick}>Spin</Button>
          </HStack>
        </Box>
        <Wheel
          mustStartSpinning={spin}
          prizeNumber={prizeNumber}
          onStopSpinning={() => {
            setSpin(false);
          }}
          perpendicularText={true}
          fontSize={30}
          data={data}
          spinDuration={0.01}
          backgroundColors={["#3e3e3e", "#df3428"]}
          textColors={["#ffffff"]}
        />
      </VStack>
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
              setResetting(true);
              await create();
              await reset_account();
              setResetting(false);
            }}
            isDisabled={resetting}
            isLoading={resetting}
          >
            {resetting ? "Resetting" : "Reset"}
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
    </>
  );
}
