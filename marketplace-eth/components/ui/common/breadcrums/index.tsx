import React from "react";
import ActiveLink from "../link";

export interface IBreadcrum {
  href: string
  value: string
  requireAdmin: boolean
}

interface IBreadcrumbItemProps {
  item: IBreadcrum,
  index: number
}

const BreadcrumbItem: React.FunctionComponent<IBreadcrumbItemProps> = ({ item, index }) => {
  return (
    <li
      className={`${index == 0 ? "pr-4" : "px-4"} font-medium text-gray-500 hover:text-gray-900`}>
      <ActiveLink href={item.href} activeLinkClass={""}>
        <a>
          {item.value}
        </a>
      </ActiveLink>
    </li>
  )
};



interface IBreadcrumsProps {
  items: IBreadcrum[]
  isAdmin: boolean
}

const Breadcrums: React.FunctionComponent<IBreadcrumsProps> = ({ items, isAdmin }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex leading-none text-indigo-600 divide-x divide-indigo-400">
        {items.map((item, i) =>
         <React.Fragment key={item.href}>
         { !item.requireAdmin &&
           <BreadcrumbItem
             item={item}
             index={i}
           />
         }
         { item.requireAdmin && isAdmin &&
           <BreadcrumbItem
             item={item}
             index={i}
           />
         }
       </React.Fragment>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrums;
