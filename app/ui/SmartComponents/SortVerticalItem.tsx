import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Squares2X2Icon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';

export function SortVerticalItem(props: {
  id: string,
  children: React.ReactNode,
  displayHandle: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,

  };

  const displayClass = props.displayHandle
    ? 'border-2 border-slate-400 rounded-lg bg-slate-50'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div
        className={displayClass}
      >
        <div
          className="border-2 grid grid-cols-12  rounded-md items-center justify-between py-2 bg-slate-300"
        >
          <div hidden={!props.displayHandle}
           className=" px-1 col-span-1 flex flex-row justify-start"
          >
            <Squares2X2Icon
              className='h-5 w-5 text-gray-400'
              {...attributes}
              {...listeners}
            />
          </div>
          { props.children}
        </div>
      </div>
    </div>
  );
}