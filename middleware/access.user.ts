const unAuthorized = (userSecret: string, jwtId: string, userId: string) => {
  return jwtId !== userId && userSecret !== 'ADMIN_ACCESS_SECRET'; //TODO add admin secret to the .env file
};

const scope = (jwtId: string, userId: string) => {
  return jwtId !== userId;
};

export { unAuthorized, scope };
