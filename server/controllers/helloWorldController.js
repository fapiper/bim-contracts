exports.sayHello = async (req, res, next) => {
  try {
    res.send('Hello World!');
  } catch (error) {
    next(error);
  }
};
