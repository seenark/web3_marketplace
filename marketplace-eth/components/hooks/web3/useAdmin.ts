import { useWeb3 } from "@components/provider"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useAccount2 } from "./useAccount"


export const useAdmin = (redirectTo: string) => {
  const account = useAccount2()
  const { requireInstall } = useWeb3()
  const router = useRouter()

  useEffect(() => {
    if ((
      requireInstall ||
      account.hasInitialResponse && !account.isAdmin) ||
      account.isEmpty) {

      router.push(redirectTo)
    }
  }, [account, redirectTo, requireInstall, router])

  return { account }
}