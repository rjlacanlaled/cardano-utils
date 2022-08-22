import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export const getCurrentEpochsAsync = async (blockfrostAPI: BlockFrostAPI) => {
    return await blockfrostAPI.epochsLatest();
};
