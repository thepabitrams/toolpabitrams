// src/tools/houseandhome/tenant-billing/index.tsx
import React, { useEffect } from 'react';
import { Tool } from '@/core/registry/toolRegistry';
import { Grid } from '@/core/components/ui/Grid';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { Container } from '@/core/components/ui/Container';
import { useOwnerStore } from './store/ownerStore';
import { useUIStore } from './store/uiStore';
import { OwnerCard } from './modules/owner';
import { TenantAdd } from './modules/tenants/TenantAdd';
import { TenantDetail } from './modules/tenants/TenantDetail';
import { Settings } from './modules/settings';

function TenantBillingTool() {
  const { loadGroups } = useOwnerStore();
  const { showSettings } = useUIStore();

  useEffect(() => {
    loadGroups();
  }, []);

  if (showSettings) return <Settings />;

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      {/* 🔥 FIX: Increased minCardWidth + max-w-7xl to limit overall width */}
      <div className="max-w-7xl mx-auto">
        <Grid minCardWidth={480} gap={20}>
          <Stagger delay={80}>
            
            {/* ===== CONTAINER 1: OWNER CARD ===== */}
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={0}
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <Container className="space-y-4">
                <OwnerCard />
              </Container>
            </Motion>

            {/* ===== CONTAINER 2: TENANT ADD ===== */}
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <Container className="space-y-4">
                <TenantAdd />
              </Container>
            </Motion>

            {/* ===== CONTAINER 3: TENANT DETAIL ===== */}
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1 lg:col-span-2 xl:col-span-3"
              delay={200}
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <Container className="space-y-4">
                <TenantDetail />
              </Container>
            </Motion>

          </Stagger>
        </Grid>
      </div>
    </div>
  );
}

const toolDef: Tool = {
  id: 'tenant-billing',
  name: 'Tenant Billing',
  description: 'Manage properties, tenants, and monthly bills',
  category: 'houseandhome',
  input: 'none',
  component: TenantBillingTool,
};

export default toolDef;