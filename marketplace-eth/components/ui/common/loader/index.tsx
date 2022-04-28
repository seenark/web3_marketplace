import * as React from 'react';

interface ILoaderProps {
  size?: "sm" | "md" | "lg"
}

const SIZES:{[key:string]:string} = {
  "sm": "w-6 h-6",
  "md": "w-8 h-8",
  "lg": "w-12 h-12"
}

const Loader: React.FunctionComponent<ILoaderProps> = ({size = "md"}) => {
  return (
    <div className={`sk-fading-circle ${SIZES[size]}`}>
      {Array.from({ length: 12 }).map((_, i) =>
        <div
          key={`dot-${i}`}
          className={`sk-circle${i + 1} sk-circle`}
        />
      )}
    </div>
  );
};

export default Loader;
