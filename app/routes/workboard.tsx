import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BoardSectionList from "~/ui/Workboard/BoardSectionList";
import React, { useState } from 'react';
import type {
  DragEndEvent,
  DragStartEvent,
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
  DragOverlay

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
  const [isActiveId, setIsActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<{ [key: string]: string[] }>({
    "a": ["1", "2"],
    "b": ["3", "4", "5", "6"],
    "c": ["7"],
  });

  const workCards: { [key: string]: { id: string, title: string, humanReadable: string } } = {
    "1": { id: "1", title: "card1", humanReadable: "humanReadable1" },
    "2": { id: "2", title: "card2", humanReadable: " 2 card" },
    "3": { id: "3", title: "card3", humanReadable: "3 here" },
    "4": { id: "4", title: "card4", humanReadable: "4 here" },
    "5": { id: "5", title: "card5", humanReadable: "5 here" },
    "6": { id: "6", title: "card6", humanReadable: "6 here" },
    "7": { id: "7", title: "card7", humanReadable: "7 here" },
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const boardColumns: { id: string, colName: string }[] = [
    { id: "a", colName: "Queue" },
    { id: "b", colName: "Invoiced" },
    { id: "c", colName: "Paid" },
  ]

  return (

    <div className="flex flex-col h-screen px-2 py-2">
      <h1
        className="text-3xl font-bold text-gray-900 "
      >
        Workboard
      </h1>


      <DndContext
        id="workboard"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="flex-1 pt-1 flex flex-row">
          {boardColumns.map((col) => (
            <WorkColumn key={col.id} id={col.id} colName={col.colName}>
              <SortableContext
                items={columns[col.id]}
                strategy={verticalListSortingStrategy}
                id={col.id}
              >
                <Droppable id={col.id}>
                  <div
                    className="flex flex-1 flex-col h-full space-y-2"
                  >

                    {columns[col.id].map((id: string) => {
                      const workCard = workCards[id]

                      return (
                        <SortableItem key={id} id={id}>
                          <WorkCard workCard={workCard} />
                        </SortableItem>
                      )
                    })}
                  </div>
                </Droppable>
              </SortableContext>
            </WorkColumn>
          ))}
          <DragOverlay>
            {isActiveId ? (
              <WorkCard workCard={workCards[isActiveId]} />
            )
              : null}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
  function handleDragStart(event: DragStartEvent) {
    setIsActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !active) return;
    setIsActiveId(null);
    console.log(event)

    const overId = over.id as string;

    const overIdIsColumn = boardColumns.find((col) => col.id === overId);
    // @ts-ignore
    const startContainer = event.active.data.current.sortable.containerId;

    if (overIdIsColumn) {
      const newColumn = overIdIsColumn.id;
      const activeId = active.id as string;
      setColumns((columns) => ({
        ...columns,
        [startContainer]: columns[startContainer].filter(
          (id) => id !== activeId),
        [newColumn]: [...columns[newColumn], activeId],
      }));
      return;
    }


    // @ts-ignore
    const endContainer = event.over.data.current.sortable.containerId;
    console.log(startContainer, endContainer)

    if (startContainer === endContainer) {
      console.log("same container")
      const startIndex = columns[startContainer].findIndex(id => active.id === id);
      const endIndex = columns[endContainer].findIndex(id => over.id === id);
      console.log(startIndex, endIndex)

      setColumns((columns) => ({
        ...columns,
        [startContainer]: arrayMove(
          columns[startContainer],
          // @ts-ignore
          columns[startContainer].findIndex(id => active.id === id),
          // @ts-ignore
          columns[startContainer].findIndex(id => over.id === id)
        ),
      }));
    } else {
      setColumns((columns) => ({
        ...columns,
        [startContainer]: columns[startContainer].filter(
          (id) => id !== active.id
        ),
        [endContainer]: [
          ...columns[endContainer],
          // @ts-ignore
          active.id,
        ],
      }));
    }



  }
}

function WorkCard(props: { workCard: { id: string, title: string, humanReadable: string } }) {
  const { id, title, humanReadable } = props.workCard

  return (
    <div
      className="h-28 px-2 py-2 border-2 rounded-lg border-slate-600"
    >
      <h4 className=" text-lg text-center">{title}</h4>
      <h4>{humanReadable}</h4>
      <button>
        Open
      </button>
    </div>
  )
}

function WorkColumn(props: { id: string, colName: string, children: React.ReactNode }) {

  return (
    <div
      className="w-80 flex flex-col space-y-2 border-2 border-slate-400 "
    >
      <h3
        className="text-lg  text-center font-medium text-gray-900"
      >{props.colName}</h3>
      <div className=" h-full w-full px-1 space-y-2">
        {props.children}
      </div>
    </div>
  )
}




function Droppable(props: { id: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const styling = "bg-green"

  return (
    <div className="bg-green-200 h-full w-full flex" ref={setNodeRef}>
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