// src/tools/productivity/bulletin-board/BulletinBoard.tsx
import React, { useEffect } from 'react';
import { Grid } from '@/core/components/ui/Grid';
import { Stagger } from '@/core/motion/core/Stagger';
import { useTaskStore } from './store/taskStore';
import { Controls } from './controls';
import { View } from './view';

export function BulletinBoard() {
  const { loadTasks } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Grid minCardWidth={360} gap={16}>
          <Stagger delay={80}>
            <Controls />
            <View />
          </Stagger>
        </Grid>
      </div>
    </div>
  );
}