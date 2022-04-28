import { ethers } from "ethers"


export function formatBytesString(text:string, bytes: number = 16) {
  const byte32 = ethers.utils.formatBytes32String(text)
  const bytes16 = byte32.slice(0, (bytes * 2) + 2)
  return bytes16
}