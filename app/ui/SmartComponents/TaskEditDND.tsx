import {  Squares2X2Icon } from "@heroicons/react/20/solid";
import { SortVerticalItem } from "~/ui/SmartComponents/SortVerticalItem";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import type { TaskWID } from "~/server/database/workboard.server";


// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function EditTaskOrder({ tasklist }: { tasklist: TaskWID[] }) {
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  let submit = useSubmit();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = tasklist.find(task => task.taskId === activeTaskId) ??
  {taskId: "activeTaskId", progress:10, name:"Error", complete: false }

  const taskOrder: string[] = tasklist.map((task) => task.taskId)

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const oldIndex = taskOrder.findIndex(fieldId => fieldId === active.id)
    const newIndex = taskOrder.findIndex(fieldId => fieldId === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    if (oldIndex === newIndex) {
      return;
    }
    let formData = new FormData();
    formData.append("_action", "sortList");
    formData.append("oldIndex", oldIndex.toString());
    formData.append("newIndex", newIndex.toString());

    setActiveTaskId("")
    submit(formData, { method: "post", });
  };

  const handleDragStart = (event: any) => {
    const { active, } = event;

    setActiveTaskId(active.id)
  };

  return (
    <DndContext
      id="tasksDropZone"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >

      <div>
        <h5>Edit Task List</h5>
        <SortableContext
          items={taskOrder}
          strategy={verticalListSortingStrategy}
        >

          <ul>
            {
              tasklist.map((task) =>

                <li className=" py-1" key={task.taskId}>
                  <SortVerticalItem id={task.taskId} displayHandle>
                    <TaskListItem task={task} />
                  </SortVerticalItem>
                </li>
              )
            }
          </ul>
        </SortableContext>
      </div>
      <DragOverlay>
        <OverlayStyle>
          <TaskListItem task={activeTask} />
        </OverlayStyle>
      </DragOverlay>
    </DndContext>
  )
};

function TaskListItem({ task }: { task: TaskWID }) {

  return (
    <>
      <div className="col-span-11 flex flex-row justify-between">
        <p className="pr-1 font-semibold text-lg ">{task.name}</p>
        <p className="text-base truncate"> TaskTitle but this is a really long title</p>
        <p>{task.progress} points </p>
        <p className="pr-2">Edit</p>
      </div>
    </>
  )
}
function TaskItemCheckbox({ task }: { task: TaskWID }) {

  const projectColor= " bg-green-500"
  return (
    <>
      <div
        className={classNames(
          projectColor,
          'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
        )}
      >
        <Squares2X2Icon />
        VC
      </div>
      <div>
        <p>30</p>
        <p>Task Title One</p>
        <button> Edit</button>
        <input type="checkbox" />
      </div>
    </>
  )
}


function OverlayStyle(props: {

  children: React.ReactNode,
}) {
  return (
    <div
      className="border-2 grid grid-cols-12  rounded-md items-center justify-between py-2 bg-slate-300"
    >
      <div
        className=" px-1 col-span-1 flex flex-row justify-start"
      >
        <Squares2X2Icon
          className='h-5 w-5 text-gray-400'
        />
      </div>
      {props.children}
    </div>
  );
}




