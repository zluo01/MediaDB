import Layout from '@/components/Layout';
import Home from '@/components/Main';
import { useFilterStore } from '@/lib/context';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';

const Setting = lazy(() => import('@/components/Setting'));

function App() {
  const location = useLocation();
  const { reset } = useFilterStore();

  useEffect(() => {
    reset();
  }, [location, reset]);

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
