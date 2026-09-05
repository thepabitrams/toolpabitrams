// src/tools/productivity/bulletin-board/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { BulletinBoard } from './BulletinBoard';

const toolDef: Tool = {
  id: 'bulletin-board',
  name: 'Bulletin Board',
  description: 'Daily task board with priority and check-in',
  category: 'productivity',
  input: 'none',
  component: BulletinBoard,
};

export default toolDef;