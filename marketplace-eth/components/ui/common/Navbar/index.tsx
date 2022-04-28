import { useWeb3 } from '@components/provider';
import Link from 'next/link';
import * as React from 'react';
import { Button } from "@components/ui/common"
import { useAccount2 } from '@components/hooks/web3/useAccount';
import { useRouter } from "next/router"
import ActiveLink from '../link';

interface INavbarProps {
}

const Navbar: React.FunctionComponent<INavbarProps> = (props) => {
  const { connect, isLoading, provider, requireInstall } = useWeb3()
  const account = useAccount2()
  const { pathname } = useRouter()

  return (
    <section>
      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <nav className="relative" aria-label="Global">
          <div className="flex justify-between items-center flex-col xs:flex-row">
            <div>
              <ActiveLink href="/" activeLinkClass={''} >
                <a
                  className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Home
                </a>
              </ActiveLink>
              <ActiveLink href="/marketplace" activeLinkClass={''} >
                <a
                  className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Marketplace
                </a>
              </ActiveLink>
              <ActiveLink href="/blogs" activeLinkClass={''} >
                <a
                  className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Blogs
                </a>
              </ActiveLink>
            </div>
            <div className="text-center">
              <ActiveLink href="/wishlist" activeLinkClass={''} >
                <a
                  className="font-medium sm:mr-8 mr-1 text-gray-500 hover:text-gray-900">
                  Wishlist
                </a>
              </ActiveLink>
              {isLoading ?
                <Button
                  disabled
                  onClick={connect}>
                  Loading...
                </Button> :
                provider != null ?
                  account.data ?
                    <Button
                      hoverable={false}
                      className="cursor-default">
                      Hi there {account.isAdmin && "Admin"}
                    </Button> :
                    <Button
                      onClick={connect}>
                      Connect
                    </Button> :
                  requireInstall ?
                    <Button
                      onClick={() => window.open("https://metamask.io/download.html", "_blank")}>
                      Install Metamask
                    </Button> :
                    <Button
                      onClick={connect}>
                      Connect
                    </Button>
              }
            </div>
          </div>
        </nav>
      </div >
      {account.data &&
        !pathname.includes("/marketplace") &&
        <div className="flex justify-end pt-1 sm:px-6 lg:px-8">
          <div className="text-white bg-indigo-600 rounded-md p-2">
            {account.data}
          </div>
        </div>
      }
    </section >
  );
};

export default Navbar;
