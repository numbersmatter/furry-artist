import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import React, { useCallback, useRef, useState } from 'react';
import type {
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCorners,
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
import { baseLoader } from "~/server/user.server";
import {  ColumnDetailsWID, getCardsforWorkboard, getWorkboardbyId, moveCard } from "~/server/database/workboard.server";

export async function action({ params, request }: ActionArgs) {
  let { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  let { _action, ...values } = Object.fromEntries(await request.formData());
  // @ts-ignore
  const newData = JSON.parse(values.moveData);
  console.log(newData)
  
  if (_action === "moveCard") {
    const moveData = {
      profileId,
      workboardId: params.workboardId as string,
      cardId: newData.cardId,
      fromColumn: newData.fromColumn,
      toColumn: newData.toColumn,
      fromIndex: newData.fromIndex,
      toIndex: newData.toIndex,
    }
    await moveCard(moveData)
    
    return json({ success: true, moveData });
  }
  
  // @ts-ignore
  return json({ success: false, data:{ cardId: values.moveData.cardId, fromColumn: values.fromColumn, toColumn: values.toColumn, fromIndex: values.fromIndex, toIndex: values.toIndex
  }});
}

export async function loader({ params, request }: LoaderArgs) {
  let { profileId, userRecord } = await baseLoader(request);
  if (!userRecord) {
    return redirect('/login');
  };
  if (!profileId) {
    return redirect('/profile-setup');
  }

  const workboardId = params.workboardId;
  console.log(workboardId)

  const workboardDoc = await getWorkboardbyId({
    profileId,
    workboardId: params.workboardId
  });
  if (!workboardDoc) {
    return redirect('/workboard');
  }

  const boardCards = await getCardsforWorkboard({
    profileId,
    workboardId: params.workboardId as string,
  });


  return json({ workboardDoc, boardCards });
}


export default function WorkboardTemplate() {
  const { workboardDoc, boardCards } = useLoaderData<typeof loader>();
  const [isActiveId, setIsActiveId] = useState<string | null>(null);
  let actionData = useActionData();  
  let submit = useSubmit();
  let navigation = useNavigation();
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);


  let parsedFormData = navigation.formData
  ? JSON.parse(navigation.formData.get("moveData") as string)
  : undefined;

  const changeCardLocation = ({
    columnData,
    cardId,
    fromColumn,
    toColumn,
    fromIndex,
    toIndex,
  }:{
    columnData: {[key: string]: ColumnDetailsWID;};
    cardId: string;
    fromColumn: string;
    toColumn: string;
    fromIndex: number;
    toIndex: number;
  })=>{
  
    if( fromColumn === toColumn) {
      const columnCardOrder = columnData[fromColumn].cardOrder;
      const newColumnCardOrder = [...columnCardOrder];
      newColumnCardOrder.splice(fromIndex, 1);
      newColumnCardOrder.splice(toIndex, 0, cardId);
      const newColumnData = {
        ...columnData,
        [fromColumn]: {
          ...columnData[fromColumn],
          cardOrder: newColumnCardOrder,
        }
      }
  
      return newColumnData;
    }
  
    const newFromColumnCardOrder = [...columnData[fromColumn].cardOrder];
    newFromColumnCardOrder.splice(fromIndex, 1);
  
    const newToColumnCardOrder = [...columnData[toColumn].cardOrder];
    newToColumnCardOrder.splice(toIndex, 0, cardId);
  
    const newColumnData = {
      ...columnData,
      [fromColumn]: {
        ...columnData[fromColumn],
        cardOrder: newFromColumnCardOrder,
      },
      [toColumn]: {
        ...columnData[toColumn],
        cardOrder: newToColumnCardOrder,
      }
    }
    return newColumnData;
  }
  

  const getColumnData = () =>{
    if(parsedFormData){
      return changeCardLocation({
        columnData: workboardDoc.columnData,
        cardId: parsedFormData.cardId,
        fromColumn: parsedFormData.fromColumn,
        toColumn: parsedFormData.toColumn,
        fromIndex: parsedFormData.fromIndex,
        toIndex: parsedFormData.toIndex,
      })
    }
    return workboardDoc.columnData
  }
  const columnData = getColumnData()

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  return (

    <div className="flex flex-1 flex-col  px-2 py-2">
      <div>
        <h1
          className="text-3xl font-bold text-gray-900 "
        >
          Workboard
        </h1>
        <Link to="add-column">
          add column
        </Link>
        <div>
          {
            actionData ?
            <p>
              {JSON.stringify(actionData)}
            </p>
            : null
          }
        </div>
      </div>


      <DndContext
        id="workboard"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="flex-1 pt-1 flex flex-row space-x-4 overflow-x-scroll">
          {workboardDoc.columnOrder.map((colId) => {
            const workColumn = columnData[colId];

            return (
              <WorkColumn key={colId} id={colId} colName={workColumn.columnTitle}>
                <SortableContext
                  items={[...workColumn.cardOrder, `new-card-${colId}`]}
                  strategy={verticalListSortingStrategy}
                  id={colId}
                >
                  <Droppable isActiveId={isActiveId} id={colId}>
                    <div
                      className="flex flex-1 flex-col h-full space-y-2"
                    >

                      {workColumn.cardOrder.map((id: string) => {

                        const workCard = boardCards.find(card => card.cardId === id)
                          ?? { cardId: id, cardTitle: "no title", };

                        return (
                          <SortableItem
                          displayHandle 
                          key={id} id={id}>
                            <WorkCard workCard={workCard} />
                          </SortableItem>
                        )
                      })}
                      <SortableItem 
                      displayHandle={false}
                      id={`new-card-${colId}`}>
                        <PlaceholderCard holdCard={{cardId: `new-card-${colId}`, cardTitle:"placeholder"} } />
                      </SortableItem>
                    </div>
                  </Droppable>
                </SortableContext>
              </WorkColumn>
            )
          }
          )}
          <DragOverlay>
            {isActiveId ? (
              <div
                className="absolute border-2 border-slate-400  z-10 w-64 h-32 bg-white rounded-lg shadow-lg"
              >

              <WorkCard workCard={{ cardId: isActiveId, cardTitle: "no title", }} />
              </div>
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

    const cardId = active.id as string;
    // @ts-ignore
    const sourceId = active.data.current.sortable.containerId;
    // @ts-ignore
    const sourceIndex = active.data.current.sortable.index;

    const overId = over.id as string;


    const overColumnId = workboardDoc.columnOrder
      .find((colId) => colId === overId);

    if (overColumnId) {
      const moveData = {
        cardId,
        fromColumn: sourceId,
        toColumn: overColumnId,
        fromIndex: sourceIndex,
        toIndex: 0,
        sourceId,
        overColumnId,
      };

      let formData = new FormData();
      formData.append("moveData", JSON.stringify(moveData));
      formData.append("_action", "moveCard")
      console.log(moveData)
      submit(formData, { method: "POST"})
      return;
    }

    // @ts-ignore
    const toColumnId = over.data.current.sortable.containerId;
    // @ts-ignore
    const toIndex = over.data.current.sortable.index;

    const moveData = {
      cardId,
      fromColumn: sourceId,
      toColumn: toColumnId,
      fromIndex: sourceIndex,
      toIndex,
    };

    let formData = new FormData();
    formData.append("moveData", JSON.stringify(moveData));
    formData.append("_action", "moveCard")
    submit(formData, { method: "POST"})
    console.log(moveData)

    return;




  }
}

function WorkCard(props: { workCard: { cardId: string, cardTitle: string, } }) {
  const { cardId, cardTitle, } = props.workCard

  return (
    <div
      className="h-28 w-56 px-2 py-2  rounded-lg"
    >
      <h4 className=" text-lg text-center">{cardTitle}</h4>
      <h4>{cardId}</h4>
      <Link
        to={cardId}
      >
        Open
      </Link>
    </div>
  )
}
function PlaceholderCard(props: { holdCard: { cardId: string, cardTitle: string, } }) {
  const { cardId, cardTitle, } = props.holdCard

  return (
    <div
      className="h-28 w-56 px-2 py-2 border-2 rounded-lg border-slate-600"
    >
      <h4 className=" text-lg text-center">drop here</h4>
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
      <div className=" h-full w-full px-2 space-y-2">
        {props.children}
      </div>
    </div>
  )
}




function Droppable(props: { id: string, isActiveId:string| null,  children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const styling = isOver
  ? "bg-green-300"
  : props.isActiveId
  ?  "bg-slate-300"
  : "bg-slate-200"

  return (
    <div className={`${styling} h-full w-full flex`} ref={setNodeRef}>
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