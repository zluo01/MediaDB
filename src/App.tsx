import Layout from '@/components/Layout';
import Home from '@/components/Main';
import Setting from '@/components/Setting';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="setting" element={<Setting />} />
      </Route>
    </Routes>
  );
}

export default App;
