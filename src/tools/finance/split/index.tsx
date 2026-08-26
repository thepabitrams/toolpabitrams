import React, { useEffect } from 'react';
import { Tool } from '@/core/registry/toolRegistry';
import { Grid } from '@/core/components/ui/Grid';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { Container } from '@/core/components/ui/Container';

// Store
import { useSplitStore } from './store/useSplitStore';
import { useSettlement } from './hooks/useSettlement';

// Components
import { CurrencyCard } from './components/CurrencyCard';
import { ExpenseFormCard } from './components/ExpenseFormCard';
import { MembersCard } from './components/MembersCard';
import { TotalsCard } from './components/TotalsCard';
import { SettlementCard } from './components/SettlementCard';
import { ActionsCard } from './components/ActionsCard';

function SplitTool() {
  const { people, clearIfExpired, init, clearAll } = useSplitStore();
  const { total, perPerson, transactions } = useSettlement();

  // 7-day garbage collection on mount
  useEffect(() => {
    clearIfExpired();
    init();
  }, [clearIfExpired, init]);

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <Grid minCardWidth={380} gap={16}>
        <Stagger delay={100}>
          
          {/* ===== CONTAINER 1: INPUTS ===== */}
          <Motion
            preset={zoomIn}
            as="div"
            className="col-span-1"
            delay={0}
            style={{ opacity: 0, transform: 'scale(0.95)' }}
          >
            <Container className="space-y-5">
              <CurrencyCard />
              <ExpenseFormCard />
              <MembersCard />
            </Container>
          </Motion>

          {/* ===== CONTAINER 2: RESULTS ===== */}
          <Motion
            preset={zoomIn}
            as="div"
            className="col-span-1"
            delay={100}
            style={{ opacity: 0, transform: 'scale(0.95)' }}
          >
            <Container className="space-y-5">
              <TotalsCard />
              <SettlementCard />
              <ActionsCard 
                transactions={transactions}
                total={total}
                perPerson={perPerson}
                people={people}
                onClear={clearAll}
              />
            </Container>
          </Motion>

        </Stagger>
      </Grid>
    </div>
  );
}

// Tool Registration
const toolDef: Tool = {
  id: 'split',
  name: 'Bill Splitter',
  description: 'Split bills and expenses fairly with friends — no signup required.',
  category: 'finance',
  input: 'single',
  component: SplitTool,
};

export default toolDef;