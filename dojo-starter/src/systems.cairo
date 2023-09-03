#[system]
mod spawn {
    use array::ArrayTrait;
    use box::BoxTrait;
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use dojo::world::Context;

    use dojo_examples::components::Position;
    use dojo_examples::components::Moves;
    use dojo_examples::constants::OFFSET;

    // so we don't go negative

    fn execute(ctx: Context) {
        // cast the offset to a u32
        let offset: u32 = OFFSET.try_into().unwrap();

        set!(
            ctx.world,
            (
                Moves {
                    player: ctx.origin, remaining: 100
                    }, Position {
                    player: ctx.origin, x: offset, y: offset
                },
            )
        );
        return ();
    }
}

//#[system]
//mod random {
//    use core::result::ResultTrait;
//    use core::traits::Destruct;
//    use array::ArrayTrait;
//    use box::BoxTrait;
//    use traits::{Into, TryInto};
//    use option::OptionTrait;
//    use dojo::world::Context;
//
//    use dojo_examples::components::Random;
//    use dojo_examples::components::Block;
//    use starknet::syscalls::get_execution_info_syscall;
//    use starknet::syscalls::get_block_hash_syscall;
//    use starknet::info::ExecutionInfo;
//    use starknet::info::BlockInfo;
//    use integer::u128_from_felt252;
//
//    #[derive(Drop, starknet::Event)]
//    struct blockNum {
//        block_number: u64,
//    }
//
//    fn execute(ctx: Context) {
//        let execution_info:ExecutionInfo = get_execution_info_syscall().unwrap().unbox();
//        let block_info:BlockInfo = execution_info.block_info.unbox(); // Reference to BlockInfo
//        let block_number:u64 = block_info.block_number - 10;
//        let block_hash = get_block_hash_syscall(block_number);
//        let hash = block_hash.unwrap();
//        set!(
//            ctx.world,
//            (
//                Random {
//                    player: ctx.origin, r: u128_from_felt252(hash)
//                    },
//            )
//        );
//        return ();
//    }
//}

#[system]
mod block {
    use core::result::ResultTrait;
    use core::traits::Destruct;
    use array::ArrayTrait;
    use box::BoxTrait;
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use dojo::world::Context;

    use dojo_examples::components::Block;
    use dojo_examples::components::Random;
    use starknet::syscalls::get_execution_info_syscall;
    use starknet::syscalls::get_block_hash_syscall;
    use starknet::info::ExecutionInfo;
    use starknet::info::BlockInfo;
    use integer::{u128s_from_felt252, U128sFromFelt252Result};

    fn hash_random_u128(seed: u128) -> u128 {
        let hash = pedersen(seed.into(), 1);
        match u128s_from_felt252(hash) {
            U128sFromFelt252Result::Narrow(x) => x,
            U128sFromFelt252Result::Wide((_, x)) => x,
        }
    }

    fn execute(ctx: Context) {
        let execution_info:ExecutionInfo = get_execution_info_syscall().unwrap().unbox();
        let block_info:BlockInfo = execution_info.block_info.unbox(); // Reference to BlockInfo
        let block_number:u64 = block_info.block_number;
        let long_block_number:u128 = block_number.into();
        let hash_block:u128 = hash_random_u128(long_block_number);

        //set!(
        //    ctx.world,
        //    (
        //        Block {
        //            player: ctx.origin, b: block_number
        //            },
        //    )
        //);

        set!(
            ctx.world,
            (
                Random {
                    player: ctx.origin, r: hash_block
                    },
                    
            )
        );
        return ();
    }
}

#[system]
mod move {
    use array::ArrayTrait;
    use box::BoxTrait;
    use traits::Into;
    use dojo::world::Context;
    use debug::PrintTrait;

    use dojo_examples::components::Position;
    use dojo_examples::components::Moves;

    #[derive(Serde, Drop)]
    enum Direction {
        Left: (),
        Right: (),
        Up: (),
        Down: (),
    }

    impl DirectionIntoFelt252 of Into<Direction, felt252> {
        fn into(self: Direction) -> felt252 {
            match self {
                Direction::Left(()) => 0,
                Direction::Right(()) => 1,
                Direction::Up(()) => 2,
                Direction::Down(()) => 3,
            }
        }
    }

    fn execute(ctx: Context, direction: Direction) {
        let (mut position, mut moves) = get!(ctx.world, ctx.origin, (Position, Moves));
        moves.remaining -= 1;
        let next = next_position(position, direction);
        set!(ctx.world, (moves, next));
        return ();
    }

    fn next_position(mut position: Position, direction: Direction) -> Position {
        match direction {
            Direction::Left(()) => {
                position.x -= 1;
            },
            Direction::Right(()) => {
                position.x += 1;
            },
            Direction::Up(()) => {
                position.y -= 1;
            },
            Direction::Down(()) => {
                position.y += 1;
            },
        };

        position
    }
}

