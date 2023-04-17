import type { Task } from '../types';

type TaskItemProps = {
  task: Task;
};

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div>
      <div>{task.title}</div>
    </div>
  );
};

export default TaskItem;
