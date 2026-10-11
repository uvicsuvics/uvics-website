import React from 'react';
import type { Metadata } from 'next';
import { OrganizationClient } from './OrganizationClient';

export const metadata: Metadata = {
  title: 'Struktur Organisasi & BPH | UVICS UNKLAB',
  description:
    'Struktur kepengurusan Badan Pengurus Harian (BPH) dan koordinator divisi riset teknologi UVICS di Universitas Klabat.',
};

export default function OrganizationPage() {
  return <OrganizationClient />;
}
