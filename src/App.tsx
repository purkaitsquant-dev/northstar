/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentModule from "./pages/student/Module";
import Practice from "./pages/student/Practice";
import Competition from "./pages/student/Competition";
import AdminDashboard from "./pages/admin/Dashboard";
import ModuleEditor from "./pages/admin/ModuleEditor";
import CompetitionEditor from "./pages/admin/CompetitionEditor";
import StudentConversations from "./pages/admin/StudentConversations";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/module/:moduleId" element={<StudentModule />} />
        <Route path="/student/practice/:moduleId/:setId" element={<Practice />} />
        <Route path="/student/competition/:id" element={<Competition />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/module/:moduleId" element={<ModuleEditor />} />
        <Route path="/admin/competition/:competitionId" element={<CompetitionEditor />} />
        <Route path="/admin/conversations" element={<StudentConversations />} />
      </Routes>
    </Router>
  );
}
