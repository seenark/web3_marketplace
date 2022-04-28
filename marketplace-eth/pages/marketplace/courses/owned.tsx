import { useAccount2 } from '@components/hooks/web3/useAccount';
import { useOwnedCourses } from '@components/hooks/web3/useOwnedCourses';
import { useWeb3 } from '@components/provider';
import { Button, Message } from '@components/ui/common';
import { OwnedCourseCard } from '@components/ui/course';
import { BaseLayout } from '@components/ui/layout';
import { MarketHeader } from '@components/ui/marketplace';
import { NextPageWithLayout } from '@pages/_app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

interface IOwnedCoursesProps {
}

const OwnedCourses: NextPageWithLayout<IOwnedCoursesProps> = (props) => {
  const { requireInstall } = useWeb3()
  const account = useAccount2()
  const ownedCourses = useOwnedCourses()
  console.log("🚀 ~ file: owned.tsx ~ line 18 ~ ownedCourses", ownedCourses)
  const router = useRouter()
  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        {ownedCourses.isEmpty && 
          <div className="w-1/2">
            <Message type="warning">
              <div>{"You don't own any courses"}</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase Course</i>
                </a>
              </Link>
            </Message>
          </div>
        }
         { account.isEmpty &&
          <div className="w-1/2">
            <Message type="warning">
              <div>Please connect to Metamask</div>
            </Message>
          </div>
        }
        { requireInstall &&
          <div className="w-1/2">
            <Message type="warning">
              <div>Please install Metamask</div>
            </Message>
          </div>
        }
        { ownedCourses.data?.map(course =>
          <OwnedCourseCard
            key={course.id}
            course={course}
          >
            <Button
              onClick={() => router.push(`/courses/${course.slug}`)}
            >
              Watch the course
            </Button>
          </OwnedCourseCard>
        )}

      </section>
    </>
  );
};

OwnedCourses.getLayout = (page: React.ReactElement) => {
  return (
    <BaseLayout>{page}</BaseLayout>
  )
}

export default OwnedCourses;
