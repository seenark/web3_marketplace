import * as React from 'react';
import { Message, Modal } from "@components/ui/common";
import {
  CourseHero,
  Curiculum,
  Keypoints
} from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses, ICourse, ICourseMap } from "@content/fetcher";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextPageWithLayout } from '@pages/_app';
import { useOwnedCourse } from '@components/hooks/web3/useOwnedCourse';
import { useNetwork } from '@components/hooks/web3/useNetwork';
import { useWeb3 } from '@components/provider';


interface ICourseProps {
  course?: ICourse
}

const Course: NextPageWithLayout<ICourseProps> = (props) => {
  const { course } = props
  useNetwork()
  const { isLoading } = useWeb3()
  const { data: ownedCourse } = useOwnedCourse(course)
  console.table(ownedCourse)
  const courseState = ownedCourse?.state
  const isLocked =
  !courseState ||
  courseState === "purchased" ||
  courseState === "deactivated"
  return (
    <>
      <div className="py-4">
        {
          course ? (
            <>
              <CourseHero title={course.title} description={course.description} image={course.coverImage} hasOwner={!!ownedCourse} />
              <Keypoints points={course.wsl} />
              {courseState &&
                <div className="max-w-5xl mx-auto">
                  {courseState === "purchased" &&
                    <Message type="warning">
                      Course is purchased and waiting for the activation. Process can take up to 24 hours.
                      <i className="block font-normal">In case of any questions, please contact info@eincode.com</i>
                    </Message>
                  }
                  {courseState === "activated" &&
                    <Message type="success">
                      Eincode wishes you happy watching of the course.
                    </Message>
                  }
                  {courseState === "deactivated" &&
                    <Message type="danger">
                      Course has been deactivated, due the incorrect purchase data.
                      The functionality to watch the course has been temporaly disabled.
                      <i className="block font-normal">Please contact info@eincode.com</i>
                    </Message>
                  }
                </div>
              }
              <Curiculum locked={isLocked} courseState={courseState} isLoading={isLoading} />
            </>
          ) : ""
        }
      </div>

      <Modal isOpen={false} />
    </>
  )
};

Course.getLayout = (page: React.ReactElement) => {
  return (
    <BaseLayout>
      {page}
    </BaseLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = getAllCourses()
  return {
    paths: data.map(c => ({
      params: {
        slug: c.slug
      }
    })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { data } = getAllCourses()
  const { params } = context
  if (!params) {
    return {
      props: {
        course: undefined
      }
    }
  }
  const course = data.filter(c => c.slug === params.slug)[0]

  return {
    props: {
      course
    }
  }
}

export default Course