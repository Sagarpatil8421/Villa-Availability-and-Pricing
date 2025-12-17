function getPaginationParams({ page, limit }) {
  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;

  const safePage = pageNumber > 0 ? pageNumber : 1;
  const safeLimit = pageSize > 0 ? pageSize : 10;

  const offset = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    offset,
  };
}

module.exports = {
  getPaginationParams,
};


