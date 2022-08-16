import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
export declare const getCurrentEpochsAsync: (blockfrostAPI: BlockFrostAPI) => Promise<{
    epoch: number;
    start_time: number;
    end_time: number;
    first_block_time: number;
    last_block_time: number;
    block_count: number;
    tx_count: number;
    output: string;
    fees: string;
    active_stake: string | null;
}>;
//# sourceMappingURL=epoch-utils.d.ts.map