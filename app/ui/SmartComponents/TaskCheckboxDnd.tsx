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
import { Link, useFetcher, useSubmit } from "@remix-run/react";
import type { TaskWID } from "~/server/database/workboard.server";
import { TaskSortItem } from "./TaskSortItem";


// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TaskCheckboxDnd({ tasklist, projectId }: { tasklist: TaskWID[], projectId: string }) {
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  let submit = useSubmit();

  const completedProgress = tasklist.reduce((acc, task) => acc + (task.complete ? task.progress : 0), 0);

  const totalSize = tasklist.reduce((acc, task) => acc + task.progress, 0);


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
      id="tasksCheckboxDrop"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >

      <div className=" max-w-lg" >
        <h5>Progress {100 * completedProgress / totalSize}%</h5>
        <SortableContext
          items={taskOrder}
          strategy={verticalListSortingStrategy}
        >

          <ul>
            {
              tasklist.map((task) =>

                <li className=" py-1" key={task.taskId}>
                  <TaskSortItem id={task.taskId} >
                    <TaskCheckBox projectId={projectId} task={task} />
                  </TaskSortItem>
                </li>
              )
            }
          </ul>
        </SortableContext>
      </div>
      <DragOverlay>
        <OverlayStyle>
          <TaskCheckBox projectId={projectId} task={activeTask} />
        </OverlayStyle>
      </DragOverlay>
    </DndContext>
  )
};

function TaskCheckBox({ task, projectId }: { task: TaskWID, projectId:string }) {
  let fetcher = useFetcher();
  let submit = fetcher.submit;

  const handleOnChange = ()=>{
    let formData = new FormData()
    formData.append("_action", "toggleTask");
    formData.append("taskId", task.taskId);
    submit(formData, {method:"post"})
  }

  const taskEditlink = `/tasks/projects/${projectId}/id/${task.taskId}`


  return (
    <fetcher.Form method="post" className=" flex-1 grid grid-cols-10 content-center justify-between">
      <p className="px-2 col-span-2 font-semibold">{task.progress}</p>
      <p className="font-bold truncate col-span-5">{task.name}</p>
      <div className="px-1 col-span-2   ">
        <Link
          to={taskEditlink} 
          className=" inline-flex items-center px-4 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        > 
          Edit
        </Link>
      </div>
      <div className="px-1 py-1 flex flex-row justify-center content-center">
        <input
          id={"taskComplete"}
          name={"taskComplete"}
          defaultChecked={task.complete} 
          onChange={handleOnChange}
          type="checkbox" 
        />
      </div>
    </fetcher.Form>
  );
}


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




