import { getAppDataPath } from '@/lib/os';
import React, { useState, useEffect } from 'react';

function useAppDataPath() {
  const [path, setPath] = useState<string>();

  useEffect(() => {
    let isMount = true;
    getAppDataPath().then(path => {
      if (isMount) {
        console.log(path);
        setPath(path);
      }
    });
    return () => {
      isMount = false;
    };
  });

  return path;
}

export default useAppDataPath;
