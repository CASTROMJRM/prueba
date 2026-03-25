export const serializeAboutPage = (page) => {
  const json = page.toJSON();

  return {
    ...json,
    values: Array.isArray(json.values)
      ? [...json.values].sort((a, b) => Number(a.order) - Number(b.order))
      : [],
    teamMembers: Array.isArray(json.teamMembers)
      ? [...json.teamMembers].sort((a, b) => Number(a.order) - Number(b.order))
      : [],
  };
};
