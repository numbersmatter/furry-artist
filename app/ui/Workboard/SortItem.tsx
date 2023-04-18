import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export function SortableItem(props: {id: number}) {
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
  
  return (
    <div
    ref={setNodeRef} 
    style={style} 
    {...attributes} 
    {...listeners}
    >
      {/* ... */}
      <div
      className='bg-slate-200 shadow border-2 border-slate-700 rounded-lg p-4' 
      >

      <p> Name and ID2: {props.id}</p>
      </div>

    </div>
  );
}