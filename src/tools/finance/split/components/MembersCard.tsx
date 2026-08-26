import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { useSplitStore } from '../store/useSplitStore';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { MdGroup } from 'react-icons/md';

export function MembersCard() {
  const { people, removePerson } = useSplitStore();

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MdGroup className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Group Members
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {people.length}
        </span>
      </div>

      {/* Scrollable member chips */}
      <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
        <Stagger delay={50}>
          {people.map((person, index) => (
            <Motion
              key={person}
              preset={zoomIn}
              as="div"
              delay={index * 30}
              style={{ opacity: 0, transform: 'scale(0.8)' }}
            >
              <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <span className="font-medium">{person}</span>
                <button
                  onClick={() => removePerson(person)}
                  className="ml-1 text-blue-400 hover:text-red-500 dark:text-blue-300 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remove ${person}`}
                >
                  ✕
                </button>
              </div>
            </Motion>
          ))}
        </Stagger>
      </div>
    </Card>
  );
}