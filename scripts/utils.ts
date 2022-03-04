import { web3 } from "hardhat";
import * as rlp from "rlp";
import keccak from "keccak";

// taken from beefy-finance

export const predictAddresses = async ({ creator }: { creator: string }) => {
  const currentNonce = await web3.eth.getTransactionCount(creator);

  const currentNonceHex = `0x${currentNonce.toString(16)}`;
  const currentInputArr = [creator, currentNonceHex];
  const currentRlpEncoded = rlp.encode(currentInputArr);
  const currentContractAddressLong = keccak("keccak256")
    .update(Buffer.from(currentRlpEncoded))
    .digest("hex");
  const currentContractAddress = `0x${currentContractAddressLong.substring(
    24
  )}`;
  const currentContractAddressChecksum = web3.utils.toChecksumAddress(
    currentContractAddress
  );

  const nextNonce = currentNonce + 1;
  const nextNonceHex = `0x${nextNonce.toString(16)}`;
  const nextInputArr = [creator, nextNonceHex];
  const nextRlpEncoded = rlp.encode(nextInputArr);
  const nextContractAddressLong = keccak("keccak256")
    .update(Buffer.from(nextRlpEncoded))
    .digest("hex");
  const nextContractAddress = `0x${nextContractAddressLong.substring(24)}`;
  const nextContractAddressChecksum =
    web3.utils.toChecksumAddress(nextContractAddress);

  return {
    vault: currentContractAddressChecksum,
    strategy: nextContractAddressChecksum,
  };
};
