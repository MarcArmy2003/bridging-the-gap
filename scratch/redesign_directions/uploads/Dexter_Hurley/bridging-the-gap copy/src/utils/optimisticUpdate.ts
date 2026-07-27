export const optimisticUpdate = async <T>(
  apply: () => void,
  rollback: () => void,
  commit: () => Promise<T>
): Promise<T> => {
  apply();
  try {
    return await commit();
  } catch (error) {
    rollback();
    throw error;
  }
};
