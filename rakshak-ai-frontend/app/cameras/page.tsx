'use client';

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { CameraGrid } from '@/components/camera/CameraGrid';
import { useCamera } from '@/hooks/useCamera';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/ui/Button';

export default function CamerasPage() {
  const { cameras, loading } = useCamera();

  if (loading) return <Loader message="Loading Surveillance Network..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Surveillance Cameras"
        subtitle="Manage and view live optical & thermal camera feeds"
        actions={<Button variant="primary" size="sm">+ Add Device</Button>}
      />

      <CameraGrid cameras={cameras} />
    </div>
  );
}
