import { useEffect, useState } from 'react';
import { api } from '../api';

export default function useAcademicLists(deptId, batchId) {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api('/meta/departments').then(setDepartments).catch(() => {});
    api('/meta/positions').then(setPositions).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false; 
    setBatches([]);
    if (deptId) {
      api(`/meta/batches?deptId=${deptId}`)
        .then((data) => !ignore && setBatches(data))
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [deptId]);

  useEffect(() => {
    let ignore = false;
    setSections([]);
    if (batchId) {
      api(`/meta/sections?batchId=${batchId}`)
        .then((data) => !ignore && setSections(data))
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [batchId]);

  return { departments, positions, batches, sections };
}