import { IProviderChainChange } from "./../../provider/web3/index";
import { useEffect } from "react";
import { useWeb3 } from "@components/provider";
import useSWR from "swr";

const NETWORKS: { [key: number]: string } = {
  1: "Ethereum Main Network",
  3: "Ropsten Test Network",
  4: "Rinkeby Test Network",
  5: "Goerli Test Network",
  42: "Kovan Test Network",
  56: "Binance Smart Chain",
  1337: "Ganache",
};

const NetworkId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID
? Number.parseInt(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID)
: 1337;
const targetNetwork = NetworkId != NaN ? NETWORKS[NetworkId] : NETWORKS[1337];

export function useNetwork() {
  const { provider, originalProvider } = useWeb3();
  const { data,error, mutate, ...rest } = useSWR(
    provider ? "web3/network" : null,
    async () => {
      const network = await provider!.getNetwork();
      const chainId = network.chainId;
      if (!chainId) {
        throw new Error("Cannot retreive network. Please refresh the browser.")
      }
      return NETWORKS[chainId];
    }
  );

  // useEffect(() => {

  //   const handler = (chainId: string) => {
  //     // const cId = Number.parseInt(chainId, 16);
  //     // if (cId != NaN) mutate(NETWORKS[cId]);
  //     window.location.reload()
  //   }

  //   if (originalProvider) {
  //     const newOriginalProvider = originalProvider as IProviderChainChange
  //     newOriginalProvider.on( "chainChanged", handler );

  //     return () => {
  //       newOriginalProvider.removeListener("chainChanged", handler)
  //       mutate(undefined)
  //     }
  //   }
     
  // }, [mutate, originalProvider]);

  return {
    chainId: data,
    hasInitialResponse: data || error,
    target: targetNetwork,
    isSupported: data === targetNetwork,
    error,
    mutate,
    ...rest,
  };
}
