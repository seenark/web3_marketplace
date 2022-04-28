import { useEffect } from 'react';
import { Web3Provider } from '@components/provider';
import { ethers } from 'ethers';
import { useState } from 'react';

export const handler = (web3: ethers.providers.Web3Provider | null) => () => {
  
  const [account, setAccount ] = useState<string | null>(null)

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3!.listAccounts()
      setAccount(accounts[0])
    }
    web3 && getAccount()
  },[])


  return {
    account
  }
}