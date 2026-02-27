import { Routes, Route, Navigate } from 'react-router-dom';
import { Opportunities } from './Opportunities';
import { MyApplications } from './MyApplications';
import { ApplicationDetail } from './Detail';
import { Simulator } from './Simulator';

/**
 * Applications routing - handles nested routes for the Applications section
 */
export default function Applications() {
  return (
    <Routes>
      <Route index element={<Navigate to="opportunities" replace />} />
      <Route path="opportunities" element={<Opportunities />} />
      <Route path="my-applications" element={<MyApplications />} />
      <Route path="detail/:id" element={<ApplicationDetail />} />
      <Route path="simulator" element={<Simulator />} />
    </Routes>
  );
}

