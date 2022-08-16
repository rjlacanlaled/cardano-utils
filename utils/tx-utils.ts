import { BlockFrostAPI, Responses } from '@blockfrost/blockfrost-js';
import CardanoWasm, {
    Address,
    BigNum,
    Bip32PrivateKey,
    Bip32PublicKey,
    LinearFee,
    Transaction,
    TransactionBody,
    TransactionBuilder,
    TransactionHash,
} from '@dcspark/cardano-multiplatform-lib-nodejs';
import { setTimeout } from 'timers/promises';
import { ProtocolParameters, UTXO } from '../types/cardano-types';
import { getCurrentEpochsAsync } from './epoch-utils';
import { toHex } from './string-utils';
import { calculateTotalUtxoQuantity } from './utxo-utils';

export const getTransactionBuilder = (config: ProtocolParameters): TransactionBuilder => {
    const builder = CardanoWasm.TransactionBuilderConfigBuilder.new()
        .fee_algo(config.linearFee)
        .pool_deposit(CardanoWasm.BigNum.from_str(config.poolDeposit))
        .key_deposit(CardanoWasm.BigNum.from_str(config.keyDeposit))
        .max_value_size(config.maxValueSize)
        .max_tx_size(config.maxTxSize)
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str(config.coinsPerUtxoWord))
        .build();

    return CardanoWasm.TransactionBuilder.new(builder);
};

export const getLatestProtocolParametersAsync = async (BlockFrostAPI: BlockFrostAPI): Promise<ProtocolParameters> => {
    const currentEpochs = await getCurrentEpochsAsync(BlockFrostAPI);
    const protocolParameters = await getProtocolParametersAsync(BlockFrostAPI, currentEpochs.epoch);

    return protocolParameters;
};

export const getProtocolParametersAsync = async (
    blockfrostAPI: BlockFrostAPI,
    epochNumber: number
): Promise<ProtocolParameters> => {
    const { pool_deposit, key_deposit, max_val_size, max_tx_size, coins_per_utxo_size, min_fee_a, min_fee_b } =
        await blockfrostAPI.epochsParameters(epochNumber);

    const linearFee = CardanoWasm.LinearFee.new(
        CardanoWasm.BigNum.from_str(min_fee_a.toString()),
        CardanoWasm.BigNum.from_str(min_fee_b.toString())
    );

    return {
        linearFee,
        poolDeposit: pool_deposit,
        keyDeposit: key_deposit,
        maxValueSize: Number(max_val_size),
        maxTxSize: Number(max_tx_size),
        coinsPerUtxoWord: coins_per_utxo_size as string,
    };
};

export const createTxBodyFromUtxosAsync = async (
    protocolParams: ProtocolParameters,
    inputs: UTXO[],
    outputs: { address: Address; amount: string }[],
    privateKey: string,
    accountPrivateKey: string,
    changeAddress: string,
    blockfrostAPI: BlockFrostAPI
): Promise<{
    finalTx: Transaction | null;
    finalTxHash: TransactionHash | null;
    inputAmount: number;
    outputAmount: number;
    inputUtxos: UTXO[];
    outputData: { address: Address; amount: string }[];
}> => {
    console.log('Creating tx body....');
    // states
    let finalTx: Transaction | null = null;
    let finalTxHash: TransactionHash | null = null;
    let inputAmount = 0;
    let outputAmount = 0;
    let inputUtxos = [];
    let outputData = [];

    console.log('here');
    const shelleyChangeAddress = CardanoWasm.Address.from_bech32(changeAddress);

    console.log({ privateKey });

    console.log('here1');

    while (true) {
        // get 1 output
        const output = outputs.pop();

        if (output === undefined) break;

        outputAmount += Number(outputAmount);
        outputData.push(output);

        // get required inputs
        while (true) {
            const input = inputs.pop();

            if (input === undefined) break;

            inputAmount = calculateTotalUtxoQuantity([input]);
            inputUtxos.push(input);

            if (inputAmount >= outputAmount) break;
        }

        // build transaction
        const txBuilder = getTransactionBuilder(protocolParams);

        console.log('here2');
        for (let input of inputUtxos) {
            console.log(`input: ${input.amount.find((a) => a.unit === 'lovelace')!.quantity}`);
            txBuilder.add_key_input(
                CardanoWasm.PrivateKey.from_bech32(privateKey).to_public().hash(), // tx hash utxo
                CardanoWasm.TransactionInput.new(
                    CardanoWasm.TransactionHash.from_bytes(Buffer.from(input.tx_hash, 'hex')),
                    BigNum.from_str(input.output_index.toString())
                ), //
                CardanoWasm.Value.new(
                    CardanoWasm.BigNum.from_str(input.amount.find((a) => a.unit === 'lovelace')!.quantity)
                )
            );
        }

        console.log('here3');

        txBuilder.add_output(
            CardanoWasm.TransactionOutput.new(output.address, CardanoWasm.Value.new(BigNum.from_str(output.amount)))
        );

        console.log('here4');

        const block = await blockfrostAPI.blocksLatest();

        txBuilder.set_ttl(BigNum.from_str((block.slot! + 1_000_000).toString()));
        txBuilder.add_change_if_needed(shelleyChangeAddress);
        const txBody = txBuilder.build();
        const txHash = CardanoWasm.hash_transaction(txBody);
        const witnesses = CardanoWasm.TransactionWitnessSet.new();

        console.log('here5');

        // add witnesses
        const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
        const vkeyWitness = CardanoWasm.make_vkey_witness(txHash, CardanoWasm.PrivateKey.from_bech32(privateKey));
        vkeyWitnesses.add(vkeyWitness);
        witnesses.set_vkeys(vkeyWitnesses);

        console.log('here6');
        // generate transaction
        const tx = CardanoWasm.Transaction.new(txBody, witnesses, undefined);

        const txSize = Buffer.byteLength(tx.to_bytes()) / 1024.0;

        console.log('here7');

        console.log({ txSize });

        if (txSize > 16) break;

        finalTx = tx;
        finalTxHash = txHash;

        console.log({ txSize, finalTxHash, finalTx });
    }

    return { finalTx, finalTxHash, inputAmount, outputAmount, inputUtxos, outputData };
};

export const confirmTransactionAsync = async (
    txHashString: string,
    blockfrostAPI: BlockFrostAPI,
    confirmationCount: number
): Promise<boolean> => {
    console.log('Confirming transaction....');

    let tx: any;

    while (true) {
        try {
            tx = await blockfrostAPI.txs(txHashString);
            console.log('TX hash found!');
            break;
        } catch (err) {
            console.log('Tx hash not yet available... retrying...');
            await setTimeout(5000);
        }
    }

    let block: any;

    let retries = 0;
    while (true) {
        if (retries > 100) break;

        try {
            block = await blockfrostAPI.blocks(tx.block);
        } catch (err) {
            console.log('Tx data not yet available, retrying in 6 seconds...');
            await setTimeout(1000 * 6);
        }

        if (block) {
            console.log(`Confirmation: ${block.confirmations}/${confirmationCount}`);
            if (block.confirmations >= confirmationCount) {
                console.log('Transaction confirmed');
                return true;
            } else {
                console.log('Transaction not confirmed yet, re-checking in 6 seconds...');
                await setTimeout(1000 * 6);
            }
        }

        retries++;
    }

    return false;
};
