// src/tools/productivity/bulletin-board/view/View.tsx
import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useTaskStore } from '../store/taskStore';
import { shouldBeActive } from '../lib/helpers';
import { Tasks } from './tasks';

export function View() {
  const { tasks, taskOrder } = useTaskStore();

  const activeTasks = tasks.filter(t => shouldBeActive(t));

  // sort active tasks according to taskOrder
  const sorted = activeTasks.sort((a, b) => {
    const indexA = taskOrder.indexOf(a.id);
    const indexB = taskOrder.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Container className="px-0">
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Active Tasks
          </h3>
          <span className="text-xs text-gray-400">{sorted.length} tasks</span>
        </div>

        <Container className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-3 max-h-[500px] overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No active tasks. Add one using the + button above!
            </div>
          ) : (
            sorted.map((task, idx) => <Tasks key={task.id} task={task} index={idx} />)
          )}
        </Container>
      </Card>
    </Container>
  );
}