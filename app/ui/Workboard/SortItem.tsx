import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { Bars2Icon } from '@heroicons/react/20/solid';

export function SortableItem(props: {
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
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,

  };

  const displayClass =  props.displayHandle 
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
        hidden={!props.displayHandle}
      
      >
        <Bars2Icon
        className='h-5 w-5 text-gray-400'
        {...attributes} 
        {...listeners}
        
        />
      </div>
      {props.children}

        </div>
    </div>
  );
}