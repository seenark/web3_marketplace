import { CourseList, CourseCard } from "@components/ui/course"
import { BaseLayout } from "@components/ui/layout"
import { WalletBar, EthRates } from "@components/ui/web3"
import { getAllCourses, ICourse } from "@content/fetcher";
import { NextPageWithLayout } from "@pages/_app";
import { Breadcrums, Button, Loader, Message } from "@components/ui/common"
import { OrderModal } from "@components/ui/order";
import { useState } from "react"
import { useEthPrice } from "@components/hooks/useEthPrice";
import { useWalletInfo } from "@components/hooks/web3/useWalletInfo";
import { MarketHeader } from "@components/ui/marketplace";
import { IOrder } from "@components/ui/order/modal";
import { useWeb3 } from "@components/provider";
import { useAccount2 } from "@components/hooks/web3/useAccount";
import { BigNumber, ethers, FixedNumber } from "ethers";
import { formatBytesString } from "@utils/formatBytes16String";
import { useOwnedCourses } from "@components/hooks/web3/useOwnedCourses";

interface IMarketplaceProps {
  courses: ICourse[]
}

const Marketplace: NextPageWithLayout<IMarketplaceProps> = ({ courses }) => {

  const { contract, requireInstall } = useWeb3()
  const { account, network, hasConnectedWallet, isConnecting } = useWalletInfo()
  const ownedCourses = useOwnedCourses()
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null)
  const [isNewPurchase, setIsNewPurchase] = useState(true)

  const purchaseCourse = async (order: IOrder) => {

    if (selectedCourse && contract) {

      const _purchaseCourse = async (hexCourseId: string, proof: string, value: BigNumber) => {
        try {
          const tx = await contract.purchaseCourse(hexCourseIdBytes16, proof, { value: value })
          await tx.wait()
          console.log("🚀 ~ file: index.tsx ~ line 66 ~ purchaseCourse ~ tx", tx.hash)
        } catch (error) {
          console.log("Purchase course operation failed!", error)
        }
      }

      const _repurchaseCourse = async (courseHash:string, value:BigNumber) => {
        try {
          const result = await contract.repurchaseCourse(courseHash, {value})
          console.log(result)
        } catch {
          console.error("Purchase course: Operation has failed.")
        }
      }

      const hexCourseId = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(selectedCourse.id))
      const hexCourseIdBytes16 = formatBytesString(selectedCourse.id, 16)

      const orderHash = ethers.utils.solidityKeccak256(["bytes16", "address"], [hexCourseIdBytes16, account.data])
      // convert eth to wei
      const wei = ethers.BigNumber.from(order.price * 1e18)

      if (isNewPurchase) {
      const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(order.email))

      const proof = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [emailHash, orderHash])
      console.table({ hexCourseId, hexCourseIdBytes16, orderHash, emailHash, proof })

      /* 
      explaination: 
      if id = 1410474 
      hexCourseId = 0x31343130343734
      but we need hexCourseId to be bytes16 so it will be 0x31343130343734000000000000000000 (it should contain 32 characters long wihtout 0x so we add 0 to make it be 32 characters long)

      address = 0x95C9CE2CF8A726017Ba62A7785b5575DD06DD899 (from metamask)

      the argument to be add to keccak256 = 3134313034373400000000000000000095C9CE2CF8A726017Ba62A7785b5575DD06DD899 (hexCourseId without 0x and address without 0x as well)
      corrected value of orderHash = 0xc38ead6e0738823c1993e01e6c07e41c8e4115c7563568e2b3ded4dc5b9b3c0f

      but we get 0xc38ead6e0738823c1993e01e6c07e41c8e4115c7563568e2b3ded4dc5b9b3c0f this is same 
      we have not found function to format string to bytes16 so we made our utils function to be convert string from 32 bytes to 16 bytes by cutting out ending zero to be 32 characters long
      why we convert to bytes16?. Because we know CourseId is number and length is not long, bytes16 is enough to store all number, so we can save gas in smart contract

      email = test@gmail.com
      keccak256 email = 0xaf257bcc3cf653863a77012256c927f26d8ab55c5bea3751063d049d0538b902

      proof argument = emailHash + orderHash (both of them without 0x) = af257bcc3cf653863a77012256c927f26d8ab55c5bea3751063d049d0538b902c38ead6e0738823c1993e01e6c07e41c8e4115c7563568e2b3ded4dc5b9b3c0f
      proof = 0x75f8db748c57eacd6407f2220f37f600c87af907677e15af9f9fc22747736cfc
    */

      _purchaseCourse(hexCourseId, proof, wei)
        
    }else{
      _repurchaseCourse(orderHash, wei)
    }

      

    }
  }

  return (
    <>
      <MarketHeader />
      <CourseList
        courses={courses}
      >
        {course => {
          const owned = ownedCourses.lookup[course.id]
          return (
            <CourseCard
              key={course.id}
              course={course}
              state={owned?.state}
              disabled={!hasConnectedWallet}
              Footer={() => {
                if (requireInstall) {
                  return (
                    <Button
                      size="sm"
                      disabled={true}
                      variant="lightPurple">
                      Install
                    </Button>
                  )
                }

                if (isConnecting) {
                  return (
                    <Button
                      size="sm"
                      disabled={true}
                      variant="lightPurple">
                      <Loader size="sm" />
                    </Button>
                  )
                }

                if (!ownedCourses.hasInitialResponse) {
                  return (
                    <div style={{ height: "42px" }}></div>
                  )
                }

                if (owned) {
                  return (
                    <>
                      <div className="flex">
                        <Button
                          onClick={() => alert("You are owner of this course.")}
                          disabled={false}
                          size="sm"
                          variant="white">
                          Yours &#10004;
                        </Button>
                        {owned.state === "deactivated" &&
                          <div className="ml-1">
                            <Button
                              size="sm"
                              disabled={false}
                              onClick={() => {
                                setIsNewPurchase(false)
                                setSelectedCourse(course)
                              }}
                              variant="purple">
                              Fund to Activate
                            </Button>
                          </div>
                        }
                      </div>
                    </>
                  )
                }


                return (
                  <Button
                    size="sm"
                    onClick={() => setSelectedCourse(course)}
                    disabled={!hasConnectedWallet}
                    variant="lightPurple">
                    Purchase
                  </Button>
                )
              }
              }
            />
          )
        }
        }
      </CourseList>
      {selectedCourse &&
        <OrderModal
          course={selectedCourse}
          onSubmit={purchaseCourse}
          isNewPurchase={isNewPurchase}
          onClose={() => {
            setSelectedCourse(null)
            setIsNewPurchase(true)
          }}
        />
      }
    </>
  );
};

Marketplace.getLayout = (page: React.ReactElement) => {
  return (
    <BaseLayout>{page}</BaseLayout>
  )
}


export function getStaticProps() {
  const { data } = getAllCourses()
  return {
    props: {
      courses: data
    }
  }
}


export default Marketplace;