// src/tools/productivity/bulletin-board/view/tasks/Tasks.tsx
import React, { useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { IconButton } from '@/core/components/ui/IconButton';
import { useTaskStore, Task } from '../../store/taskStore';
import { Priority } from './Priority';
import { Notes } from './Notes';
import { CheckIn } from './CheckIn';
import { Edit } from './Edit';
import { MdDelete, MdEdit } from 'react-icons/md';

interface TasksProps {
  task: Task;
  index: number;
}

export function Tasks({ task, index }: TasksProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Move "${task.title}" to trash?`)) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSave = async (id: string, data: Partial<Task>) => {
    try {
      await updateTask(id, data);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeLabel = () => {
    return task.type === 'permanent' ? 'Permanent' : 'Temporary';
  };

  const getDateDisplay = () => {
    const start = formatDate(task.startDate);
    if (task.type === 'temporary' && task.endDate) {
      const end = formatDate(task.endDate);
      return `${start} → ${end}`;
    }
    return start;
  };

  const getFrequencyDisplay = () => {
    const unitMap: Record<string, string> = {
      day: 'Day',
      week: 'Week',
      month: 'Month',
    };
    const unit = unitMap[task.freqUnit] || task.freqUnit;
    return `Every ${task.freqValue} ${unit}${task.freqValue > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Card className="p-3 shadow-sm hover:shadow-md transition-all duration-200" hover>
        <div className="flex items-center gap-2 mb-2">
          <Priority taskId={task.id} index={index} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
            {task.title}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <IconButton
              size="sm"
              onClick={() => setShowEdit(true)}
              ariaLabel="Edit"
              className="text-gray-400 hover:text-blue-500"
            >
              <MdEdit size={16} />
            </IconButton>
            <IconButton
              size="sm"
              onClick={handleDelete}
              ariaLabel="Delete"
              className="text-gray-400 hover:text-red-500"
            >
              <MdDelete size={16} />
            </IconButton>
          </div>
        </div>

        <Notes notes={task.notes} />

        <div className="mb-2">
          <CheckIn
            taskId={task.id}
            checkedDates={task.checkedDates || []}
            startDate={task.startDate}
            endDate={task.endDate}
            freqValue={task.freqValue}
            freqUnit={task.freqUnit}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700/30">
          <span className="truncate min-w-[70px]">{getTypeLabel()}</span>
          <span className="truncate flex-1 text-center px-2">{getDateDisplay()}</span>
          <span className="truncate min-w-[80px] text-right">{getFrequencyDisplay()}</span>
        </div>
      </Card>

      <Edit
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
        onSave={handleSave}
      />
    </>
  );
}