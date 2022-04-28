import { useAdmin } from '@components/hooks/web3/useAdmin';
import { IOwnedCourse, useManageCourses } from '@components/hooks/web3/useManageCourses';
import { COURSE_STATES, useOwnedCourses } from '@components/hooks/web3/useOwnedCourses';
import { useWeb3 } from '@components/provider';
import { Button, Message } from '@components/ui/common';
import { CourseFilter, ManagedCourseCard, OwnedCourseCard } from '@components/ui/course';
import { BaseLayout } from '@components/ui/layout';
import { MarketHeader } from '@components/ui/marketplace';
import { ICourse } from '@content/fetcher';
import { NextPageWithLayout } from '@pages/_app';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

// BEFORE TX BALANCE -> 85,233893735999999996

// GAS 133009 * 20000000000 -> 2660180000000000 -> 0,00266018

// GAS + VALUE SEND = 0,00266018 + 1 -> 1,00266018

// AFTER TX -> 84,231233556
// AFTER TX -> 84,231233556
//             85,231233556

interface IVerificationInputProps {
  onVerify: (email: string) => void
}

const VerificationInput: React.FunctionComponent<IVerificationInputProps> = ({ onVerify }) => {

  const [email, setEmail] = useState("")

  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({ target: { value } }) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..." />
      <Button
        onClick={() => {
          onVerify(email)
        }}
      >
        Verify
      </Button>
    </div>
  );
};


interface IManageCoursesProps {

}

const ManagedCourses: NextPageWithLayout<IManageCoursesProps> = (props) => {
  const { account } = useAdmin("/marketplace")
  const { contract } = useWeb3()
  const managedCourses = useManageCourses()
  const [proofedOwnership, setProofedOwnership] = useState<{ [key: string]: boolean }>({})
  const [ searchedCourse, setSearchedCourse ] = useState<IOwnedCourse | null>(null)
  const [ filters, setFilters ] = useState({state: "all"})

  const renderCard = (course: IOwnedCourse, isSearched:boolean) => {
    return (
      <ManagedCourseCard
        key={course.ownedCourseId}
        isSearched={isSearched}
        course={course}
      >
        <VerificationInput
          onVerify={email => {
            verifyCourse(email, {
              hash: course.hash,
              proof: course.proof
            })
          }}
        />
        { proofedOwnership[course.hash] &&
          <div className="mt-2">
            <Message>
              Verified!
            </Message>
          </div>
        }
        { proofedOwnership[course.hash] === false &&
          <div className="mt-2">
            <Message type="danger">
              Wrong Proof!
            </Message>
          </div>
        }
        { course.state === "purchased" &&
          <div className="mt-2">
            <Button
              onClick={() => activateCourse(course.hash)}
              variant="green">
              Activate
            </Button>
            <Button
              onClick={() => deactivateCourse(course.hash)}
              variant="red">
              Deactivate
            </Button>
          </div>
        }
      </ManagedCourseCard>
    )
  }

  const verifyCourse = (email: string, value: { hash: string, proof: string }) => {
    if (!email) {
      return
    }

    const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email))
    const proofToCheck = ethers.utils.solidityKeccak256(["bytes32", "bytes32"], [emailHash, value.hash])

    proofToCheck === value.proof ?
      setProofedOwnership({
        ...proofedOwnership,
        [value.hash]: true
      }) :
      setProofedOwnership({
        ...proofedOwnership,
        [value.hash]: false
      })
  }

  const activateCourse = async (courseHash:string) => {
    try {
      if (!contract) throw new Error("no contract")
     await contract.activateCourse(courseHash)
    } catch(e:any) {
      console.error(e.message)
    }
  }

  const deactivateCourse = async (courseHash:string) => {
  console.log("🚀 ~ file: managed.tsx ~ line 87 ~ deactivateCourse ~ courseHash", courseHash)
    try {
      if (!contract) throw new Error("no contract")
     await contract.deactivateCourse(courseHash)
    } catch(e:any) {
      console.error(e.message)
    }
  }

  const searchCourse = async (hash:string) => {
    const re = /[0-9A-Fa-f]{6}/g;

    if(contract && hash && hash.length === 66 && re.test(hash)) {
      const course = await contract.getCourseByHash(hash)

      if (course.owner !== ethers.constants.AddressZero) {
        const newCourse: IOwnedCourse = {
          hash: hash,
          ownedCourseId: course.id.toNumber(),
          owner: course.owner,
          price: course.price.toNumber(),
          proof: course.proof,
          state: COURSE_STATES[course.state]
        }
        console.log("🚀 ~ file: managed.tsx ~ line 113 ~ searchCourse ~ newCourse", newCourse)
        setSearchedCourse(newCourse)
        return
      }
    }
  }

  useEffect(() => {
    console.log(filters)
  }, [filters])

  if (!account.isAdmin) {
    return null
  }

  const filteredCourses = managedCourses.data
  ?.filter((course) => {
    if (filters.state === "all") {
      return true
    }

    return course.state === filters.state
  })
  .map(course => renderCard(course, false) )

  return (
    <>
      <MarketHeader />
      <CourseFilter onFilterSelect={(value) => setFilters({state: value})} onSearchSubmit={searchCourse } />
      <section className="grid grid-cols-1">
      { searchedCourse &&
          <div>
            <h1 className="text-2xl font-bold p-5">Search</h1>
            { renderCard(searchedCourse, true) }
          </div>
        }
        <h1 className="text-2xl font-bold p-5">All Courses</h1>
        { filteredCourses }
        { filteredCourses?.length === 0 &&
          <Message type="warning">
            No courses to display
          </Message>
        }
      </section>
    </>
  );
};


ManagedCourses.getLayout = (page: React.ReactElement) => {
  return (
    <BaseLayout>
      {page}
    </BaseLayout>
  )
}

export default ManagedCourses;
