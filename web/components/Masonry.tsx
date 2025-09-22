import { PropsWithChildren } from 'react';

export default function Masonry({ children }: PropsWithChildren) {
  return <div className="masonry columns-1 sm:columns-2 lg:columns-3 xl:columns-4">{children}</div>;
}
