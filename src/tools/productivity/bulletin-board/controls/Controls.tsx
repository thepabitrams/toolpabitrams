// src/tools/productivity/bulletin-board/controls/Controls.tsx
import React, { useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { IconButton } from '@/core/components/ui/IconButton';
import { MdAdd, MdSettings } from 'react-icons/md';
import { AddTask } from './AddTask';
import { Settings } from './Settings';

export function Controls() {
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Container className="px-0">
        <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1">
              Today's Tasks
            </h2>
            <IconButton
              variant="standard"
              size="sm"
              onClick={() => setShowAdd(true)}
              ariaLabel="Add task"
              className="text-gray-400 hover:text-blue-500"
            >
              <MdAdd size={22} />
            </IconButton>
            <IconButton
              variant="standard"
              size="sm"
              onClick={() => setShowSettings(true)}
              ariaLabel="Settings"
              className="text-gray-400 hover:text-gray-600"
            >
              <MdSettings size={20} />
            </IconButton>
          </div>
        </Card>
      </Container>

      <AddTask isOpen={showAdd} onClose={() => setShowAdd(false)} />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}