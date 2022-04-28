import { useAccount2 } from "@components/hooks/web3/useAccount";
import { Breadcrums } from "@components/ui/common";
import { IBreadcrum } from "@components/ui/common/breadcrums";
import { EthRates, WalletBar } from "@components/ui/web3";


interface IHeaderProps {
}

const LINKS: IBreadcrum[] = [{
  href: "/marketplace",
  value: "Buy",
  requireAdmin: false
}, {
  href: "/marketplace/courses/owned",
  value: "My Courses",
  requireAdmin: false
}, {
  href: "/marketplace/courses/managed",
  value: "Manage Courses",
  requireAdmin: true
}]

const Header: React.FunctionComponent<IHeaderProps> = (props) => {
  const account = useAccount2()
  return (
    <>
     <div className="pt-4">
        <WalletBar />
      </div>
      <EthRates />
      <div className="flex flex-row-reverse p-4 sm:px-6 lg:px-8">
        <Breadcrums items={LINKS} isAdmin={account.isAdmin} />
      </div>
    </>
  );
};

export default Header;
