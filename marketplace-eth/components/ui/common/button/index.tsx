import * as React from 'react';

const SIZE = {
  sm: "p-2 text-base xs:px-4",
  md: "p-3 text-base xs:px-8",
  lg: "p-3 text-lg xs:px-8"
}

interface IButtonProps {
  className?: string
  hoverable?: boolean,
  variant?:string
  size?: keyof typeof SIZE
}



const Button: React.FunctionComponent<IButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  hoverable = true,
  variant = "purple",
  size = "md",
  ...rest
}) => {
  const sizeClass = SIZE[size]
  const variants: {[key:string]: string} = {
    white: `text-black bg-white`,
    green: `text-white bg-green-600 ${hoverable && "hover:bg-green-700"}`,
    purple: `text-white bg-indigo-600 ${hoverable && "hover:bg-indigo-700"}`,
    red: `text-white bg-red-600 ${hoverable && "hover:bg-red-700"}`,
    lightPurple: `text-indigo-700 bg-indigo-100 ${hoverable && "hover:bg-indigo-200"}`,
  }
  return (
    <button
      {...rest}
      className={`${sizeClass} disabled:opacity-50 disabled:cursor-not-allowed xs:px-8 xs:py-3 p-2 border rounded-md text-base font-medium ${className} ${variants[variant]}`}>
      {children}
    </button>
  );
};

export default Button;
