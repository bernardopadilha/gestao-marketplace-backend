export default () => ({
  jwtAuth: {
    expiresIn: 900000,
    jwtSecret: process.env.JWT_SECRET,
  },
});
