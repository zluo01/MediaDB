import Layout from '@/components/Layout';
import Home from '@/components/Main';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Setting = lazy(() => import('@/components/Setting'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="setting"
          element={
            <Suspense>
              <Setting />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
