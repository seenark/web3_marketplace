import { CourseMarketplace__factory } from './../contracts/typechain/factories/CourseMarketplace__factory';
import { ethers } from "ethers";


export const loadContract = async (contractAddress: string,provider: ethers.providers.Web3Provider) => {
  try {
    const signer = provider.getSigner()
    const factory = new CourseMarketplace__factory(signer)
    const contract = factory.attach(contractAddress)
    return contract
  } catch (error) {
    console.log("Contract cannot be loaded")
    return null
  }
}