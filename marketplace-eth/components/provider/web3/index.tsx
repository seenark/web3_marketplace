import { ethers } from "ethers";
import { createContext, FunctionComponent, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import detectEthProvider from "@metamask/detect-provider"
import { DEFAULT_HOOKS, IHooks, setupHooks } from "./hooks/setupHooks";
import { loadContract } from "@utils/loadContract";
import { CourseMarketplace } from "contracts/typechain";

interface IRequestAccounts {
  method: "eth_requestAccounts"
}

interface ExternalProviderExtend extends ethers.providers.ExternalProvider {
  removeAllListeners: () => void
}

export interface IProviderChainChange extends ExternalProviderExtend {
  on: (method: "chainChanged", callback: (chainId: string) => void) => void
  removeListener: (method: "chainChanged", callback: (chainId: string) => void) => void
}

export interface IProviderAccountsChanged extends ExternalProviderExtend {
  on: (method: "accountsChanged", callback: (accounts: string[]) => void) => void
  removeListener: (method: "accountsChanged", callback: (accounts: string[]) => void) => void
}

export type MyExternalProvider = IProviderChainChange | IProviderAccountsChanged
// export type MyExternalProvider<T extends "chainChanged" | "accountsChanged" = "accountsChanged"> = T extends "chainChanged" ? IChainChange : IAccountsChanged

export interface IWeb3Context {
  originalProvider: MyExternalProvider | null
  provider: ethers.providers.Web3Provider | null,
  web3: null,
  // isWeb3Loaded: boolean,
  requireInstall: boolean
  contract: CourseMarketplace | null
  isLoading: boolean
  getHooks: () => IHooks,
  connect: () => void,
}

let initialData: IWeb3Context = {
  originalProvider: null,
  provider: null,
  web3: null,
  // isWeb3Loaded: false,
  requireInstall: true,
  contract: null,
  isLoading: true,
  getHooks: () => DEFAULT_HOOKS,
  connect: () => { }
}

const Web3Context = createContext(initialData)


interface IWeb3ProviderProps {
  children: ReactNode
}

const Web3Provider: FunctionComponent<IWeb3ProviderProps> = ({ children }) => {

  const [web3Api, setWeb3Api] = useState<IWeb3Context>(initialData)

  useEffect(() => {

    (async () => {
      const provider = await detectEthProvider({ mustBeMetaMask: true }) as MyExternalProvider

      if (provider) {
        const newProvider = new ethers.providers.Web3Provider(provider)
        const contract = await loadContract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!, newProvider);

        (provider as IProviderChainChange).on("chainChanged", () => window.location.reload())

        setWeb3Api((state) => ({
          ...state,
          originalProvider: provider,
          provider: newProvider,
          isLoading: false,
          contract: contract
        }))
      } else {
        setWeb3Api((state) => ({
          ...state,
          isLoading: false
        }))
        console.log("Please install Metamask")
      }
    })()
  }, [])


  const _web3 = useMemo(() => {
    return {
      ...web3Api,
      // isWeb3Loaded: web3Api.provider != null,
      requireInstall: !web3Api.isLoading && !web3Api.provider,
      getHooks: () => setupHooks(web3Api.provider),
      connect: web3Api.provider ?
        async () => {
          try {
            web3Api.originalProvider!.request!({ method: "eth_requestAccounts" })
          } catch (error) {
            location.reload()
            // console.log(error)
          }
        } :
        () => console.log("Cannot connect to Metamask. Please reload your browser")
    }
  }, [web3Api])


  return (
    <Web3Context.Provider value={_web3}>
      {children}
    </Web3Context.Provider>
  )
};

export default Web3Provider;

export function useWeb3() {
  return useContext(Web3Context)
}

export function useHooks(cb: (hooks: IHooks) => void) {
  const { getHooks } = useWeb3()
  const hook = getHooks()
  return cb(hook)
}



