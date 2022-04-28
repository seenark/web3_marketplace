import React, { ReactElement, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from "next/router"

interface IActiveLinkProps extends LinkProps {
  children: ReactNode
  activeLinkClass: string
}

const ActiveLink: React.FunctionComponent<IActiveLinkProps> = ({children,activeLinkClass, ...props}) => {
  const { pathname } = useRouter()
  let className = ""
  const child: React.ReactElement = children as ReactElement

  if (child && child.props && child.props.className) {
    className = child.props.className
  }

  if (pathname === props.href) {
    className = `${className} ${activeLinkClass ? activeLinkClass : "text-indigo-600"}`
  }

  return (
    <Link {...props}>
      {
       React.cloneElement( children, {className})
      }
    </Link>
  );
};

export default ActiveLink;
