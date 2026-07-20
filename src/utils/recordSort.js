export const getRecordTimestamp = (record) => {
  const value = record?.updated_at || record?.created_at || record?.updatedAt || record?.createdAt;
  const timestamp = value ? new Date(value).getTime() : 0;

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortRecordsByRecent = (records = []) => {
  return [...records].sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));
};
