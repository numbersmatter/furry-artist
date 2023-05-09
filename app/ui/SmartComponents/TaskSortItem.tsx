import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Squares2X2Icon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { TaskWID } from '~/server/database/workboard.server';


// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function TaskSortItem(props: {
  id: string,
  children: React.ReactNode,
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

  const displayClass = 'border-2 border-slate-400 rounded-lg bg-slate-50';
  const projectColor = "bg-green-500"

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div
        className={displayClass}
      >
        <div className=" h-12 flex flex-row  border-2 border-slate-400 rounded-lg">
          <div
            className={classNames(
              projectColor,
              'flex w-16 flex-shrink-0 items-center justify-evenly text-sm font-medium text-white  '
            )}
          >
            <Squares2X2Icon
              className='h-5 w-5 text-gray-400'
              {...attributes}
              {...listeners}
            />
          </div>
          {props.children}
        </div>
      </div>
    </div>
  );
};


function TaskItemCheckbox({ children }: {
  children: React.ReactNode,
}) {

  const projectColor = " bg-green-500"
  return (
    <div className=" h-12 flex flex-row  border-2 border-slate-400 rounded-lg">
      <div
        className={classNames(
          projectColor,
          'flex w-16 flex-shrink-0 items-center justify-evenly text-sm font-medium text-white  '
        )}
      >
        <Squares2X2Icon className=" h-5 w-5" />
        VC
      </div>
      {children}
    </div>
  )
}
