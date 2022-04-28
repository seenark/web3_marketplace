import chai from "chai";
import { ethers } from "hardhat";
import chaiAsPromised from "chai-as-promised";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CourseMarketplace } from "../typechain";
import { ContractTransaction } from "ethers";

chai.use(chaiAsPromised);
const { expect } = chai;

const getBalance = async (address: string) => ethers.provider.getBalance(address)
const toBN = (value: number | string) => ethers.BigNumber.from(value)

const getGas = async (result: ContractTransaction) => {
  const tx = await ethers.provider.getTransactionReceipt(result.hash)
      const gasUsed = tx.gasUsed
      const gasPrice = result.gasPrice!
      const effGasPrice = tx.effectiveGasPrice
      const gas = gasUsed.mul(gasPrice)
      print("gas", gas.toNumber())
      return gas
}

describe("CourseMarketplace", async () => {
  const courseId = "0x00000000000000000000000000003130";
  const proof = "0x0000000000000000000000000000313000000000000000000000000000003130";
  const value = "900000000";

  const courseId2 = "0x00000000000000000000000000002130"
  const proof2 = "0x0000000000000000000000000000213000000000000000000000000000002130"

  let _contract: CourseMarketplace;
  let accounts: SignerWithAddress[]
  let contractOwner: SignerWithAddress;
  let buyer: SignerWithAddress;
  // let tx: ContractTransaction;
  let courseHash = ""

  before(async () => {
    const factory = await ethers.getContractFactory("CourseMarketplace");
    _contract = await factory.deploy();
    await _contract.deployed();
    accounts = await ethers.getSigners();
    contractOwner = accounts[0];
    buyer = accounts[1];
  });

  describe("Purchase the new course", () => {
    before(async () => {
      await _contract.connect(buyer).purchaseCourse(courseId, proof, { value });
    });

    it("should NOT allow to repurchase already owned course", async () => {
      expect(_contract.connect(buyer).purchaseCourse(courseId, proof)).to.rejected
    })

    it("can get the purchased course hash by index", async () => {
      const index = 0;
      courseHash = await _contract.getCourseHashAtIndex(index);
      const expectedHash = ethers.utils.solidityKeccak256(["bytes16", "address"], [courseId, buyer.address]);
      expect(courseHash, "Course hash is not maching the hash of purchased course!").to.eq(expectedHash);
    });

    it("should match the data of the course purchased by buyer", async () => {
      const exptectedIndex = 0;
      const exptectedState = 0;
      const course = await _contract.getCourseByHash(courseHash);

      expect(course.id.toNumber(), "Course index should be 0!").to.eq(exptectedIndex);
      expect(course.price.toString(), `Course price should be ${value}!`).to.eq(value);
      expect(course.proof, `Course proof should be ${proof}!`).to.eq(proof);
      expect(course.owner, `Course buyer should be ${buyer.address}!`).to.eq(buyer.address);
      expect(course.state, `Course state should be ${exptectedState}!`).to.eq(exptectedState);
    });
  });

  describe("Activate the purchased course", () => {
    before(async () => {
      await _contract.connect(contractOwner).activateCourse(courseHash)
    })

    it("should NOT be able to activate course by NOT contract owner", async () => {
      expect(_contract.connect(buyer).activateCourse(courseHash)).to.rejected
    })

    it("should have 'activated' state", async () => {
      const course = await _contract.getCourseByHash(courseHash)
      const exptectedState = 1

      expect(course.state, "Course should have 'activated' state").to.eq(exptectedState)
    })
  })

  describe("Transfer ownership", () => {
    let currentOwner = ""

    before(async() => {
      currentOwner = await _contract.getContractOwner()
    })

    it("getContractOwner should return deployer address", async () => {
      expect(contractOwner.address, "Contract owner is not matching the one from getContractOwner function").to.eq(currentOwner)
    })

    it("should NOT transfer ownership when contract owner is not sending TX", async () => {
      // await catchRevert(_contract.transferOwnership(accounts[3], {from: accounts[4]}))
      expect( _contract.connect(accounts[4]).transferOwnership(accounts[3].address)).to.rejected
    })

    it("should transfer owership to 3rd address from 'accounts'", async () => {
      await _contract.transferOwnership(accounts[2].address)
      const owner = await _contract.getContractOwner()
      expect(owner, "Contract owner is not the second account").to.eq(accounts[2].address)
    })

    it("should transfer owership back to initial contract owner'", async () => {
      await _contract.connect(accounts[2]).transferOwnership(contractOwner.address)
      const owner = await _contract.getContractOwner()
      expect(owner,  "Contract owner is not set!").to.eq(contractOwner.address)
    })
  })

  describe("Deactivate course", () => {
    let courseHash2 = ""
    let currentOwner = ""

    before(async () => {
      await _contract.connect(buyer).purchaseCourse(courseId2, proof2, {value})
      courseHash2 = await _contract.getCourseHashAtIndex(1)
      currentOwner = await _contract.getContractOwner()
    })

    it("should NOT be able to deactivate the course by NOT contract owner", async () => {
      expect(_contract.connect(buyer).deactivateCourse(courseHash2)).to.rejected
    })

    it("should have status of deactivated and price 0", async () => {
      const beforeTxBuyerBalance = await getBalance(buyer.address)
      const beforeTxContractBalance = await getBalance(_contract.address)
      const beforeTxOwnerBalance = await getBalance(currentOwner)

      const result = await _contract.connect(contractOwner).deactivateCourse(courseHash2)
      const gas = await getGas(result)
      const afterTxBuyerBalance = await getBalance(buyer.address)
      const afterTxContractBalance = await getBalance(_contract.address)
      const afterTxOwnerBalance = await getBalance(currentOwner)
      const course = await _contract.getCourseByHash(courseHash2)
      const exptectedState = 2
      const exptectedPrice = 0

      expect(course.state, "Course is NOT deactivated!").to.eq(exptectedState)
      expect(course.price.toNumber(), "Course price is not 0!").to.eq(exptectedPrice)

      expect(beforeTxOwnerBalance.sub(gas).toString(), "Contract owner ballance is not correct").to.eq(afterTxOwnerBalance.toString())

      expect(beforeTxBuyerBalance.add(toBN(value)).toString(), "Buyer ballance is not correct").to.eq(afterTxBuyerBalance.toString())

      expect(beforeTxContractBalance.sub(toBN(value).toString()),"Contract ballance is not correct").to.eq(afterTxContractBalance.toString())
    })

    it("should NOT be able activate deactivated course", async () => {
      expect(_contract.connect(contractOwner).activateCourse(courseHash2)).to.rejected
    })

  })

  describe("Repurchase course", () => {
    let courseHash2 = ""

    before(async () => {
      courseHash2 = await _contract.getCourseHashAtIndex(1)
    })

    it("should NOT repurchase when the course doesn't exist", async () => {
      const notExistingHash = "0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3"
      expect(_contract.connect(buyer).repurchaseCourse(notExistingHash)).to.rejected
    })

    it("should NOT repurchase with NOT course owner", async () => {
      const notOwnerAddress = accounts[2]
      // await catchRevert(_contract.repurchaseCourse(courseHash2, {from: notOwnerAddress}))
      expect(_contract.connect(notOwnerAddress).repurchaseCourse(courseHash2)).to.rejected
    })

    it("should be able repurchase with the original buyer", async () => {
      const beforeTxBuyerBalance = await getBalance(buyer.address)
      print("buyer balance before",beforeTxBuyerBalance.toString())
      print("value", value)
      const beforeTxContractBalance = await getBalance(_contract.address)

      const result = await _contract.connect(buyer).repurchaseCourse(courseHash2, { value})
      
      const afterTxBuyerBalance = await getBalance(buyer.address)
      const afterTxContractBalance = await getBalance(_contract.address)
      const gas = await getGas(result)
      print("gas", gas.toString())

      const course = await _contract.getCourseByHash(courseHash2)
      const exptectedState = 0

      expect(course.state, "The course is not in purchased state").to.eq(exptectedState)
      expect(course.price.toString(), `The course price is not equal to ${value}`).to.eq(value)
      expect(beforeTxBuyerBalance.sub(toBN(value)).sub(gas).toString(), "Client balance is not correct!").to.eq(afterTxBuyerBalance.toString())
      
      expect(beforeTxContractBalance.add(toBN(value)).toString(), "Contract balance is not correct!").to.eq(afterTxContractBalance.toString())
    })

    it("should NOT be able to repurchase purchased course", async () => {
      expect(_contract.connect(buyer).repurchaseCourse(courseHash2)).to.rejected
    })

  })


  describe("Receive funds", () => {

    it("should have transacted funds", async () => {
      const value = ethers.utils.parseUnits("1", 18)
      const contractBeforeTx = await getBalance(_contract.address)

      // await web3.eth.sendTransaction({
      //   from: buyer,
      //   to: _contract.address,
      //   value
      // })

      await buyer.sendTransaction({
        to: _contract.address,
        value: value,
      })

      const contractAfterTx = await getBalance(_contract.address)
      expect(contractBeforeTx.add(value).toString(), "Value after transaction is not matching!").to.eq(contractAfterTx.toString())

    })
  })

  describe("Normal withdraw", () => {
    const fundsToDeposit = ethers.utils.parseUnits("1", 18)
    const overLimitFunds = "999999000000000000000"
    let currentOwner = ""

    before(async () => {
      currentOwner = await _contract.getContractOwner()

      await buyer.sendTransaction({to: _contract.address, value: fundsToDeposit})
    })

    it("should fail when withdrawing with NOT owner address", async () => {
      const value = "10000000000000000"
      expect(_contract.withdraw(value)).to.rejected
    })

    it("should fail when withdrawing OVER limit balance", async () => {
      expect(_contract.withdraw(overLimitFunds)).to.rejected
    })

    it("should have +0.1ETH after withdraw", async () => {
      const ownerBalance = await getBalance(currentOwner)
      const result = await _contract.withdraw(fundsToDeposit, {from: currentOwner})
      const newOwnerBalance = await getBalance(currentOwner)
      const gas = await getGas(result)

      expect(ownerBalance.add(fundsToDeposit).sub(gas).toString(), "The new owner balance is not correct!").to.eq(newOwnerBalance.toString())
    })
  })

  describe("Emergency withdraw", () => {
    let currentOwner = ""

    before(async () => {
      currentOwner = await _contract.getContractOwner()
    })

    after(async () => {
      await _contract.resumeContract({from: currentOwner})
    })

    it("should fail when contract is NOT stopped", async () => {
      const currentOwnerSigner = await ethers.getSigner(currentOwner)
      expect(_contract.connect(currentOwnerSigner).emergencyWithdraw()).to.rejected
      // await catchRevert(_contract.emergencyWithdraw({from: currentOwner}))
    })

    it("should have +contract funds on contract owner", async () => {
      await _contract.connect(contractOwner).stopContract()

      const contractBalance = await getBalance(_contract.address)
      const ownerBalance = await getBalance(currentOwner)

      const result = await _contract.emergencyWithdraw({from: currentOwner})
      const gas = await getGas(result)

      const newOwnerBalance = await getBalance(currentOwner)

      expect(ownerBalance.add(contractBalance).sub(gas), "Owner doesn't have contract balance").to.eq(newOwnerBalance)
      // assert.equal(
      //   toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
      //   newOwnerBalance,
      //   "Owner doesn't have contract balance"
      // )
    })

    it("should have contract balance of 0", async () => {
      const contractBalance = await getBalance(_contract.address)

      expect(contractBalance.toNumber(), "Contract does't have 0 balance").to.eq(0)
      // assert.equal(
      //   contractBalance,
      //   0,
      //   "Contract does't have 0 balance"
      // )
    })
  })

  describe("Self Destruct", () => {
    let currentOwner = ""
    let currentOwnerSigner:SignerWithAddress
    before(async () => {
      currentOwner = await _contract.getContractOwner()
      currentOwnerSigner = await ethers.getSigner(currentOwner)
    })

    it("should fail when contract is NOT stopped", async () => {
      expect(_contract.selfDestruct()).to.rejected
    })

    it("should have +contract funds on contract owner", async () => {
      await _contract.connect(contractOwner).stopContract()

      const contractBalance = await getBalance(_contract.address)
      const ownerBalance = await getBalance(currentOwner)

      const result = await _contract.selfDestruct({from: currentOwner})
      const gas = await getGas(result)

      const newOwnerBalance = await getBalance(currentOwner)

      expect(ownerBalance.add(contractBalance).sub(gas), "Owner doesn't have contract balance").to.eq(newOwnerBalance)
      // assert.equal(
      //   toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
      //   newOwnerBalance,
      //   "Owner doesn't have contract balance"
      // )
    })

    it("should have contract balance of 0", async () => {
      const contractBalance = await getBalance(_contract.address)
      expect(contractBalance.toNumber(), "Contract does't have 0 balance").to.eq(0)
      // assert.equal(
      //   contractBalance,
      //   0,
      //   "Contract does't have 0 balance"
      // )
    })

    it("should have 0x bytecode", async () => {
      const code = await ethers.provider.getCode(_contract.address)
      // const code = await web3.eth.getCode(_contract.address)
      expect(code, "Contract is not destroyed").to.eq("0x")
      // assert.equal(
      //   code,
      //   "0x",
      //   "Contract is not destroyed"
      // )
    })
  })

});

export function print(text: string, value: any) {
  expect(console.log(text, value));
}
