import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { ProtocolParameters } from '../types/cardano-types';
export declare const requestTestAdaAsync: (requestCount: number, address: string, blockfrostAPI: BlockFrostAPI, protocolParameters: ProtocolParameters) => Promise<void>;
export declare const waitForFundsAsync: (address: string, blockfrostAPI: BlockFrostAPI) => Promise<boolean>;
//# sourceMappingURL=faucet-utils.d.ts.map