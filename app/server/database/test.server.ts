import { dataPoint } from "./db.server";

interface Task {
  name: string;
  progress: number;
  complete: boolean;
};

interface TaskList {
  tasks: { [key: string]: Task };
  taskOrder: string[];
  open: boolean
}


const testDb = {
  tasklist: ()=> dataPoint<TaskList>(`demo`)
}

export const getTaskList = async () => {
  const docRef = testDb.tasklist().doc('tasklist');
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  return docData;
};

export const  updateDoc = async (data: Partial<TaskList>) => {
  const docRef = testDb.tasklist().doc('tasklist');
  const updateToDb = await docRef.set(data, {merge: true});
  return updateToDb;
};

export const updateTask = async (taskId: string, tasks: { [key:string]:Task}) => {
  const docRef = testDb.tasklist().doc('tasklist');
  const updateData = {
    tasks: tasks
  }
  const updateToDb = await docRef.set(updateData, {merge: true});
  return updateToDb;
}
export const updateTaskComplete = async (taskId: string, complete: boolean) => {
  const docRef = testDb.tasklist().doc('tasklist');
  const updateData = {
    [`tasks.${taskId}.complete`]: complete
  }
  const updateToDb = await docRef.set(updateData, {merge: true});
  return updateToDb;
}