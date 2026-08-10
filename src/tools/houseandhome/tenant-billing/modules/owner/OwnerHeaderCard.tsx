import React, { useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Select } from '@/core/components/ui/Select';
import { IconButton } from '@/core/components/ui/IconButton';
import { Input } from '@/core/components/ui/Input';
import { Button } from '@/core/components/ui/Button';
import { useOwnerStore } from '../../store/ownerStore';
import { useUIStore } from '../../store/uiStore';
import { MdHome, MdAdd, MdEdit, MdDelete, MdSettings, MdCheck } from 'react-icons/md';

export const OwnerHeader = () => {
  const { groups, selectedGroupId, createGroup, updateGroup, deleteGroup, setSelectedGroupId } = useOwnerStore();
  const { setShowSettings } = useUIStore();
  const [showAddInput, setShowAddInput] = useState(false);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupOptions = groups.map(g => ({
    value: g.id,
    label: `${g.name} (${g.tenantCount})`,
  }));

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup(newGroupName.trim());
    setNewGroupName('');
    setShowAddInput(false);
  };

  const handleRenameGroup = async () => {
    if (selectedGroup && renameValue.trim()) {
      await updateGroup(selectedGroup.id, renameValue.trim());
      setRenameValue('');
      setShowRenameInput(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (selectedGroup && confirm(`Delete "${selectedGroup.name}" and all its tenants?`)) {
      await deleteGroup(selectedGroup.id);
    }
  };

  const startRename = () => {
    if (selectedGroup) {
      setRenameValue(selectedGroup.name);
      setShowRenameInput(!showRenameInput);
    }
  };

  const toggleAddInput = () => {
    setShowAddInput(!showAddInput);
    if (showAddInput) setNewGroupName('');
  };

  return (
    <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* ─── Buttons Row ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <MdHome className="text-gray-400 text-xl flex-shrink-0" />
        
        <Select
          options={groupOptions}
          value={selectedGroupId || ''}
          onChange={setSelectedGroupId}
          placeholder="Select property"
          className="flex-1 min-w-[140px]"
        />

        {/* ─── ALWAYS SHOW ADD BUTTON ─────────────────────────── */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={toggleAddInput}
          className="text-gray-400 hover:text-blue-500"
          title="Add property"
        >
          <MdAdd size={20} />
        </IconButton>

        {/* ─── ONLY SHOW EDIT & DELETE WHEN GROUP SELECTED ──── */}
        {selectedGroup && (
          <>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={startRename}
              className="text-gray-400 hover:text-blue-500"
              title="Rename property"
            >
              <MdEdit size={18} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleDeleteGroup}
              className="text-gray-400 hover:text-red-500"
              title="Delete property"
            >
              <MdDelete size={18} />
            </IconButton>
          </>
        )}

        {/* ─── SETTINGS ───────────────────────────────────────── */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="text-gray-400 hover:text-gray-600"
          title="Settings"
        >
          <MdSettings size={20} />
        </IconButton>
      </div>

      {/* ─── Inline Add Input ────────────────────────────────── */}
      {showAddInput && (
        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="New property name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleAddGroup}>
            <MdCheck className="mr-1" /> Add
          </Button>
        </div>
      )}

      {/* ─── Inline Rename Input ────────────────────────────── */}
      {showRenameInput && selectedGroup && (
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRenameGroup}>
            <MdCheck className="mr-1" /> Save
          </Button>
        </div>
      )}
    </Card>
  );
};