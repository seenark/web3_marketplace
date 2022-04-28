import { IProviderAccountsChanged } from "./../../provider/web3/index";
import { useEffect, useMemo, useState } from "react";
import { useHooks, useWeb3 } from "@components/provider/web3";
import useSWR from "swr";
import { ethers } from "ethers";
export const useAccount = () => {
  // return useHooks((hook) => hook.useAccount)();
  return useHooks((hook) => hook.useAccount);
};

const adminAddresses: { [key: string]: boolean } = {
  "0xc1e2eb0756b3fa5f73cb7c5ab223fa9844d793d5ab6086469d504f2df895777f": true, // hash of admin metamask public address
};

export function useAccount2() {
  const { provider, originalProvider } = useWeb3();

  const { data, mutate, error, ...rest } = useSWR(
    provider ? "web3/accounts" : null,
    async () => {
      const accounts = await provider!.listAccounts();
      const account = accounts[0];

      if (!account) {
        throw new Error(
          "Cannot retreive an account. Please refresh the browser."
        );
      }

      return account;
    }
  );

  useEffect(() => {
    console.log("SUBSCRIBING TO EVENT");

    const handler = (accounts: string[]) => {
      console.log("ON ACCOUNT DATA");
      mutate(accounts[0] ?? null);
    };

    if (originalProvider) {
      const newOriginalProvider = originalProvider as IProviderAccountsChanged
      newOriginalProvider.on( "accountsChanged", handler );
      console.log(originalProvider);
      return () => {
        console.log("remove");
        newOriginalProvider.removeListener("accountsChanged", handler)
        mutate();
      };
    }
  }, [mutate, originalProvider]);

  const isAdmin = useMemo(() => {
    if (!data) return false;
    const hash = ethers.utils.keccak256(data);
    return adminAddresses[hash];
  }, [data]);

  return {
    data,
    isAdmin: isAdmin,
    hasInitialResponse: !!(data || error),
    isEmpty: !!((data && data === "") || error),
    mutate,
    ...rest,
  };
}
