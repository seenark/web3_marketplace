import { ethers } from 'ethers';
import { handler as createUseAccount}  from "./useAccount"

export interface IHooks {
  useAccount: () => { account: string | null }
}

export const DEFAULT_HOOKS: IHooks = {
  useAccount: () => ({account: null})
}

export const setupHooks = (web3: ethers.providers.Web3Provider | null) => {

  return {
    useAccount: createUseAccount(web3)
  }
}