import { SetupNetworkResult } from "./setupNetwork";
import {
  Account,
  InvokeTransactionReceiptResponse,
  shortString,
} from "starknet";
import { EntityIndex, getComponentValue, setComponent } from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { updatePositionWithDirection } from "../utils";
import { sign } from "crypto";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { execute, contractComponents }: SetupNetworkResult,
  { Position, Moves, Random, Block }: ClientComponents
) {
  const random = async (signer: Account) => {
    const entityId = parseInt(signer.address) as EntityIndex;
    try {
      const tx = await execute(signer, "block", []);
      const receipt = await signer.waitForTransaction(tx.transaction_hash, {
        retryInterval: 100,
      });
      console.log(receipt);
      /*const tx2 = await execute(signer, "random", []);
      const receipt2 = await signer.waitForTransaction(tx2.transaction_hash, {
        retryInterval: 100,
      });
      console.log(receipt2);*/
      const events = parseEvent(receipt);
      console.log(events);
      const entity = parseInt(events[0].entity.toString()) as EntityIndex;
      const randomEvent = events[0];
      console.log(randomEvent);
      setComponent(contractComponents.Random, entity, {
        r: randomEvent.r,
      });
      return randomEvent.r;
    } catch (e) {
      console.log(e);
    }
  };

  return {
    random,
  };
}

// TODO: Move types and generalise this

export enum Direction {
  Left = 0,
  Right = 1,
  Up = 2,
  Down = 3,
}

export enum ComponentEvents {
  Moves = "Moves",
  Position = "Position",
  Random = "Random",
  Block = "Block",
}

export interface BaseEvent {
  type: ComponentEvents;
  entity: string;
}

export interface Moves extends BaseEvent {
  remaining: number;
}

export interface Position extends BaseEvent {
  x: number;
  y: number;
}

export const parseEvent = (
  receipt: InvokeTransactionReceiptResponse
): Array<Moves | Position> => {
  if (!receipt.events) {
    throw new Error(`No events found`);
  }

  const events: Array<Moves | Position> = [];

  for (const raw of receipt.events) {
    const decodedEventType = shortString.decodeShortString(raw.data[0]);

    switch (decodedEventType) {
      case ComponentEvents.Moves:
        if (raw.data.length < 6) {
          throw new Error("Insufficient data for Moves event.");
        }

        const movesData: Moves = {
          type: ComponentEvents.Moves,
          entity: raw.data[2],
          remaining: Number(raw.data[5]),
        };

        events.push(movesData);
        break;

      case ComponentEvents.Random:
        if (raw.data.length < 7) {
          throw new Error("Insufficient data for Random event.");
        }

        const randomData: Random = {
          type: ComponentEvents.Random,
          entity: raw.data[2],
          r: Number(raw.data[6]),
          score: Number(raw.data[5]),
        };

        events.push(randomData);
        break;

      /*case ComponentEvents.Block:
        if (raw.data.length < 7) {
          throw new Error("Insufficient data for Block event.");
        }

        const blockData: Block = {
          type: ComponentEvents.Block,
          entity: raw.data[2],
          r: Number(raw.data[6]),
          score: Number(raw.data[5]),
        };

        events.push(blockData);
        break;*/

      case ComponentEvents.Position:
        if (raw.data.length < 7) {
          throw new Error("Insufficient data for Position event.");
        }

        const positionData: Position = {
          type: ComponentEvents.Position,
          entity: raw.data[2],
          x: Number(raw.data[5]),
          y: Number(raw.data[6]),
        };

        events.push(positionData);
        break;

      default:
        throw new Error("Unsupported event type.");
    }
  }

  return events;
};
