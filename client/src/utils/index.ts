import { Direction } from "../dojo/createSystemCalls";

export function isValidArray(input: any): input is any[] {
  return Array.isArray(input) && input != null;
}

export function getFirstComponentByType(
  entities: any[] | null | undefined,
  typename: string,
  address
): any | null {
  if (!isValidArray(entities)) return null;
  for (const entity of entities) {
    if (entity.node.keys[0] !== address) continue;
    if (isValidArray(entity?.node.components)) {
      const foundComponent = entity.node.components.find(
        (comp: any) => comp.__typename === typename
      );
      if (foundComponent) return foundComponent;
    }
  }

  return null;
}

export function extractAndCleanKey(
  entities?: any[] | null | undefined
): string | null {
  if (!isValidArray(entities) || !entities[0]?.keys) return null;

  return entities[0].keys.replace(/,/g, "");
}

export function updatePositionWithDirection(
  direction: Direction,
  value: { x: number; y: number }
) {
  switch (direction) {
    case Direction.Left:
      value.x--;
      break;
    case Direction.Right:
      value.x++;
      break;
    case Direction.Up:
      value.y--;
      break;
    case Direction.Down:
      value.y++;
      break;
    default:
      throw new Error("Invalid direction provided");
  }
  return value;
}
