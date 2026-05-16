import { useEffect } from 'react';
import { useForesightStore } from '../store/foresightStore';
import { useParams } from 'react-router-dom';

export const useForesight = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, error, fetchForesight } = useForesightStore();

  useEffect(() => {
    if (projectId) {
      fetchForesight(projectId);
    }
  }, [projectId, fetchForesight]);

  const getRiskColor = () => {
    if (!data) return 'var(--cyan-glow)';
    switch (data.risk_level) {
      case 'none': return 'var(--cyan-glow)';
      case 'low': return '#10b981'; // Green
      case 'medium': return '#f59e0b'; // Amber
      case 'high': return '#ef4444'; // Red
      case 'critical': return '#b91c1c'; // Dark Red
      default: return 'var(--cyan-glow)';
    }
  };

  return {
    data,
    isLoading,
    error,
    getRiskColor,
    refresh: () => projectId && fetchForesight(projectId)
  };
};
