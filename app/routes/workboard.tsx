import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BoardSectionList from "~/ui/Workboard/BoardSectionList";
import React, { useState } from 'react';
import type {
  DragEndEvent
} from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from "~/ui/Workboard/SortItem";

export async function action({ params, request }: ActionArgs) {


  return redirect('/');
}

export async function loader({ params, request }: LoaderArgs) {


  return json({});
}


export default function App() {
  const [items, setItems] = useState([1, 2, 3]);
  const [isActiveId, setIsActiveId] = useState(null);
  const [columns, setColumns] = useState({
    "a": [1, 2, 3],
    "b": [4, 5, 6]
  });
  const [dragEvent, setDragEvent] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex flex-row space-x-4"
      >

        <div
          className=" w-72 flex flex-col space-y-2"
        >
          <h3
            className="text-lg font-medium text-gray-900"
          >Column 1</h3>


          <Droppable id="a">
            {
              columns["a"].map(id =>
                 <Draggable key={id} id={id}>
                  <p>This is {id.toString()} </p>
                  </Draggable>
              )
            }
            {/* <SortableContext
              items={columns["a"]}
              strategy={verticalListSortingStrategy}
            >
              {columns["a"].map(id => <SortableItem key={id} id={id} />)}
            </SortableContext> */}
          </Droppable>
        </div>
        <div
          className=" w-72 flex flex-col space-y-2"
        >
          <h3
            className="text-lg font-medium text-gray-900"
          >Column 2</h3>

          <Droppable id="b">

            <SortableContext
              items={columns["b"]}
              strategy={verticalListSortingStrategy}
            >
              {columns["b"].map(id => <SortableItem key={id} id={id} />)}
            </SortableContext>
          </Droppable>
        </div>
      </div>
      <DragOverlay>
        {isActiveId ? (
          <div className="border-2 py-2 px-2">
            <p>This is {isActiveId} </p>
          </div>
        )
        :null }
      </DragOverlay>
    </DndContext>
  );
  function handleDragStart(event: DragStartEvent) {
    setIsActiveId(event.active.id);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setIsActiveId(null);
    console.log(event)
    // @ts-ignore
    if (active.id !== over.id) {
      setItems((items) => {
        // @ts-ignore
        const oldIndex = items.indexOf(active.id);
        // 
        // @ts-ignore
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}



function Droppable(props: { id: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const styling = "bg-green"

  return (
    <div className="bg-green-200" ref={setNodeRef}>
      {props.children}
    </div>
  );
}

export function Draggable(props: { id: number, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;


  return (
    
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}


// export default function FormSections() {
//   const { } = useLoaderData<typeof loader>();
//   return (
//     <BoardSectionList />
//   );
// }