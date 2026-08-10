// src/tools/houseandhome/tenant-billing/modules/tenants/TenantAdd.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { Input } from '@/core/components/ui/Input';
import { useOwnerStore } from '../../store/ownerStore';
import { useTenantStore } from '../../store/tenantStore';
import { TenantList } from './TenantList';
import { MdAdd, MdClose } from 'react-icons/md';

export const TenantAdd = () => {
  const { selectedGroupId } = useOwnerStore();
  const { tenants, addTenant, loadTenants } = useTenantStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ─── 🔥 FIX: Reload tenants when group changes ──────────────
  useEffect(() => {
    if (selectedGroupId) {
      loadTenants(selectedGroupId);
    }
  }, [selectedGroupId, loadTenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return alert('Select a property first');
    if (!name.trim()) return alert('Name is required');
    setIsLoading(true);
    try {
      await addTenant(selectedGroupId, { name, phone, address, note });
      setName('');
      setPhone('');
      setAddress('');
      setNote('');
      setShowForm(false);
      // ─── Reload tenants after adding ────────────────────────
      await loadTenants(selectedGroupId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* ─── HEADER ROW ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tenants
        </h3>
        <span className="text-xs text-gray-400">{tenants.length} tenants</span>
      </div>

      {/* ─── GRAY CONTAINER FOR TENANT LIST ─────────────────── */}
      <Container className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 max-h-60 overflow-y-auto">
        <TenantList />
      </Container>

      {/* ─── FOOTER ROW ────────────────────────────────────── */}
      <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
        >
          <MdAdd size={16} />
          {showForm ? 'Cancel' : 'Add Tenant'}
        </Button>
      </div>

      {/* ─── ADD TENANT FORM ────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
            />
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="submit"
              disabled={isLoading || !selectedGroupId}
              className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
              size="sm"
            >
              <MdAdd size={16} />
              {isLoading ? 'Adding...' : 'Add Tenant'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setName('');
                setPhone('');
                setAddress('');
                setNote('');
              }}
            >
              <MdClose size={16} /> Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};