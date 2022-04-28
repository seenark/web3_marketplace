import { useAccount2 } from '@components/hooks/web3/useAccount';
import { useNetwork } from '@components/hooks/web3/useNetwork';


export function useWalletInfo() {
  const account = useAccount2()
  const network = useNetwork()

  const isConnecting =
  !account.hasInitialResponse &&
  !network.hasInitialResponse

  const hasConnectedWallet = !!(account.data && network.isSupported)
  return {
    account,
    network,
    isConnecting,
    hasConnectedWallet
  }
}