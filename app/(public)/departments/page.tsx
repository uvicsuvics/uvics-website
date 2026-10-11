import React from 'react';
import type { Metadata } from 'next';
import { DepartmentsClient } from './DepartmentsClient';

export const metadata: Metadata = {
  title: 'Struktur Departemen & Divisi Riset | UVICS UNKLAB',
  description:
    'Eksplorasi 6 pilar departemen spesialisasi di UVICS FIK UNKLAB dengan kurikulum terarah, mentoring intensif, dan portofolio nyata.',
};

export default function DepartmentsPage() {
  return <DepartmentsClient />;
}
