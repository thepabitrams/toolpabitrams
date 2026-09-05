// src/tools/productivity/bulletin-board/controls/Settings.tsx
import React from 'react';
import { Overlay } from '@/core/components/ui/Overlay';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { IconButton } from '@/core/components/ui/IconButton';
import { useTaskStore, Task } from '../store/taskStore';
import { MdDelete, MdRestore } from 'react-icons/md';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { tasks, restoreTask, permanentDelete } = useTaskStore();

  const trashItems = tasks.filter((t: Task) => t.isTrash === true);

  const getDaysLeft = (task: Task): number => {
    const now = new Date();
    const deleted = new Date(task.deletedAt!);

    if (task.trashDays !== undefined && task.trashDays !== null) {
      const daysSinceDelete = Math.floor((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, task.trashDays - daysSinceDelete);
    }

    const diff = 30 - Math.floor((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleRestore = async (task: Task) => {
    if (task.type === 'temporary' && task.endDate) {
      const now = new Date();
      const end = new Date(task.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        alert(`Cannot restore "${task.title}" – the task has expired (end date: ${new Date(task.endDate).toLocaleDateString()}).`);
        return;
      }
    }
    try {
      await restoreTask(task.id);
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Permanently delete this task? This cannot be undone!')) {
      try {
        await permanentDelete(id);
      } catch (error) {
        console.error('Failed to permanently delete task:', error);
      }
    }
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <Container className="px-0 max-w-2xl mx-auto py-8">
        <Card className="p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Trash
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {trashItems.length} items
            </span>
          </div>

          {trashItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-lg">Trash is empty</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {trashItems.map((task) => {
                const daysLeft = getDaysLeft(task);
                const isExpiring = daysLeft <= 3;
                const isExpired = task.type === 'temporary' && task.endDate
                  ? new Date() > new Date(task.endDate)
                  : false;
                const shouldDelete = daysLeft <= 0;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isExpired || shouldDelete
                        ? 'border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/20'
                        : isExpiring
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Deleted: {new Date(task.deletedAt!).toLocaleDateString()}
                        </span>
                        <span className={`text-xs font-medium ${isExpiring ? 'text-red-500' : 'text-gray-400'}`}>
                          {daysLeft} days left
                        </span>
                        {task.type === 'temporary' && task.endDate && (
                          <span className="text-xs text-gray-400">
                            End: {new Date(task.endDate).toLocaleDateString()}
                          </span>
                        )}
                        {(isExpired || shouldDelete) && (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            Auto-delete
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <IconButton
                        size="sm"
                        onClick={() => handleRestore(task)}
                        ariaLabel="Restore"
                        className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${
                          isExpired || shouldDelete ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isExpired || shouldDelete}
                      >
                        <MdRestore size={18} />
                      </IconButton>
                      <IconButton
                        size="sm"
                        onClick={() => handlePermanentDelete(task.id)}
                        ariaLabel="Delete permanently"
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <MdDelete size={18} />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {trashItems.some(t => t.trashDays !== undefined && t.trashDays !== null)
                ? "Temporary tasks auto-delete after their end date passes"
                : "Tasks auto-delete after 30 days in trash"}
            </p>
          </div>
        </Card>
      </Container>
    </Overlay>
  );
}