"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmTransactionAsync = exports.createTxBodyFromUtxosAsync = exports.getProtocolParametersAsync = exports.getLatestProtocolParametersAsync = exports.getTransactionBuilder = void 0;
const cardano_multiplatform_lib_nodejs_1 = __importStar(require("@dcspark/cardano-multiplatform-lib-nodejs"));
const promises_1 = require("timers/promises");
const epoch_utils_1 = require("./epoch-utils");
const utxo_utils_1 = require("./utxo-utils");
const getTransactionBuilder = (config) => {
    const builder = cardano_multiplatform_lib_nodejs_1.default.TransactionBuilderConfigBuilder.new()
        .fee_algo(config.linearFee)
        .pool_deposit(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(config.poolDeposit))
        .key_deposit(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(config.keyDeposit))
        .max_value_size(config.maxValueSize)
        .max_tx_size(config.maxTxSize)
        .coins_per_utxo_word(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(config.coinsPerUtxoWord))
        .build();
    return cardano_multiplatform_lib_nodejs_1.default.TransactionBuilder.new(builder);
};
exports.getTransactionBuilder = getTransactionBuilder;
const getLatestProtocolParametersAsync = (BlockFrostAPI) => __awaiter(void 0, void 0, void 0, function* () {
    const currentEpochs = yield (0, epoch_utils_1.getCurrentEpochsAsync)(BlockFrostAPI);
    const protocolParameters = yield (0, exports.getProtocolParametersAsync)(BlockFrostAPI, currentEpochs.epoch);
    return protocolParameters;
});
exports.getLatestProtocolParametersAsync = getLatestProtocolParametersAsync;
const getProtocolParametersAsync = (blockfrostAPI, epochNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const { pool_deposit, key_deposit, max_val_size, max_tx_size, coins_per_utxo_size, min_fee_a, min_fee_b } = yield blockfrostAPI.epochsParameters(epochNumber);
    const linearFee = cardano_multiplatform_lib_nodejs_1.default.LinearFee.new(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(min_fee_a.toString()), cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(min_fee_b.toString()));
    return {
        linearFee,
        poolDeposit: pool_deposit,
        keyDeposit: key_deposit,
        maxValueSize: Number(max_val_size),
        maxTxSize: Number(max_tx_size),
        coinsPerUtxoWord: coins_per_utxo_size,
    };
});
exports.getProtocolParametersAsync = getProtocolParametersAsync;
const createTxBodyFromUtxosAsync = (protocolParams, inputs, outputs, privateKey, accountPrivateKey, changeAddress, blockfrostAPI) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Creating tx body....');
    // states
    let finalTx = null;
    let finalTxHash = null;
    let inputAmount = 0;
    let outputAmount = 0;
    let inputUtxos = [];
    let outputData = [];
    console.log('here');
    const shelleyChangeAddress = cardano_multiplatform_lib_nodejs_1.default.Address.from_bech32(changeAddress);
    console.log({ privateKey });
    console.log('here1');
    while (true) {
        // get 1 output
        const output = outputs.pop();
        if (output === undefined)
            break;
        outputAmount += Number(outputAmount);
        outputData.push(output);
        // get required inputs
        while (true) {
            const input = inputs.pop();
            if (input === undefined)
                break;
            inputAmount = (0, utxo_utils_1.calculateTotalUtxoQuantity)([input]);
            inputUtxos.push(input);
            if (inputAmount >= outputAmount)
                break;
        }
        // build transaction
        const txBuilder = (0, exports.getTransactionBuilder)(protocolParams);
        console.log('here2');
        for (let input of inputUtxos) {
            console.log(`input: ${input.amount.find((a) => a.unit === 'lovelace').quantity}`);
            txBuilder.add_key_input(cardano_multiplatform_lib_nodejs_1.default.PrivateKey.from_bech32(privateKey).to_public().hash(), // tx hash utxo
            cardano_multiplatform_lib_nodejs_1.default.TransactionInput.new(cardano_multiplatform_lib_nodejs_1.default.TransactionHash.from_bytes(Buffer.from(input.tx_hash, 'hex')), cardano_multiplatform_lib_nodejs_1.BigNum.from_str(input.output_index.toString())), //
            cardano_multiplatform_lib_nodejs_1.default.Value.new(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(input.amount.find((a) => a.unit === 'lovelace').quantity)));
        }
        console.log('here3');
        txBuilder.add_output(cardano_multiplatform_lib_nodejs_1.default.TransactionOutput.new(output.address, cardano_multiplatform_lib_nodejs_1.default.Value.new(cardano_multiplatform_lib_nodejs_1.BigNum.from_str(output.amount))));
        console.log('here4');
        const block = yield blockfrostAPI.blocksLatest();
        txBuilder.set_ttl(cardano_multiplatform_lib_nodejs_1.BigNum.from_str((block.slot + 1000000).toString()));
        txBuilder.add_change_if_needed(shelleyChangeAddress);
        const txBody = txBuilder.build();
        const txHash = cardano_multiplatform_lib_nodejs_1.default.hash_transaction(txBody);
        const witnesses = cardano_multiplatform_lib_nodejs_1.default.TransactionWitnessSet.new();
        console.log('here5');
        // add witnesses
        const vkeyWitnesses = cardano_multiplatform_lib_nodejs_1.default.Vkeywitnesses.new();
        const vkeyWitness = cardano_multiplatform_lib_nodejs_1.default.make_vkey_witness(txHash, cardano_multiplatform_lib_nodejs_1.default.PrivateKey.from_bech32(privateKey));
        vkeyWitnesses.add(vkeyWitness);
        witnesses.set_vkeys(vkeyWitnesses);
        console.log('here6');
        // generate transaction
        const tx = cardano_multiplatform_lib_nodejs_1.default.Transaction.new(txBody, witnesses, undefined);
        const txSize = Buffer.byteLength(tx.to_bytes()) / 1024.0;
        console.log('here7');
        console.log({ txSize });
        if (txSize > 16)
            break;
        finalTx = tx;
        finalTxHash = txHash;
        console.log({ txSize, finalTxHash, finalTx });
    }
    return { finalTx, finalTxHash, inputAmount, outputAmount, inputUtxos, outputData };
});
exports.createTxBodyFromUtxosAsync = createTxBodyFromUtxosAsync;
const confirmTransactionAsync = (txHashString, blockfrostAPI, confirmationCount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Confirming transaction....');
    let tx;
    while (true) {
        try {
            tx = yield blockfrostAPI.txs(txHashString);
            console.log('TX hash found!');
            break;
        }
        catch (err) {
            console.log('Tx hash not yet available... retrying...');
            yield (0, promises_1.setTimeout)(5000);
        }
    }
    let block;
    let retries = 0;
    while (true) {
        if (retries > 100)
            break;
        try {
            block = yield blockfrostAPI.blocks(tx.block);
        }
        catch (err) {
            console.log('Tx data not yet available, retrying in 6 seconds...');
            yield (0, promises_1.setTimeout)(1000 * 6);
        }
        if (block) {
            console.log(`Confirmation: ${block.confirmations}/${confirmationCount}`);
            if (block.confirmations >= confirmationCount) {
                console.log('Transaction confirmed');
                return true;
            }
            else {
                console.log('Transaction not confirmed yet, re-checking in 6 seconds...');
                yield (0, promises_1.setTimeout)(1000 * 6);
            }
        }
        retries++;
    }
    return false;
});
exports.confirmTransactionAsync = confirmTransactionAsync;
